# MLH Transport - Professional Transport Quote System

A complete web application for MLH Transport, inspired by QikTruck's design but built specifically for South African transport services.

## 🚛 Features

### Customer Features
- **Modern Homepage** - Clean, professional design similar to QikTruck
- **Instant Quote Calculator** - Real-time pricing with Google Maps integration
- **Address Validation** - Google Places API for accurate pickup/dropoff locations
- **Multiple Vehicle Types** - 4-ton trucks with expandable options
- **PDF Quotes** - Professional quote generation with company branding
- **Email/WhatsApp Delivery** - Send quotes directly to customers
- **User Registration** - Customer account management
- **Quote History** - Track previous quotes and bookings

### Admin Features
- **Secure Admin Dashboard** - Separate admin portal at `/admin`
- **Pricing Management** - Adjust rates, VAT, and depot settings
- **Quote Management** - View all quotes with detailed breakdown
- **User Management** - Add/remove admin users
- **Internal Analytics** - See full route calculations (depot→pickup→dropoff→depot)

### Technical Features
- **Google Maps Integration** - Distance calculation and address validation
- **South African Focus** - ZAR currency, VAT 15%, SA address validation
- **Depot-Based Pricing** - Hidden depot calculations (9 Main Road, Klapmuts)
- **Secure Authentication** - JWT-based auth with bcrypt password hashing
- **SQLite Database** - Lightweight, reliable local database
- **Rate Limiting** - API protection and security
- **Responsive Design** - Mobile-first, works on all devices

## 🏗️ Architecture

```
Frontend (React/TypeScript)
├── Homepage (QikTruck-inspired design)
├── Quote Calculator (Google Maps integration)
├── User Registration/Login
└── Admin Dashboard

Backend (Node.js/Express)
├── Authentication API
├── Quote Calculation Engine
├── Google Maps Integration
├── Email/WhatsApp Services
└── SQLite Database

Database (SQLite)
├── Users & Admin Users
├── Quotes & Settings
└── Automated Backups
```

## 🚀 Quick Start

### For Development
```bash
# Clone repository
git clone https://github.com/your-username/mlh-transport.git
cd mlh-transport

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Setup frontend (in new terminal)
cd ..
npm install
npm run dev
```

### For Production Deployment
Follow the complete guide in `DEPLOYMENT_GUIDE_COMPLETE.md`

## 🔧 Configuration

### Required APIs (All Free Tier)

1. **Google Maps API** - $200/month free credit
   - Maps JavaScript API
   - Places API  
   - Distance Matrix API

2. **Gmail SMTP** - Free email sending
   - Create business Gmail account
   - Generate App Password

### Environment Variables

```env
# Backend (.env)
PORT=3001
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-api-key
EMAIL_USER=info@mlhtransport.co.za
EMAIL_PASS=your-app-password

# Depot Configuration
DEPOT_ADDRESS=9 Main Road, Klapmuts, Cape Town, South Africa
DEPOT_LAT=-33.8567
DEPOT_LNG=18.8086

# Pricing
TRUCK_RATE_PER_KM=10
DRIVER_RATE_PER_8H=400
EXTRA_HOUR_RATE=500
VAT_PERCENT=15
```

## 💰 Pricing Structure

The system calculates quotes based on:

1. **Distance Calculation**
   - Depot → Pickup location
   - Pickup → Dropoff location (shown to customer)
   - Dropoff → Depot (hidden from customer)

2. **Cost Components**
   - Base rate: R10/km for total distance
   - Driver cost: R400 per 8-hour day (pro-rated)
   - Extra time: R500/hour for loading/offloading beyond 1 hour each
   - VAT: 15% added to final price

3. **Customer Display**
   - Only sees pickup → dropoff distance
   - Gets "incl. VAT" pricing
   - Professional PDF quote

## 🔐 Default Login Credentials

**Admin Dashboard** (`/admin`)
- Email: `admin@mlhtransport.co.za`
- Password: `admin123`

⚠️ **Change this immediately after deployment!**

## 📱 Routes

- `/` - Homepage with quote calculator
- `/register` - Customer registration
- `/login` - Admin login (redirects to `/admin`)
- `/admin` - Admin dashboard (protected)

## 🛠️ Development

### Frontend Stack
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router for navigation
- Google Maps JavaScript API

### Backend Stack
- Node.js + Express + TypeScript
- SQLite3 database
- JWT authentication
- bcrypt password hashing
- Nodemailer for emails

### Key Files
- `src/components/HomePage.tsx` - Main homepage component
- `src/components/QuoteCalculator.tsx` - Quote calculation logic
- `backend/src/routes/quotes.ts` - Quote API endpoints
- `backend/src/models/database.ts` - Database schema and helpers

## 📋 Deployment Checklist

- [ ] Ubuntu server with domain (aegisum.co.za)
- [ ] Google Maps API key configured
- [ ] Gmail SMTP credentials setup
- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Admin password changed
- [ ] Firewall configured
- [ ] Nginx reverse proxy setup

## 🔍 Monitoring

```bash
# Check backend status
pm2 status

# View logs
pm2 logs mlh-backend

# Check database
sqlite3 backend/database/mlh_transport.db ".tables"

# Test API
curl https://aegisum.co.za/api/health
```

## 📞 Support

For deployment assistance or customization:
- Check `DEPLOYMENT_GUIDE_COMPLETE.md` for detailed instructions
- Review `backend-setup.md` for backend configuration
- See `get-google-maps-api-key.md` for API setup

## 📄 License

Private project for MLH Transport. All rights reserved.

---

**MLH Transport** - Professional transport services across South Africa 🇿🇦
