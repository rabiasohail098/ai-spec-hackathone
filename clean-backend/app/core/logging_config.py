"""
Logging Configuration for the Backend Application

Implements structured logging as required by task T150.
"""

import logging
import sys
from datetime import datetime
from typing import Dict, Any
import json


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that outputs logs in a structured JSON format.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            'timestamp': datetime.utcfromtimestamp(record.created).isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add any extra fields
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'context'):
            log_entry['context'] = record.context
            
        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO", log_format: str = "structured") -> None:
    """
    Set up the logging configuration for the application.
    
    Args:
        log_level: The minimum logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Format of logs ("structured" for JSON, "standard" for text)
    """
    # Convert string log level to logging constant
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Clear any existing handlers
    root_logger.handlers.clear()
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    
    # Set formatter based on format preference
    if log_format == "structured":
        formatter = StructuredFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    # Set specific log levels for known loggers
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    logging.getLogger('openai').setLevel(level)
    logging.getLogger('qdrant_client').setLevel(level)


# Initialize logging when module is loaded
setup_logging()