
--  # Overlapping Bookings Detection
--  
--  This table identifies overlapping bookings for the same property to detect potential conflicts.
--  Analyzes booking conflicts by comparing check-in/check-out dates across all active bookings.


CREATE OR REFRESH MATERIALIZED VIEW overlapping_bookings
COMMENT "Identifies overlapping bookings for the same property to detect potential conflicts"
AS
WITH bookings_with_dates AS (
  SELECT 
    f.property_id,
    f.booking_id,
    f.booking_status,
    f.user_id,
    checkin_date.full_date as check_in,
    -- Calculate check_out by adding nights_stayed (simplified - using 1 day for demo)
    DATE_ADD(checkin_date.full_date, 1) as check_out
  FROM LIVE.fact_bookings f
    JOIN LIVE.dim_date checkin_date ON f.checkin_date_sk = checkin_date.date_sk
  WHERE f.booking_status != 'cancelled'
),
overlapping_pairs AS (
  SELECT 
    a.property_id,
    a.booking_id as booking_id_a,
    b.booking_id as booking_id_b,
    a.booking_status as booking_status_a,
    b.booking_status as booking_status_b,
    a.user_id as user_id_a,
    b.user_id as user_id_b,
    a.check_in as check_in_a,
    a.check_out as check_out_a,
    b.check_in as check_in_b,
    b.check_out as check_out_b,
    
    -- Add conflict severity
    CASE 
      WHEN a.booking_status = 'confirmed' AND b.booking_status = 'confirmed' THEN 'High'
      WHEN a.booking_status = 'confirmed' OR b.booking_status = 'confirmed' THEN 'Medium'
      ELSE 'Low'
    END as conflict_severity,
    
    -- Add overlap days calculation
    DATEDIFF(
      LEAST(a.check_out, b.check_out),
      GREATEST(a.check_in, b.check_in)
    ) as overlap_days
    
  FROM bookings_with_dates a
    JOIN bookings_with_dates b ON a.property_id = b.property_id
  WHERE 
    a.booking_id != b.booking_id
    AND (
      -- Case 1: booking A starts before or on B's start and ends after B starts
      (a.check_in <= b.check_in AND a.check_out > b.check_in)
      OR
      -- Case 2: booking A starts after B starts but before B ends  
      (a.check_in >= b.check_in AND a.check_in < b.check_out)
    )
)
SELECT *
FROM overlapping_pairs
WHERE overlap_days > 0;
