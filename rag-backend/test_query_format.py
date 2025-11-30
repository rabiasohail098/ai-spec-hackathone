import qdrant_client
from qdrant_client.http.models import PointStruct, VectorParams, Distance
import uuid

# Create an in-memory client for testing
client = qdrant_client.QdrantClient(":memory:")

# Create a test collection
collection_name = "test_collection"
try:
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=4, distance=Distance.COSINE)
    )
    
    # Add a test point
    client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(
                id=1,
                vector=[0.1, 0.2, 0.3, 0.4],
                payload={"text": "Test document content", "source": "test_source"}
            )
        ]
    )
    
    # Test the query method
    search_results = client.query(
        collection_name=collection_name,
        query_vector=[0.1, 0.2, 0.3, 0.4],
        limit=5
    )
    
    print("Query method results:")
    print(f"Type of result: {type(search_results)}")
    if search_results:
        print(f"First result type: {type(search_results[0])}")
        print(f"First result: {search_results[0]}")
        print(f"First result payload: {search_results[0].payload}")
        print(f"Can access .payload: {hasattr(search_results[0], 'payload')}")
        print(f"Has .id attribute: {hasattr(search_results[0], 'id')}")
        print(f"Has .vector attribute: {hasattr(search_results[0], 'vector')}")
    else:
        print("No results returned")
    
    # Clean up
    client.delete_collection(collection_name)
    
except Exception as e:
    print(f"Error during test: {e}")