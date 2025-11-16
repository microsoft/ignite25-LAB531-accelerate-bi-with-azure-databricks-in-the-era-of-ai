# Creating a Genie Space: Wanderbricks Booking Insights

## Overview

This guide walks you through creating a Genie space for natural language analytics on the Wanderbricks booking platform. 

**What you'll create:**
- Genie space name: `Wanderbricks Booking Insights`
- Data source: `wanderbricks_bookings_metrics` metric view (created in Lab 02)



---

## Prerequisites

Before you begin:

- Completed Lab 02 (metric view `wanderbricks_bookings_metrics` exists)
- Access to a SQL Warehouse
- SELECT privileges on your schema

---

## Step 1: Create the Genie Space

1. In the Databricks workspace, click **AI/BI** in the left sidebar
2. Click **Genie Spaces**
3. Click **Create** (or **New** button in upper-right)
4. **Add data source:**
   - Click **Add data**
   - Navigate to: `ignite_2025` → `<your_schema>` → `wanderbricks_bookings_metrics`
   - Select the metric view
   - Click **Add**
5. Click **Create**

---

## Step 2: Configure Settings

1. Click **Configure** (gear icon)
2. Click **Settings** tab
3. Update the following:
   - **Name:** `Wanderbricks Booking Insights`
   - **Description:**
     ```
     This Genie space provides comprehensive analytics for the Wanderbricks travel booking platform
     using a metric view with pre-defined dimensions and measures.

     **METRIC VIEW USAGE:**
     - Use MEASURE() function to access pre-defined metrics like Total Bookings, Total Revenue, Cancellation Rate
     - Focus on 2025 data by default
     ```
   - **Default warehouse:** Select your SQL warehouse (serverless recommended)
4. Click **Save**

---

## Step 3: Test with Sample Questions

Navigate to your Genie space and try these sample questions:

### Revenue & Performance
- "What is the total revenue for 2025?"
- "Show me monthly revenue trends by customer region"
- "Which property type generates the most revenue in 2025?"

### Booking Analysis
- "What's the average booking length by city?"
- "What's the cancellation rate by season in 2025?"

### Property & Host Insights
- "Which cities have the most bookings in 2025?"
- "Show me properties with the highest revenue per night"

### Advanced Queries
- "What's the revenue trend for luxury properties by quarter in 2025?"
- "Show me top 10 destinations by booking count and average revenue"

---

## Success Criteria

- Genie space appears in your Genie Spaces list
- Sample questions return results without errors
- Generated SQL uses `MEASURE()` function for metrics
- Can see visualizations and data tables

---

## Troubleshooting

**Issue: "No data sources found"**
- **Fix:** Verify the metric view was created in Lab 02. Run the SQL script again if needed.

**Issue: "Permission denied" when adding data source**
- **Fix:** Ask instructor to grant SELECT privilege on your schema

**Issue: Generated SQL doesn't use MEASURE() function**
- **Fix:** This is normal - Genie automatically converts to appropriate SQL. The metric view definitions are still being used.

**Issue: Questions return no data**
- **Fix:**
  - Check that your pipeline ran successfully (fact_bookings table has data)
  - Try filtering to specific time periods: "Show me bookings in July 2025"

