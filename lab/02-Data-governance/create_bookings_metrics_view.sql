-- Create Metric View for Genie Spaces and Power BI
-- Auto-detects catalog/schema or uses job parameters

-- Set catalog and schema context
DECLARE OR REPLACE VARIABLE target_catalog STRING;
DECLARE OR REPLACE VARIABLE target_schema STRING;

SET VARIABLE target_catalog = 'ignite_2025';  -- Default catalog
SET VARIABLE target_schema = LOWER(REPLACE(REPLACE(SPLIT(CURRENT_USER(), '@')[0], '.', '_'), '-', '_'));  -- Auto-detect schema

-- Set the context so we don't need to qualify table names
USE CATALOG IDENTIFIER(target_catalog);
USE SCHEMA IDENTIFIER(target_schema);

-- ============================================================================
-- Step 2: Create the Metric View
-- ============================================================================
CREATE OR REPLACE VIEW wanderbricks_bookings_metrics
WITH METRICS
LANGUAGE YAML
AS $$
version: 1.1
source: fact_bookings
joins:
  - name: customer
    source: dim_customer
    on: source.user_id = customer.user_id
  - name: property
    source: dim_property
    on: source.property_id = property.property_id
  - name: host
    source: dim_host
    on: source.host_sk = host.host_sk
  - name: checkin_date
    source: dim_date
    on: source.checkin_date_sk = checkin_date.date_sk
  - name: booking_date
    source: dim_date
    on: source.booking_date_sk = booking_date.date_sk
