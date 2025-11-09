-- Migration: Add profile_image column to users table
-- Date: 2025-11-06

USE powershare_db;

-- Add profile_image column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) DEFAULT NULL AFTER address;

-- Success message
SELECT 'Profile image column added successfully!' AS Status;

