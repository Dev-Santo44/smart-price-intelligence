FROM python:3.11-slim
WORKDIR /app
COPY models/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY models /app
EXPOSE 8000
CMD ["uvicorn","src.app:app","--host","0.0.0.0","--port","8000"]
