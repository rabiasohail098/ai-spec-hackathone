"""
Comprehensive Error Handling Module

Implements comprehensive error handling for API endpoints as required by task T149.
"""

from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import traceback
from enum import Enum


class ErrorCode(str, Enum):
    """Enumeration of standard error codes for the API"""
    
    # Generic errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    
    # Specific to our application
    RAG_ERROR = "RAG_ERROR"
    VECTOR_STORE_ERROR = "VECTOR_STORE_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    CONVERSATION_ERROR = "CONVERSATION_ERROR"
    USER_PROFILE_ERROR = "USER_PROFILE_ERROR"


class APIError(BaseModel):
    """Standard error response format"""
    
    success: bool = False
    error_code: ErrorCode
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


class CustomException(Exception):
    """Custom application exception that can be caught and handled consistently"""
    
    def __init__(self, error_code: ErrorCode, message: str, details: Optional[Dict[str, Any]] = None):
        self.error_code = error_code
        self.message = message
        self.details = details
        super().__init__(message)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for the FastAPI application.
    
    Args:
        request: The incoming request that caused the exception
        exc: The exception that was raised
        
    Returns:
        JSONResponse with standardized error format
    """
    logger = logging.getLogger(__name__)
    
    # Generate request ID if not present
    request_id = getattr(request.state, 'request_id', None) if hasattr(request, 'state') else None
    if not request_id:
        import uuid
        request_id = str(uuid.uuid4())
    
    # Log the error with traceback
    logger.error(
        f"Request ID {request_id}: Unhandled exception occurred",
        extra={
            'request_id': request_id,
            'exception_type': type(exc).__name__,
            'exception_message': str(exc),
            'traceback': traceback.format_exc()
        }
    )
    
    # Handle different types of exceptions
    if isinstance(exc, HTTPException):
        # FastAPI's built-in HTTP exceptions
        error_code = _http_status_to_error_code(exc.status_code)
        message = exc.detail
        status_code = exc.status_code
    elif isinstance(exc, CustomException):
        # Our custom exceptions
        error_code = exc.error_code
        message = exc.message
        status_code = _error_code_to_http_status(error_code)
    else:
        # Generic internal server error for all other exceptions
        error_code = ErrorCode.INTERNAL_ERROR
        message = "An internal error occurred while processing your request"
        status_code = 500
    
    # Create and return standardized error response
    error_response = APIError(
        success=False,
        error_code=error_code,
        message=message,
        details={
            "timestamp": f"{datetime.utcnow().isoformat()}Z",
            "path": str(request.url),
            "method": request.method,
        } if status_code >= 500 else None,  # Only include sensitive details for 5xx errors
        request_id=request_id
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.dict()
    )


def _http_status_to_error_code(status_code: int) -> ErrorCode:
    """Convert HTTP status code to our error code"""
    mapping = {
        400: ErrorCode.VALIDATION_ERROR,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        429: ErrorCode.RATE_LIMIT_EXCEEDED,
    }
    return mapping.get(status_code, ErrorCode.INTERNAL_ERROR)


def _error_code_to_http_status(error_code: ErrorCode) -> int:
    """Convert our error code to HTTP status code"""
    mapping = {
        ErrorCode.VALIDATION_ERROR: 400,
        ErrorCode.UNAUTHORIZED: 401,
        ErrorCode.FORBIDDEN: 403,
        ErrorCode.NOT_FOUND: 404,
        ErrorCode.RATE_LIMIT_EXCEEDED: 429,
        ErrorCode.INTERNAL_ERROR: 500,
        ErrorCode.RAG_ERROR: 500,
        ErrorCode.VECTOR_STORE_ERROR: 500,
        ErrorCode.AUTHENTICATION_ERROR: 401,
        ErrorCode.CONVERSATION_ERROR: 500,
        ErrorCode.USER_PROFILE_ERROR: 500,
    }
    return mapping.get(error_code, 500)


def handle_validation_error(errors: list) -> APIError:
    """Create an APIError specifically for validation errors"""
    return APIError(
        success=False,
        error_code=ErrorCode.VALIDATION_ERROR,
        message="Validation failed",
        details={"errors": errors}
    )


def handle_not_found_error(resource_type: str, resource_id: str = None) -> APIError:
    """Create an APIError specifically for not found errors"""
    message = f"{resource_type} not found"
    if resource_id:
        message += f" with id: {resource_id}"
    
    return APIError(
        success=False,
        error_code=ErrorCode.NOT_FOUND,
        message=message
    )


def handle_internal_error(message: str, details: Optional[Dict[str, Any]] = None) -> APIError:
    """Create an APIError specifically for internal errors"""
    return APIError(
        success=False,
        error_code=ErrorCode.INTERNAL_ERROR,
        message=message,
        details=details
    )


# Import datetime for use in error handling
from datetime import datetime