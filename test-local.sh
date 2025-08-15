#!/bin/bash

# MLH Transport Website Local Test Script
# This script will help you test the MLH Transport website locally

# Exit on error
set -e

echo "===== MLH Transport Website Local Test ====="
echo "This script will help you test the MLH Transport website locally."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting the development server..."
echo "The website will be available at http://localhost:12000"
echo "Press Ctrl+C to stop the server."
npm run dev