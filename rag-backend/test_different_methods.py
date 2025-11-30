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
    
    # Try the search method (might work in a different implementation)
    try:
        search_results = client.search(
            collection_name=collection_name,
            query_vector=[0.1, 0.2, 0.3, 0.4],
            limit=5
        )
        
        print("Using search method succeeded:")
        print(f"Type of result: {type(search_results)}")
        if search_results:
            print(f"First result type: {type(search_results[0])}")
            print(f"First result: {search_results[0]}")
            print(f"First result payload: {search_results[0].payload}")
    except AttributeError as e:
        print(f"search method not available: {e}")
        
        # Try the query method with different parameters
        print("\nTrying query_points method:")
        try:
            search_results = client.query_points(
                collection_name=collection_name,
                query=[0.1, 0.2, 0.3, 0.4],  # Different parameter name
                limit=5
            )
            
            print("Using query_points method succeeded:")
            print(f"Type of result: {type(search_results)}")
            if hasattr(search_results, 'points') and search_results.points:
                print(f"First result type: {type(search_results.points[0])}")
                print(f"First result: {search_results.points[0]}")
                print(f"First result payload: {search_results.points[0].payload}")
        except Exception as e2:
            print(f"query_points method error: {e2}")
    
    # Clean up
    client.delete_collection(collection_name)
    
except Exception as e:
    print(f"Error during test: {e}")