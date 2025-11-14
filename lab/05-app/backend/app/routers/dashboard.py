"""
Country Manager Dashboard API endpoints
Provides aggregated analytics data for the dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any
import asyncpg
import logging
import datetime
from app.database.connection import get_db_connection
from sql.dashboard_queries import (
    MARKET_PERFORMANCE_QUERY,
    CITY_PERFORMANCE_QUERY,
    HOST_SUPPLY_QUERY,
    PROPERTY_PERFORMANCE_QUERY,
    EMPLOYEE_OPERATIONS_QUERY
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)

def calculate_mom_growth_from_trends(monthly_trends):
    """
    Calculate month-over-month growth from monthly trends data
    Returns the growth rate between the latest two months available
    """
    if not monthly_trends or len(monthly_trends) < 2:
        return 0.0
    
    try:
        # Get the last two months of data
        current_month = monthly_trends[-1]
        previous_month = monthly_trends[-2]
        
        # Extract booking values (assuming bookings field exists)
        current_bookings = current_month.get('bookings', 0) or 0
        previous_bookings = previous_month.get('bookings', 0) or 0
        
        if previous_bookings == 0:
            return 100.0 if current_bookings > 0 else 0.0
            
        growth_rate = ((current_bookings - previous_bookings) / previous_bookings) * 100
        return round(growth_rate, 2)
        
    except (KeyError, TypeError, ValueError):
        # Fallback if data structure is different
        return 0.0

@router.get("/market-performance")
async def get_market_performance(
    country: Optional[str] = Query(None, description="Filter by country (e.g. 'Japan', 'United States', 'all')")
):
    """
    Get comprehensive market performance metrics including:
    - Gross Booking Value (GBV)
    - Revenue (15% commission)
    - Booking volume and trends
    - Occupancy rates
    - Monthly trend data
    """
    try:
        async with get_db_connection() as conn:
            logger.info(f"Fetching market performance data for country: {country}")
            
            result = await conn.fetchrow(MARKET_PERFORMANCE_QUERY, country)
            
            if not result:
                return {
                    "total_gbv": 0,
                    "total_revenue": 0,
                    "total_bookings": 0,
                    "avg_booking_value": 0,
                    "occupancy_rate": 0,
                    "total_properties": 0,
                    "unique_cities": 0,
                    "total_hosts": 0,
                    "monthly_trends": []
                }
            
            return {
                "total_gbv": float(result['total_gbv']) if result['total_gbv'] else 0,
                "total_revenue": float(result['total_revenue']) if result['total_revenue'] else 0,
                "total_bookings": int(result['total_bookings']) if result['total_bookings'] else 0,
                "avg_booking_value": float(result['avg_booking_value']) if result['avg_booking_value'] else 0,
                "occupancy_rate": float(result['occupancy_rate']) if result['occupancy_rate'] else 0,
                "total_properties": int(result['total_properties']) if result['total_properties'] else 0,
                "unique_cities": int(result['unique_cities']) if result['unique_cities'] else 0,
                "total_hosts": int(result['total_hosts']) if result['total_hosts'] else 0,
                "monthly_trends": result['monthly_trends'] if result['monthly_trends'] else [],
                # Calculate month-over-month growth (simplified)
                # Calculate real month-over-month growth from monthly trends data
                "mom_growth": calculate_mom_growth_from_trends(result['monthly_trends'] if result['monthly_trends'] else [])
            }
            
    except Exception as e:
        logger.error(f"Error fetching market performance data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market performance data")

@router.get("/city-performance")
async def get_city_performance(
    country: Optional[str] = Query(None, description="Filter by country")
):
    """
    Get city-level performance metrics including:
    - Top performing cities by GBV
    - Occupancy rates by city
    - Market share analysis
    - Property counts per city
    """
    try:
        async with get_db_connection() as conn:
            logger.info(f"Fetching city performance data for country: {country}")
            
            results = await conn.fetch(CITY_PERFORMANCE_QUERY, country)
            
            cities_data = []
            for row in results:
                cities_data.append({
                    "city_name": row['city_name'],
                    "gbv": float(row['gbv']) if row['gbv'] else 0,
                    "booking_count": int(row['booking_count']) if row['booking_count'] else 0,
                    "properties_count": int(row['properties_count']) if row['properties_count'] else 0,
                    "occupancy_rate": float(row['occupancy_rate']) if row['occupancy_rate'] else 0,
                    "market_share": float(row['market_share']) if row['market_share'] else 0,
                    "avg_rating": float(row['avg_rating']) if row['avg_rating'] else 0,
                    "avg_booking_value": float(row['avg_booking_value']) if row['avg_booking_value'] else 0
                })
            
            return {
                "cities": cities_data,
                "total_cities": len(cities_data)
            }
            
    except Exception as e:
        logger.error(f"Error fetching city performance data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch city performance data")

@router.get("/host-supply")
async def get_host_supply(
    country: Optional[str] = Query(None, description="Filter by country")
):
    """
    Get host and supply health metrics including:
    - Active host count
    - Superhost percentage
    - Host growth and churn rates
    - Single vs multi-property host distribution
    """
    try:
        async with get_db_connection() as conn:
            logger.info(f"Fetching host supply data for country: {country}")
            
            result = await conn.fetchrow(HOST_SUPPLY_QUERY, country)
            
            if not result:
                return {
                    "active_hosts": 0,
                    "superhost_percentage": 0,
                    "single_property_hosts": 0,
                    "multi_property_hosts": 0,
                    "host_growth_rate": 0,
                    "host_churn_rate": 0,
                    "host_engagement_rate": 0,
                    "avg_host_rating": 0
                }
            
            return {
                "active_hosts": int(result['active_hosts']) if result['active_hosts'] else 0,
                "superhost_percentage": float(result['superhost_percentage']) if result['superhost_percentage'] else 0,
                "single_property_hosts": int(result['single_property_hosts']) if result['single_property_hosts'] else 0,
                "multi_property_hosts": int(result['multi_property_hosts']) if result['multi_property_hosts'] else 0,
                "host_growth_rate": float(result['host_growth_rate']) if result['host_growth_rate'] else 0,
                "host_churn_rate": float(result['host_churn_rate']) if result['host_churn_rate'] else 0,
                "host_engagement_rate": float(result['host_engagement_rate']) if result['host_engagement_rate'] else 0,
                "avg_host_rating": float(result['avg_host_rating']) if result['avg_host_rating'] else 0
            }
            
    except Exception as e:
        logger.error(f"Error fetching host supply data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch host supply data")

@router.get("/property-performance")
async def get_property_performance(
    country: Optional[str] = Query(None, description="Filter by country")
):
    """
    Get property performance insights including:
    - Property type distribution and performance
    - Underperforming properties
    - Amenity coverage gaps
    - Average nightly rates by type
    """
    try:
        async with get_db_connection() as conn:
            logger.info(f"Fetching property performance data for country: {country}")
            
            result = await conn.fetchrow(PROPERTY_PERFORMANCE_QUERY, country)
            
            if not result:
                return {
                    "property_types": [],
                    "underperforming_count": 0,
                    "amenity_coverage": [],
                    "avg_nightly_rate": 0
                }
            
            return {
                "property_types": result['property_types'] if result['property_types'] else [],
                "underperforming_count": int(result['underperforming_count']) if result['underperforming_count'] else 0,
                "amenity_coverage": result['amenity_coverage'] if result['amenity_coverage'] else [],
                "total_properties": len(result['property_types']) if result['property_types'] else 0
            }
            
    except Exception as e:
        logger.error(f"Error fetching property performance data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch property performance data")


@router.get("/employee-operations")
async def get_employee_operations(
    country: Optional[str] = Query(None, description="Filter by country")
):
    """
    Get employee and operations metrics including:
    - Total employee count
    - Employee distribution by city
    - Host-to-employee ratios
    - Support response times and SLA compliance
    """
    try:
        async with get_db_connection() as conn:
            logger.info(f"Fetching employee operations data for country: {country}")
            
            result = await conn.fetchrow(EMPLOYEE_OPERATIONS_QUERY, country)
            
            if not result:
                return {
                    "total_employees": 0,
                    "employees_per_city": [],
                    "avg_host_to_employee_ratio": 0,
                    "cities_covered": 0,
                    "support_response_time_hours": 0,
                    "sla_compliance_percentage": 0
                }
            
            return {
                "total_employees": int(result['total_employees']) if result['total_employees'] else 0,
                "employees_per_city": result['employees_per_city'] if result['employees_per_city'] else [],
                "avg_host_to_employee_ratio": float(result['avg_host_to_employee_ratio']) if result['avg_host_to_employee_ratio'] else 0,
                "cities_covered": int(result['cities_covered']) if result['cities_covered'] else 0,
                "support_response_time_hours": float(result['support_response_time_hours']) if result['support_response_time_hours'] else 0,
                "sla_compliance_percentage": float(result['sla_compliance_percentage']) if result['sla_compliance_percentage'] else 0
            }
            
    except Exception as e:
        logger.error(f"Error fetching employee operations data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch employee operations data")

@router.get("/countries")
async def get_available_countries():
    """
    Get list of available countries for filtering dashboard data
    """
    try:
        async with get_db_connection() as conn:
            logger.info("Fetching available countries")
            
            query = """
            SELECT DISTINCT d.country, COUNT(p.property_id) as property_count
            FROM destinations d
            JOIN properties p ON p.destination_id = d.destination_id
            GROUP BY d.country
            ORDER BY property_count DESC
            """
            
            results = await conn.fetch(query)
            
            countries = []
            for row in results:
                countries.append({
                    "country": row['country'],
                    "property_count": int(row['property_count'])
                })
            
            return {
                "countries": countries,
                "total_countries": len(countries)
            }
            
    except Exception as e:
        logger.error(f"Error fetching available countries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch available countries")

@router.get("/summary")
async def get_dashboard_summary(
    country: Optional[str] = Query(None, description="Filter by country")
):
    """
    Get a summary of all dashboard metrics in a single call for initial page load
    """
    try:
        # This endpoint combines multiple queries for efficiency
        # In production, consider caching this data
        market_data = await get_market_performance(country)
        
        return {
            "market_performance": market_data,
            "last_updated": datetime.datetime.now().isoformat(),  # Real timestamp
            "country_filter": country or "all",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard summary")