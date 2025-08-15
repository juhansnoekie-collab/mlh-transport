#!/bin/bash

# MLH Transport Backend Deployment Script

echo "🚛 MLH Transport Backend Deployment"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Create database directory
mkdir -p database

# Create backup directory
mkdir -p ~/backups

# Set up PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mlh-transport-backend',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the server: npm start"
echo "3. Or use PM2: pm2 start ecosystem.config.js"
echo ""
echo "Default admin login:"
echo "Email: admin@mlhtransport.co.za"
echo "Password: admin123"
echo ""
echo "API will be available at: http://localhost:3001"