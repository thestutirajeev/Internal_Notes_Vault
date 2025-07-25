#!/bin/bash

# Set the working directory to the project root
cd /opt/render/project/src/backend || exit

# Apply database migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn server
gunicorn Internal_Notes_Vault.wsgi:application --bind 0.0.0.0:8000