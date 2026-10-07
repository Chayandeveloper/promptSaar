# 🚀 Production Server Setup & Deployment Guide
**Prompt Saar (Backend & Admin Panel)**

This guide contains the step-by-step commands and configuration required to deploy the latest features—including **Notification Timers & Scheduler**, **AdMob Controls**, and **Firebase Push Notifications**—to your live production server.

---

## 📋 Overview of Changes
* **Notification Timer & Scheduler**: Schedule multiple push notifications for specific dates and times with automatic timezone synchronization.
* **Scheduled Queue Management**: Real-time countdowns, immediate dispatch trigger (`Send Now`), and cancel/delete controls.
* **Background Worker & Fail-Safe**: Automated every-minute delivery via Laravel scheduler + instant request-triggered backup.
* **AdMob Policy & Reliability Guards**: Auto-collapsing banners on `NO_FILL`, no test badges in production builds, and synchronized admin toggles.

---

## 🛠️ Step-by-Step Server Setup Commands

Connect to your server via SSH and run the following commands inside your Laravel project root:

### 1. Navigate to Project Directory
```bash
cd /var/www/promptbaba.cloud/admin-app
```
*(Replace `/var/www/promptbaba.cloud/admin-app` with your actual server directory path)*.

---

### 2. Pull the Latest Code
```bash
git pull origin main
```
*(Or upload the updated files via SFTP / cPanel File Manager)*.

---

### 3. Run Database Migrations
Adds the `scheduled_at` and `sent_at` timestamp columns to the `push_notifications` table:
```bash
php artisan migrate --force
```

---

### 4. Verify Firebase Credentials
Make sure your Firebase service account key exists in the storage directory:
```bash
ls -la storage/app/firebase-credentials.json
```
> **Note:** If this file is missing, upload your Google Firebase Admin service account key JSON file (`promptcraft-b14f6`) to `storage/app/firebase-credentials.json`.

---

### 5. Install Dependencies & Build Frontend
Compiles the latest Inertia React admin interface (Notification Scheduler UI, calendar picker, and Scheduled Queue):
```bash
npm install
npm run build
```

---

### 6. Clear & Rebuild Application Caches
Ensures the server is running on the latest routes and configuration:
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### 7. Test the Scheduled Notification Command
Manually execute the scheduler command to verify that there are no syntax or configuration errors:
```bash
php artisan notifications:send-scheduled
```
**Expected Output:**
```text
Checking for due scheduled notifications...
No scheduled notifications due at this time.
```

---

## ⏰ Step 8: Configure the 1-Minute Cron Job

To automatically send scheduled notifications at the exact scheduled minute, configure Laravel's task scheduler.

### Option A: Standard Linux VPS / Ubuntu / Nginx / Apache
1. Open your server crontab:
   ```bash
   crontab -e
   ```
2. Add the following line at the very bottom (replace with your actual project path):
   ```bash
   * * * * * cd /var/www/promptbaba.cloud/admin-app && php artisan schedule:run >> /dev/null 2>&1
   ```
3. Save and exit (in `nano`: press `CTRL + O`, `ENTER`, then `CTRL + X`).

### Option B: cPanel / Webmin / DirectAdmin
1. Log in to **cPanel**.
2. Search for **Cron Jobs** under the *Advanced* section.
3. Under **Common Settings**, select **Once Per Minute (`* * * * *`)**.
4. In the **Command** input box, paste:
   ```bash
   /usr/local/bin/php /home/username/public_html/admin-app/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Adjust PHP binary path and folder path according to your hosting provider)*.
5. Click **Add New Cron Job**.

> **💡 Built-in Fail-Safe Protection:**  
> Even if your cron job temporarily stops or is delayed, the system has a built-in fail-safe trigger: whenever an admin loads the Notification page or any mobile device pings the API (`/api/app-version`), overdue notifications are automatically processed and dispatched!

---

## ⚡ Quick One-Liner (For Future Deployments)

After future updates, you can run all deployment commands at once:

```bash
git pull origin main && php artisan migrate --force && npm run build && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

---

## 📱 Mobile App Production Checklist (`mobile/`)

Before generating your production Android APK / AAB build (`eas build -p android --profile production`):

1. **Verify API URL in `mobile/.env`**:
   ```env
   EXPO_PUBLIC_API_URL=https://promptbaba.cloud/api
   ```
2. **Verify Firebase File**:
   Ensure `mobile/google-services.json` matches your Firebase package `com.fillosoftpromptsaar.app`.
3. **AdMob Production Switches**:
   Log in to your live Admin Panel (`https://promptbaba.cloud/admin/settings/ads`) and ensure your live AdMob App ID and Ad Unit IDs are saved.
