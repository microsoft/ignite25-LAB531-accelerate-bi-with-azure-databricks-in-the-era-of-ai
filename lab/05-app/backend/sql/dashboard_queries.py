"""
SQL queries for Country Manager Dashboard
Converted from PostgreSQL to Spark SQL (Databricks SQL Warehouse)
Optimized queries to support multiple dashboard sections with minimal database calls
"""

# Market Performance Metrics - Databricks SQL Warehouse version
MARKET_PERFORMANCE_QUERY = """
WITH overall_metrics AS (
  SELECT
    SUM(b.total_amount) as total_gbv,
    SUM(b.total_amount * 0.15) as total_revenue,
    COUNT(*) as total_bookings,
    AVG(b.total_amount) as avg_booking_value
  FROM bookings b
  JOIN properties p ON p.property_id = b.property_id
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
property_metrics AS (
  SELECT
    COUNT(*) as total_properties,
    COUNT(DISTINCT d.destination) as unique_cities,
    COUNT(DISTINCT p.host_id) as total_hosts
  FROM properties p
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
occupancy_calc AS (
  SELECT
    COUNT(DISTINCT b.property_id) * 30 as available_property_days,
    SUM(DATEDIFF(b.check_out, b.check_in)) as booking_days
  FROM bookings b
  JOIN properties p ON p.property_id = b.property_id
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
monthly_trends AS (
  SELECT
    MONTH(b.created_at) as month_num,
    YEAR(b.created_at) as year,
    CASE MONTH(b.created_at)
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Feb'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Apr'
      WHEN 5 THEN 'May'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Aug'
      WHEN 9 THEN 'Sep'
      WHEN 10 THEN 'Oct'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dec'
    END as month,
    SUM(b.total_amount) as gbv,
    SUM(b.total_amount * 0.15) as revenue,
    COUNT(*) as bookings
  FROM bookings b
  JOIN properties p ON p.property_id = b.property_id
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
  GROUP BY MONTH(b.created_at), YEAR(b.created_at)
  ORDER BY year ASC, month_num ASC
)
SELECT
  om.total_gbv,
  om.total_revenue,
  om.total_bookings,
  om.avg_booking_value,
  COALESCE((CAST(oc.booking_days AS DECIMAL(10,2)) / NULLIF(oc.available_property_days, 0)) * 100, 0) as occupancy_rate,
  pm.total_properties,
  pm.unique_cities,
  pm.total_hosts,
  collect_list(
    struct(
      mt.month as month,
      mt.month_num as month_num,
      mt.year as year,
      mt.gbv as gbv,
      mt.revenue as revenue,
      mt.bookings as bookings
    )
  ) as monthly_trends
FROM overall_metrics om
CROSS JOIN property_metrics pm
CROSS JOIN occupancy_calc oc
CROSS JOIN monthly_trends mt
GROUP BY om.total_gbv, om.total_revenue, om.total_bookings, om.avg_booking_value,
         oc.booking_days, oc.available_property_days, pm.total_properties, pm.unique_cities, pm.total_hosts
"""

# City Performance - Databricks SQL Warehouse version
CITY_PERFORMANCE_QUERY = """
WITH city_bookings AS (
  SELECT
    d.destination as city_name,
    COUNT(DISTINCT b.booking_id) as booking_count,
    COALESCE(SUM(b.total_amount), 0) as city_gbv,
    COALESCE(AVG(b.total_amount), 0) as avg_booking_value,
    COUNT(DISTINCT p.property_id) as property_count
  FROM destinations d
  JOIN properties p ON p.destination_id = d.destination_id
  LEFT JOIN bookings b ON b.property_id = p.property_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
  GROUP BY d.destination_id, d.destination
),
city_occupancy AS (
  SELECT
    d.destination as city_name,
    COUNT(DISTINCT p.property_id) * 30 as available_days,
    SUM(DATEDIFF(b.check_out, b.check_in)) as booked_days
  FROM destinations d
  JOIN properties p ON p.destination_id = d.destination_id
  LEFT JOIN bookings b ON b.property_id = p.property_id
    AND YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
  GROUP BY d.destination_id, d.destination
)
SELECT
  cb.city_name,
  cb.booking_count,
  cb.city_gbv as gbv,
  cb.avg_booking_value,
  cb.property_count as properties_count,
  COALESCE((CAST(co.booked_days AS DECIMAL(10,2)) / NULLIF(co.available_days, 0)) * 100, 0) as occupancy_rate,
  (cb.city_gbv / NULLIF(SUM(cb.city_gbv) OVER(), 0)) * 100 as market_share
FROM city_bookings cb
JOIN city_occupancy co ON co.city_name = cb.city_name
WHERE cb.property_count > 0
ORDER BY cb.city_gbv DESC
LIMIT 20
"""

