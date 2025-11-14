import json
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.property import Property, SearchCriteria, BookingCreate, Booking
from app.database.connection import get_db_connection
import asyncpg
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


class PropertyService:
    """Service for handling property-related database operations"""
    
    @staticmethod
    async def search_properties(criteria: SearchCriteria, conn: asyncpg.Connection) -> List[Property]:
        """Search properties based on criteria"""
        try:
            # Build dynamic query with proper joins to destinations and amenities
            query = """
                SELECT p.property_id as id, p.title, p.description, p.base_price as price_per_night,
                       p.property_type, p.max_guests, p.bedrooms, p.bathrooms, p.created_at,
                       CURRENT_TIMESTAMP as updated_at,
                       d.destination || ', ' || d.country as location,
                       p.host_id::text as host_id,
                       -- Calculate rating based on booking success rate (0-5 scale)
                       LEAST(5.0, GREATEST(1.0, 
                         COALESCE(
                           (SELECT COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT DATE_PART('month', b.created_at)), 0) 
                            FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed'), 0
                         ) + 3.0
                       )) as rating,
                       -- Real review count from completed bookings
                       (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed') as review_count,
                       -- Calculate superhost based on booking volume (10+ bookings)
                       (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed') >= 10 as is_superhost,
                       COALESCE(pa.amenities, '[]'::json) as amenities,
                       '[]'::json as images
                FROM properties p
                LEFT JOIN destinations d ON p.destination_id = d.destination_id
                LEFT JOIN (
                    SELECT pa.property_id, json_agg(a.name) as amenities
                    FROM property_amenities pa
                    JOIN amenities a ON pa.amenity_id = a.amenity_id 
                    GROUP BY pa.property_id
                ) pa ON p.property_id = pa.property_id
                WHERE 1=1
            """
            
            params = []
            param_count = 0
            
            if criteria.destination:
                param_count += 1
                destination = criteria.destination.strip()
                if ',' in destination:
                    # Handle "City, Country" format
                    city_part = destination.split(',')[0].strip()
                    query += f" AND LOWER(d.destination) LIKE LOWER(${param_count})"
                    params.append(f"%{city_part}%")
                else:
                    # Search in both destination and country
                    query += f" AND (LOWER(d.destination) LIKE LOWER(${param_count}) OR LOWER(d.country) LIKE LOWER(${param_count}))"
                    params.append(f"%{destination}%")
            
            if criteria.guests:
                param_count += 1
                query += f" AND p.max_guests >= ${param_count}"
                params.append(criteria.guests)
            
            # Add pagination
            param_count += 1
            query += f" ORDER BY p.created_at DESC LIMIT ${param_count}"
            params.append(criteria.limit)
            
            param_count += 1
            query += f" OFFSET ${param_count}"
            params.append((criteria.page - 1) * criteria.limit)
            
            logger.info(f"Executing query: {query} with params: {params}")
            
            rows = await conn.fetch(query, *params)
            properties = []
            
            for row in rows:
                prop_dict = dict(row)
                # Parse JSON fields
                prop_dict['images'] = json.loads(prop_dict['images'] or '[]')
                prop_dict['amenities'] = json.loads(prop_dict['amenities'] or '[]')
                prop_dict['availability_calendar'] = []  # Placeholder
                properties.append(Property(**prop_dict))
            
            return properties
            
        except Exception as e:
            logger.error(f"Error searching properties: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    @staticmethod
    async def get_property_by_id(property_id: str, conn: asyncpg.Connection) -> Optional[Property]:
        """Get a single property by ID"""
        try:
            query = """
                SELECT p.property_id as id, p.title, p.description, p.base_price as price_per_night,
                       p.property_type, p.max_guests, p.bedrooms, p.bathrooms, p.created_at,
                       CURRENT_TIMESTAMP as updated_at,
                       d.destination || ', ' || d.country as location,
                       p.host_id::text as host_id,
                       -- Calculate rating based on booking success rate (0-5 scale)
                       LEAST(5.0, GREATEST(1.0, 
                         COALESCE(
                           (SELECT COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT DATE_PART('month', b.created_at)), 0) 
                            FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed'), 0
                         ) + 3.0
                       )) as rating,
                       -- Real review count from completed bookings
                       (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed') as review_count,
                       -- Calculate superhost based on booking volume (10+ bookings)
                       (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.property_id AND b.status = 'confirmed') >= 10 as is_superhost,
                       COALESCE(pa.amenities, '[]'::json) as amenities,
                       '[]'::json as images
                FROM properties p
                LEFT JOIN destinations d ON p.destination_id = d.destination_id
                LEFT JOIN (
                    SELECT pa.property_id, json_agg(a.name) as amenities
                    FROM property_amenities pa
                    JOIN amenities a ON pa.amenity_id = a.amenity_id 
                    GROUP BY pa.property_id
                ) pa ON p.property_id = pa.property_id
                WHERE p.property_id = $1
            """
            
            row = await conn.fetchrow(query, property_id)
            
            if not row:
                return None
            
            prop_dict = dict(row)
            prop_dict['images'] = json.loads(prop_dict['images'] or '[]')
            prop_dict['amenities'] = json.loads(prop_dict['amenities'] or '[]')
            prop_dict['availability_calendar'] = []  # Placeholder
            
            return Property(**prop_dict)
            
        except Exception as e:
            logger.error(f"Error fetching property {property_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    @staticmethod
    async def create_booking(booking_data: BookingCreate, conn: asyncpg.Connection) -> Booking:
        """Create a new booking"""
        try:
            booking_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            query = """
                INSERT INTO bookings (
                    booking_id, property_id, user_id, check_in, check_out, guests_count,
                    total_amount, status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING booking_id as id, property_id, user_id as guest_id, 
                         check_in, check_out, guests_count as guests, total_amount,
                         status as booking_status, 'paid' as payment_status, created_at
            """
            
            values = (
                booking_id, booking_data.property_id, booking_data.guest_id,
                booking_data.check_in, booking_data.check_out, booking_data.guests,
                booking_data.total_amount, "confirmed", now, now
            )
            
            row = await conn.fetchrow(query, *values)
            return Booking(**dict(row))
            
        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/search")
async def search_properties(criteria: SearchCriteria, conn: asyncpg.Connection = Depends(get_db_connection)):
    """Search properties endpoint"""
    properties = await PropertyService.search_properties(criteria, conn)
    return {
        "data": properties,
        "status": "success", 
        "total": len(properties),
        "page": criteria.page,
        "limit": criteria.limit
    }


@router.get("/{property_id}")
async def get_property(property_id: str, conn: asyncpg.Connection = Depends(get_db_connection)):
    """Get property by ID endpoint"""
    property_obj = await PropertyService.get_property_by_id(property_id, conn)
    
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {
        "data": property_obj,
        "status": "success"
    }


@router.post("/bookings")
async def create_booking(booking_data: BookingCreate, conn: asyncpg.Connection = Depends(get_db_connection)):
    """Create booking endpoint"""
    booking = await PropertyService.create_booking(booking_data, conn)
    return {
        "data": booking,
        "status": "success"
    }
