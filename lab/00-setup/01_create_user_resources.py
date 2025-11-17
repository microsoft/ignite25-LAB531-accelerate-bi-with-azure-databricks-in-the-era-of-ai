# Databricks notebook source
# MAGIC %md
# MAGIC # User Workspace Setup
# MAGIC
# MAGIC **Connect to Serverless compute before running!**
# MAGIC
# MAGIC Creates: catalog, schema, volume, warehouse, cluster
# MAGIC Auto-configures: databricks.yml and app.yaml
# MAGIC Run ONCE before bundle deployment.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 1: Import Dependencies and Get Current User

# COMMAND ----------

from pyspark.sql import SparkSession

# Get spark session
spark = SparkSession.getActiveSession()
if spark is None:
    spark = SparkSession.builder.getOrCreate()

# COMMAND ----------

# Get current user email
current_user_email = spark.sql("SELECT current_user()").collect()[0][0]
print(f"Current user: {current_user_email}")

# Convert email to schema name (replace . and - with _ and remove domain)
# Example: saurabh.shukla@databricks.com → saurabh_shukla
# Example: user1-56655733@domain.com → user1_56655733
current_user_schema = current_user_email.split("@")[0].replace(".", "_").replace("-", "_").lower()
print(f"Schema name: {current_user_schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 2: Create Catalog if Not Exists

# COMMAND ----------

catalog_name = "ignite_2025"

try:
    spark.sql(f"CREATE CATALOG IF NOT EXISTS {catalog_name}")
    print(f"✅ Catalog created/verified: {catalog_name}")

    # Verify we can use it
    spark.sql(f"USE CATALOG {catalog_name}")
    print(f"✅ Successfully switched to catalog: {catalog_name}")

except Exception as e:
    print(f"❌ Could not create catalog '{catalog_name}'")
    print(f"   Error: {str(e)}")
    print(f"\n⚠️  ACTION REQUIRED:")
    print(f"   1. Ask your instructor to create the catalog, OR")
    print(f"   2. Ask for CREATE CATALOG permission on the metastore")
    print(f"   3. Admin can run: GRANT CREATE CATALOG ON METASTORE TO `{current_user_email}`")
    raise

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 3: Set Catalog Context

# COMMAND ----------

# Set catalog to ignite_2025
catalog_name = "ignite_2025"

try:
    spark.sql(f"USE CATALOG {catalog_name}")
    print(f"✅ Using catalog: {catalog_name}")
except Exception as e:
    print(f"❌ ERROR: Cannot access catalog '{catalog_name}'")
    print(f"   Error: {str(e)}")
    print(f"\n   Ask your instructor to grant:")
    print(f"   GRANT USE CATALOG ON CATALOG {catalog_name} TO `{current_user_email}`;")
    raise

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 4: Create User Schema

# COMMAND ----------

# Create schema if it doesn't exist
try:
    spark.sql(f"""
        CREATE SCHEMA IF NOT EXISTS {current_user_schema}
        COMMENT 'Personal schema for Wanderbricks Lab workshop - User: {current_user_email}'
    """)
    print(f"✅ Schema created/verified: {catalog_name}.{current_user_schema}")
except Exception as e:
    print(f"❌ ERROR: Cannot create schema '{current_user_schema}'")
    print(f"   Error: {str(e)}")
    print(f"\n   Ask your instructor to grant:")
    print(f"   GRANT CREATE SCHEMA ON CATALOG {catalog_name} TO `{current_user_email}`;")
    raise

# COMMAND ----------

# Use the schema
spark.sql(f"USE SCHEMA {current_user_schema}")
print(f"✅ Using schema: {catalog_name}.{current_user_schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 5: Create Volume for File Data

# COMMAND ----------

# Create volume if it doesn't exist
volume_name = "file_data"

try:
    spark.sql(f"""
        CREATE VOLUME IF NOT EXISTS {volume_name}
        COMMENT 'Volume for storing booking CSV files generated during workshop'
    """)
    print(f"✅ Volume created/verified: {catalog_name}.{current_user_schema}.{volume_name}")
except Exception as e:
    print(f"❌ ERROR: Cannot create volume '{volume_name}'")
    print(f"   Error: {str(e)}")
    print(f"\n   Ask your instructor to grant:")
    print(f"   GRANT CREATE VOLUME ON SCHEMA {catalog_name}.{current_user_schema} TO `{current_user_email}`;")
    raise

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 6: Verify Setup

# COMMAND ----------

# Get current context
current_catalog = spark.sql("SELECT current_catalog()").collect()[0][0]
current_schema = spark.sql("SELECT current_schema()").collect()[0][0]

# Construct volume path
volume_path = f"/Volumes/{current_catalog}/{current_schema}/{volume_name}"

# Display initial setup summary
print("=" * 80)
print("✅ SCHEMA & VOLUME CREATED!")
print("=" * 80)
print(f"User:        {current_user_email}")
print(f"Catalog:     {current_catalog}")
print(f"Schema:      {current_schema}")
print(f"Volume:      {current_catalog}.{current_schema}.{volume_name}")
print(f"Volume Path: {volume_path}")
print("=" * 80)
# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 7: Get Workspace Information

# COMMAND ----------

# Get workspace URL from Spark configuration (for reference only)
workspace_url = spark.conf.get("spark.databricks.workspaceUrl", "unknown")

print("\n" + "=" * 80)
print("📍 WORKSPACE INFORMATION")
print("=" * 80)
print(f"Workspace URL: https://{workspace_url}")
print("=" * 80)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 8: Create or Get SQL Warehouse (Using Databricks SDK)

# COMMAND ----------

from databricks.sdk import WorkspaceClient

# Initialize Databricks SDK WorkspaceClient
# In notebook context, it auto-detects credentials
w = WorkspaceClient()

# Warehouse configuration
warehouse_name = "Serverless Starter Warehouse"
warehouse_id = None

try:
    # List existing warehouses
    print(f"Checking for existing warehouse: {warehouse_name}...")
    existing_warehouses = list(w.warehouses.list())

    # Look for warehouse by name
    for wh in existing_warehouses:
        if wh.name == warehouse_name:
            warehouse_id = wh.id
            print(f"✅ SQL Warehouse already exists: {warehouse_name}")
            print(f"   Warehouse ID: {warehouse_id}")
            print(f"   State: {wh.state}")
            break

    # If not found, create it
    if not warehouse_id:
        print(f"\nCreating new SQL Warehouse: {warehouse_name}...")
        print(f"   This may take 1-2 minutes...")

        # Create warehouse using SDK
        created_warehouse = w.warehouses.create(
            name=warehouse_name,
            cluster_size="2X-Small",
            min_num_clusters=1,
            max_num_clusters=1,
            auto_stop_mins=10,
            enable_serverless_compute=True
        )

        warehouse_id = created_warehouse.id
        print(f"✅ SQL Warehouse created successfully!")
        print(f"   Name: {warehouse_name}")
        print(f"   Warehouse ID: {warehouse_id}")
        print(f"   The warehouse is starting (background process)...")

except PermissionError as e:
    print(f"⚠️  Permission Error: You don't have permission to create/list warehouses")
    print(f"   Error: {str(e)}")
    print(f"\n   📝 Ask your instructor to either:")
    print(f"      1. Create warehouse '{warehouse_name}' for the workshop, OR")
    print(f"      2. Grant you warehouse creation permissions, OR")
    print(f"      3. Provide a warehouse ID to use")
    warehouse_id = None

except Exception as e:
    print(f"⚠️  Could not create/list SQL Warehouse")
    print(f"   Error: {str(e)}")
    print(f"\n   📝 Manual alternative:")
    print(f"      1. Go to SQL Warehouses → Create SQL Warehouse")
    print(f"      2. Name: {warehouse_name}")
    print(f"      3. Size: 2X-Small")
    print(f"      4. Enable serverless compute: Yes")
    print(f"      5. Copy the warehouse ID and paste in databricks.yml")
    warehouse_id = None





# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 9: Final Configuration Summary

# COMMAND ----------

# Display comprehensive setup summary
print("\n" + "=" * 80)
print("✅ SETUP COMPLETE - RESOURCE DETECTION SUMMARY")
print("=" * 80)

print(f"\n👤 User Information:")
print(f"   Email:            {current_user_email}")
print(f"   Schema:           {current_schema}")

print(f"\n📦 Unity Catalog Resources:")
print(f"   Catalog:          {current_catalog}")
print(f"   Schema:           {current_catalog}.{current_schema}")
print(f"   Volume:           {current_catalog}.{current_schema}.{volume_name}")
print(f"   Volume Path:      {volume_path}")

print(f"\n🌐 Workspace Configuration:")
print(f"   Workspace URL:    https://{workspace_url}")

if warehouse_id:
    print(f"\n💾 SQL Warehouse:")
    print(f"   Name:             {warehouse_name}")
    print(f"   Warehouse ID:     {warehouse_id}")
    print(f"   Status:           ✅ Ready to use")
    print(f"   Auto-Config:      ✅ Will be applied in Step 11")
else:
    print(f"\n💾 SQL Warehouse:")
    print(f"   Status:           ⚠️  Needs manual setup")
    print(f"   Action Required:  Get warehouse ID from instructor")

print("\n" + "=" * 80)
print("NEXT: Steps 10-12 auto-configure, then deploy bundle via UI")
print("=" * 80 + "\n")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 10: Generate Dashboard JSON from Template

# COMMAND ----------

import json
import os

print("=" * 80)
print("📊 GENERATING DASHBOARD CONFIGURATION")
print("=" * 80)

# Get current notebook path (doesn't include /Workspace prefix)
# Example: /Users/email/repo_name/lab/00-setup/create_user_resources
notebook_path = dbutils.notebook.entry_point.getDbutils().notebook().getContext().notebookPath().get()
print(f"Current notebook path: {notebook_path}")

# Find repo root by looking for 'lab' in the path
path_parts = notebook_path.split("/")
try:
    lab_index = path_parts.index("lab")
    # Get path up to (but not including) 'lab'
    repo_path_without_workspace = "/".join(path_parts[:lab_index])
    # Add /Workspace prefix (notebook paths don't include it)
    repo_root = f"/Workspace{repo_path_without_workspace}"
except ValueError:
    # Fallback: assume notebook is at lab/00-setup/create_user_resources (3 levels deep)
    repo_path_without_workspace = "/".join(path_parts[:-3])
    repo_root = f"/Workspace{repo_path_without_workspace}"

print(f"Repo root: {repo_root}")

# Define paths
template_path = f"{repo_root}/lab/03-AI-BI/Wanderbricks Dashboard (using Metric View).lvdash.json.template"
output_path = f"{repo_root}/lab/03-AI-BI/Wanderbricks Dashboard (using Metric View).lvdash.json"

print(f"\nTemplate: {template_path}")
print(f"Output:   {output_path}")

# COMMAND ----------

# Read template file
try:
    with open(template_path, 'r') as f:
        template_content = f.read()
    print("✅ Template file read successfully")
except FileNotFoundError:
    print(f"❌ ERROR: Template file not found: {template_path}")
    raise

# COMMAND ----------

# Replace placeholders with actual catalog and schema
dashboard_json_str = template_content.replace("{{CATALOG}}", current_catalog) \
                                     .replace("{{SCHEMA}}", current_schema)

print(f"\nReplacing placeholders:")
print(f"  {{{{CATALOG}}}} → {current_catalog}")
print(f"  {{{{SCHEMA}}}}  → {current_schema}")

# COMMAND ----------

# Validate JSON structure
try:
    dashboard_json = json.loads(dashboard_json_str)
    print("✅ Generated JSON is valid")

    # Write validated JSON to output file
    with open(output_path, 'w') as f:
        json.dump(dashboard_json, f, indent=2)

    print(f"✅ Dashboard JSON written to: {output_path}")

except json.JSONDecodeError as e:
    print(f"❌ ERROR: Generated JSON is invalid")
    print(f"   Error: {str(e)}")
    raise

# COMMAND ----------

# Display confirmation
print("\n" + "=" * 80)
print("✅ DASHBOARD GENERATED SUCCESSFULLY")
print("=" * 80)
print(f"\nDataset configuration:")
print(f"  asset_name: {dashboard_json['datasets'][0]['asset_name']}")
print(f"\nThe dashboard will use metric view:")
print(f"  {current_catalog}.{current_schema}.wanderbricks_bookings_metrics")
print("=" * 80)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 11: Auto-Configure Warehouse ID in Configuration Files

# COMMAND ----------

print("\n" + "=" * 80)
print("🔧 AUTO-CONFIGURING WAREHOUSE ID")
print("=" * 80)

if not warehouse_id:
    print("⚠️  No warehouse ID detected - skipping auto-configuration")
    print("   You'll need to manually update databricks.yml and app.yaml")
else:
    # Placeholder warehouse ID to replace
    old_warehouse_id = "PLACEHOLDER_WAREHOUSE_ID"
    
    # Files to update (using repo_root from Step 10)
    files_to_update = {
        "databricks.yml": f"{repo_root}/databricks.yml",
        "app.yaml": f"{repo_root}/lab/05-app/backend/app.yaml"
    }
    
    print(f"Detected warehouse ID: {warehouse_id}")
    print(f"Replacing old ID:      {old_warehouse_id}")
    print()
    
    # Track results
    update_results = {}
    
    # Update each file
    for file_name, file_path in files_to_update.items():
        try:
            # Read file content
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Count occurrences
            occurrence_count = content.count(old_warehouse_id)
            
            if occurrence_count == 0:
                print(f"ℹ️  {file_name}: No updates needed (already configured)")
                update_results[file_name] = "skipped"
            else:
                # Replace all occurrences
                updated_content = content.replace(old_warehouse_id, warehouse_id)
                
                # Write back to file
                with open(file_path, 'w') as f:
                    f.write(updated_content)
                
                print(f"✅ {file_name}: Updated {occurrence_count} occurrence(s)")
                update_results[file_name] = f"{occurrence_count} updated"
                
        except FileNotFoundError:
            print(f"⚠️  {file_name}: File not found at {file_path}")
            update_results[file_name] = "not found"
        except PermissionError:
            print(f"❌ {file_name}: Permission denied")
            update_results[file_name] = "permission denied"
        except Exception as e:
            print(f"❌ {file_name}: Error - {str(e)}")
            update_results[file_name] = f"error: {str(e)}"
    
    # Summary
    print("\n" + "-" * 80)
    print("Configuration Update Summary:")
    print("-" * 80)
    for file_name, result in update_results.items():
        print(f"  {file_name:20s} → {result}")
    print("-" * 80)
    
    # Files using variable interpolation (no update needed)
    print("\nℹ️  Note: These files use ${var.warehouse_id} and don't need updates:")
    print("     - wanderbricks_lab_job.job.yml")
    print("     - Wanderbricks_Bookings.dashboard.yml")

print("=" * 80)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 12: Generate Deployment Command Guide Notebook

# COMMAND ----------

print("\n" + "=" * 80)
print("📝 PERSONALIZING DEPLOYMENT COMMAND GUIDE")
print("=" * 80)

# Define path for deployment guide notebook
deploy_guide_path = f"{repo_root}/lab/00-setup/02_deploy_lab.ipynb"

try:
    # Read the template notebook (JSON format)
    with open(deploy_guide_path, 'r') as f:
        notebook_json = json.load(f)

    # Create personalized deployment commands cell
    deployment_cell = {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Deploy Bundle + App\n",
            "\n",
            "```bash\n",
            f"cd {repo_root}\n",
            "\n",
            "# Deploy bundle (Pipeline, Job, Dashboard)\n",
            "databricks bundle deploy --target dev\n",
            "\n",
            "# Deploy app (run after bundle completes)\n",
            "databricks bundle run -t dev wanderbricks_booking_app\n",
            "```\n",
            "\n",
            "---\n"
        ]
    }

    # Insert the personalized cell after the first cell (index 1)
    if "cells" in notebook_json:
        notebook_json["cells"].insert(1, deployment_cell)

    # Write the updated notebook back
    with open(deploy_guide_path, 'w') as f:
        json.dump(notebook_json, f, indent=2)

    print(f"✅ Deployment guide personalized successfully")
    print(f"   Location: {deploy_guide_path}")
    print(f"   Format:   Jupyter Notebook (.ipynb)")
    print(f"\n   📓 Open this notebook in Databricks to see your personalized deployment commands!")
    print(f"   ✨ Added cell with your repo path: {repo_root}")

except Exception as e:
    print(f"⚠️  Could not personalize deployment guide")
    print(f"   Error: {str(e)}")
    print(f"   This is optional - you can still deploy using the UI (see README.md)")

print("=" * 80)
