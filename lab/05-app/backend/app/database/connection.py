"""
Databricks SQL Warehouse connection manager
Uses service principal authentication (app credentials)
"""
import logging
from typing import Optional, Any, Dict, List
import asyncio
import re
import time
import threading
from databricks import sql
from app.core.config import settings
from genie.token_minter import TokenMinter

logger = logging.getLogger(__name__)

# Lazy initialization of TokenMinter to avoid race conditions during container startup
_token_minter_instance = None
_token_minter_lock = threading.Lock()

def get_token_minter() -> TokenMinter:
    """
    Get or create TokenMinter instance with lazy initialization and retry logic.

    This defers OAuth token acquisition until first use, avoiding race conditions
    where network/DNS may not be ready during module import at container startup.

    Returns:
        TokenMinter: Initialized token minter instance

    Raises:
        Exception: If token minter initialization fails after retries
    """
    global _token_minter_instance

    if _token_minter_instance is None:
        with _token_minter_lock:
            # Double-check locking pattern
            if _token_minter_instance is None:
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        _token_minter_instance = TokenMinter()
                        logger.info("TokenMinter initialized successfully")
                        break
                    except Exception as e:
                        if attempt < max_retries - 1:
                            wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                            logger.warning(
                                f"TokenMinter initialization attempt {attempt + 1}/{max_retries} failed: {e}. "
                                f"Retrying in {wait_time}s..."
                            )
                            time.sleep(wait_time)
                        else:
                            logger.error(f"TokenMinter initialization failed after {max_retries} attempts: {e}")
                            raise

    return _token_minter_instance


class DatabricksManager:
    """Databricks SQL Warehouse connection manager using service principal auth"""

    def __init__(self):
        self._lock = asyncio.Lock()

    async def execute_query(
        self,
        query: str,
        params: Optional[List[Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute SQL query using app service principal credentials.

        Args:
            query: SQL query
            params: Query parameters
        """
        async with self._lock:
            def _execute():
                # Use app service principal OAuth2 token (lazy initialization with retry)
                # TokenMinter exchanges DATABRICKS_CLIENT_ID/CLIENT_SECRET for access token
                token_minter = get_token_minter()  # Lazy init - deferred until first query
                token = token_minter.get_token()

                if not token:
                    raise ValueError("Failed to obtain access token from TokenMinter")

                conn = sql.connect(
                    server_hostname=settings.databricks_server_hostname_resolved,
                    http_path=settings.databricks_http_path_resolved,
                    access_token=token,
                    catalog=settings.databricks_catalog_resolved,
                    schema=settings.databricks_schema_resolved,
                )

                try:
                    cursor = conn.cursor()

                    # Convert params and add catalog prefix
                    databricks_query = self._convert_params(query)
                    databricks_query = self._add_catalog_prefix(databricks_query)

                    cursor.execute(databricks_query, params or [])

                    columns = [desc[0] for desc in cursor.description] if cursor.description else []
                    rows = cursor.fetchall()

                    results = []
                    for row in rows:
                        if hasattr(row, 'asDict'):
                            results.append(row.asDict())
                        elif isinstance(row, (list, tuple)):
                            results.append(dict(zip(columns, row)))
                        else:
                            results.append(dict(zip(columns, list(row))))

                    return results
                finally:
                    cursor.close()
                    conn.close()

            return await asyncio.to_thread(_execute)

    async def execute_fetchone(
        self,
        query: str,
        params: Optional[List[Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Execute query and return single row"""
        results = await self.execute_query(query, params)
        return results[0] if results else None

    def _convert_params(self, query: str) -> str:
        """Convert $1, $2 style params to ? placeholders"""
        param_nums = sorted(set(int(p[1:]) for p in re.findall(r'\$\d+', query)), reverse=True)
        result = query
        for num in param_nums:
            result = result.replace(f'${num}', '?')
        return result

    def _add_catalog_prefix(self, query: str) -> str:
        """Add catalog.schema prefix to table names"""
        tables = ['properties', 'destinations', 'bookings', 'users', 'hosts',
                 'amenities', 'property_amenities', 'employees', 'reviews', 'property_images']
        result = query
        catalog_schema = f"{settings.databricks_catalog_resolved}.{settings.databricks_schema_resolved}"

        for table in tables:
            pattern = r'\b(FROM|JOIN|INTO)\s+(?!' + re.escape(catalog_schema) + r'\.)(' + table + r')\b'
            replacement = r'\1 ' + catalog_schema + r'.\2'
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

        return result


# Singleton instance
db_manager = DatabricksManager()
