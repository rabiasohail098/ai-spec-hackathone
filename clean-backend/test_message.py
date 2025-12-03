"""Test script to reproduce the error"""
try:
    print("Attempting to import Message model...")
    from app.models.message import Message
    print("Successfully imported Message model!")
except Exception as e:
    print(f"Error importing Message model: {e}")
    import traceback
    traceback.print_exc()