# Databricks notebook source
# MAGIC %md
# MAGIC # Deployment Commands
# MAGIC
# MAGIC **How to use Web Terminal:**
# MAGIC 1. Connect to Serverless
# MAGIC 2. View → Cluster Tools → Web Terminal
# MAGIC 3. Run commands below
# MAGIC
# MAGIC ---
# MAGIC
# MAGIC ## Deploy Bundle + App
# MAGIC
# MAGIC ```bash
# MAGIC cd {repo_root}
# MAGIC
# MAGIC # Deploy bundle (Pipeline, Job, Dashboard)
# MAGIC databricks bundle deploy --target dev
# MAGIC
# MAGIC # Deploy app (run after bundle completes)
# MAGIC databricks bundle run -t dev wanderbricks_booking_app
# MAGIC ```
# MAGIC
# MAGIC ---
# MAGIC
# MAGIC ## Alternative: UI Deployment
# MAGIC
# MAGIC **Deploy Bundle:**
# MAGIC - Repos folder → **⋮** menu → Databricks Asset Bundles → Deploy → Choose `dev`
# MAGIC
# MAGIC **Run Job:**
# MAGIC - Workflows → `[dev username] wanderbricks_lab_job` → Run Now
# MAGIC
# MAGIC ---
# MAGIC
# MAGIC ## Troubleshooting
# MAGIC
# MAGIC **Clean state (if deployment fails):**
# MAGIC ```bash
# MAGIC cd {repo_root}
# MAGIC rm -rf .databricks/bundle/dev
# MAGIC databricks bundle deploy --target dev
# MAGIC ```
