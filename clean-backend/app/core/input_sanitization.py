"""
Input Sanitization Utilities

Implements input sanitization to prevent injection attacks as required by task T158.
"""

import re
import html
from typing import Union, Dict, Any, List


class InputSanitizer:
    """
    Utility class for sanitizing user inputs to prevent injection attacks.
    """
    
    @staticmethod
    def sanitize_text(text: str, max_length: int = 10000) -> str:
        """
        Sanitize text input by removing dangerous characters and limiting length.
        
        Args:
            text: The text to sanitize
            max_length: Maximum allowed length (default 10000 characters)
            
        Returns:
            Sanitized text
        """
        if text is None:
            return ""
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Remove null bytes which can be used in some injection attacks
        text = text.replace('\x00', '')
        
        # Encode HTML to prevent XSS
        text = html.escape(text)
        
        return text
    
    @staticmethod
    def sanitize_query(query: str) -> str:
        """
        Sanitize search/query input.
        
        Args:
            query: The search query to sanitize
            
        Returns:
            Sanitized query
        """
        if not query:
            return ""
        
        # Sanitize as regular text first
        query = InputSanitizer.sanitize_text(query, max_length=1000)
        
        # Remove potentially dangerous SQL characters/sequences
        dangerous_sql_patterns = [
            r"(?i)\b(drop|delete|insert|update|create|alter|exec|execute|union|select)\b",
            r"(?i)(\b(select|union|insert|update|delete|drop|create|exec|execute|truncate|alter)\b.*\b(from|where|into|values|table|database)\b)",
            r"--.*",
            r"\/\*.*\*\/",
            r"(?i)waitfor.*delay",
            r"(?i)shutdown",
            r"(?i)xp_",
            r"(?i)sp_"
        ]
        
        for pattern in dangerous_sql_patterns:
            query = re.sub(pattern, "", query)
        
        # Remove multiple consecutive semicolons
        query = re.sub(r';+', ';', query)
        
        return query.strip()
    
    @staticmethod
    def sanitize_user_input(data: Union[str, Dict[str, Any], List[Any]]) -> Union[str, Dict[str, Any], List[Any]]:
        """
        Recursively sanitize user input data structures.
        
        Args:
            data: The data to sanitize (string, dict, or list)
            
        Returns:
            Sanitized data
        """
        if isinstance(data, str):
            return InputSanitizer.sanitize_text(data)
        elif isinstance(data, dict):
            sanitized_dict = {}
            for key, value in data.items():
                # Sanitize the key too, but be more permissive since it's likely a field name
                safe_key = re.sub(r'[<>"\']', '', str(key))[:100]  # Limit key length
                sanitized_dict[safe_key] = InputSanitizer.sanitize_user_input(value)
            return sanitized_dict
        elif isinstance(data, list):
            return [InputSanitizer.sanitize_user_input(item) for item in data]
        else:
            # For non-string types, just return as is
            return data
    
    @staticmethod
    def validate_and_sanitize_chat_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Specific sanitization for chat requests.
        
        Args:
            request_data: The chat request data to sanitize
            
        Returns:
            Sanitized request data
        """
        sanitized = {}
        
        # Sanitize question
        if 'question' in request_data:
            sanitized['question'] = InputSanitizer.sanitize_query(request_data['question'])
        
        # Sanitize context_text if present
        if 'context_text' in request_data:
            sanitized['context_text'] = InputSanitizer.sanitize_text(request_data['context_text'])
        
        # Sanitize conversation_id if present (numeric, so we just validate)
        if 'conversation_id' in request_data:
            conv_id = request_data['conversation_id']
            if isinstance(conv_id, int) or (isinstance(conv_id, str) and conv_id.isdigit()):
                sanitized['conversation_id'] = int(conv_id) if isinstance(conv_id, str) else conv_id
            else:
                sanitized['conversation_id'] = None  # Default to no conversation
        
        # Preserve other fields but sanitize text fields
        for key, value in request_data.items():
            if key not in sanitized:
                if isinstance(value, str):
                    sanitized[key] = InputSanitizer.sanitize_text(value)
                else:
                    sanitized[key] = value
        
        return sanitized

# Example usage:
# sanitizer = InputSanitizer()
# safe_input = sanitizer.sanitize_text(user_input)