#!/bin/bash

# MLH Transport Website Server Script
# This script will help you run the MLH Transport website on your Ubuntu server

# Exit on error
set -e

echo "===== MLH Transport Website Server Setup ====="
echo "This script will help you run the MLH Transport website on your Ubuntu server."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js and npm installed successfully."
else
    echo "Node.js is already installed."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create a simple Node.js server to serve the application
echo "Creating a simple Node.js server..."
cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Get the file path
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

  // If the file doesn't exist, try to serve index.html (for SPA routing)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // Get the file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${DIST_DIR}`);
});
EOF

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Start the server with PM2
echo "Starting the server with PM2..."
pm2 start server.js --name "mlh-transport"

# Save the PM2 process list
echo "Saving the PM2 process list..."
pm2 save

# Set up PM2 to start on boot
echo "Setting up PM2 to start on boot..."
pm2 startup

echo "===== Server Setup Complete ====="
echo "Your MLH Transport website is now running at http://localhost:3000"
echo "To make it accessible from the internet, you need to set up a reverse proxy with Nginx."
echo "See the SETUP_GUIDE.md file for more information."