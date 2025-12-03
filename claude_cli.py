import os

from anthropic import Client

# Make sure ANTHROPIC_API_KEY is set in your environment
client = Client()

while True:
    prompt = input("💬 Ask Claude (type 'exit' to quit): ")
    if prompt.lower() == "exit":
        break

    response = client.completions.create(
        model="claude-3-5-sonnet-latest", prompt=prompt, max_tokens_to_sample=200
    )
    print("\n🤖 Claude says:\n")
    print(response.completion)
