-- System Settings Table
-- This table stores configurable system-wide settings
-- To create this table, run: mysql -u root -p powershare_db < database/create_settings_table.sql

CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('platform_name', 'PowerShare', 'The name of the platform'),
('default_currency', 'USD', 'Default currency for transactions'),
('email_notifications', 'true', 'Enable email notifications'),
('sms_notifications', 'false', 'Enable SMS notifications'),
('maintenance_mode', 'false', 'Put system in maintenance mode'),
('max_subscriptions_per_user', '5', 'Maximum subscriptions per user'),
('min_generator_capacity', '5', 'Minimum generator capacity in kW'),
('max_generator_capacity', '1000', 'Maximum generator capacity in kW')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Display the settings
SELECT * FROM system_settings;

