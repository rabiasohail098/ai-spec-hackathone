"""
Rate Limiting Middleware

Implements request rate limiting as required by task T154.
"""

import time
from collections import defaultdict
from typing import Dict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to implement rate limiting per IP address.
    
    Default: 100 requests per minute per IP
    """
    
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.logger = logging.getLogger(__name__)
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP address (considering potential proxy headers)
        client_ip = request.client.host
        if "X-Forwarded-For" in request.headers:
            client_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()
        elif "X-Real-IP" in request.headers:
            client_ip = request.headers["X-Real-IP"]
        
        # Clean old requests (older than 1 minute)
        now = time.time()
        self.requests[client_ip] = [
            timestamp for timestamp in self.requests[client_ip] 
            if now - timestamp < 60
        ]
        
        # Check if rate limit is exceeded
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            self.logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
                }
            )
        
        # Add current request timestamp
        self.requests[client_ip].append(now)
        
        response = await call_next(request)
        return response