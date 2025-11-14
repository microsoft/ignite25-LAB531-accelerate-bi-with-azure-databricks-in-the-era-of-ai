
-- Comprehensive booking insights for Power BI reporting
CREATE OR REFRESH MATERIALIZED VIEW booking_insights
COMMENT "Comprehensive booking insights with all dimensions including employee and review data - primary view for Power BI reporting"
AS
WITH employee_summary AS (
  SELECT 
    host_id,
    COUNT(*) as active_staff_count,
    AVG(tenure_months) as avg_staff_tenure,
    SUM(CASE WHEN role_category = 'Management' THEN 1 ELSE 0 END) as management_count
  FROM LIVE.dim_employee
  WHERE is_currently_employed = true
  GROUP BY host_id
),
review_summary AS (
  SELECT 
    booking_id,
    FIRST(rating) as review_rating,
    FIRST(created_at) as review_date
  FROM LIVE.latest_reviews
  GROUP BY booking_id
)
SELECT 
  -- Fact Metrics
  f.booking_id,
  f.total_amount,
  f.net_revenue,
  f.nights_stayed,
  f.guest_count,
  f.revenue_per_night,
  f.total_payments_made,
  f.refund_amount,
  f.payment_count,
  f.booking_status,
  f.payment_status,
  f.is_weekend_checkin,
  
  -- Check-in Date Dimensions
  checkin_date.full_date as checkin_date,
  checkin_date.year as checkin_year,
  checkin_date.quarter as checkin_quarter,
  checkin_date.quarter_name as checkin_quarter_name,
  checkin_date.month as checkin_month,
  checkin_date.month_name as checkin_month_name,
  checkin_date.month_year as checkin_month_year,
  checkin_date.day_name as checkin_day_name,
  checkin_date.season as checkin_season,
  checkin_date.is_weekend as is_weekend_checkin_date,
  checkin_date.fiscal_year as checkin_fiscal_year,
  
  -- Booking Date Dimensions
  booking_date.full_date as booking_date,
  booking_date.year as booking_year,
  booking_date.month_name as booking_month_name,
  booking_date.season as booking_season,
  
  -- Customer Dimensions
  c.user_id,
  c.user_name,
  c.email,
  c.user_type,
  c.is_business,
  c.company_name,
  c.country as customer_country,
  c.region as customer_region,
  c.customer_segment,
  c.created_date as customer_since,
  
  -- Property Dimensions
  p.property_id,
  p.property_title,
  p.property_type,
  p.base_price,
  p.max_guests,
  p.bedrooms,
  p.bathrooms,
  p.city_name,
  p.country as property_country,
  p.region as property_region,
  p.total_amenities,
  p.has_wifi,
  p.has_kitchen,
  p.has_pool,
  p.has_parking,
  p.has_air_conditioning,
  p.amenity_tier,
  p.total_images,
  p.has_professional_photos,
  p.price_tier,
  p.size_category,
  p.visual_appeal_score,
  
  -- Host Dimensions
  h.host_id,
  h.host_name,
  h.host_country,
  h.host_region,
  h.host_rating,
  h.is_verified as host_verified,
  h.employee_count,
  h.has_staff,
  h.management_style,
  h.host_tier,
  h.experience_level as host_experience,
  
  -- Employee Dimensions (3 columns)
  COALESCE(emp.active_staff_count, 0) as host_staff_count,
  ROUND(COALESCE(emp.avg_staff_tenure, 0.0), 1) as avg_staff_tenure_months,
  CASE 
    WHEN emp.active_staff_count > 2 THEN 'Staffed'
    WHEN emp.active_staff_count > 0 THEN 'Small Team'
    ELSE 'Owner Only'
  END as staffing_level,
  
  -- Review Dimensions (3 columns)
  rev.review_rating,
  CASE WHEN rev.review_rating IS NOT NULL THEN 1 ELSE 0 END as has_review,
  CASE 
    WHEN rev.review_rating >= 4.0 THEN 'Positive'
    WHEN rev.review_rating >= 3.0 THEN 'Neutral'
    WHEN rev.review_rating IS NOT NULL THEN 'Negative'
    ELSE 'No Review'
  END as review_sentiment,
  
  -- Calculated Fields for Power BI
  DATEDIFF(checkin_date.full_date, booking_date.full_date) as booking_lead_time_days,
  (f.total_amount / f.guest_count) as revenue_per_guest,
  CASE WHEN f.booking_status = 'confirmed' THEN 1 ELSE 0 END as is_confirmed_booking,
  CASE WHEN f.booking_status = 'cancelled' THEN 1 ELSE 0 END as is_cancelled_booking,
  CASE WHEN f.booking_status = 'completed' THEN 1 ELSE 0 END as is_completed_booking,
  CASE WHEN f.refund_amount > 0 THEN 1 ELSE 0 END as has_refund,
  CASE WHEN c.is_business = true THEN 'B2B' ELSE 'B2C' END as business_type,
  CASE 
    WHEN f.nights_stayed >= 7 THEN 'Week+'
    WHEN f.nights_stayed >= 3 THEN '3-6 Days'
    ELSE '1-2 Days'
  END as stay_length_category,
  CASE 
    WHEN f.guest_count >= 6 THEN 'Large Group'
    WHEN f.guest_count >= 3 THEN 'Small Group'
    ELSE 'Individual/Couple'
  END as group_size_category

FROM LIVE.fact_bookings f
  JOIN LIVE.dim_date checkin_date ON f.checkin_date_sk = checkin_date.date_sk
  JOIN LIVE.dim_date booking_date ON f.booking_date_sk = booking_date.date_sk
  JOIN LIVE.dim_customer c ON f.user_sk = c.user_sk
  JOIN LIVE.dim_property p ON f.property_sk = p.property_sk
  JOIN LIVE.dim_host h ON f.host_sk = h.host_sk
  LEFT JOIN employee_summary emp ON h.host_id = emp.host_id
  LEFT JOIN review_summary rev ON f.booking_id = rev.booking_id;
