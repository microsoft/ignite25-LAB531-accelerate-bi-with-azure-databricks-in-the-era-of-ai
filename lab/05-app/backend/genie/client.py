import pandas as pd
import time
import requests
import os
import threading
from typing import Dict, Any, Optional, List, Union, Tuple
import logging
import backoff
from .token_minter import TokenMinter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
# Databricks Apps automatically inject DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET
SPACE_ID = os.environ.get("SPACE_ID")
DATABRICKS_HOST = os.environ.get("DATABRICKS_HOST")
CLIENT_ID = os.environ.get("DATABRICKS_CLIENT_ID")
CLIENT_SECRET = os.environ.get("DATABRICKS_CLIENT_SECRET")

# Lazy initialization of TokenMinter to avoid race conditions during container startup
_token_minter_instance = None
_token_minter_lock = threading.Lock()

def get_token_minter() -> Optional[TokenMinter]:
    """
    Get or create TokenMinter instance with lazy initialization.

    Returns None if initialization fails (Genie features will be disabled).
    This avoids breaking the app if Genie credentials aren't available.
    """
    global _token_minter_instance

    if _token_minter_instance is None:
        with _token_minter_lock:
            if _token_minter_instance is None:
                try:
                    _token_minter_instance = TokenMinter()
                    logger.info("✓ Token minter initialized successfully for Genie AI")
                except ValueError as e:
                    logger.warning(f"Token minter initialization failed: {e}")
                    logger.warning("Genie AI features will be disabled")
                    return None
                except Exception as e:
                    logger.error(f"Unexpected error initializing token minter: {e}")
                    logger.warning("Genie AI features will be disabled")
                    return None

    return _token_minter_instance

# Keep backward compatibility for existing code
token_minter = None  # Will be initialized lazily on first use

class GenieClient:
    def __init__(self, host: str, space_id: str):
        self.host = host
        self.space_id = space_id
        self.update_headers()
        self.base_url = f"https://{host}/api/2.0/genie/spaces/{space_id}"

    def update_headers(self) -> None:
        """Update headers with fresh token from token_minter"""
        tm = get_token_minter()  # Lazy initialization
        if not tm:
            raise ValueError("Token minter not initialized. Check environment variables.")
        self.headers = {
            "Authorization": f"Bearer {tm.get_token()}",
            "Content-Type": "application/json"
        }

    @backoff.on_exception(
        backoff.expo,
        Exception,
        max_tries=5,
        factor=2,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"API request failed. Retrying in {details['wait']:.2f} seconds (attempt {details['tries']})"
        )
    )
    def start_conversation(self, question: str) -> Dict[str, Any]:
        """Start a new conversation with the given question"""
        self.update_headers()
        url = f"{self.base_url}/start-conversation"
        payload = {"content": question}

        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    @backoff.on_exception(
        backoff.expo,
        Exception,
        max_tries=5,
        factor=2,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"API request failed. Retrying in {details['wait']:.2f} seconds (attempt {details['tries']})"
        )
    )
    def send_message(self, conversation_id: str, message: str) -> Dict[str, Any]:
        """Send a follow-up message to an existing conversation"""
        self.update_headers()
        url = f"{self.base_url}/conversations/{conversation_id}/messages"
        payload = {"content": message}

        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    @backoff.on_exception(
        backoff.expo,
        Exception,
        max_tries=5,
        factor=2,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"API request failed. Retrying in {details['wait']:.2f} seconds (attempt {details['tries']})"
        )
    )
    def get_message(self, conversation_id: str, message_id: str) -> Dict[str, Any]:
        """Get the details of a specific message"""
        self.update_headers()
        url = f"{self.base_url}/conversations/{conversation_id}/messages/{message_id}"

        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    @backoff.on_exception(
        backoff.expo,
        Exception,
        max_tries=5,
        factor=2,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"API request failed. Retrying in {details['wait']:.2f} seconds (attempt {details['tries']})"
        )
    )
    def get_query_result(self, conversation_id: str, message_id: str, attachment_id: str) -> Dict[str, Any]:
        """Get the query result using the attachment_id endpoint"""
        self.update_headers()
        url = f"{self.base_url}/conversations/{conversation_id}/messages/{message_id}/attachments/{attachment_id}/query-result"

        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        result = response.json()

        # Extract data_array from the correct nested location
        data_array = []
        if 'statement_response' in result:
            if 'result' in result['statement_response']:
                data_array = result['statement_response']['result'].get('data_array', [])

        return {
            'data_array': data_array,
            'schema': result.get('statement_response', {}).get('manifest', {}).get('schema', {})
        }

    def wait_for_message_completion(self, conversation_id: str, message_id: str, timeout: int = 300, poll_interval: int = 2) -> Dict[str, Any]:
        """
        Wait for a message to reach a terminal state (COMPLETED, ERROR, etc.).

        Args:
            conversation_id: The ID of the conversation
            message_id: The ID of the message
            timeout: Maximum time to wait in seconds
            poll_interval: Time between status checks in seconds

        Returns:
            The completed message
        """

        start_time = time.time()
        attempt = 1

        while time.time() - start_time < timeout:
            message = self.get_message(conversation_id, message_id)
            status = message.get("status")

            if status in ["COMPLETED", "ERROR", "FAILED"]:
                return message

            time.sleep(poll_interval)
            attempt += 1

        raise TimeoutError(f"Message processing timed out after {timeout} seconds")


