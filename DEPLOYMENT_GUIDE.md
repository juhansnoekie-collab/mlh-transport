# MLH Transport Website Deployment Guide

This guide will help you deploy the MLH Transport website on your Ubuntu server.

## Prerequisites

- Ubuntu server with SSH access
- Domain name (aegisum.co.za) pointing to your server's IP address
- Basic knowledge of Linux commands

## Step 1: Connect to Your Ubuntu Server

Use SSH to connect to your Ubuntu server:

```bash
ssh username@your-server-ip
```

## Step 2: Clone the Repository

```bash
git clone https://github.com/fdgsrhnsxtr/mlh-haul-quote.git
cd mlh-haul-quote
```

## Step 3: Choose a Deployment Method

You have several options for deploying the website:

### Option 1: Using the Deployment Script

The simplest way to deploy the website is to use the provided deployment script:

```bash
./deploy.sh
```

This script will:
- Install Node.js and npm if not already installed
- Install Nginx if not already installed
- Build the application
- Configure Nginx to serve the website
- Restart Nginx

### Option 2: Using the Server Script

If you prefer to run the website using Node.js directly:

```bash
./run-on-server.sh
```

This script will:
- Install Node.js and npm if not already installed
- Build the application
- Create a simple Node.js server to serve the application
- Install PM2 for process management
- Start the server with PM2
- Set up PM2 to start on boot

### Option 3: Manual Deployment

If you prefer to deploy the website manually:

1. Install Node.js and npm:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install dependencies and build the application:

```bash
npm install
npm run build
```

3. Install and configure Nginx:

```bash
sudo apt-get update
sudo apt-get install -y nginx

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

sudo ln -sf /etc/nginx/sites-available/mlh-transport.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Set Up SSL (HTTPS)

To secure your website with HTTPS, you can use the provided SSL setup script:

```bash
./setup-ssl.sh aegisum.co.za
```

This script will:
- Install Certbot if not already installed
- Configure Nginx for SSL
- Obtain an SSL certificate from Let's Encrypt
- Configure Nginx to use the SSL certificate

## Step 5: Get a Google Maps API Key

To use the Google Maps integration, you need to get a free Google Maps API key. See the [get-google-maps-api-key.md](./get-google-maps-api-key.md) file for detailed instructions.

## Step 6: Set Up Supabase Backend (Optional)

If you want to add a backend to your website, you can set up Supabase. See the [setup-supabase.md](./setup-supabase.md) file for detailed instructions.

## Troubleshooting

If you encounter any issues:

1. Check the Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Check the Nginx access logs:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

3. Make sure your domain is correctly pointing to your server's IP address

4. Ensure that your Google Maps API key is correctly entered and has the necessary APIs enabled

5. If you're having issues with the API key, try removing the restrictions temporarily to see if that resolves the issue

## Updating the Website

To update the website:

1. Pull the latest changes from the repository:
   ```bash
   git pull
   ```

2. Rebuild the application:
   ```bash
   npm install
   npm run build
   ```

3. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## Conclusion

Your MLH Transport website should now be deployed and accessible at your domain (aegisum.co.za). Don't forget to set up your Google Maps API key in the application!