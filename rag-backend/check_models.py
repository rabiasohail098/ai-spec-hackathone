import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

print("🔍 Checking available models for your API Key...")

try:
    models = client.models.list()
    for model in models:
        print(f"✅ Available: {model.id}")
except Exception as e:
    print(f"❌ Error: {e}")
