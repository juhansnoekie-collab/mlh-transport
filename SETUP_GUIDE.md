# MLH Transport Website Setup Guide

This guide will help you set up the MLH Transport website on your Ubuntu server and obtain a free Google Maps API key.

## Getting a Free Google Maps API Key

Google Maps Platform offers a $200 monthly credit, which is more than enough for a small business website. Here's how to get your free API key:

### Step 1: Create a Google Cloud Platform Account

1. Go to [Google Cloud Platform](https://cloud.google.com/)
2. Click on "Get Started for Free" or "Sign In" if you already have a Google account
3. Follow the prompts to create a new account or sign in
4. You may need to enter credit card information, but you won't be charged unless you exceed the free tier limits

### Step 2: Create a New Project

1. Once logged in, go to the [Google Cloud Console](https://console.cloud.google.com/)
2. At the top of the page, click on the project dropdown and then click "New Project"
3. Name your project (e.g., "MLH Transport")
4. Click "Create"

### Step 3: Enable the Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs (click on each one and then click "Enable"):
   - Maps JavaScript API
   - Places API
   - Distance Matrix API

### Step 4: Create an API Key

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Your new API key will be displayed. Copy it to a safe place.

### Step 5: Restrict Your API Key (Recommended)

To secure your API key, you should restrict it:

1. In the Credentials page, find your API key and click "Edit API key"
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your domain (e.g., `*.aegisum.co.za/*`) to the list of allowed referrers
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled (Maps JavaScript API, Places API, Distance Matrix API)
6. Click "Save"

## Deploying the Website on Your Ubuntu Server

### Step 1: Connect to Your Ubuntu Server

Use SSH to connect to your Ubuntu server:

```bash
ssh username@your-server-ip
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/fdgsrhnsxtr/mlh-haul-quote.git
cd mlh-haul-quote
```

### Step 3: Run the Deployment Script

```bash
./deploy.sh
```

This script will:
- Install Node.js and npm if not already installed
- Install Nginx if not already installed
- Build the application
- Configure Nginx to serve the website
- Restart Nginx

### Step 4: Set Up Your Domain

Make sure your domain (aegisum.co.za) points to your server's IP address. You can do this through your domain registrar's DNS settings.

### Step 5: Set Up SSL (Optional but Recommended)

To secure your website with HTTPS, you can use Let's Encrypt:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d aegisum.co.za -d www.aegisum.co.za
```

Follow the prompts to complete the SSL setup.

## Using the Website

1. Open your website in a browser (e.g., http://aegisum.co.za)
2. Click on "Set API Key" and enter your Google Maps API key
3. The key will be saved locally in your browser
4. You can now use the quote calculator to generate transport quotes

## Admin Dashboard

The admin dashboard is available at http://aegisum.co.za/admin. Here you can:
- Adjust pricing settings
- View the latest quote details

## Future Enhancements

For future enhancements, you might want to:

1. Set up a backend server to store quotes and settings
2. Implement user authentication for the admin dashboard
3. Add email and WhatsApp integration for sending quotes
4. Add more truck types and pricing options

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