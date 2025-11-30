import os

import qdrant_client
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS (Frontend Connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OPENAI SETUP ---
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("❌ ERROR: OPENAI_API_KEY missing in .env")

# Initialize OpenAI client
openai_client = OpenAI(api_key=openai_api_key)

# --- QDRANT SETUP ---
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if not qdrant_url or not qdrant_api_key:
    print("❌ ERROR: QDRANT credentials missing in .env")

qdrant_client_instance = qdrant_client.QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)
collection_name = "book_knowledge"


class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"📩 Query: {request.question}")

        # Create embedding for the user's question using OpenAI's embedding model
        embedding_response = openai_client.embeddings.create(
            input=request.question, model="text-embedding-ada-002"
        )
        query_embedding = embedding_response.data[0].embedding

        # Search in Qdrant for relevant context using the query_points method
        search_response = qdrant_client_instance.query_points(
            collection_name=collection_name,
            query=query_embedding,
            limit=5,  # Retrieve top 5 most relevant chunks
        )

        # Extract the text content from search results
        context_texts = [result.payload.get("text", "") for result in search_response.points]
        context = "\n\n".join(context_texts)

        if not context.strip():
            print("⚠️ No relevant context found in vector database")
            # Fallback to direct generation if no context is found
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": request.question}],
                max_tokens=500,
                temperature=0.7,
            )
        else:
            print(f"📚 Retrieved context from {len(context_texts)} relevant documents")
            # Create a prompt that incorporates the retrieved context
            prompt = f"""
            Context information:
            {context}

            Using ONLY the context information above, please answer the following question:
            {request.question}

            If the context doesn't contain enough information to answer the question, please say so.
            """

            # Generate response based on context
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant for Physical AI and Humanoid Robotics. Use the provided context to answer questions. If the context doesn't contain enough information, say so.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=500,
                temperature=0.7,
            )

        # Extract text safely
        answer = response.choices[0].message.content

        return {
            "answer": answer,
            "context_sources": [
                result.payload.get("source", "Unknown") for result in search_response.points
            ],
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Endpoint to check available collections in Qdrant
@app.get("/collections")
async def get_collections():
    try:
        collections = qdrant_client_instance.get_collections()
        return {"collections": [c.name for c in collections.collections]}
    except Exception as e:
        print(f"❌ Error getting collections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
