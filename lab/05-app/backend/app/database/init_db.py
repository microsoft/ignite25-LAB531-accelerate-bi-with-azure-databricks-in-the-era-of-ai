"""
Database initialization script for the travel booking platform
Creates tables and populates sample data for demo purposes
"""
import asyncio
import asyncpg
import logging
import uuid
from datetime import datetime
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseInitializer:
    
    @staticmethod
    async def create_tables(conn: asyncpg.Connection):
        """Create all required database tables"""
        
        # Create properties table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS properties (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                property_type VARCHAR(50) NOT NULL,
                bedrooms INTEGER NOT NULL,
                bathrooms INTEGER NOT NULL,
                max_guests INTEGER NOT NULL,
                price_per_night DECIMAL(10,2) NOT NULL,
                rating DECIMAL(3,2) NOT NULL,
                review_count INTEGER NOT NULL,
                description TEXT,
                host_id VARCHAR(50) NOT NULL,
                is_superhost BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create property images table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS property_images (
                id VARCHAR(50) PRIMARY KEY,
                property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                display_order INTEGER DEFAULT 0
            )
        """)
        
        # Create property amenities table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS property_amenities (
                id VARCHAR(50) PRIMARY KEY,
                property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
                amenity_name VARCHAR(100) NOT NULL
            )
        """)
        
        # Create bookings table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(50) PRIMARY KEY,
                property_id VARCHAR(50) REFERENCES properties(id),
                guest_id VARCHAR(50) NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests INTEGER NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                guest_name VARCHAR(255) NOT NULL,
                guest_email VARCHAR(255) NOT NULL,
                guest_phone VARCHAR(50) NOT NULL,
                booking_status VARCHAR(50) DEFAULT 'pending',
                payment_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        logger.info("Database tables created successfully")
    
    @staticmethod
    async def populate_sample_data(conn: asyncpg.Connection):
        """Populate database with sample travel properties"""
        
        # Check if data already exists
        count = await conn.fetchval("SELECT COUNT(*) FROM properties")
        if count > 0:
            logger.info(f"Database already contains {count} properties, skipping sample data population")
            return
        
        sample_properties = [
            # Paris Properties
            {
                'id': 'paris-montmartre-apt',
                'title': 'Chic Montmartre Apartment', 
                'location': 'Paris, France',
                'property_type': 'apartment',
                'bedrooms': 2, 'bathrooms': 1, 'max_guests': 4,
                'price_per_night': 120.00, 'rating': 4.8, 'review_count': 127,
                'description': 'Beautiful apartment in the heart of Montmartre with stunning city views and modern amenities.',
                'host_id': 'host-paris-1', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800'
                ],
                'amenities': ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Washer', 'City view']
            },
            {
                'id': 'paris-louvre-loft',
                'title': 'Elegant Louvre District Loft',
                'location': 'Paris, France', 
                'property_type': 'apartment',
                'bedrooms': 1, 'bathrooms': 1, 'max_guests': 2,
                'price_per_night': 150.00, 'rating': 4.9, 'review_count': 89,
                'description': 'Stylish loft near the Louvre with high ceilings and historic charm.',
                'host_id': 'host-paris-2', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
                ],
                'amenities': ['WiFi', 'Kitchen', 'Heating', 'Historic building', 'Central location']
            },
            
            # Tokyo Properties  
            {
                'id': 'tokyo-shibuya-studio',
                'title': 'Modern Shibuya Studio',
                'location': 'Tokyo, Japan',
                'property_type': 'apartment', 
                'bedrooms': 1, 'bathrooms': 1, 'max_guests': 2,
                'price_per_night': 95.00, 'rating': 4.6, 'review_count': 203,
                'description': 'Contemporary studio in the heart of Shibuya, perfect for exploring Tokyo.',
                'host_id': 'host-tokyo-1', 'is_superhost': False,
                'images': [
                    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
                    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800'
                ],
                'amenities': ['WiFi', 'Air conditioning', 'TV', 'Elevator', 'Near subway', 'Modern']
            },
            {
                'id': 'tokyo-asakusa-traditional',
                'title': 'Traditional Asakusa House',
                'location': 'Tokyo, Japan',
                'property_type': 'house',
                'bedrooms': 3, 'bathrooms': 2, 'max_guests': 6,
                'price_per_night': 180.00, 'rating': 4.7, 'review_count': 156,
                'description': 'Authentic Japanese house in historic Asakusa district with traditional tatami rooms.',
                'host_id': 'host-tokyo-2', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1576669802071-bc8fcbd8b30c?w=800'
                ],
                'amenities': ['WiFi', 'Traditional design', 'Garden', 'Near temples', 'Authentic experience']
            },
            
            # New York Properties
            {
                'id': 'nyc-manhattan-loft', 
                'title': 'Manhattan Skyline Loft',
                'location': 'New York, USA',
                'property_type': 'apartment',
                'bedrooms': 2, 'bathrooms': 2, 'max_guests': 4, 
                'price_per_night': 220.00, 'rating': 4.5, 'review_count': 178,
                'description': 'Stunning loft with Manhattan skyline views in prime location.',
                'host_id': 'host-nyc-1', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800',
                    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'
                ],
                'amenities': ['WiFi', 'Gym', 'Doorman', 'City view', 'High floor', 'Modern']
            },
            
            # London Properties
            {
                'id': 'london-notting-hill',
                'title': 'Victorian Notting Hill House', 
                'location': 'London, England',
                'property_type': 'house',
                'bedrooms': 3, 'bathrooms': 2, 'max_guests': 6,
                'price_per_night': 175.00, 'rating': 4.8, 'review_count': 142,
                'description': 'Charming Victorian house in trendy Notting Hill with garden.',
                'host_id': 'host-london-1', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'
                ],
                'amenities': ['WiFi', 'Garden', 'Victorian charm', 'Near Portobello Road', 'Historic']
            },
            
            # Barcelona Properties
            {
                'id': 'barcelona-gothic-quarter',
                'title': 'Gothic Quarter Apartment',
                'location': 'Barcelona, Spain', 
                'property_type': 'apartment',
                'bedrooms': 2, 'bathrooms': 1, 'max_guests': 4,
                'price_per_night': 110.00, 'rating': 4.6, 'review_count': 198,
                'description': 'Authentic apartment in the historic Gothic Quarter with medieval charm.',
                'host_id': 'host-barcelona-1', 'is_superhost': False,
                'images': [
                    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800'
                ],
                'amenities': ['WiFi', 'Historic building', 'Central location', 'Near cathedral', 'Authentic']
            },
            
            # Amsterdam Properties
            {
                'id': 'amsterdam-canal-house',
                'title': 'Canal House Apartment',
                'location': 'Amsterdam, Netherlands',
                'property_type': 'apartment', 
                'bedrooms': 1, 'bathrooms': 1, 'max_guests': 2,
                'price_per_night': 130.00, 'rating': 4.9, 'review_count': 167,
                'description': 'Beautiful apartment in historic canal house with water views.',
                'host_id': 'host-amsterdam-1', 'is_superhost': True,
                'images': [
                    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'
                ],
                'amenities': ['WiFi', 'Canal view', 'Historic building', 'Bikes included', 'Central']
            }
        ]
        
        for prop in sample_properties:
            # Insert property
            property_id = prop['id']
            now = datetime.utcnow()
            
            await conn.execute("""
                INSERT INTO properties (
                    id, title, location, property_type, bedrooms, bathrooms, max_guests,
                    price_per_night, rating, review_count, description, host_id, 
                    is_superhost, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """, property_id, prop['title'], prop['location'], prop['property_type'],
                prop['bedrooms'], prop['bathrooms'], prop['max_guests'],
                prop['price_per_night'], prop['rating'], prop['review_count'],
                prop['description'], prop['host_id'], prop['is_superhost'], now, now)
            
            # Insert images
            for idx, image_url in enumerate(prop['images']):
                image_id = f"{property_id}-img-{idx + 1}"
                await conn.execute("""
                    INSERT INTO property_images (id, property_id, image_url, display_order)
                    VALUES ($1, $2, $3, $4)
                """, image_id, property_id, image_url, idx)
            
            # Insert amenities  
            for amenity in prop['amenities']:
                amenity_id = f"{property_id}-amenity-{uuid.uuid4().hex[:8]}"
                await conn.execute("""
                    INSERT INTO property_amenities (id, property_id, amenity_name)
                    VALUES ($1, $2, $3)
                """, amenity_id, property_id, amenity)
        
        logger.info(f"Populated database with {len(sample_properties)} sample properties")
    
    @staticmethod
    async def initialize_database():
        """Main initialization function"""
        try:
            # Connect to database
            conn = await asyncpg.connect(
                host=settings.db_host,
                port=settings.db_port,
                database=settings.db_name,
                user=settings.db_user,
                password=settings.db_password
            )
            
            logger.info("Connected to database successfully")
            
            # Create tables
            await DatabaseInitializer.create_tables(conn)
            
            # Populate sample data
            await DatabaseInitializer.populate_sample_data(conn)
            
            await conn.close()
            logger.info("Database initialization completed successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(DatabaseInitializer.initialize_database())
