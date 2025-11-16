"""
Latest Bookings CDC Pipeline

This module implements a multi-source CDC (Change Data Capture) architecture that merges
booking data from THREE different sources into a single `latest_booking_updates` table.

Architecture Overview:
=====================

Target Table: latest_booking_updates
├── Flow #1 (booking_snapshot): Initial snapshot load from base bookings table
├── Flow #2 (booking_updates_cdc): Continuous CDC updates from booking_updates table
└── Flow #3 (bookings_volume_cdc): Streaming CSV ingestion from Databricks Volume

All three flows write to the same target table and are deduplicated by booking_id.
The record with the highest sequence_by value (booking_update_id) wins.

Data Flow:
==========
1. Flow #1 loads initial snapshot from samples.wanderbricks.bookings (base table)
2. Flow #2 reads ongoing changes from samples.wanderbricks.booking_updates (CDC stream)
3. Flow #3 ingests new bookings from /Volumes/.../file_data/bookings (CSV files)

All three sources are merged into latest_booking_updates using AUTO CDC flows with
unique names, enabling multiple flows to write to the same target safely.
"""

from pyspark import pipelines as dp
from pyspark.sql.functions import col, lit
from pyspark.sql.types import StructType, StructField, LongType, IntegerType, FloatType, StringType, DateType, TimestampType

# Import common functions
from utilities.common_functions import *

# ============================================================================
# Schema Definition for Volume CSV Files
# ============================================================================
# Schema for October 2025 bookings CSV from Volume
# Matches the output format from bookings_gen_oct2025.py generator script
# IMPORTANT: Must match source table schema exactly (use FloatType for total_amount)
bookings_volume_schema = StructType([
    StructField("booking_id", LongType(), False),
    StructField("user_id", LongType(), True),
    StructField("property_id", LongType(), True),
    StructField("check_in", DateType(), True),
    StructField("check_out", DateType(), True),
    StructField("guests_count", IntegerType(), True),
    StructField("total_amount", FloatType(), True),  # FLOAT not DOUBLE - must match source tables
    StructField("status", StringType(), True),
    StructField("created_at", TimestampType(), True),
    StructField("updated_at", TimestampType(), True)
])

# ============================================================================
# Target Streaming Table - Receives Data from All Three CDC Flows
# ============================================================================
dp.create_streaming_table(
  name="latest_booking_updates",
  comment="Latest booking state merged from 3 sources: CDC stream, snapshot, and Volume CSV ingestion. Change data feed enabled for downstream processing.",
  table_properties={
    'delta.enableChangeDataFeed': 'true'
  }
)

# ============================================================================
# CDC Flow #1: Initial Snapshot Load from Base Bookings Table
# ============================================================================
# Source: samples.wanderbricks.bookings (base table with current state)
# Sequence: booking_update_id = 0 (all records get same low sequence number)
# Purpose: Load initial historical data; will be overwritten by Flow #2 updates
@dp.view(
    name="bookings_initial_load"
)
def bookings_initial_load():
  """
  Loads the initial snapshot of bookings from the base table.
  Adds booking_update_id=0 to all records, ensuring they have the lowest
  sequence number and will be overwritten by any updates from Flow #2.
  """
  return spark.readStream.table(f"{source_catalog_schema}.bookings").withColumn("booking_update_id", lit(0).cast("long"))

dp.create_auto_cdc_flow(
  target="latest_booking_updates",
  source="bookings_initial_load",
  name="booking_snapshot",
  keys=["booking_id"],
  sequence_by=col("booking_update_id")
)

# ============================================================================
# CDC Flow #2: Continuous Updates from booking_updates Table
# ============================================================================
# Source: samples.wanderbricks.booking_updates (table with incremental change events)
# Sequence: booking_update_id (incremental integer from table)
# Purpose: Apply ongoing booking changes (status updates, modifications, etc.)
@dp.view(
    name="booking_updates_stream"
)
def booking_updates_stream():
  """
  Streams booking updates from the booking_updates table.
  Contains incremental changes to bookings with auto-incrementing booking_update_id.
  """
  return spark.readStream.table(f"{source_catalog_schema}.booking_updates")

dp.create_auto_cdc_flow(
  target="latest_booking_updates",
  source="booking_updates_stream",
  name="booking_updates_cdc",
  keys=["booking_id"],
  sequence_by=col("booking_update_id")
)

# ============================================================================
# CDC Flow #3: Volume CSV Ingestion - Auto Loader Streaming
# ============================================================================
# Source: Databricks Volume - CSV files in /Volumes/{catalog}/{schema}/file_data/bookings
# Sequence: booking_update_id (same as booking_id for first-time inserts)
# Purpose: Ingest new bookings generated externally (e.g., October 2025 test data)
@dp.table(
    comment="October 2025 bookings ingested from Volume using Auto Loader - streaming incremental CSV ingestion. Automatically picks up new CSV files as they arrive."
)
def bookings_volume_raw():
    """
    Streaming ingestion from Databricks Volume using Auto Loader (cloudFiles).

    - Automatically detects new CSV files as they arrive in the Volume
    - Uses explicit schema to prevent type inference issues
    - Schema metadata stored in {volume_path}/_schema for evolution tracking
    - Empty Volume at startup is OK - returns empty stream, waits for data
    - Uses booking_id as booking_update_id (first-time inserts, no prior update history)

    Volume Path: /Volumes/{catalog}/{schema}/file_data/bookings
    Generated by: lab/01-Data-Transformation/data_gen/bookings_gen_oct2025.py
    """
    # Use catalog and schema from common_functions (centralized configuration)
    volume_path = f"/Volumes/{catalog}/{schema}/file_data/bookings"

    return (
        spark.readStream
        .format("cloudFiles")
        .schema(bookings_volume_schema)
        .option("cloudFiles.format", "csv")
        .option("header", "true")
        .option("cloudFiles.inferColumnTypes", "false")
        .option("cloudFiles.schemaLocation", f"{volume_path}/_schema")
        .load(volume_path)
        # Use booking_id as booking_update_id for CDC sequencing
        # These are first-time inserts (new bookings), so booking_id serves as the sequence
        .withColumn("booking_update_id", col("booking_id"))
    )

dp.create_auto_cdc_flow(
  target="latest_booking_updates",
  source="bookings_volume_raw",
  name="bookings_volume_cdc",
  keys=["booking_id"],
  sequence_by=col("booking_update_id")  # Changed from updated_at to booking_update_id (LongType)
)

# ============================================================================
# End of CDC Flows
# ============================================================================
# Result: latest_booking_updates table contains the latest state of all bookings
# from all three sources, deduplicated by booking_id with the highest sequence
# value winning (booking_update_id used consistently across all flows)