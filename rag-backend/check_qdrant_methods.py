import qdrant_client

# Create a dummy client to inspect available methods
client = qdrant_client.QdrantClient(":memory:")  # In-memory client for testing

# Print all available methods in the client
methods = [method for method in dir(client) if not method.startswith('_')]
print("Available methods in QdrantClient:")
for method in methods:
    print(f"  - {method}")

# Check specifically for search method
if hasattr(client, 'search'):
    print("\n'search' method is available")
else:
    print("\n'search' method is NOT available")

# Check for similar method names
search_like_methods = [method for method in methods if 'search' in method.lower() or 'query' in method.lower()]
print(f"\nMethods containing 'search' or 'query': {search_like_methods}")