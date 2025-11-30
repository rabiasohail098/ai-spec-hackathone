import os
import qdrant_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Qdrant client
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

client = qdrant_client.QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)

collection_name = "book_knowledge"

# Delete the existing collection to clean up failed embeddings
try:
    client.delete_collection(collection_name)
    print(f"[SUCCESS] Collection '{collection_name}' deleted successfully.")
    print("Now run 'python ingest.py' with a valid API key to properly populate the database.")
except Exception as e:
    print(f"[ERROR] Error deleting collection: {e}")
    print("The collection might not exist yet, which is fine.")