def process_genie_response(client: GenieClient, conversation_id: str, message_id: str, complete_message: Dict[str, Any]) -> Tuple[Union[str, List[Dict]], Optional[str]]:
    """
    Process the response from Genie

    Args:
        client: The GenieClient instance
        conversation_id: The conversation ID
        message_id: The message ID
        complete_message: The completed message response

    Returns:
        Tuple containing:
        - result: Either text or list of property dictionaries
        - query_text: SQL query text if applicable, otherwise None
    """
    # Check attachments first
    attachments = complete_message.get("attachments", [])
    for attachment in attachments:
        attachment_id = attachment.get("attachment_id")

        # If there's text content in the attachment, return it
        if "text" in attachment and "content" in attachment["text"]:
            return attachment["text"]["content"], None

        # If there's a query, get the result
        elif "query" in attachment:
            query_text = attachment.get("query", {}).get("query", "")
            query_result = client.get_query_result(conversation_id, message_id, attachment_id)

            data_array = query_result.get('data_array', [])
            schema = query_result.get('schema', {})
            columns = [col.get('name') for col in schema.get('columns', [])]

            # If we have data, return as list of dictionaries
            if data_array:
                # If no columns from schema, create generic ones
                if not columns and data_array and len(data_array) > 0:
                    columns = [f"column_{i}" for i in range(len(data_array[0]))]

                # Convert to list of dictionaries for easier processing
                properties = []
                for row in data_array:
                    property_dict = {}
                    for i, col in enumerate(columns):
                        if i < len(row):
                            property_dict[col] = row[i]
                    properties.append(property_dict)

                return properties, query_text

    # If no attachments or no data in attachments, return text content
    if 'content' in complete_message:
        return complete_message.get('content', ''), None

    return "No response available", None


def start_new_conversation(question: str) -> Tuple[str, Union[str, List[Dict]], Optional[str]]:
    """
    Start a new conversation with Genie - matches genie_space pattern

    Args:
        question: The initial question

    Returns:
        Tuple containing:
        - conversation_id: The new conversation ID
        - response: Either text or list of property dictionaries
        - query_text: SQL query text if applicable, otherwise None
    """
    if not all([DATABRICKS_HOST, SPACE_ID]):
        return None, "Genie service not configured. Check environment variables.", None

    client = GenieClient(
        host=DATABRICKS_HOST,
        space_id=SPACE_ID
    )

    try:
        # Start a new conversation
        response = client.start_conversation(question)
        conversation_id = response.get("conversation_id")
        message_id = response.get("message_id")

        # Wait for the message to complete
        complete_message = client.wait_for_message_completion(conversation_id, message_id)

        # Process the response
        result, query_text = process_genie_response(client, conversation_id, message_id, complete_message)

        return conversation_id, result, query_text

    except Exception as e:
        logger.error(f"Error starting conversation: {str(e)}")
        return None, f"Sorry, an error occurred: {str(e)}. Please try again.", None


def continue_conversation(conversation_id: str, question: str) -> Tuple[Union[str, List[Dict]], Optional[str]]:
    """
    Send a follow-up message in an existing conversation - matches genie_space pattern

    Args:
        conversation_id: The existing conversation ID
        question: The follow-up question

    Returns:
        Tuple containing:
        - response: Either text or list of property dictionaries
        - query_text: SQL query text if applicable, otherwise None
    """
    if not all([DATABRICKS_HOST, SPACE_ID]):
        return "Genie service not configured. Check environment variables.", None

    logger.info(f"Continuing conversation {conversation_id} with question: {question[:30]}...")

    client = GenieClient(
        host=DATABRICKS_HOST,
        space_id=SPACE_ID
    )

    try:
        # Send follow-up message in existing conversation
        response = client.send_message(conversation_id, question)
        message_id = response.get("message_id")

        # Wait for the message to complete
        complete_message = client.wait_for_message_completion(conversation_id, message_id)

        # Process the response
        result, query_text = process_genie_response(client, conversation_id, message_id, complete_message)

        return result, query_text

    except Exception as e:
        # Handle specific errors
        if "429" in str(e) or "Too Many Requests" in str(e):
            return "Sorry, the system is currently experiencing high demand. Please try again in a few moments.", None
        elif "Conversation not found" in str(e):
            return "Sorry, the previous conversation has expired. Please try your query again to start a new conversation.", None
        else:
            logger.error(f"Error continuing conversation: {str(e)}")
            return f"Sorry, an error occurred: {str(e)}", None


def property_search(question: str) -> Union[Tuple[str, Optional[str]], Tuple[List[Dict], str]]:
    """
    Main entry point for property search queries - similar to genie_space genie_query

    Args:
        question: The property search question

    Returns:
        Tuple containing either:
        - (text_response, None) for clarification questions
        - (properties_list, sql_query) for property results
    """
    try:
        # Start a new conversation for each query
        conversation_id, result, query_text = start_new_conversation(question)
        return result, query_text

    except Exception as e:
        logger.error(f"Error in property search: {str(e)}. Please try again.")
        return f"Sorry, an error occurred: {str(e)}. Please try again.", None