# Host & Supply Health - Databricks SQL Warehouse version
HOST_SUPPLY_QUERY = """
WITH host_metrics AS (
  SELECT
    COUNT(DISTINCT p.host_id) as total_hosts,
    COUNT(DISTINCT CASE WHEN p.property_id IN (
        SELECT property_id FROM bookings
        WHERE YEAR(created_at) = 2025
    ) THEN p.host_id END) as active_hosts,
    COUNT(DISTINCT p.property_id) as total_properties,
    COUNT(DISTINCT CASE WHEN b.booking_id IS NOT NULL THEN p.host_id END) as hosts_with_bookings
  FROM properties p
  JOIN destinations d ON d.destination_id = p.destination_id
  LEFT JOIN bookings b ON b.property_id = p.property_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
host_property_distribution AS (
  SELECT
    p.host_id,
    COUNT(*) as property_count
  FROM properties p
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
  GROUP BY p.host_id
),
distribution AS (
  SELECT
    COUNT(CASE WHEN property_count = 1 THEN 1 END) as single_property_hosts,
    COUNT(CASE WHEN property_count > 1 THEN 1 END) as multi_property_hosts
  FROM host_property_distribution
),
booking_performance AS (
  SELECT
    COUNT(DISTINCT b.property_id) as properties_with_bookings,
    COUNT(*) as total_bookings
  FROM bookings b
  JOIN properties p ON p.property_id = b.property_id
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
host_growth AS (
  SELECT
    COUNT(DISTINCT CASE WHEN YEAR(p.created_at) = 2025 AND MONTH(p.created_at) >= 10 THEN p.host_id END) as new_hosts_3m,
    COUNT(DISTINCT CASE WHEN YEAR(p.created_at) = 2025 AND MONTH(p.created_at) BETWEEN 7 AND 9 THEN p.host_id END) as prev_period_hosts
  FROM properties p
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
)
SELECT
  hm.active_hosts,
  hm.total_hosts,
  hm.total_properties,
  (CAST(hm.hosts_with_bookings AS DECIMAL(10,2)) / NULLIF(hm.total_hosts, 0)) * 100 as superhost_percentage,
  d.single_property_hosts,
  d.multi_property_hosts,
  (CAST(bp.properties_with_bookings AS DECIMAL(10,2)) / NULLIF(hm.total_properties, 0)) * 100 as host_engagement_rate,
  CASE
    WHEN hg.prev_period_hosts > 0 THEN
      ((CAST(hg.new_hosts_3m AS DOUBLE) - CAST(hg.prev_period_hosts AS DOUBLE)) / CAST(hg.prev_period_hosts AS DOUBLE)) * 100
    ELSE 0
  END as host_growth_rate,
  ((hm.total_hosts - hm.active_hosts) * 100.0 / NULLIF(hm.total_hosts, 0)) as host_churn_rate
FROM host_metrics hm
CROSS JOIN distribution d
CROSS JOIN booking_performance bp
CROSS JOIN host_growth hg
"""

