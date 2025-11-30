import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
print(f"OpenAI Key Loaded: {api_key[:10] if api_key else 'None'}...")

try:
    client = OpenAI(api_key=api_key)

    # Test chat completion functionality
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": "Test prompt"}
        ],
        max_tokens=10
    )
    print("✅ SUCCESS! OpenAI Key is working correctly.")

    # Test embedding functionality
    embedding_result = client.embeddings.create(
        input="Test text for embedding",
        model="text-embedding-ada-002"
    )
    embedding_length = len(embedding_result.data[0].embedding)
    print(f"✅ Embedding model is working. Embedding length: {embedding_length}")

except Exception as e:
    print(f"ERROR: Key is not working. Reason:\n{e}")
