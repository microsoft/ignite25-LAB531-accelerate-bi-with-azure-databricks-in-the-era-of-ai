from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PropertyBase(BaseModel):
    title: str = Field(..., max_length=255)
    location: str = Field(..., max_length=255)
    property_type: str = Field(..., regex="^(apartment|house|villa|condo)$")
    bedrooms: int = Field(..., ge=1, le=10)
    bathrooms: int = Field(..., ge=1, le=10)
    max_guests: int = Field(..., ge=1, le=20)
    price_per_night: float = Field(..., ge=0)
    rating: float = Field(..., ge=0, le=5)
    review_count: int = Field(..., ge=0)
    description: str = Field(..., max_length=2000)
    host_id: str = Field(..., max_length=50)
    is_superhost: bool = False


class PropertyCreate(PropertyBase):
    images: List[str] = []
    amenities: List[str] = []


class Property(PropertyBase):
    id: str
    images: List[str] = []
    amenities: List[str] = []
    availability_calendar: List[dict] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyInDB(Property):
    pass


class SearchCriteria(BaseModel):
    destination: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    guests: Optional[int] = 1
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class BookingCreate(BaseModel):
    property_id: str
    guest_id: str
    check_in: str
    check_out: str
    guests: int
    total_amount: float
    guest_name: str
    guest_email: str
    guest_phone: str


class Booking(BookingCreate):
    id: str
    booking_status: str = "confirmed"
    payment_status: str = "paid"
    created_at: datetime

    class Config:
        from_attributes = True
