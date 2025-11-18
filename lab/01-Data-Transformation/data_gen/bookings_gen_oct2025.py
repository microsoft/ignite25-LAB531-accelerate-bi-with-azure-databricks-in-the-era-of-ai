# Databricks notebook source
# MAGIC %md
# MAGIC # October 2025 Booking Data Generator
# MAGIC
# MAGIC This notebook generates realistic booking data for October 2025 by analyzing patterns from July 2025 data.
# MAGIC
# MAGIC **Prerequisites:**
# MAGIC - Run `create_user_resources.py` first to create your schema and volume
# MAGIC - Source data must exist in `samples.wanderbricks`
# MAGIC
# MAGIC **What it does:**
# MAGIC - Generates 9,000 booking records over 15 minutes (simulates streaming data)
# MAGIC - Writes CSV batches every 30 seconds to your volume
# MAGIC - Uses realistic patterns from historical data
# MAGIC - Ready for Lakeflow pipeline ingestion

# COMMAND ----------

# Note: spark and dbutils are automatically available in Databricks runtime
import random
import time
from datetime import datetime, timedelta
from pyspark.sql import SparkSession

# COMMAND ----------

# MAGIC %md
# MAGIC ## Configuration

# COMMAND ----------

# Dynamic catalog and schema detection (same logic as create_user_resources.py)
import re
current_user = spark.sql("SELECT current_user()").collect()[0][0]
SCHEMA = current_user.split("@")[0].replace(".", "_").replace("-", "_").lower()

# Auto-generate catalog name from user email
# Extract numeric user ID from email (e.g., User1-56748340@... → 56748340)
match = re.search(r'-(\d+)@', current_user)
if match:
    user_id = match.group(1)
    CATALOG = f"adb_lab531_{user_id}"
else:
    # Fallback for non-Skillable emails
    CATALOG = f"adb_lab531_{SCHEMA}"

# Volume path for data files
VOLUME_PATH = f"/Volumes/{CATALOG}/{SCHEMA}/file_data/bookings"

# Data generation configuration
FILE_PREFIX = "booking_2025oct"
INTERVAL_SECONDS = 30  # Write every 30 seconds
RECORDS_PER_BATCH = 300  # Records per batch
DURATION_MINUTES = 15  # Total duration
TOTAL_BATCHES = (DURATION_MINUTES * 60) // INTERVAL_SECONDS  # 30 batches
TOTAL_RECORDS = TOTAL_BATCHES * RECORDS_PER_BATCH  # 9,000 records

print("=" * 80)
print("CONFIGURATION")
print("=" * 80)
print(f"User:           {current_user}")
print(f"Catalog:        {CATALOG}")
print(f"Schema:         {SCHEMA}")
print(f"Target path:    {VOLUME_PATH}")
print(f"Interval:       {INTERVAL_SECONDS} seconds")
print(f"Duration:       {DURATION_MINUTES} minutes")
print(f"Total batches:  {TOTAL_BATCHES}")
print(f"Total records:  {TOTAL_RECORDS}")
print("=" * 80)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 1: Query Actual Dimension Data

# COMMAND ----------

print("Loading actual user IDs from dimension table...")
user_ids_df = spark.sql("""
  SELECT DISTINCT user_id 
  FROM samples.wanderbricks.users 
  ORDER BY user_id
""")
user_id_list = [row.user_id for row in user_ids_df.collect()]
print(f"Loaded {len(user_id_list)} unique user IDs")

# COMMAND ----------

print("Loading actual property IDs from dimension table...")
property_ids_df = spark.sql("""
  SELECT DISTINCT property_id 
  FROM samples.wanderbricks.properties 
  ORDER BY property_id
""")
property_id_list = [row.property_id for row in property_ids_df.collect()]
print(f"Loaded {len(property_id_list)} unique property IDs")

# COMMAND ----------

print("Analyzing July 2025 booking patterns...")
july_stats = spark.sql("""
  SELECT 
    MAX(booking_id) as max_booking_id,
    COUNT(*) as total_bookings,
    AVG(total_amount) as avg_amount,
    MIN(total_amount) as min_amount,
    MAX(total_amount) as max_amount,
    AVG(guests_count) as avg_guests,
    MIN(guests_count) as min_guests,
    MAX(guests_count) as max_guests
  FROM samples.wanderbricks.bookings
  WHERE check_in >= '2025-07-01' AND check_in < '2025-08-01'
""").first()