comment: Comprehensive booking analytics metric view with customer, property, host, and temporal dimensions for the Wanderbricks travel platform.
dimensions:
  # Booking Dimensions
  - name: Booking ID
    expr: booking_id
    comment: "Unique identifier of the booking, used to track and reference individual bookings."
    synonyms:
      - booking identifier
      - ID of booking
  - name: Booking Status
    expr: booking_status
    comment: "The current status of the booking: confirmed, cancelled, completed, or pending."
    synonyms:
      - status of booking
      - booking state
  - name: Payment Status
    expr: payment_status
    comment: "Indicates if there were any payment issues or if the payment flow is normal."
    synonyms:
      - payment condition
      - payment state
  - name: Nights Stayed
    expr: nights_stayed
    comment: "The number of nights the guest stayed at the property."
    synonyms:
      - number of nights
      - stay duration in nights
  - name: Guests Count
    expr: guest_count
    comment: "The total number of guests included in the booking."
    synonyms:
      - number of guests
      - guest count
      - total guests
  - name: Is Weekend Check-in
    expr: is_weekend_checkin
    comment: "Boolean flag indicating if the check-in date falls on a weekend (Saturday or Sunday)."
    synonyms:
      - weekend checkin
      - checkin on weekend
  
  # Customer Dimensions
  - name: User ID
    expr: customer.user_id
    comment: "Unique identifier of the user who made the booking."
    synonyms:
      - customer ID
      - user identifier
  - name: User Name
    expr: customer.user_name
    comment: "The full name of the user who made the booking."
    synonyms:
      - customer name
      - name of user
  - name: User Email
    expr: customer.email
    comment: "The email address of the user who made the booking."
    synonyms:
      - customer email
      - email address
  - name: User Type
    expr: customer.user_type
    comment: "The type of user account, such as standard, premium, or VIP."
    synonyms:
      - customer type
      - user category
  - name: User Is Business
    expr: customer.is_business
    comment: "Boolean flag indicating whether the user is a business entity or individual customer."
    synonyms:
      - business customer
      - is business user
  - name: User Company Name
    expr: customer.company_name
    comment: "The name of the company if the user is a business entity."
    synonyms:
      - company name
      - business name
  - name: Customer Country
    expr: customer.country
    comment: "The country of residence of the user who made the booking."
    synonyms:
      - user country
      - customer nation
  - name: Customer Region
    expr: customer.region
    comment: "The geographic region of the customer: EMEA, Americas, or APAC."
    synonyms:
      - user region
      - customer geography
  - name: Customer Segment
    expr: customer.customer_segment
    comment: "Customer segmentation: B2B for business customers or B2C for individual consumers."
    synonyms:
      - user segment
      - customer category
  - name: Customer Since
    expr: customer.created_date
    comment: "The date when the customer first registered on the platform."
    synonyms:
      - customer registration date
      - user created date
  
  # Property Dimensions
  - name: Property ID
    expr: property.property_id
    comment: "Unique identifier of the property being booked."
    synonyms:
      - property identifier
      - listing ID
  - name: Property Title
    expr: property.property_title
    comment: "The title or name of the property listing."
    synonyms:
      - property name
      - listing title
  - name: Property Type
    expr: property.property_type
    comment: "The type of property: house, apartment, villa, cottage, etc."
    synonyms:
      - type of property
      - listing type
  - name: Property Base Price
    expr: property.base_price
    comment: "The base nightly price for the property in USD."
    synonyms:
      - property price
      - nightly rate
  - name: Property Max Guests
    expr: property.max_guests
    comment: "The maximum number of guests that the property can accommodate."
    synonyms:
      - maximum guests
      - guest capacity
  - name: Property Bedrooms
    expr: property.bedrooms
    comment: "The total number of bedrooms available in the property."
    synonyms:
      - number of bedrooms
      - bedroom count
  - name: Property Bathrooms
    expr: property.bathrooms
    comment: "The total number of bathrooms available in the property."
    synonyms:
      - number of bathrooms
      - bathroom count
  - name: Property City
    expr: property.city_name
    comment: "The city or destination where the property is located."
    synonyms:
      - property destination
      - city name
  - name: Property Country
    expr: property.country
    comment: "The country where the property is located."
    synonyms:
      - property nation
      - destination country
  - name: Property Region
    expr: property.region
    comment: "The geographic region of the property: EMEA, Americas, or APAC."
    synonyms:
      - property geography
      - destination region
  - name: Property State Or Province
    expr: property.state_or_province
    comment: "The state or province where the property is located."
    synonyms:
      - property state
      - destination state
  - name: Property Destination ID
    expr: property.destination_id
    comment: "Unique identifier of the destination where the property is located."
    synonyms:
      - destination identifier
      - ID of destination
  - name: Destination State Or Province Code
    expr: property.state_or_province_code
    comment: "The code of the state, province, or region where the destination is located."
    synonyms:
      - state or province code
      - destination state code
  - name: Destination Country Code
    expr: property.destination_country_code
    comment: "The ISO 2-letter country code of the destination country."
    synonyms:
      - country code
      - destination country code
  - name: Destination Continent
    expr: property.destination_continent
    comment: "The continent where the destination country is located."
    synonyms:
      - continent of destination
      - destination continent
  - name: Property Latitude
    expr: property.property_latitude
    comment: "The latitude coordinate of the property's location."
    synonyms:
      - latitude
      - property latitude
  - name: Property Longitude
    expr: property.property_longitude
    comment: "The longitude coordinate of the property's location."
    synonyms:
      - longitude
      - property longitude
  - name: Property Total Amenities
    expr: property.total_amenities
    comment: "The total count of amenities available at the property."
    synonyms:
      - amenity count
      - number of amenities
  - name: Property Has WiFi
    expr: property.has_wifi
    comment: "Boolean flag indicating if the property has WiFi available."
    synonyms:
      - WiFi available
      - has internet
  - name: Property Has Kitchen
    expr: property.has_kitchen
    comment: "Boolean flag indicating if the property has a kitchen."
    synonyms:
      - kitchen available
      - has cooking facilities
  - name: Property Has Pool
    expr: property.has_pool
    comment: "Boolean flag indicating if the property has a swimming pool."
    synonyms:
      - pool available
      - has swimming pool
  - name: Property Has Parking
    expr: property.has_parking
    comment: "Boolean flag indicating if the property has parking available."
    synonyms:
      - parking available
      - has parking space
  - name: Property Has Air Conditioning
    expr: property.has_air_conditioning
    comment: "Boolean flag indicating if the property has air conditioning."
    synonyms:
      - AC available
      - has cooling
  - name: Property Amenity Tier
    expr: property.amenity_tier
    comment: "Classification of property amenities: Basic, Standard, or Luxury."
    synonyms:
      - amenity level
      - amenity category
  - name: Property Price Tier
    expr: property.price_tier
    comment: "Price classification of the property: Budget, Mid-range, Luxury, or Premium."
    synonyms:
      - price category
      - pricing level
  - name: Property Size Category
    expr: property.size_category
    comment: "Size classification based on bedrooms: Studio, Small, Medium, or Large."
    synonyms:
      - size classification
      - property size
  
  # Host Dimensions
  - name: Host ID
    expr: host.host_id
    comment: "Unique identifier of the host who owns the property."
    synonyms:
      - host identifier
      - owner ID
  - name: Host Name
    expr: host.host_name
    comment: "The full name of the property host."
    synonyms:
      - host full name
      - owner name
  - name: Host Country
    expr: host.host_country
    comment: "The country where the host is based."
    synonyms:
      - host nation
      - owner country
  - name: Host Region
    expr: host.host_region
    comment: "The geographic region of the host: EMEA, Americas, or APAC."
    synonyms:
      - host geography
      - owner region
  - name: Host Rating
    expr: host.host_rating
    comment: "The average rating of the host on a scale of 1.0 to 5.0 based on guest reviews."
    synonyms:
      - host score
      - owner rating
  - name: Host Is Verified
    expr: host.is_verified
    comment: "Boolean flag indicating whether the host has been verified by the platform."
    synonyms:
      - verified host
      - host verified
  - name: Host Has Staff
    expr: host.has_staff
    comment: "Boolean flag indicating if the host employs staff to manage properties."
    synonyms:
      - has employees
      - staffed host
  - name: Host Management Style
    expr: host.management_style
    comment: "Classification of host management: Owner_Operated, Hybrid, or Staff_Managed."
    synonyms:
      - management type
      - host style
  - name: Host Tier
    expr: host.host_tier
    comment: "Host tier based on rating: Elite (4.5+), Super (4.0+), Standard (3.5+), or New."
    synonyms:
      - host level
      - host category
  - name: Host Experience Level
    expr: host.experience_level
    comment: "Host experience based on tenure: <1 year, 1-3 years, or 3+ years."
    synonyms:
      - host tenure
      - years of experience
  
  # Check-in Date Dimensions
  - name: Check-In Date
    expr: checkin_date.full_date
    comment: "The date on which the guests are scheduled to check into the property."
    synonyms:
      - checkin date
      - arrival date
  - name: Check-In Year
    expr: checkin_date.year
    comment: "The year of the check-in date."
    synonyms:
      - checkin year
      - arrival year
  - name: Check-In Quarter
    expr: checkin_date.quarter_name
    comment: "The quarter and year of the check-in date (e.g., Q1 2025)."
    synonyms:
      - checkin quarter
      - arrival quarter
  - name: Check-In Month
    expr: checkin_date.month_name
    comment: "The month name of the check-in date (e.g., January, February)."
    synonyms:
      - checkin month
      - arrival month
  - name: Check-In Season
    expr: checkin_date.season
    comment: "The season of the check-in date: Winter, Spring, Summer, or Fall."
    synonyms:
      - checkin season
      - arrival season
  - name: Check-In Day Name
    expr: checkin_date.day_name
    comment: "The day of the week for the check-in date (e.g., Monday, Tuesday)."
    synonyms:
      - checkin day
      - arrival day of week
  - name: Check-In Is Weekend
    expr: checkin_date.is_weekend
    comment: "Boolean flag indicating if the check-in date falls on a weekend."
    synonyms:
      - checkin weekend flag
      - arrival on weekend
  - name: Check-In Fiscal Year
    expr: checkin_date.fiscal_year
    comment: "The fiscal year of the check-in date (starts in April)."
    synonyms:
      - checkin FY
      - arrival fiscal year
  
  # Booking Date Dimensions
  - name: Booking Date
    expr: booking_date.full_date
    comment: "The date when the booking was initially created."
    synonyms:
      - booking creation date
      - date of booking
  - name: Booking Year
    expr: booking_date.year
    comment: "The year when the booking was created."
    synonyms:
      - booking creation year
      - year of booking
  - name: Booking Month
    expr: booking_date.month_name
    comment: "The month name when the booking was created."
    synonyms:
      - booking creation month
      - month of booking
  - name: Booking Season
    expr: booking_date.season
    comment: "The season when the booking was created: Winter, Spring, Summer, or Fall."
    synonyms:
      - booking creation season
      - season of booking

