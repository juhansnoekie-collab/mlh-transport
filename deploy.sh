#!/bin/bash

# MLH Transport Website Deployment Script
# This script will help you deploy the MLH Transport website on your Ubuntu server

# Exit on error
set -e

echo "===== MLH Transport Website Deployment ====="
echo "This script will help you deploy the MLH Transport website on your Ubuntu server."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js and npm installed successfully."
else
    echo "Node.js is already installed."
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed. Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
    echo "Nginx installed successfully."
else
    echo "Nginx is already installed."
fi

# Build the application
echo "Building the application..."
npm install
npm run build

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mlh-transport.conf > /dev/null << EOF
server {
    listen 80;
    server_name aegisum.co.za www.aegisum.co.za;

    root $(pwd)/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Enable CORS
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/mlh-transport.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "===== Deployment Complete ====="
echo "Your MLH Transport website should now be accessible at http://aegisum.co.za"
echo "Don't forget to set up your Google Maps API key in the application!"