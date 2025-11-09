-- Create payment_methods table for storing user payment cards
USE powershare_db;

CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_type ENUM('visa', 'mastercard', 'amex', 'discover') NOT NULL,
    card_last_four VARCHAR(4) NOT NULL,
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_month VARCHAR(2) NOT NULL,
    expiry_year VARCHAR(4) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_payment (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample payment methods for testing
INSERT INTO payment_methods (user_id, card_type, card_last_four, card_holder_name, expiry_month, expiry_year, is_default) VALUES
(1, 'visa', '4242', 'John Doe', '12', '2026', TRUE),
(1, 'mastercard', '8888', 'John Doe', '09', '2027', FALSE);

