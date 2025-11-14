import requests
import threading
from datetime import datetime, timedelta
import logging
import os

logger = logging.getLogger(__name__)

class TokenMinter:
    """
    A class to handle OAuth token generation and renewal for Databricks.
    Automatically refreshes the token before it expires.

    For Databricks Apps, DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET are
    automatically injected as environment variables by the platform.
    """
    def __init__(self, client_id: str = None, client_secret: str = None, host: str = None):
        # Priority order:
        # 1. Explicitly passed credentials (for flexibility)
        # 2. DATABRICKS_CLIENT_ID, DATABRICKS_CLIENT_SECRET (Databricks Apps injected or local dev)
        self.client_id = client_id or os.getenv("DATABRICKS_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("DATABRICKS_CLIENT_SECRET")

        # Get host from environment if not provided
        self.host = host or os.getenv("DATABRICKS_HOST", "")

        # Remove https:// if present
        if self.host:
            self.host = self.host.replace("https://", "").replace("http://", "")

        # Validate required credentials
        if not self.client_id or not self.client_secret:
            raise ValueError(
                "Missing OAuth credentials. In Databricks Apps, CLIENT_ID and CLIENT_SECRET "
                "are automatically injected. For local development, set DATABRICKS_CLIENT_ID "
                "and DATABRICKS_CLIENT_SECRET in your .env file."
            )

        if not self.host:
            raise ValueError("DATABRICKS_HOST must be set")

        self.token = None
        self.expiry_time = None
        self.lock = threading.RLock()

        logger.info(f"TokenMinter initialized with host: {self.host}")
        logger.info(f"Using DATABRICKS_CLIENT_ID: {self.client_id[:10]}..." if self.client_id else "No client ID found")

        self._refresh_token()

    def _refresh_token(self) -> None:
        """Internal method to refresh the OAuth token"""
        url = f"https://{self.host}/oidc/v1/token"
        auth = (self.client_id, self.client_secret)
        data = {'grant_type': 'client_credentials', 'scope': 'all-apis'}

        try:
            response = requests.post(url, auth=auth, data=data)
            response.raise_for_status()
            token_data = response.json()

            with self.lock:
                self.token = token_data.get('access_token')
                # Set expiry time to 55 minutes (slightly less than the 60-minute expiry)
                self.expiry_time = datetime.now() + timedelta(minutes=55)

            logger.info("Successfully refreshed Databricks OAuth token")
        except Exception as e:
            logger.error(f"Failed to refresh Databricks OAuth token: {str(e)}")
            raise

    def get_token(self) -> str:
        """
        Get a valid token, refreshing if necessary.

        Returns:
            str: The current valid OAuth token
        """
        with self.lock:
            # Check if token is expired or about to expire (within 5 minutes)
            if not self.token or not self.expiry_time or datetime.now() + timedelta(minutes=5) >= self.expiry_time:
                self._refresh_token()
            return self.token