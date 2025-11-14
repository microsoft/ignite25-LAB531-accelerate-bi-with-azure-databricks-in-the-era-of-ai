from pyspark import pipelines as dp
from pyspark.sql.functions import *

# Import common functions
from utilities.common_functions import *

@dp.materialized_view(
    comment="Employee dimension - refreshed materialized view",
    table_properties={
        "quality": "gold",
        "pipelines.autoOptimize.managed": "true"
    }
)
@dp.expect("unique_employee", "employee_id IS NOT NULL")
@dp.expect("valid_host_ref", "host_id IS NOT NULL")
def dim_employee():
    return (
        spark.read.table(f"{source_catalog_schema}.employees")
        .withColumn("employee_sk", generate_sk("employee_id", "EMP_"))
        .withColumn("tenure_months", 
            months_between(current_date(), col("joined_at")))
        .withColumn("employment_status",
            when(col("is_currently_employed") == True, "Active")
            .when(col("end_service_date").isNotNull(), "Terminated")
            .otherwise("Unknown"))
        .withColumn("role_category",
            when(col("role").isin("owner", "manager"), "Management")
            .when(col("role").isin("cleaner", "maintenance", "electrician"), "Operations")
            .otherwise("Support"))
        .select(
            col("employee_sk"), col("employee_id"), col("host_id"),
            col("name").alias("employee_name"), col("role").alias("employee_role"),
            col("email").alias("employee_email"), col("phone").alias("employee_phone"),
            col("country").alias("employee_country"), col("joined_at").cast("date").alias("joined_date"),
            col("end_service_date"), col("is_currently_employed"), col("employment_status"),
            col("tenure_months"), col("role_category")
        )
    )