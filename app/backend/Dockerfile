FROM python:3.10

# Install system dependencies for OpenCV
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*



WORKDIR /app


COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

RUN git lfs pull

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]