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

1. In the Databricks workspace, click **Genie** in the left sidebar
2. Click **Create** button (or **New** button in upper-right)
4. **Add data source:**
   - Click **Add data**
   - Navigate to: `ignite_2025` → `<your_schema>` → `wanderbricks_bookings_metrics`
   - Select the metric view
   - Click **Add**
5. Optionally update the **Genie space name** to `Wanderbricks Booking Insights`
6. Click **Create**

---

## Step 2: Update Text Instructions

1. Click **Instructions** tab
2. Click **Text** tab
3. Update the following:
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

