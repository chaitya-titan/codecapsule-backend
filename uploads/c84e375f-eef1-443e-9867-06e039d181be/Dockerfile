# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy everything from this execId folder into the container
COPY . .

# Install dependencies if requirements.txt exists
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Install websocket-client for wrapper.py WS communication
RUN pip install --no-cache-dir websocket-client

# Create generated folder (host will mount this)
RUN mkdir -p /generated

# Make wrapper.py the entrypoint, passing script.py as argument
ENTRYPOINT ["python", "-u", "wrapper.py"]
CMD ["script.py"]