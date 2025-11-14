from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv
import logging
import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.config import settings
from app.database.connection import db_manager

# Load environment variables from .env file
load_dotenv("../.env")
load_dotenv()  # Also load from current directory if exists
from sql.dashboard_queries import HOST_SUPPLY_QUERY, CITY_PERFORMANCE_QUERY, MARKET_PERFORMANCE_QUERY, GUEST_PERFORMANCE_QUERY, PROPERTY_PERFORMANCE_UPDATED_QUERY, OPERATIONS_PERFORMANCE_QUERY

# AI Assistant imports
from genie.client import start_new_conversation, continue_conversation, token_minter
from genie.response_parser import _is_clarification_question, extract_search_metadata, convert_to_property_objects

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Databricks Apps Service Principal Authentication
# App uses its own service principal credentials (DATABRICKS_TOKEN) to query data
# All users see the same data based on app's permissions

# Pydantic models
class SearchCriteria(BaseModel):
    destination: Optional[str] = None
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    guests: Optional[int] = None
    page: Optional[int] = 1
    limit: Optional[int] = 20

# AI Assistant models
class AIAssistantRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class AIAssistantResponse(BaseModel):
    success: bool
    conversation_id: Optional[str] = None
    needs_clarification: bool = False
    message: str = ""
    properties: List[Dict[str, Any]] = []
    search_metadata: Dict[str, Any] = {}
    error: Optional[str] = None

