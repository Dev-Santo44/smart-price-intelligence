# Use lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY backend/requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend /app

# Expose port (same as Flask runs on)
EXPOSE 8000

# Run Flask
CMD ["python", "app.py"]
