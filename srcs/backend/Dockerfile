# Use the official Python base image
FROM python:3.9.18-slim-bullseye

# Set the working directory in the container
RUN mkdir -p /app
WORKDIR /app

# Copy the requirements file to the container wowwowowowowowowowowowowowowowowowwowowowowowowowowowowowo
COPY ./requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create new project
RUN django-admin startproject mimmo

# Expose the port that Django runs on
EXPOSE 8000

# Start the Django development server
CMD ["python", "mimmo/manage.py", "runserver", "0.0.0.0:8000"]