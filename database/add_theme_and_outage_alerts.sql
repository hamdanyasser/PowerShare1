-- Add theme and outage alerts preferences to users table
-- Run: mysql -u root -p powershare_db < database/add_theme_and_outage_alerts.sql

USE powershare_db;

-- Add outage_alerts column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS outage_alerts BOOLEAN DEFAULT TRUE AFTER sms_notifications;

-- Add theme column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS theme ENUM('light', 'dark') DEFAULT 'light' AFTER reminder_notifications;

-- Display updated schema
DESCRIBE users;

SELECT 'Theme and outage alerts columns added successfully!' as Status;
