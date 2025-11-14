from pyspark import pipelines as dp
from pyspark.sql.functions import *

# Import common functions
from utilities.common_functions import *

@dp.materialized_view(
    comment="Customer dimension with business segmentation - refreshed materialized view",
    table_properties={
        "quality": "gold",
        "pipelines.autoOptimize.managed": "true"
    }
)
@dp.expect("unique_user", "user_id IS NOT NULL")
@dp.expect("valid_email", "email IS NOT NULL OR email != ''")
@dp.expect("valid_region", "region IN ('EMEA', 'Americas', 'APAC')")
def dim_customer():
    return (
        spark.read.table(f"{source_catalog_schema}.users")
        .withColumn("user_sk", generate_sk("user_id", "USER_"))
        .withColumn("user_name", col("name"))
        .withColumn("region", get_region_udf(col("country")))
        .withColumn("created_date", col("created_at").cast("date"))
        .withColumn("customer_segment", 
            when(col("is_business") == True, "B2B").otherwise("B2C"))
        .withColumn("is_active", lit(True))
        .select(
            col("user_sk"), col("user_id"), col("user_name"), col("email"),
            col("user_type"), col("is_business"), col("company_name"), 
            col("country"), col("region"), col("created_date"), 
            col("customer_segment"), col("is_active")
        )
    )