# Unity Catalog Catalog Explorer – fact_bookings (Quick Demo)

Purpose: Show key Unity Catalog Catalog Explorer features on the single table produced by the pipeline: `ignite_2025.<your_schema>.fact_bookings`.

Replace `<your_schema>` below with your actual schema (e.g., your username without domain).

## 1) Discover & Document (AI + Comments)

In Catalog Explorer:
- Find: Data → Catalogs → `ignite_2025` → Schemas → `<your_schema>` → Tables → `fact_bookings`.
- Add description with AI: Table details → Description → Generate with AI (edit, then Save).
- Column descriptions: Columns tab → select a column (e.g., `total_amount`) → Generate with AI (edit, Save).

## 2) Permissions (Access Control)

 Table → Permissions tab
- View principals and effective permissions
- Grant or revoke access to users/groups (Save changes)


## 3) Lineage (Table + Column)

UI: Table → Lineage tab
- Table lineage: See upstream tables/views and downstream consumers.
- Column lineage: Switch to Columns view, select a field (e.g., `user_id` or `total_amount`) to trace its origin and downstream usage.

What to point out:
- Upstream includes sources used by the Lakeflow pipeline and intermediate CDC tables.
- Downstream may include views or dashboards that reference `fact_bookings`.

## 4) Insights (Usage)

UI: Table → Insights tab
- Usage: who/what queried the table recently.
- Frequently joined with: other tables commonly joined with `fact_bookings`.
- Downstream artifacts: notebooks, dashboards, or apps using the table.

## 5) Preview & Schema

UI:
- Preview tab: sample rows (quick data check without writing SQL).
- Columns tab: names, types, nullability, and saved descriptions.


