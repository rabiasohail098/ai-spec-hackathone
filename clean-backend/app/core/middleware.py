"""
Request Processing Middleware

Implements various middleware for request processing including:
- Request ID generation and tracking
- Performance monitoring
- Request/response logging
"""

import uuid
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add request ID and log requests/responses
    """
    
    async def dispatch(self, request: Request, call_next):
        # Generate a unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log the incoming request
        logger = logging.getLogger(__name__)
        logger.info(
            f"Request ID {request_id}: {request.method} {request.url.path}",
            extra={
                'request_id': request_id,
                'method': request.method,
                'path': request.url.path,
                'query_params': str(dict(request.query_params))
            }
        )
        
        # Record start time for performance tracking
        start_time = time.time()
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Add process time to response headers
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id
            
            # Log successful response
            logger.info(
                f"Request ID {request_id}: Response {response.status_code} in {process_time:.2f}s",
                extra={
                    'request_id': request_id,
                    'status_code': response.status_code,
                    'process_time': process_time
                }
            )
            
            return response
            
        except Exception as e:
            # Calculate processing time even for errors
            process_time = time.time() - start_time
            
            # Log error with request ID
            logger.error(
                f"Request ID {request_id}: Error processing request: {str(e)}",
                extra={
                    'request_id': request_id,
                    'process_time': process_time,
                    'exception': str(e)
                }
            )
            
            # Re-raise the exception to be handled by our global exception handler
            raise