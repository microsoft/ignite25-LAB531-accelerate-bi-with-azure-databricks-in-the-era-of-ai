from pyspark import pipelines as dp
from pyspark.sql.functions import *

# Import common functions
from utilities.common_functions import *

# Step 1: Payment aggregations from streaming table
@dp.view(name="payment_aggregations")
def payment_aggregations():
    return (
        spark.read.table(f"{source_catalog_schema}.payments")
        .groupBy("booking_id")
        .agg(
            sum(when(col("status") == "completed", col("amount")).otherwise(0)).alias("total_payments_made"),
            sum(when(col("status") == "refunded", col("amount")).otherwise(0)).alias("refund_amount"),
            count("*").alias("payment_count"),
            countDistinct(when(col("status") == "failed", col("payment_id"))).alias("failed_payment_count")
        )
        .withColumn("net_revenue", col("total_payments_made") - col("refund_amount"))
    )

# Step 2: Create CDC view for latest_booking_updates
@dp.view(name="latest_booking_updates_cdc_view")
def latest_booking_updates_cdc_view():
    return (
        spark.readStream
        .option('readChangeFeed', 'true')
        .table('latest_booking_updates')
        .withColumnRenamed('_change_type', 'src_change_type')
        .withColumnRenamed('_commit_timestamp', 'src_commit_timestamp')
    )

# Step 3: Create enriched fact view with ALL transformations
@dp.view(name="fact_bookings_enriched")
def fact_bookings_enriched():
    # Get current dimension states for lookups (use spark.table for current state)
    dim_customer = spark.table("dim_customer").select("user_id", "user_sk")
    dim_property = spark.table("dim_property").select("property_id", "property_sk", "host_id")
    dim_host = spark.table("dim_host").select("host_id", "host_sk")
    dim_date = spark.table("dim_date").select("full_date", "date_sk")

    return (
        spark.readStream.table("latest_booking_updates_cdc_view")
        .join(spark.read.table("payment_aggregations"), ["booking_id"], "left")
        .join(broadcast(dim_customer), ["user_id"], "left")
        .join(broadcast(dim_property), ["property_id"], "left")
        .join(broadcast(dim_host), ["host_id"], "left")
        .join(broadcast(dim_date).alias("checkin_date"), col("check_in") == col("checkin_date.full_date"), "left")
        .join(broadcast(dim_date).alias("booking_date"), col("created_at").cast("date") == col("booking_date.full_date"), "left")
        .withColumn("booking_sk", generate_sk("booking_id", "BOOK_"))
        .withColumn("nights_stayed", datediff(col("check_out"), col("check_in")))
        .withColumn("revenue_per_night", col("total_amount") / col("nights_stayed"))
        .withColumn("is_weekend_checkin", date_format(col("check_in"), "E").isin("Sat", "Sun"))
        .select(
            # Surrogate Keys
            col("booking_sk"), col("user_sk"), col("property_sk"), col("host_sk"),
            col("checkin_date.date_sk").alias("checkin_date_sk"),
            col("booking_date.date_sk").alias("booking_date_sk"),
            
            # Business Keys
            col("booking_id"), col("user_id"), col("property_id"),
            
            # Degenerate Dimensions
            col("status").alias("booking_status"),
            when(col("failed_payment_count") > 0, "Payment_Issues").otherwise("Normal").alias("payment_status"),
            
            # Measures
            col("total_amount"), col("nights_stayed"), col("guests_count").alias("guest_count"),
            col("revenue_per_night"),
            coalesce(col("total_payments_made"), lit(0)).alias("total_payments_made"),
            coalesce(col("payment_count"), lit(0)).alias("payment_count"),
            coalesce(col("refund_amount"), lit(0)).alias("refund_amount"),
            coalesce(col("net_revenue"), col("total_amount")).alias("net_revenue"),
            
            # Flags
            col("is_weekend_checkin"),
            
            # CDC metadata
            col("src_change_type"), col("src_commit_timestamp")
        )
    )

# Step 4: Create target fact table and apply CDC flow
dp.create_streaming_table(
    name="fact_bookings"
)

dp.create_auto_cdc_flow(
    target="fact_bookings",
    source="fact_bookings_enriched",
    keys=["booking_id"],
    sequence_by=col('src_commit_timestamp'),
    apply_as_deletes=expr("src_change_type = 'delete'"),
    except_column_list=["src_change_type", "src_commit_timestamp"]
)