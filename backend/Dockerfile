FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start application with uvicorn (single worker for development)
# For production, use: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --preload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
