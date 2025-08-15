# MLH Transport Backend Setup

This guide will help you set up a local backend for MLH Transport instead of using Supabase.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ubuntu server access

## Step 1: Install Required Dependencies

On your Ubuntu server, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install SQLite3 for database
sudo apt-get install sqlite3
```

## Step 2: Create Backend Directory

```bash
cd ~/mlh-haul-quote
mkdir backend
cd backend
```

## Step 3: Initialize Backend Project

```bash
npm init -y
npm install express cors helmet morgan bcryptjs jsonwebtoken sqlite3 nodemailer axios dotenv
npm install -D @types/node @types/express @types/bcryptjs @types/jsonwebtoken typescript ts-node nodemon
```

## Step 4: Create Backend Structure

```bash
mkdir src
mkdir src/routes
mkdir src/middleware
mkdir src/models
mkdir src/utils
mkdir database
```

## Step 5: Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
DB_PATH=./database/mlh_transport.db

# Email Configuration (using Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# WhatsApp API (optional - can use WhatsApp Business API)
WHATSAPP_API_URL=https://api.whatsapp.com/send
```

## Step 6: Database Schema

The backend will automatically create the following tables:
- `users` - Customer accounts
- `admin_users` - Admin accounts
- `quotes` - Generated quotes
- `settings` - System settings

## Step 7: Email Setup (Free Gmail SMTP)

1. Create a Gmail account for your business (e.g., info@mlhtransport.co.za)
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
   - Use this password in your `.env` file

## Step 8: WhatsApp Integration

For WhatsApp integration, you can use:
1. WhatsApp Business API (requires approval)
2. Third-party services like Twilio, MessageBird, or ChatAPI
3. Simple WhatsApp Web links (basic solution)

## Step 9: Start the Backend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start

# Using PM2 for production
pm2 start dist/index.js --name "mlh-backend"
pm2 startup
pm2 save
```

## Step 10: Configure Frontend

Update your frontend to use the local backend instead of Supabase:

1. Replace Supabase calls with local API calls
2. Update authentication to use JWT tokens
3. Configure CORS to allow your domain

## API Endpoints

The backend will provide these endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/logout` - Logout

### Quotes
- `POST /api/quotes/calculate` - Calculate quote
- `GET /api/quotes` - Get user quotes
- `GET /api/admin/quotes` - Get all quotes (admin)

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/admin/settings` - Update settings (admin)

### Communication
- `POST /api/quotes/send-email` - Send quote via email
- `POST /api/quotes/send-whatsapp` - Send quote via WhatsApp

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

## Backup Strategy

```bash
# Create daily database backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cp ~/mlh-haul-quote/backend/database/mlh_transport.db ~/backups/mlh_transport_$(date +\%Y\%m\%d).db
```

This setup provides a complete local backend solution that's free to run and gives you full control over your data.