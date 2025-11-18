import dlt
from pyspark.sql.functions import *
from pyspark.sql.types import *
from pyspark.sql import SparkSession

# Get spark session for DLT context
spark = SparkSession.getActiveSession()
if spark is None:
    spark = SparkSession.builder.getOrCreate()

# Configuration (set by pipeline YAML, with fallback defaults)
source_catalog_schema = spark.conf.get("source_catalog_schema", "samples.wanderbricks")
if not source_catalog_schema:
    source_catalog_schema = "samples.wanderbricks"

catalog = spark.conf.get("catalog", "ignite_2025")

schema = spark.conf.get("schema")
if not schema:
    username = spark.sql("SELECT current_user()").collect()[0][0]
    schema = username.split("@")[0].replace(".", "_").replace("-", "_").lower()

@udf(returnType=StringType())
def get_region_udf(country):
    """Map country to region"""
    emea_countries = ['Spain', 'France', 'Italy', 'Germany', 'UK', 'Switzerland', 
                      'Austria', 'Netherlands', 'Belgium', 'Portugal', 'Greece']
    americas_countries = ['USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile']
    
    if country in emea_countries:
        return 'EMEA'
    elif country in americas_countries:
        return 'Americas'
    else:
        return 'APAC'

def get_season(month):
    """Get season from month number"""
    if month in [12, 1, 2]: 
        return "Winter"
    elif month in [3, 4, 5]: 
        return "Spring"
    elif month in [6, 7, 8]: 
        return "Summer"
    else: 
        return "Fall"

def generate_sk(natural_key_col, table_prefix=""):
    """Generate deterministic surrogate key using xxhash64"""
    if table_prefix:
        return xxhash64(concat(lit(table_prefix), col(natural_key_col).cast("string")))
    return xxhash64(col(natural_key_col).cast("string"))