print(f"July 2025 Stats:")
print(f"  Total bookings: {july_stats.total_bookings}")
print(f"  Max booking ID: {july_stats.max_booking_id}")
print(f"  Avg amount: ${july_stats.avg_amount:.2f}")
print(f"  Amount range: ${july_stats.min_amount:.2f} - ${july_stats.max_amount:.2f}")
print(f"  Avg guests: {july_stats.avg_guests:.1f}")
print(f"  Guests range: {july_stats.min_guests} - {july_stats.max_guests}")

# COMMAND ----------

print("Getting status distribution from July 2025...")
status_dist_df = spark.sql("""
  SELECT status, COUNT(*) as status_count
  FROM samples.wanderbricks.bookings
  WHERE check_in >= '2025-07-01' AND check_in < '2025-08-01'
  GROUP BY status
  ORDER BY status_count DESC
""")

status_distribution = {}
total_count = 0
for row in status_dist_df.collect():
    status_distribution[row.status] = row.status_count
    total_count += row.status_count

# Calculate probabilities
status_probabilities = {status: count/total_count for status, count in status_distribution.items()}
print(f"Status distribution:")
for status, prob in status_probabilities.items():
    print(f"  {status}: {prob*100:.1f}%")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 2: Define Generation Functions

# COMMAND ----------

def generate_booking_record(booking_id, check_in_date, user_id_list, property_id_list, 
                            avg_amount, min_amount, max_amount, 
                            min_guests, max_guests, status_probs):
    """
    Generate a single booking record with realistic October 2025 data
    """
    # Random selections from actual dimension data
    user_id = random.choice(user_id_list)
    property_id = random.choice(property_id_list)
    
    # Check-in and check-out dates
    check_in = check_in_date
    nights = random.randint(1, 7)
    check_out = check_in + timedelta(days=nights)
    
    # Guest count
    guests_count = random.randint(min_guests, max_guests)
    
    # Total amount - use normal distribution around average
    # Adding some variance while keeping it realistic
    amount_std = (max_amount - min_amount) / 4
    total_amount = random.gauss(avg_amount, amount_std)
    total_amount = max(min_amount, min(max_amount, total_amount))
    total_amount = round(total_amount, 2)
    
    # Status - weighted random based on July distribution
    statuses = list(status_probs.keys())
    weights = list(status_probs.values())
    status = random.choices(statuses, weights=weights)[0]
    
    # Created_at: 1-14 days before check-in
    days_before_checkin = random.randint(1, 14)
    created_at = check_in - timedelta(days=days_before_checkin, 
                                      hours=random.randint(0, 23),
                                      minutes=random.randint(0, 59),
                                      seconds=random.randint(0, 59))
    
    # Updated_at: between created_at and check_in
    days_between = (check_in - created_at).days
    if days_between > 0:
        update_days = random.randint(0, days_between)
        updated_at = created_at + timedelta(days=update_days,
                                           hours=random.randint(0, 23),
                                           minutes=random.randint(0, 59),
                                           seconds=random.randint(0, 59))
    else:
        updated_at = created_at
    
    # Format timestamps as ISO 8601
    created_at_str = created_at.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    updated_at_str = updated_at.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    check_in_str = check_in.strftime("%Y-%m-%d")
    check_out_str = check_out.strftime("%Y-%m-%d")
    
    return {
        'booking_id': booking_id,
        'user_id': user_id,
        'property_id': property_id,
        'check_in': check_in_str,
        'check_out': check_out_str,
        'guests_count': guests_count,
        'total_amount': f"{total_amount:.2f}",
        'status': status,
        'created_at': created_at_str,
        'updated_at': updated_at_str
    }

# COMMAND ----------

