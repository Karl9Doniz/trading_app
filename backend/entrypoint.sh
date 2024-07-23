#!/bin/bash

set -e

# Function to wait for the database to be ready
wait_for_db() {
  echo "Waiting for database..."
  while ! pg_isready -h db -p 5432 -q -U postgres; do
    sleep 1
  done
  echo "Database is ready!"
}

wait_for_db

# Check if there are any existing migrations
if [ -d "migrations" ]; then
  echo "Migrations directory exists. Upgrading database..."
  flask db upgrade
else
  echo "Initializing migrations..."
  flask db init
  flask db migrate -m "Initial migration"
  flask db upgrade
fi

# Start the Flask application
flask run --host 0.0.0.0