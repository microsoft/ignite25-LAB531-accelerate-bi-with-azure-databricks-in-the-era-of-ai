from pyspark import pipelines as dp
from pyspark.sql.functions import col, expr

# Import common functions
from utilities.common_functions import *

# Latest reviews table with CDC tracking
dp.create_streaming_table(
  name="latest_reviews",
  comment="Latest review state for each booking with CDC tracking"
)

dp.create_auto_cdc_flow(
  target="latest_reviews",
  source=f"{source_catalog_schema}.reviews",
  keys=["booking_id"],
  sequence_by=col("review_id"),
  apply_as_deletes=expr("is_deleted = true")
)
