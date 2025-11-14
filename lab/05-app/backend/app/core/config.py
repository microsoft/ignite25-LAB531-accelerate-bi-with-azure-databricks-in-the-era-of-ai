import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ===== DATABRICKS SQL WAREHOUSE =====
    databricks_server_hostname: str = os.getenv("DATABRICKS_SERVER_HOSTNAME", "")
    databricks_host: str = os.getenv("DATABRICKS_HOST", "")  # Auto-injected in Databricks Apps
    databricks_warehouse_id: str = os.getenv("DATABRICKS_WAREHOUSE_ID", "")
    databricks_http_path: str = os.getenv("DATABRICKS_HTTP_PATH", "")

    # OAuth2 Service Principal Credentials (auto-injected by Databricks Apps)
    # These are used by TokenMinter to obtain access tokens
    # Note: DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET are read by genie/token_minter.py
    databricks_client_id: str = os.getenv("DATABRICKS_CLIENT_ID", "")
    databricks_client_secret: str = os.getenv("DATABRICKS_CLIENT_SECRET", "")

    # Catalog/Schema: Support both formats
    # Format 1 (Databricks Apps): DATABRICKS_CATALOG_SCHEMA="catalog.schema"
    # Format 2 (Local dev): DATABRICKS_CATALOG + DATABRICKS_SCHEMA
    databricks_catalog_schema: str = os.getenv("DATABRICKS_CATALOG_SCHEMA", "")
    databricks_catalog: str = os.getenv("DATABRICKS_CATALOG", "samples")
    databricks_schema: str = os.getenv("DATABRICKS_SCHEMA", "wanderbricks")

    @property
    def databricks_catalog_resolved(self) -> str:
        """Get catalog: parse from DATABRICKS_CATALOG_SCHEMA or use DATABRICKS_CATALOG"""
        if self.databricks_catalog_schema and "." in self.databricks_catalog_schema:
            return self.databricks_catalog_schema.split(".")[0]
        return self.databricks_catalog

    @property
    def databricks_schema_resolved(self) -> str:
        """Get schema: parse from DATABRICKS_CATALOG_SCHEMA or use DATABRICKS_SCHEMA"""
        if self.databricks_catalog_schema and "." in self.databricks_catalog_schema:
            return self.databricks_catalog_schema.split(".")[1]
        return self.databricks_schema

    @property
    def databricks_server_hostname_resolved(self) -> str:
        """Get server hostname: use explicit hostname, or extract from DATABRICKS_HOST"""
        if self.databricks_server_hostname:
            return self.databricks_server_hostname
        elif self.databricks_host:
            return self.databricks_host.replace("https://", "").replace("http://", "").rstrip("/")
        else:
            raise ValueError("DATABRICKS_SERVER_HOSTNAME or DATABRICKS_HOST must be set")

    @property
    def databricks_http_path_resolved(self) -> str:
        """Get HTTP path: use explicit path, or construct from warehouse_id"""
        if self.databricks_http_path:
            return self.databricks_http_path
        elif self.databricks_warehouse_id:
            return f"/sql/1.0/warehouses/{self.databricks_warehouse_id}"
        else:
            raise ValueError("DATABRICKS_HTTP_PATH or DATABRICKS_WAREHOUSE_ID must be set")

    # API settings
    api_prefix: str = os.getenv("API_PREFIX", "/api")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
