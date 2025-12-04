FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for building tiktoken
RUN apt-get update && apt-get install -y \
    build-essential \
    cargo \
    rustc \
    && rm -rf /var/lib/apt/lists/*

COPY clean-backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY clean-backend/ .

EXPOSE $PORT

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]