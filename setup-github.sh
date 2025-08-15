#!/bin/bash

echo "🚛 MLH Transport - GitHub Setup"
echo "==============================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
backend/node_modules/

# Build outputs
dist/
backend/dist/
build/

# Environment variables
.env
backend/.env

# Database
backend/database/*.db

# Logs
*.log
logs/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp

# Backup files
*~
*.bak
EOF
fi

# Set up git config if not already set
if [ -z "$(git config user.name)" ]; then
    echo "⚙️ Setting up git configuration..."
    git config user.name "MLH Transport"
    git config user.email "info@mlhtransport.co.za"
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial MLH Transport website setup

- Complete React/TypeScript frontend with QikTruck-inspired design
- Node.js/Express backend with SQLite database
- Google Maps integration for address validation and distance calculation
- Quote calculator with depot-based pricing (9 Main Road, Klapmuts)
- Admin dashboard for settings and quote management
- User registration and authentication system
- PDF quote generation
- Email integration setup
- South African pricing (ZAR, VAT 15%)
- Responsive design optimized for mobile and desktop
- Complete deployment guides and scripts

Features:
✅ Homepage with vehicle selection
✅ Instant quote calculator
✅ Admin login (/admin)
✅ User registration (/register)
✅ Settings management
✅ Quote history and management
✅ PDF generation and email sending
✅ Google Maps API integration
✅ SQLite database with proper schema
✅ JWT authentication
✅ Rate limiting and security
✅ Nginx configuration
✅ SSL setup guide
✅ Backup scripts
✅ Complete deployment documentation"

echo ""
echo "✅ Git setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/your-username/mlh-transport.git"
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Then follow the DEPLOYMENT_GUIDE_COMPLETE.md for server deployment."