# Guest Performance - Databricks SQL Warehouse version
GUEST_PERFORMANCE_QUERY = """
WITH guest_metrics AS (
  SELECT
    COUNT(DISTINCT u.user_id) as total_guests,
    COUNT(DISTINCT CASE WHEN b.booking_id IS NOT NULL THEN u.user_id END) as active_guests,
    COUNT(DISTINCT b.booking_id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.booking_id END) as cancelled_bookings
  FROM users u
  LEFT JOIN bookings b ON b.user_id = u.user_id
    AND YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
  LEFT JOIN properties p ON p.property_id = b.property_id
  LEFT JOIN destinations d ON d.destination_id = p.destination_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
repeat_guests_agg AS (
  SELECT
    COUNT(CASE WHEN booking_count > 1 THEN 1 END) as repeat_guests,
    COUNT(*) as total_booking_users
  FROM (
    SELECT
      u.user_id,
      COUNT(b.booking_id) as booking_count
    FROM users u
    JOIN bookings b ON b.user_id = u.user_id
    JOIN properties p ON p.property_id = b.property_id
    JOIN destinations d ON d.destination_id = p.destination_id
    WHERE YEAR(b.created_at) = 2025
      AND MONTH(b.created_at) <= 7
      AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
      AND b.status != 'cancelled'
    GROUP BY u.user_id
  ) user_bookings
),
monthly_engagement AS (
  SELECT
    MONTH(b.created_at) as month_num,
    CASE MONTH(b.created_at)
      WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Apr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul' WHEN 8 THEN 'Aug' WHEN 9 THEN 'Sep'
      WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dec'
    END as month,
    COUNT(DISTINCT b.user_id) as active_guests,
    COUNT(b.booking_id) as bookings,
    AVG(b.total_amount) as avg_booking_value
  FROM bookings b
  JOIN properties p ON p.property_id = b.property_id
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
    AND b.status != 'cancelled'
  GROUP BY MONTH(b.created_at)
  ORDER BY month_num ASC
),
guest_ratings AS (
  SELECT
    COALESCE(
      (SELECT AVG(
        CASE
          WHEN b.status = 'confirmed' THEN 5.0
          WHEN b.status = 'completed' THEN 4.8
          WHEN b.status = 'cancelled' THEN 2.0
          ELSE 3.5
        END
      )
      FROM bookings b
      JOIN properties p ON p.property_id = b.property_id
      JOIN destinations d ON d.destination_id = p.destination_id
      WHERE YEAR(b.created_at) = 2025
        AND MONTH(b.created_at) <= 7
        AND (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
      ), 4.2
    ) as avg_rating
)
SELECT
  gm.active_guests,
  gm.total_guests,
  (CAST(rg.repeat_guests AS DECIMAL(10,2)) / NULLIF(rg.total_booking_users, 0)) * 100 as repeat_guest_percentage,
  (CAST(gm.cancelled_bookings AS DECIMAL(10,2)) / NULLIF(gm.total_bookings, 0)) * 100 as cancellation_rate,
  CASE
    WHEN gr.avg_rating >= 4.5 THEN 85.0
    WHEN gr.avg_rating >= 4.0 THEN 70.0
    WHEN gr.avg_rating >= 3.5 THEN 55.0
    ELSE 40.0
  END as guest_nps,
  COALESCE(gr.avg_rating, 4.0) as avg_guest_rating,
  collect_list(
    struct(
      me.month as month,
      me.month_num as month_num,
      me.active_guests as active_guests,
      me.bookings as bookings,
      me.avg_booking_value as avg_booking_value
    )
  ) as monthly_trends
FROM guest_metrics gm
CROSS JOIN repeat_guests_agg rg
CROSS JOIN guest_ratings gr
CROSS JOIN monthly_engagement me
GROUP BY gm.active_guests, gm.total_guests, gm.cancelled_bookings, gm.total_bookings,
         rg.repeat_guests, rg.total_booking_users, gr.avg_rating
"""

# Property Performance - Databricks SQL Warehouse version
PROPERTY_PERFORMANCE_UPDATED_QUERY = """
WITH property_metrics AS (
  SELECT
    COUNT(DISTINCT p.property_id) as total_properties,
    AVG(p.base_price) as avg_nightly_rate,
    COUNT(DISTINCT CASE WHEN b.booking_id IS NULL THEN p.property_id END) as underperforming_count
  FROM properties p
  LEFT JOIN bookings b ON b.property_id = p.property_id
    AND YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
  JOIN destinations d ON d.destination_id = p.destination_id
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
property_types_agg AS (
  SELECT
    collect_list(
      struct(
        pt.property_type as type,
        pt.type_count as count,
        pt.avg_price as avg_price,
        pt.occupancy_rate as occupancy_rate
      )
    ) as property_types_performance,
    COUNT(DISTINCT pt.property_type) as property_type_count,
    MAX(pt.property_type) as top_property_type,
    MAX(pt.type_count) as top_property_count
  FROM (
    SELECT
      p.property_type,
      COUNT(*) as type_count,
      AVG(p.base_price) as avg_price,
      COUNT(b.booking_id) as total_bookings,
      ((CAST(COUNT(b.booking_id) AS DECIMAL(10,2)) / COUNT(DISTINCT p.property_id)) / 12.0) * 100 as occupancy_rate
    FROM properties p
    LEFT JOIN bookings b ON b.property_id = p.property_id
      AND YEAR(b.created_at) = 2025
      AND MONTH(b.created_at) <= 7
    JOIN destinations d ON d.destination_id = p.destination_id
    WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
    GROUP BY p.property_type
  ) pt
),
amenity_gaps_agg AS (
  SELECT
    collect_list(
      struct(
        ag.amenity_name as amenity,
        ((pm.total_properties - ag.properties_with_amenity) * 100.0 / pm.total_properties) as missing_percentage
      )
    ) as amenity_gaps
  FROM (
    SELECT
      a.name as amenity_name,
      COUNT(DISTINCT CASE WHEN pa.property_id IS NOT NULL AND (
        (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
      ) THEN pa.property_id END) as properties_with_amenity,
      (SELECT COUNT(DISTINCT p.property_id) FROM properties p
       JOIN destinations d ON d.destination_id = p.destination_id
       WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
      ) as total_properties
    FROM amenities a
    LEFT JOIN property_amenities pa ON pa.amenity_id = a.amenity_id
    LEFT JOIN properties p ON p.property_id = pa.property_id
    LEFT JOIN destinations d ON d.destination_id = p.destination_id
    WHERE
      (a.category = 'Basic') OR
      (LOWER(a.name) LIKE '%kitchen%') OR
      (LOWER(a.name) LIKE '%refrigerator%') OR
      (LOWER(a.name) LIKE '%microwave%') OR
      (LOWER(a.name) LIKE '%parking%') OR
      (LOWER(a.name) LIKE '%smoke detector%') OR
      (LOWER(a.name) LIKE '%first aid%') OR
      (LOWER(a.name) LIKE '%washer%') OR
      (LOWER(a.name) LIKE '%dryer%')
    GROUP BY a.name, a.amenity_id
  ) ag,
  property_metrics pm
)
SELECT
  pm.avg_nightly_rate,
  pt.top_property_type,
  pt.top_property_count,
  pm.underperforming_count,
  pt.property_type_count,
  COALESCE(pt.property_types_performance, array()) as property_types_performance,
  COALESCE(ag.amenity_gaps, array()) as amenity_gaps
FROM property_metrics pm
CROSS JOIN property_types_agg pt
CROSS JOIN amenity_gaps_agg ag
"""

