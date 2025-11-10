-- Add user status and notification preferences columns
-- Run: mysql -u root -p powershare_db < database/add_user_status_and_preferences.sql

USE powershare_db;

-- Add status column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status ENUM('active', 'suspended', 'inactive') DEFAULT 'active' AFTER role;

-- Add notification preference columns if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE AFTER status,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT TRUE AFTER email_notifications,
ADD COLUMN IF NOT EXISTS reminder_notifications BOOLEAN DEFAULT TRUE AFTER sms_notifications;

-- Update existing users to have active status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Add index on status for faster queries
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_status (status);

-- Display updated schema
DESCRIBE users;

SELECT 'User status and preferences columns added successfully!' as Status;
