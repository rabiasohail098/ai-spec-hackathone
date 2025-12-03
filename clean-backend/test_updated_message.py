"""Test script to test the updated Message model"""
try:
    print("Attempting to import Message model...")
    from app.models.message import Message
    from datetime import datetime
    print("Successfully imported Message model!")

    print("\nTesting valid message creation...")
    msg = Message(
        conversation_id=1,
        content="Hello, world!",
        role="user",
        timestamp=datetime.utcnow()
    )
    print(f"Valid message created: {msg}")

    print("\nTesting invalid role...")
    try:
        invalid_msg = Message(
            conversation_id=1,
            content="Hello, world!",
            role="invalid_role",  # This should fail
            timestamp=datetime.utcnow()
        )
        print("ERROR: Invalid role was accepted!")
    except Exception as e:
        print(f"Good: Invalid role was rejected with error: {e}")

    print("\nAll tests passed!")
except Exception as e:
    print(f"Error importing Message model: {e}")
    import traceback
    traceback.print_exc()