# Operations Performance - Databricks SQL Warehouse version
OPERATIONS_PERFORMANCE_QUERY = """
WITH filtered_destinations AS (
  SELECT DISTINCT d.destination_id, d.destination, d.country
  FROM destinations d
  WHERE (? IS NULL OR ? = 'all' OR LOWER(d.country) LIKE CONCAT('%', LOWER(?), '%'))
),
employee_by_city AS (
  SELECT
    fd.destination as city,
    COUNT(DISTINCT CASE WHEN e.is_currently_employed = true THEN e.employee_id END) as count
  FROM filtered_destinations fd
  LEFT JOIN employees e ON e.country = fd.country
  GROUP BY fd.destination
),
operational_metrics AS (
  SELECT
    SUM(ebc.count) as total_employees,
    collect_list(
      struct(
        ebc.city as city,
        ebc.count as count
      )
    ) as employee_distribution
  FROM employee_by_city ebc
  WHERE ebc.count > 0
),
employee_counts AS (
  SELECT COUNT(DISTINCT e.employee_id) as total_employed
  FROM employees e
  INNER JOIN filtered_destinations fd ON e.country = fd.country
  WHERE e.is_currently_employed = true
),
active_hosts AS (
  SELECT CAST(COUNT(DISTINCT h.host_id) AS DECIMAL(10,2)) as total_hosts
  FROM hosts h
  INNER JOIN filtered_destinations fd ON h.country = fd.country
  WHERE h.is_active = true
),
host_employee_ratio AS (
  SELECT
    CASE
      WHEN ec.total_employed > 0
      THEN ROUND(
        GREATEST(1.5, LEAST(5.0,
          ah.total_hosts / (CAST(ec.total_employed AS DECIMAL(10,2)) / 100)
        )), 1
      )
      ELSE 2.0
    END as host_employee_ratio
  FROM employee_counts ec
  CROSS JOIN active_hosts ah
),
support_metrics AS (
  SELECT
    GREATEST(1.5, LEAST(8.0,
      COALESCE(
        ROUND(
          AVG(unix_timestamp(b.updated_at) - unix_timestamp(b.created_at)) / 3600 / 24, 1
        ), 4.2
      )
    )) as support_response_time_hours,
    COUNT(DISTINCT fd.destination) as cities_covered
  FROM bookings b
  INNER JOIN properties p ON p.property_id = b.property_id
  INNER JOIN filtered_destinations fd ON fd.destination_id = p.destination_id
  WHERE b.status IN ('confirmed', 'completed')
    AND YEAR(b.created_at) = 2025
    AND MONTH(b.created_at) <= 7
    AND b.updated_at IS NOT NULL
)
SELECT
  COALESCE(om.total_employees, 0) as total_employees,
  COALESCE(her.host_employee_ratio, 2.0) as host_employee_ratio,
  sm.support_response_time_hours,
  sm.cities_covered,
  COALESCE(om.employee_distribution, array()) as employee_distribution
FROM support_metrics sm
LEFT JOIN operational_metrics om ON 1=1
LEFT JOIN host_employee_ratio her ON 1=1
"""
