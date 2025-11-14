import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

def _is_clarification_question(message: str) -> bool:
    """
    Detect if a Genie response is asking for clarification

    Args:
        message: The message content from Genie

    Returns:
        bool: True if this appears to be a clarification question
    """
    clarification_indicators = [
        "could you please specify",
        "which city", "which location", "which destination",
        "what dates", "when would you like",
        "how many guests", "for how many people",
        "please provide", "i need more information",
        "can you specify", "could you clarify",
        "what city", "what location"
    ]

    message_lower = message.lower()
    return any(indicator in message_lower for indicator in clarification_indicators)

def extract_search_metadata(genie_response: str, properties: List[Dict], original_query: str = "") -> Dict[str, Any]:
    """
    Extract booking parameters for display from the response

    Args:
        genie_response: The text response from Genie
        properties: List of property dictionaries returned
        original_query: The original user query

    Returns:
        dict: Extracted metadata for search display
    """
    metadata = {
        "destination": None,
        "guests": None,
        "dates": None,
        "property_count": len(properties)
    }

    # Combine response and query for analysis
    text_to_analyze = f"{original_query} {genie_response}".lower()

    # Extract destination - look in properties first, then text
    if properties and len(properties) > 0:
        # Try to get location from first property
        for prop in properties[:3]:  # Check first few properties
            for field in ['location', 'city', 'destination', 'city_name']:
                if field in prop and prop[field]:
                    metadata["destination"] = str(prop[field])
                    break
            if metadata["destination"]:
                break

    # Fallback: extract from text
    if not metadata["destination"]:
        # Common city patterns
        city_patterns = [
            r'\bin\s+([A-Z][a-zA-Z\s]+?)(?:\s|,|$)',
            r'\bto\s+([A-Z][a-zA-Z\s]+?)(?:\s|,|$)',
            r'([A-Z][a-zA-Z\s]+?),\s*[A-Z]',
            r'(Tokyo|Paris|London|New York|NYC|Dubai|Singapore|Rome)'
        ]

        for pattern in city_patterns:
            match = re.search(pattern, text_to_analyze, re.IGNORECASE)
            if match:
                metadata["destination"] = match.group(1).strip().title()
                break

    # Extract guest count
    guest_patterns = [
        r'(\d+)\s*guests?',
        r'for\s+(\d+)\s*people',
        r'(\d+)\s*people',
        r'accommodate\s+(\d+)'
    ]

    for pattern in guest_patterns:
        match = re.search(pattern, text_to_analyze)
        if match:
            try:
                metadata["guests"] = int(match.group(1))
                break
            except ValueError:
                continue

    # Extract dates - simple patterns
    date_patterns = [
        r'(oct|october|nov|november|dec|december|jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september)\s+(\d{1,2})(?:\s*(?:to|-)?\s*(oct|october|nov|november|dec|december|jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september)?\s*(\d{1,2})?)?',
        r'(\d{1,2})/(\d{1,2})/(\d{2,4})',
        r'(\d{1,2})-(\d{1,2})-(\d{2,4})'
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text_to_analyze, re.IGNORECASE)
        if match:
            # Basic date range extraction - this could be enhanced
            groups = match.groups()
            if len(groups) >= 2:
                if groups[2] and groups[3]:  # Range found
                    metadata["dates"] = f"{groups[0].title()} {groups[1]} - {groups[2].title()} {groups[3]}"
                else:
                    metadata["dates"] = f"{groups[0].title()} {groups[1]}"
            break

    return metadata

def convert_to_property_objects(data_rows: List[Dict]) -> List[Dict]:
    """
    Convert Genie query results to property objects matching our frontend format

    Args:
        data_rows: Raw data rows from Genie query result

    Returns:
        List of property dictionaries in frontend format
    """
    properties = []

    for row in data_rows:
        try:
            # Map common field variations to our property format
            property_obj = {
                "id": str(row.get("property_id") or row.get("id") or ""),
                "title": row.get("title") or row.get("name") or "Property",
                "description": row.get("description") or "",
                "location": row.get("location") or row.get("city") or row.get("destination") or "",
                "price_per_night": float(row.get("base_price") or row.get("price_per_night") or row.get("price") or 0),
                "property_type": row.get("property_type") or row.get("type") or "apartment",
                "max_guests": int(row.get("max_guests") or row.get("guests") or 2),
                "bedrooms": int(row.get("bedrooms") or 1),
                "bathrooms": int(row.get("bathrooms") or 1),
                "rating": float(row.get("rating") or 4.5),
                "review_count": int(row.get("review_count") or 25),
                "is_superhost": bool(row.get("is_superhost") or False),
                "host_id": str(row.get("host_id") or ""),
                "amenities": [],  # Will be populated by existing backend logic
                "images": []      # Will be populated by existing backend logic
            }

            # Ensure price is rounded to integer
            property_obj["price_per_night"] = round(property_obj["price_per_night"])

            properties.append(property_obj)

        except Exception as e:
            logger.warning(f"Failed to convert property row: {e}, row: {row}")
            continue

    return properties