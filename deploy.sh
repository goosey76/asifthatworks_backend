#!/bin/bash

# VPS Deployment Script for asifthatworks_backend
# Run this script on your VPS after cloning the repository

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Update system
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
fi

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found. Please create it with your environment variables."
    echo "Example: cp .env.example .env && nano .env"
    exit 1
fi

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete asifthatworks 2>/dev/null || true
pm2 start server.js --name asifthatworks --watch
pm2 save
pm2 startup

echo "✅ Application deployed successfully!"
echo ""
echo "📋 Useful commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs asifthatworks  - View logs"
echo "  pm2 restart asifthatworks - Restart app"
echo "  pm2 stop asifthatworks  - Stop app"
