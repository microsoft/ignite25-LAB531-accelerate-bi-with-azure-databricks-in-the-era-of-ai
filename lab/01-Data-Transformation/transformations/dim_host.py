from pyspark import pipelines as dp
from pyspark.sql.functions import *

# Import common functions
from utilities.common_functions import *

@dp.view(name="employee_stats_by_host")
def employee_stats_by_host():
    return (
        spark.read.table(f"{source_catalog_schema}.employees")
        .where("is_currently_employed = true")
        .groupBy("host_id")
        .agg(
            count("*").alias("employee_count"),
            avg(months_between(current_date(), col("joined_at"))).alias("avg_employee_tenure_months")
        )
    )

@dp.materialized_view(
    comment="Host dimension with employee management metrics - refreshed materialized view",
    table_properties={
        "quality": "gold",
        "pipelines.autoOptimize.managed": "true"
    }
)
@dp.expect("unique_host", "host_id IS NOT NULL")
@dp.expect("valid_rating", "host_rating BETWEEN 1.0 AND 5.0 OR host_rating IS NULL")
def dim_host():
    employee_stats = spark.read.table("employee_stats_by_host")

    return (
        spark.read.table(f"{source_catalog_schema}.hosts")
        .join(employee_stats, ["host_id"], "left")
        .withColumn("host_sk", generate_sk("host_id", "HOST_"))
        .withColumn("host_region", get_region_udf(col("country")))
        .withColumn("employee_count", coalesce(col("employee_count"), lit(0)))
        .withColumn("has_staff", col("employee_count") > 0)
        .withColumn("management_style",
            when(col("employee_count") == 0, "Owner_Operated")
            .when(col("employee_count") <= 2, "Hybrid")
            .otherwise("Staff_Managed"))
        .withColumn("host_rating", col("rating"))
        .withColumn("host_tier",
            when(col("host_rating") >= 4.5, "Elite")
            .when(col("host_rating") >= 4.0, "Super")
            .when(col("host_rating") >= 3.5, "Standard")
            .otherwise("New"))
        .withColumn("experience_level",
            when(months_between(current_date(), col("joined_at")) < 12, "<1 year")
            .when(months_between(current_date(), col("joined_at")) < 36, "1-3 years")
            .otherwise("3+ years"))
        .select(
            col("host_sk"), col("host_id"), col("name").alias("host_name"),
            col("email").alias("host_email"), col("phone").alias("host_phone"),
            col("country").alias("host_country"), col("host_region"),
            col("host_rating"), col("is_verified"), col("is_active"),
            col("joined_at").cast("date").alias("joined_date"), col("employee_count"),
            col("has_staff"), col("management_style"), col("avg_employee_tenure_months"),
            col("host_tier"), col("experience_level")
        )
    )