def write_batch_to_volume(records, batch_num, target_path, file_prefix):
    """
    Write a batch of records to the Volume as CSV
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{file_prefix}_{timestamp}_batch{batch_num:04d}.csv"
    filepath = f"{target_path}/{filename}"
    
    # Create CSV content
    csv_lines = []
    # Header
    csv_lines.append("booking_id,user_id,property_id,check_in,check_out,guests_count,total_amount,status,created_at,updated_at")
    
    # Data rows
    for record in records:
        csv_lines.append(
            f"{record['booking_id']},{record['user_id']},{record['property_id']},"
            f"{record['check_in']},{record['check_out']},{record['guests_count']},"
            f"{record['total_amount']},{record['status']},{record['created_at']},{record['updated_at']}"
        )
    
    csv_content = "\n".join(csv_lines)
    
    # Write to Volume using dbutils
    dbutils.fs.put(filepath, csv_content, overwrite=True)
    
    return filepath

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 3: Clean Up Volume Folder

# COMMAND ----------

print(f"Cleaning up {VOLUME_PATH}...")
try:
    dbutils.fs.rm(VOLUME_PATH, recurse=True)
    print(f"✓ Removed existing files from {VOLUME_PATH}")
except Exception as e:
    print(f"No existing files to clean up (this is normal): {e}")

# Recreate the directory
dbutils.fs.mkdirs(VOLUME_PATH)
print(f"✓ Volume path ready: {VOLUME_PATH}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 4: Generate and Write Data

# COMMAND ----------

print("=" * 80)
print("STARTING OCTOBER 2025 BOOKING DATA GENERATION")
print("=" * 80)
print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Starting booking ID (after July max)
starting_booking_id = july_stats.max_booking_id + 1
current_booking_id = starting_booking_id

# October 2025 date range
october_start = datetime(2025, 10, 1)
october_end = datetime(2025, 10, 31)
total_october_days = 31

# Calculate how many batches per day to spread data chronologically
batches_per_day = TOTAL_BATCHES / total_october_days
current_day = 0

# Track progress
start_time = time.time()
total_records_written = 0

# Main generation loop
for batch_num in range(TOTAL_BATCHES):
    # Calculate which day of October we're on (chronological distribution)
    current_day = int(batch_num / batches_per_day)
    current_day = min(current_day, total_october_days - 1)  # Cap at day 31
    
    # Base date for this batch (chronological order)
    base_check_in_date = october_start + timedelta(days=current_day)
    
    # Generate records for this batch
    batch_records = []
    for i in range(RECORDS_PER_BATCH):
        # Add some variance (+/- 2 days) around the base date for natural distribution
        day_variance = random.randint(-2, 2)
        check_in_date = base_check_in_date + timedelta(days=day_variance)
        
        # Keep within October bounds
        if check_in_date < october_start:
            check_in_date = october_start
        elif check_in_date > october_end:
            check_in_date = october_end
        
        record = generate_booking_record(
            booking_id=current_booking_id,
            check_in_date=check_in_date,
            user_id_list=user_id_list,
            property_id_list=property_id_list,
            avg_amount=july_stats.avg_amount,
            min_amount=july_stats.min_amount,
            max_amount=july_stats.max_amount,
            min_guests=july_stats.min_guests,
            max_guests=july_stats.max_guests,
            status_probs=status_probabilities
        )
        batch_records.append(record)
        current_booking_id += 1
    
    # Write batch to volume
    filepath = write_batch_to_volume(batch_records, batch_num, VOLUME_PATH, FILE_PREFIX)
    total_records_written += len(batch_records)
    
    # Progress reporting
    if (batch_num + 1) % 10 == 0 or batch_num == 0:
        elapsed_time = time.time() - start_time
        progress_pct = ((batch_num + 1) / TOTAL_BATCHES) * 100
        records_per_sec = total_records_written / elapsed_time if elapsed_time > 0 else 0
        estimated_total_time = (elapsed_time / (batch_num + 1)) * TOTAL_BATCHES
        estimated_remaining = estimated_total_time - elapsed_time
        
        print(f"Batch {batch_num+1:4d}/{TOTAL_BATCHES} ({progress_pct:5.1f}%) | "
              f"Records: {total_records_written:5d}/{TOTAL_RECORDS} | "
              f"Date: Oct {current_day+1:2d} | "
              f"Speed: {records_per_sec:.1f} rec/s | "
              f"ETA: {estimated_remaining/60:.1f} min")
    
    # Sleep for the configured interval
    if batch_num < TOTAL_BATCHES - 1:  # Don't sleep after last batch
        time.sleep(INTERVAL_SECONDS)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 5: Summary

# COMMAND ----------

end_time = time.time()
total_duration = end_time - start_time

print()
print("=" * 80)
print("DATA GENERATION COMPLETE!")
print("=" * 80)
print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total duration: {total_duration/60:.2f} minutes ({total_duration:.1f} seconds)")
print(f"Total records generated: {total_records_written}")
print(f"Total batches written: {TOTAL_BATCHES}")
print(f"Booking ID range: {starting_booking_id} - {current_booking_id-1}")
print(f"Records per second: {total_records_written/total_duration:.2f}")
print()
print(f"Data location: {VOLUME_PATH}")
print()

# List files created
print("Files created:")
files = dbutils.fs.ls(VOLUME_PATH)
print(f"Total files: {len(files)}")
if len(files) <= 10:
    for file in files[:10]:
        print(f"  - {file.name}")
else:
    for file in files[:5]:
        print(f"  - {file.name}")
    print(f"  ... and {len(files)-5} more files")

print()
print("✓ Ready for DLT pipeline ingestion!")
# COMMAND ----------