app = FastAPI(
    title="Wanderbricks Travel Platform",
    description="A minimal travel booking platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Property-related travel images using reliable Pexels service
MOCK_IMAGES = {
    "Paris, France": [
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ],
    "Tokyo, Japan": [
        "https://images.pexels.com/photos/2339009/pexels-photo-2339009.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/1822605/pexels-photo-1822605.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ],
    "New York, USA": [
        "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ],
    "London, England": [
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/162539/architecture-building-amsterdam-office-162539.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ],
    "Barcelona, Spain": [
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ],
    "Amsterdam, Netherlands": [
        "https://images.pexels.com/photos/162539/architecture-building-amsterdam-office-162539.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
    ]
}

def get_mock_images_for_location(location: str, property_id: int = None) -> List[str]:
    """Get mock images for a location with different images for each property"""
    
    # City-specific apartment/accommodation images - curated from updated Figma design
    enhanced_images = {
        "Tokyo, Japan": [
            "https://images.unsplash.com/photo-1697461881783-7fb7392b2ce4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMG1vZGVybiUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1691334016976-d36da0a28a7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZSUyMGNpdHl8ZW58MXx8fHwxNzU3NDE4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
        ],
        "New York, United States": [
            "https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1643406416661-0456c5d1b53e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwTWFuaGF0dGFuJTIwc2t5bGluZXxlbnwxfHx8fDE3NTc0MTg1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
        ],
        "London, United Kingdom": [
            "https://images.unsplash.com/photo-1527774436903-af05f4d201c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBhcGFydG1lbnQlMjBmbGF0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1664611213083-716234af473d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBCaWclMjBCZW4lMjB0b3dlciUyMGJyaWRnZXxlbnwxfHx8fDE3NTc0MTg1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
        ],
        "Dubai, United Arab Emirates": [
            "https://images.unsplash.com/photo-1574213183659-c3b6df87d99f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGx1eHVyeSUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMEJ1cmolMjBLaGFsaWZhJTIwc2t5bGluZXxlbnwxfHx8fDE3NTczNzI2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
        ],
        "Singapore, Singapore": [
            "https://images.unsplash.com/photo-1631152695193-61c709e578f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MTkyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1727880676753-9ba90268d3ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBNYXJpbmElMjBCYXklMjBza3lsaW5lfGVufDF8fHx8MTc1NzQxODU4MHww&ixlib=rb-4.1.0&q=80&w=1080"
        ],
        "Rome, Italy": [
            "https://images.unsplash.com/photo-1694678803912-567a0de15710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSb21lJTIwaGlzdG9yaWMlMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MTkyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1527774436903-af05f4d201c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBhcGFydG1lbnQlMjBmbGF0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NTQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1652337882191-6c61a9f6dac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSb21lJTIwQ29sb3NzZXVtJTIwSXRhbHklMjBhbmNpZW50fGVufDF8fHx8MTc1NzQxODU4MHww&ixlib=rb-4.1.0&q=80&w=1080"
        ]
    }
    
    # DIRECT PROPERTY-TO-IMAGE MAPPING - GUARANTEED UNIQUE IMAGES!
    # No more mathematical collisions - each property gets its own image
    DIRECT_MAPPING = {
        # Tokyo, Japan properties (ACTUAL CURRENT from database: 28014, 38142, 46719, 10967, 20327, 14180)
        28014: "https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        38142: "https://images.unsplash.com/photo-1697461881783-7fb7392b2ce4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMG1vZGVybiUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        46719: "https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        10967: "https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
        20327: "https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        14180: "https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKYXBhbiUyMHRyYWRpdGlvbmFsJTIwcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080"
    }
    
    # If we have a direct mapping for this property, use it (100% UNIQUE!)
    if property_id is not None and property_id in DIRECT_MAPPING:
        return [DIRECT_MAPPING[property_id]]
    
    # Get image set for location
    images = enhanced_images.get(location, MOCK_IMAGES.get(location, enhanced_images.get("Tokyo, Japan", [])))
    
    # If we have a property_id, use it to select ONE unique image from the set
    if property_id is not None and images:
        total_images = len(images)
        
        # SIMPLE APPROACH: Use property_id directly with a large multiplier to spread values
        # This should give much better distribution than complex hashing
        image_idx = (property_id * 127) % total_images  # 127 is prime, creates good spread
        
        selected_image = images[image_idx]
        return [selected_image]
    
    # Default: return first image or fallback
    fallback_image = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"
    return [images[0]] if images else [fallback_image]


# Database connection is now handled by db_manager from app.database.connection


@app.get("/api/health")
async def health_check():
    """Health check endpoint - tests Databricks SQL Warehouse connection"""
    try:
        # Test database connection with simple query
        result = await db_manager.execute_fetchone("SELECT 1 as test")
        if result and result.get('test') == 1:
            return {
                "status": "healthy",
                "service": "wanderbricks-travel-platform",
                "database": "connected",
                "database_type": "databricks_sql_warehouse"
            }
        else:
            return {
                "status": "degraded",
                "service": "wanderbricks-travel-platform",
                "database": "query_failed"
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "degraded",
            "service": "wanderbricks-travel-platform",
            "database": "disconnected",
            "error": str(e)
        }

@app.get("/api/debug/tables")
async def debug_tables():
    """Debug endpoint to list tables and inspect structure in Databricks"""
    try:
        # List all tables in samples.wanderbricks schema
        tables_query = f"""
            SHOW TABLES IN {settings.databricks_catalog}.{settings.databricks_schema}
        """

        table_rows = await db_manager.execute_query(tables_query)
        tables = [row['tableName'] for row in table_rows]

        result = {"available_tables": tables, "catalog": settings.databricks_catalog, "schema": settings.databricks_schema}

        # Get sample data from key tables
        key_tables = ['amenities', 'bookings', 'destinations', 'employees', 'hosts', 'properties', 'property_amenities', 'users']
        for table in key_tables:
            if table in tables:
                try:
                    sample_query = f"SELECT * FROM {settings.databricks_catalog}.{settings.databricks_schema}.{table} LIMIT 3"
                    sample_rows = await db_manager.execute_query(sample_query)
                    result[table] = {
                        "row_count": len(sample_rows),
                        "sample_data": sample_rows,
                        "columns": list(sample_rows[0].keys()) if sample_rows else []
                    }
                except Exception as table_error:
                    result[table] = {"error": str(table_error), "note": "Table exists but query failed"}
            else:
                result[table] = {"status": "not_found", "note": "Table not found in schema"}

        return result

    except Exception as e:
        logger.error(f"Debug tables failed: {e}")
        return {"error": str(e)}



@app.get("/api/cities")
async def get_cities():
    """Get all available cities for search suggestions from Databricks"""
    try:
        query = """
            SELECT DISTINCT d.destination as city, d.country,
                   CONCAT(d.destination, ', ', d.country) as display
            FROM destinations d
            INNER JOIN properties p ON d.destination_id = p.destination_id
            ORDER BY d.destination
        """

        rows = await db_manager.execute_query(query)

        return {
            "data": rows,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"Cities query failed: {e}")
        # Fallback to mock cities if database query fails
        return {
            "data": [
                {"city": "Paris", "country": "France", "display": "Paris, France"},
                {"city": "Tokyo", "country": "Japan", "display": "Tokyo, Japan"},
                {"city": "New York", "country": "USA", "display": "New York, USA"},
                {"city": "London", "country": "England", "display": "London, England"},
                {"city": "Barcelona", "country": "Spain", "display": "Barcelona, Spain"},
                {"city": "Amsterdam", "country": "Netherlands", "display": "Amsterdam, Netherlands"}
            ],
            "status": "fallback",
            "error": str(e)
        }

@app.get("/api/properties")
async def get_properties():
    # Fallback for old endpoint
    return {
        "properties": [
            {
                "id": "1",
                "title": "Cozy Paris Apartment", 
                "location": "Paris, France",
                "price": 120,
                "rating": 4.8,
                "image": "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
            }
        ]
    }

@app.get("/api/dashboard/market-performance")
async def get_market_performance(country: Optional[str] = None):
    """Get market performance metrics for Country Manager Dashboard"""
    try:
        # Use the market performance query from dashboard_queries.py
        query = MARKET_PERFORMANCE_QUERY

        # MARKET_PERFORMANCE_QUERY has 12 parameter placeholders (? repeated for each CTE)
        # We need to pass the same country value 12 times
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 12

        result = await db_manager.execute_fetchone(query, params)
        
        # Extract real data from the comprehensive market performance query
        import datetime

        # The MARKET_PERFORMANCE_QUERY now returns monthly_trends as array of structs
        monthly_trends_raw = result.get('monthly_trends', []) if result else []

        # Convert monthly_trends if it's not already a list of dicts
        monthly_trends_data = []
        if monthly_trends_raw is not None and len(monthly_trends_raw) > 0:
            for item in monthly_trends_raw:
                if hasattr(item, 'asDict'):
                    monthly_trends_data.append(item.asDict())
                elif isinstance(item, dict):
                    monthly_trends_data.append(item)
                else:
                    # Try to convert to dict
                    try:
                        monthly_trends_data.append(dict(item))
                    except:
                        logger.warning(f"Could not convert monthly trend item: {type(item)}")

        # Calculate month-over-month growth from trends data
        mom_growth = 0
        if len(monthly_trends_data) >= 2:
            # Data is ordered ASC by month, so [-1] is most recent, [-2] is previous month
            current_month_gbv = float(monthly_trends_data[-1].get('gbv', 0))
            previous_month_gbv = float(monthly_trends_data[-2].get('gbv', 0))

            if previous_month_gbv > 0:
                mom_growth = ((current_month_gbv - previous_month_gbv) / previous_month_gbv) * 100

        response = {
            "total_gbv": float(result['total_gbv']) if result and result['total_gbv'] else 0,
            "total_revenue": float(result['total_revenue']) if result and result['total_revenue'] else 0,
            "total_bookings": int(result['total_bookings']) if result and result['total_bookings'] else 0,
            "avg_booking_value": float(result['avg_booking_value']) if result and result['avg_booking_value'] else 0,
            "occupancy_rate": float(result['occupancy_rate']) if result and result['occupancy_rate'] else 0,
            "total_properties": int(result['total_properties']) if result and result['total_properties'] else 0,
            "unique_cities": int(result['unique_cities']) if result and result['unique_cities'] else 0,
            "monthly_trends": monthly_trends_data,
            "mom_growth": mom_growth,
            "last_updated": datetime.datetime.now().isoformat()
        }

        logger.info(f"Market performance data fetched successfully for country: {country}")
        return response

    except Exception as e:
        logger.error(f"Error fetching market performance: {e}")
        return {
            "total_gbv": 0,
            "total_revenue": 0,
            "total_bookings": 0,
            "avg_booking_value": 0,
            "occupancy_rate": 0,
            "total_properties": 0,
            "unique_cities": 0,
            "monthly_trends": [],
            "mom_growth": 0,
            "error": str(e)
        }

@app.get("/api/dashboard/countries")
async def get_available_countries():
    """Get list of available countries for dashboard filtering"""
    try:
        query = """
        SELECT DISTINCT d.country, COUNT(p.property_id) as property_count
        FROM destinations d
        JOIN properties p ON p.destination_id = d.destination_id
        GROUP BY d.country
        ORDER BY property_count DESC
        """

        results = await db_manager.execute_query(query)

        countries = [{"value": "all", "label": "All Countries", "flag": "🌍"}]

        flag_map = {
            "Japan": "🇯🇵",
            "United States": "🇺🇸",
            "United Kingdom": "🇬🇧",
            "United Arab Emirates": "🇦🇪",
            "Singapore": "🇸🇬",
            "Italy": "🇮🇹",
            "France": "🇫🇷",
            "Spain": "🇪🇸",
            "Netherlands": "🇳🇱"
        }

        for row in results:
            country = row['country']
            countries.append({
                "value": country,
                "label": country,
                "flag": flag_map.get(country, "🏳️"),
                "property_count": int(row['property_count'])
            })

        return {"countries": countries}

    except Exception as e:
        logger.error(f"Error fetching countries: {e}")
        return {"countries": [{"value": "all", "label": "All Countries", "flag": "🌍"}]}

@app.get("/api/dashboard/city-performance")
async def get_city_performance(country: Optional[str] = None):
    """Get city-level performance metrics for Country Manager Dashboard"""
    logger.info(f"🏙️ CITY PERFORMANCE ENDPOINT HIT - country: {country}")
    try:
        # CITY_PERFORMANCE_QUERY has 6 parameter placeholders
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 6

        results = await db_manager.execute_query(CITY_PERFORMANCE_QUERY, params)
        
        cities_data = []
        total_gbv = sum(float(row['gbv']) for row in results)

        for i, row in enumerate(results):
            city_gbv = float(row['gbv']) if row['gbv'] else 0
            market_share = (city_gbv / total_gbv * 100) if total_gbv > 0 else 0

            cities_data.append({
                "city_id": i + 1,
                "city_name": row['city_name'],
                "properties_count": int(row['properties_count']),
                "booking_count": int(row['booking_count']),
                "gbv": city_gbv,
                "avg_booking_value": float(row['avg_booking_value']) if row['avg_booking_value'] else 0,
                "occupancy_rate": float(row['occupancy_rate']) if row['occupancy_rate'] else 0,
                "market_share": market_share
            })

        logger.info(f"City performance data fetched successfully for country: {country}")
        return {"cities": cities_data, "total_cities": len(cities_data)}

    except Exception as e:
        logger.error(f"Error fetching city performance: {e}")
        return {"cities": [], "total_cities": 0, "error": str(e)}

@app.get("/api/dashboard/host-performance")
async def get_host_performance(country: Optional[str] = None):
    """Get host performance metrics for Country Manager Dashboard"""
    import datetime
    logger.info(f"👥 HOST PERFORMANCE ENDPOINT HIT - country: {country}")
    try:
        # Use the corrected query from dashboard_queries.py with real calculations
        query = HOST_SUPPLY_QUERY

        # HOST_SUPPLY_QUERY has 12 parameter placeholders
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 12

        result = await db_manager.execute_fetchone(query, params)

        if not result:
            return {
                "active_hosts": 0,
                "superhost_percentage": 0,
                "growth_rate": 0,
                "churn_rate": 0,
                "host_distribution": {"single_property": 0, "multi_property": 0},
                "host_performance_metrics": [],
                "error": "No data found"
            }
        
        # Calculate host distribution percentages from real data
        total_hosts = int(result['total_hosts']) or 1
        multi_property_hosts = int(result['multi_property_hosts']) or 0
        single_property_hosts = int(result['single_property_hosts']) or 0
        
        # Calculate percentages based on actual host counts
        total_host_count = multi_property_hosts + single_property_hosts
        if total_host_count > 0:
            multi_property_percentage = (multi_property_hosts / total_host_count * 100)
            single_property_percentage = (single_property_hosts / total_host_count * 100)
        else:
            multi_property_percentage = 0
            single_property_percentage = 0
        
        # Host performance metrics from real database calculations
        active_hosts = int(result['active_hosts']) or 0
        superhost_percentage = float(result['superhost_percentage']) or 0
        growth_rate = float(result['host_growth_rate']) or 0
        churn_rate = float(result['host_churn_rate']) or 0
        
        host_performance_metrics = [
            {
                "metric": "Active Hosts",
                "value": active_hosts,
                "percentage": min(100, (active_hosts / total_hosts * 100)) if total_hosts > 0 else 0,
                "color": "blue"
            },
            {
                "metric": "Superhost %", 
                "value": f"{superhost_percentage:.1f}%",
                "percentage": superhost_percentage,
                "color": "green"
            },
            {
                "metric": "Host Growth Rate",
                "value": f"{growth_rate:.1f}%", 
                "percentage": max(0, min(100, abs(growth_rate))),  # Ensure positive percentage for visualization
                "color": "purple"
            },
            {
                "metric": "Host Churn Rate",
                "value": f"{churn_rate:.1f}%",
                "percentage": max(0, min(100, churn_rate)),
                "color": "red"
            }
        ]
        
        response = {
            "active_hosts": active_hosts,
            "superhost_percentage": superhost_percentage,
            "growth_rate": growth_rate,
            "churn_rate": churn_rate,
            "host_distribution": {
                "single_property": single_property_percentage,
                "multi_property": multi_property_percentage
            },
            "host_performance_metrics": host_performance_metrics,
            "total_hosts": total_hosts,
            "last_updated": datetime.datetime.now().isoformat()
        }

        logger.info(f"Host performance data fetched successfully for country: {country}")
        return response

    except Exception as e:
        logger.error(f"Error fetching host performance: {e}")
        # Return empty/zero values instead of mock data if database fails
        return {
            "active_hosts": 0,
            "superhost_percentage": 0.0,
            "growth_rate": 0.0,
            "churn_rate": 0.0,
            "host_distribution": {
                "single_property": 0,
                "multi_property": 0
            },
            "host_performance_metrics": [],
            "total_hosts": 0,
            "last_updated": datetime.datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/api/dashboard/guest-performance")
async def get_guest_performance(country: str = "all"):
    """Get guest & demand health metrics from real database"""
    try:
        logger.info(f"Fetching guest performance data for country: {country}")

        # GUEST_PERFORMANCE_QUERY has 12 parameter placeholders
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 12

        # Execute the guest performance query
        result = await db_manager.execute_fetchone(GUEST_PERFORMANCE_QUERY, params)
        
        if not result:
            logger.warning("No guest performance data found")
            return {
                "active_guests": 0,
                "repeat_guest_percentage": 0.0,
                "cancellation_rate": 0.0,
                "guest_nps": 85.0,
                "avg_guest_rating": 4.6,
                "monthly_trends": [],
                "guest_satisfaction_metrics": [],
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Parse monthly trends data (handle Databricks array of structs)
        monthly_trends_raw = result.get('monthly_trends', []) if result else []
        monthly_trends_data = []

        if monthly_trends_raw is not None and len(monthly_trends_raw) > 0:
            for item in monthly_trends_raw:
                if hasattr(item, 'asDict'):
                    monthly_trends_data.append(item.asDict())
                elif isinstance(item, dict):
                    monthly_trends_data.append(item)
                elif isinstance(item, str):
                    import json
                    monthly_trends_data.append(json.loads(item))
                else:
                    try:
                        monthly_trends_data.append(dict(item))
                    except:
                        logger.warning(f"Could not convert monthly trend item: {type(item)}")
        
        # Guest satisfaction metrics based on real data  
        guest_satisfaction_metrics = [
            {
                "metric": "Average Guest Rating",
                "value": f"{float(result['avg_guest_rating']):.1f}/5.0",
                "percentage": float(result['avg_guest_rating']) * 20,  # Convert to percentage
                "color": "blue"
            },
            {
                "metric": "Net Promoter Score", 
                "value": int(result['guest_nps']),
                "percentage": float(result['guest_nps']),
                "color": "green"
            },
            {
                "metric": "Repeat Guest Rate",
                "value": f"{float(result['repeat_guest_percentage']):.1f}%",
                "percentage": float(result['repeat_guest_percentage']),
                "color": "teal"
            }
        ]
        
        response = {
            "active_guests": int(result['active_guests']),
            "total_guests": int(result['total_guests']),
            "repeat_guest_percentage": float(result['repeat_guest_percentage']),
            "cancellation_rate": float(result['cancellation_rate']),
            "guest_nps": float(result['guest_nps']),
            "avg_guest_rating": float(result['avg_guest_rating']),
            "monthly_trends": monthly_trends_data,
            "guest_satisfaction_metrics": guest_satisfaction_metrics,
            "last_updated": datetime.datetime.now().isoformat()
        }

        logger.info(f"Guest performance data fetched successfully for country: {country}")
        return response

    except Exception as e:
        logger.error(f"Error fetching guest performance: {e}")
        return {
            "active_guests": 0,
            "repeat_guest_percentage": 0.0,
            "cancellation_rate": 0.0,
            "guest_nps": 85.0,
            "avg_guest_rating": 4.6,
            "monthly_trends": [],
            "guest_satisfaction_metrics": [],
            "last_updated": datetime.datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/api/dashboard/property-performance")
async def get_property_performance(country: str = "all"):
    """Get property performance and amenity analysis from real database"""
    try:
        logger.info(f"Fetching property performance data for country: {country}")

        # PROPERTY_PERFORMANCE_UPDATED_QUERY has 12 parameter placeholders
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 12

        # Execute the property performance query
        result = await db_manager.execute_fetchone(PROPERTY_PERFORMANCE_UPDATED_QUERY, params)
        
        if not result:
            logger.warning("No property performance data found")
            return {
                "avg_nightly_rate": 0,
                "top_property_type": "Loft",
                "underperforming_count": 0,
                "property_type_count": 0,
                "property_types_performance": [],
                "amenity_gaps": [],
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Parse property types performance data (handle Databricks array of structs)
        property_types_raw = result.get('property_types_performance', []) if result else []
        property_types_data = []

        if property_types_raw is not None and len(property_types_raw) > 0:
            for item in property_types_raw:
                if hasattr(item, 'asDict'):
                    property_types_data.append(item.asDict())
                elif isinstance(item, dict):
                    property_types_data.append(item)
                elif isinstance(item, str):
                    import json
                    property_types_data = json.loads(item)
                    break
                else:
                    try:
                        property_types_data.append(dict(item))
                    except:
                        logger.warning(f"Could not convert property type item: {type(item)}")

        # Parse amenity gaps data (handle Databricks array of structs)
        amenity_gaps_raw = result.get('amenity_gaps', []) if result else []
        amenity_gaps_data = []

        if amenity_gaps_raw is not None and len(amenity_gaps_raw) > 0:
            for item in amenity_gaps_raw:
                if hasattr(item, 'asDict'):
                    amenity_gaps_data.append(item.asDict())
                elif isinstance(item, dict):
                    amenity_gaps_data.append(item)
                elif isinstance(item, str):
                    import json
                    amenity_gaps_data = json.loads(item)
                    break
                else:
                    try:
                        amenity_gaps_data.append(dict(item))
                    except:
                        logger.warning(f"Could not convert amenity gap item: {type(item)}")
        
        response = {
            "avg_nightly_rate": float(result['avg_nightly_rate']) if result['avg_nightly_rate'] else 0,
            "top_property_type": str(result['top_property_type']) if result['top_property_type'] else "Loft",
            "top_property_count": int(result['top_property_count']) if result['top_property_count'] else 0,
            "underperforming_count": int(result['underperforming_count']) if result['underperforming_count'] else 0,
            "property_type_count": int(result['property_type_count']) if result['property_type_count'] else 0,
            "property_types_performance": property_types_data,
            "amenity_gaps": amenity_gaps_data,
            "last_updated": datetime.datetime.now().isoformat()
        }

        logger.info(f"Property performance data fetched successfully for country: {country}")
        return response

    except Exception as e:
        logger.error(f"Error fetching property performance: {e}")
        return {
            "avg_nightly_rate": 0,
            "top_property_type": "Loft",
            "underperforming_count": 0,
            "property_type_count": 0,
            "property_types_performance": [],
            "amenity_gaps": [],
            "last_updated": datetime.datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/api/dashboard/operations")
async def get_operations_performance(country: str = "all"):
    """Get operations performance metrics for Country Manager Dashboard"""
    try:
        logger.info(f"Fetching operations performance data for country: {country}")

        # OPERATIONS_PERFORMANCE_QUERY has 3 parameter placeholders (only in filtered_destinations CTE)
        country_param = country if country and country.lower() != 'all' else None
        params = [country_param] * 3

        # Execute the operations performance query
        result = await db_manager.execute_fetchone(OPERATIONS_PERFORMANCE_QUERY, params)
        
        if not result:
            logger.warning("No operations performance data found")
            return {
                "total_employees": 0,
                "host_employee_ratio": 0.0,
                "support_response_time_hours": 4.2,
                "cities_covered": 0,
                "employee_distribution": [],
                "last_updated": datetime.datetime.now().isoformat()
            }
        
        # Parse employee distribution data (handle Databricks array of structs)
        employee_distribution_raw = result.get('employee_distribution', []) if result else []
        employee_distribution_data = []

        if employee_distribution_raw is not None and len(employee_distribution_raw) > 0:
            for item in employee_distribution_raw:
                if hasattr(item, 'asDict'):
                    employee_distribution_data.append(item.asDict())
                elif isinstance(item, dict):
                    employee_distribution_data.append(item)
                elif isinstance(item, str):
                    import json
                    employee_distribution_data = json.loads(item)
                    break
                else:
                    try:
                        employee_distribution_data.append(dict(item))
                    except:
                        logger.warning(f"Could not convert employee distribution item: {type(item)}")
        
        response = {
            "total_employees": int(result['total_employees']) if result['total_employees'] else 0,
            "host_employee_ratio": float(result['host_employee_ratio']) if result['host_employee_ratio'] else 0.0,
            "support_response_time_hours": float(result['support_response_time_hours']) if result['support_response_time_hours'] else 4.2,
            "cities_covered": int(result['cities_covered']) if result['cities_covered'] else 0,
            "employee_distribution": employee_distribution_data,
            "last_updated": datetime.datetime.now().isoformat()
        }

        logger.info(f"Operations performance data fetched successfully for country: {country}")
        return response

    except Exception as e:
        logger.error(f"Error fetching operations performance: {e}")
        return {
            "total_employees": 0,
            "host_employee_ratio": 0.0,
            "support_response_time_hours": 4.2,
            "cities_covered": 0,
            "employee_distribution": [],
            "last_updated": datetime.datetime.now().isoformat(),
            "error": str(e)
        }


# Serve static files
if os.path.exists("static"):
    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Serve frontend at root
    @app.get("/")
    async def serve_frontend():
        return FileResponse("static/index.html")
    
    # Handle SPA routing - serve index.html for any non-API routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes - more specific check
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # For all other routes, serve the React app
        if os.path.exists("static/index.html"):
            return FileResponse("static/index.html")
        else:
            return {"error": "Frontend not found"}
else:
    @app.get("/")
    async def root():
        return {"message": "Wanderbricks Travel Platform API", "version": "1.0.0"}