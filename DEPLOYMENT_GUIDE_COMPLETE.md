# MLH Transport - Complete Deployment Guide

This guide will help you deploy the complete MLH Transport application on your Ubuntu server with the domain aegisum.co.za.

## Overview

The application consists of:
- **Frontend**: React/TypeScript application (similar to QikTruck design)
- **Backend**: Node.js/Express API with SQLite database
- **Features**: Quote calculation, admin dashboard, user registration, PDF generation, email/WhatsApp integration

## Prerequisites

- Ubuntu server with root access
- Domain name (aegisum.co.za) pointing to your server
- Basic terminal knowledge

## Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install SQLite3
sudo apt-get install sqlite3
```

## Step 2: Clone and Setup Repository

```bash
# Navigate to your home directory
cd ~

# Clone the repository (replace with your actual repo URL)
git clone https://github.com/your-username/mlh-transport.git
cd mlh-transport

# Or if you're copying files manually:
# Create the directory structure as shown in the repository
```

## Step 3: Backend Setup

```bash
# Navigate to backend directory
cd ~/mlh-transport/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit the environment file
nano .env
```

Configure your `.env` file:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-here
DB_PATH=./database/mlh_transport.db

# Email Configuration (Gmail SMTP - Free)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@mlhtransport.co.za
EMAIL_PASS=your-gmail-app-password

# Google Maps API (Free tier)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Depot Configuration
DEPOT_ADDRESS=9 Main Road, Klapmuts, Cape Town, South Africa
DEPOT_LAT=-33.8567
DEPOT_LNG=18.8086

# Pricing Configuration
TRUCK_RATE_PER_KM=10
DRIVER_RATE_PER_8H=400
EXTRA_HOUR_RATE=500
VAT_PERCENT=15
```

```bash
# Build and start backend
npm run build
pm2 start dist/index.js --name "mlh-backend"
pm2 startup
pm2 save
```

## Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd ~/mlh-transport

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to nginx directory
sudo cp -r dist/* /var/www/html/
```

## Step 5: Nginx Configuration

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/aegisum.co.za
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name aegisum.co.za www.aegisum.co.za;
    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aegisum.co.za /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 6: SSL Certificate (Free with Let's Encrypt)

```bash
# Get SSL certificate
sudo certbot --nginx -d aegisum.co.za -d www.aegisum.co.za

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 7: Get Free APIs

### Google Maps API (Free $200/month credit)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "MLH Transport"
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
4. Create API key in "Credentials"
5. Restrict the key to your domain (aegisum.co.za)
6. Add the key to your backend `.env` file

### Gmail SMTP (Free)

1. Create Gmail account: info@mlhtransport.co.za
2. Enable 2-factor authentication
3. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Add credentials to backend `.env` file

## Step 8: Database Backup Setup

```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ~/mlh-transport/backend/database/mlh_transport.db ~/backups/mlh_transport_$DATE.db
# Keep only last 30 days of backups
find ~/backups -name "mlh_transport_*.db" -mtime +30 -delete
EOF

chmod +x ~/backup-db.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-db.sh") | crontab -
```

## Step 9: Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Step 10: Testing

1. **Visit your website**: https://aegisum.co.za
2. **Test quote calculator**: Enter addresses and get quotes
3. **Test admin login**: https://aegisum.co.za/login
   - Email: admin@mlhtransport.co.za
   - Password: admin123
4. **Test API**: https://aegisum.co.za/api/health

## Step 11: Post-Deployment Configuration

### Update Admin Password
1. Login to admin dashboard
2. Go to Admin Users tab
3. Change default password

### Configure Settings
1. In admin dashboard, go to Settings tab
2. Update depot address if needed
3. Adjust pricing as required

### Add Google Maps API Key
1. On the main website, click "Set API Key"
2. Enter your Google Maps API key
3. Test address autocomplete

## Monitoring and Maintenance

### Check Application Status
```bash
# Check backend status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check logs
pm2 logs mlh-backend
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
# Pull latest changes
cd ~/mlh-transport
git pull

# Update backend
cd backend
npm install
npm run build
pm2 restart mlh-backend

# Update frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

## Troubleshooting

### Common Issues

1. **API not working**: Check PM2 status and logs
2. **SSL issues**: Run `sudo certbot renew`
3. **Database errors**: Check file permissions
4. **Google Maps not loading**: Verify API key and restrictions

### Log Locations
- Backend logs: `pm2 logs mlh-backend`
- Nginx logs: `/var/log/nginx/`
- Database: `~/mlh-transport/backend/database/`

## Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured
- ✅ Default admin password changed
- ✅ Google Maps API key restricted
- ✅ Database backups configured
- ✅ Security headers in nginx

## Support

For issues or questions:
1. Check the logs first
2. Verify all environment variables are set
3. Ensure all services are running
4. Check domain DNS settings

Your MLH Transport website should now be fully operational at https://aegisum.co.za!