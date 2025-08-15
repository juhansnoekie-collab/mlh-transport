#!/bin/bash

# MLH Transport Website SSL Setup Script
# This script will help you set up SSL for your MLH Transport website

# Exit on error
set -e

echo "===== MLH Transport Website SSL Setup ====="
echo "This script will help you set up SSL for your MLH Transport website."

# Check if the domain is provided
if [ -z "$1" ]; then
    echo "Please provide your domain name as an argument."
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Certbot is not installed. Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    echo "Certbot installed successfully."
else
    echo "Certbot is already installed."
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

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mlh-transport.conf > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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

# Get SSL certificate
echo "Getting SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

echo "===== SSL Setup Complete ====="
echo "Your MLH Transport website should now be accessible at https://$DOMAIN"
echo "Don't forget to set up your Google Maps API key in the application!"