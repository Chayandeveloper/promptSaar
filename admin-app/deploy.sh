#!/bin/bash
set -e

echo "🚀 Starting Deployment for Prompt Saar Backend..."

# 1. Pull latest code from Git
echo "📥 Pulling latest changes from Git..."
git pull origin main

# 2. Install PHP Composer dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# 3. Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 4. Install npm packages & compile Vite production assets
echo "⚡ Building frontend assets..."
npm install
npm run build

# 5. Clear and rebuild Laravel caches
echo "🧹 Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Ensure correct directories and file permissions
echo "🔒 Fixing file permissions..."
mkdir -p storage/framework/{sessions,views,cache/data} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 7. Reload services
echo "🔄 Reloading PHP-FPM and Nginx..."
sudo systemctl reload php8.5-fpm || sudo systemctl reload php*-fpm || true
sudo systemctl reload nginx || true

echo "✅ Deployment completed successfully!"
