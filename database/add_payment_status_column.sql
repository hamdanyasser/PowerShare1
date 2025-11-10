-- Add status column to payments table if it doesn't exist
-- Run: mysql -u root -p powershare_db < database/add_payment_status_column.sql

USE powershare_db;

-- Add status column to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'completed', 'failed') DEFAULT 'completed' AFTER payment_method;

-- Update existing payments to have completed status
UPDATE payments SET status = 'completed' WHERE status IS NULL;

-- Add index on status for faster queries
ALTER TABLE payments ADD INDEX IF NOT EXISTS idx_status (status);

-- Display updated schema
DESCRIBE payments;

SELECT COUNT(*) as total_payments,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments
FROM payments;

SELECT 'Payment status column added successfully!' as Status;