measures:
  # Count Measures
  - name: Total Bookings
    expr: COUNT(*)
    comment: "The total number of bookings."
    synonyms:
      - booking count
      - number of bookings
  - name: Confirmed Bookings
    expr: SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END)
    comment: "The total number of confirmed bookings."
    synonyms:
      - confirmed booking count
      - number of confirmed bookings
  - name: Cancelled Bookings
    expr: SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END)
    comment: "The total number of cancelled bookings."
    synonyms:
      - cancelled booking count
      - number of cancelled bookings
  - name: Completed Bookings
    expr: SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END)
    comment: "The total number of completed bookings where guests have checked out."
    synonyms:
      - completed booking count
      - number of completed bookings
  
  # Revenue Measures
  - name: Total Revenue
    expr: SUM(total_amount)
    comment: "The total revenue generated from all bookings."
    synonyms:
      - total booking revenue
      - booking revenue
  - name: Net Revenue
    expr: SUM(net_revenue)
    comment: "The net revenue after accounting for refunds and payment issues."
    synonyms:
      - revenue after refunds
      - net booking revenue
  - name: Avg Booking Amount
    expr: AVG(total_amount)
    comment: "The average amount paid per booking."
    synonyms:
      - average booking amount
      - mean booking amount
      - average booking value
  - name: Total Refunds
    expr: SUM(refund_amount)
    comment: "The total amount refunded to customers."
    synonyms:
      - total refund amount
      - refund total
  - name: Total Payments Made
    expr: SUM(total_payments_made)
    comment: "The total amount of successful payments received."
    synonyms:
      - total payment amount
      - payments received
  - name: Revenue Per Night
    expr: SUM(total_amount) / NULLIF(SUM(nights_stayed), 0)
    comment: "The average revenue generated per night stayed across all bookings."
    synonyms:
      - nightly revenue
      - revenue per night stayed
  
  # Stay Measures
  - name: Total Duration of Stay
    expr: SUM(nights_stayed)
    comment: "The total time guests stayed at the property in days."
    synonyms:
      - total days stayed
      - total nights stayed
      - total stay duration
  - name: Avg Duration of Stay
    expr: AVG(nights_stayed)
    comment: "The average time guests stayed at the property in days."
    synonyms:
      - average days stayed
      - mean days stayed
      - average nights stayed
      - mean stay duration
  - name: Total Num Guests
    expr: SUM(guest_count)
    comment: "Total number of guests for the bookings."
    synonyms:
      - total guest count
      - overall guests
      - overall guest count
  - name: Avg Num Guests
    expr: AVG(guest_count)
    comment: "Average number of guests for the bookings."
    synonyms:
      - average guests
      - mean guest count
      - average guest count
  
  # Distinct Count Measures
  - name: Unique Customers
    expr: COUNT(DISTINCT user_id)
    comment: "The total number of unique customers who made bookings."
    synonyms:
      - distinct customers
      - customer count
  - name: Unique Properties
    expr: COUNT(DISTINCT property_id)
    comment: "The total number of unique properties that were booked."
    synonyms:
      - distinct properties
      - property count
  - name: Unique Hosts
    expr: COUNT(DISTINCT host.host_id)
    comment: "The total number of unique hosts with bookings."
    synonyms:
      - distinct hosts
      - host count
  
  # Rate Measures
  - name: Cancellation Rate
    expr: SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)
    comment: "The percentage of bookings that were cancelled."
    synonyms:
      - cancellation percentage
      - cancel rate
  - name: Completion Rate
    expr: SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)
    comment: "The percentage of bookings that were completed successfully."
    synonyms:
      - completion percentage
      - complete rate
  - name: Confirmation Rate
    expr: SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)
    comment: "The percentage of bookings that are in confirmed status."
    synonyms:
      - confirmation percentage
      - confirm rate
  
  # Business Metrics
  - name: Average Revenue Per Guest
    expr: SUM(total_amount) / NULLIF(SUM(guest_count), 0)
    comment: "The average revenue generated per guest across all bookings."
    synonyms:
      - revenue per guest
      - guest revenue
  - name: Total Num Bookings per User
    expr: COUNT(*) / NULLIF(COUNT(DISTINCT user_id), 0)
    comment: "The total number of bookings made per user."
    synonyms:
      - bookings per user
      - total user bookings
      - average bookings per customer
      - customer booking frequency
  - name: Total Num Bookings per Property
    expr: COUNT(*) / NULLIF(COUNT(DISTINCT property_id), 0)
    comment: "The total number of bookings made per property."
    synonyms:
      - bookings per property
      - total property bookings
      - average bookings per property
      - property booking frequency
  - name: Average Payment Count
    expr: AVG(payment_count)
    comment: "The average number of payments made per booking."
    synonyms:
      - average payments
      - mean payment count
  - name: Avg Property Revenue
    expr: AVG(total_amount) / COUNT(DISTINCT property_id)
    comment: "The average revenue generated per property."
    synonyms:
      - average property revenue
      - mean property revenue
      - revenue per property

  # Advanced Host Metrics
  - name: Total Num Active Hosts
    expr: COUNT(DISTINCT CASE WHEN host.is_active = true THEN host.host_id END)
    comment: "The total number of hosts who are currently active on the platform."
    synonyms:
      - active hosts
      - total active hosts
      - number of active hosts
  - name: Total Num Verified Hosts
    expr: COUNT(DISTINCT CASE WHEN host.is_verified = true THEN host.host_id END)
    comment: "The total number of hosts who have been verified by the platform."
    synonyms:
      - verified hosts
      - total verified hosts
      - number of verified hosts
  - name: Avg Host Rating
    expr: AVG(host.host_rating)
    comment: "The average rating of hosts based on guest reviews."
    synonyms:
      - average host rating
      - mean host rating
      - average host score

  # Advanced Customer Metrics
  - name: Total Num Business Users
    expr: COUNT(DISTINCT CASE WHEN customer.is_business = true THEN customer.user_id END)
    comment: "The total number of users who are registered as business entities."
    synonyms:
      - business users
      - total business users
      - number of business users

  # Time-based Window Metrics
  - name: 7 Day Trailing Booking Revenue
    expr: SUM(total_amount)
    window:
      - order: Booking Date
        semiadditive: last
        range: trailing 7 days
    comment: "The total booking revenue over the trailing 7 days."
    synonyms:
      - weekly trailing revenue
      - 7 day revenue
      - trailing revenue
$$;