const db = require('./dbConnection');

class SettingsDAL {
    // Get a setting by key
    async getSetting(key) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM system_settings WHERE setting_key = ?',
                [key]
            );
            return rows[0] || null;
        } catch (error) {
            // If table doesn't exist yet, return null
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return null;
            }
            throw error;
        }
    }

    // Get all settings
    async getAllSettings() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM system_settings ORDER BY setting_key'
            );
            
            // Convert to object format
            const settings = {};
            rows.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });
            
            return settings;
        } catch (error) {
            // If table doesn't exist yet, return default settings
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return this.getDefaultSettings();
            }
            throw error;
        }
    }

    // Update or create a setting
    async setSetting(key, value) {
        try {
            await db.execute(
                `INSERT INTO system_settings (setting_key, setting_value) 
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
                [key, value, value]
            );
        } catch (error) {
            // If table doesn't exist, we'll just skip for now
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.log('Settings table not created yet. Settings will use defaults.');
                return;
            }
            throw error;
        }
    }

    // Update multiple settings
    async updateSettings(settings) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            for (const [key, value] of Object.entries(settings)) {
                await connection.execute(
                    `INSERT INTO system_settings (setting_key, setting_value) 
                     VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
                    [key, value, value]
                );
            }
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            // If table doesn't exist, we'll just skip for now
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.log('Settings table not created yet. Settings will use defaults.');
                return;
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete a setting
    async deleteSetting(key) {
        try {
            await db.execute(
                'DELETE FROM system_settings WHERE setting_key = ?',
                [key]
            );
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return;
            }
            throw error;
        }
    }

    // Get default settings
    getDefaultSettings() {
        return {
            platform_name: 'PowerShare',
            default_currency: 'USD',
            email_notifications: 'true',
            sms_notifications: 'false',
            maintenance_mode: 'false',
            max_subscriptions_per_user: '5',
            min_generator_capacity: '5',
            max_generator_capacity: '1000'
        };
    }

    // Initialize default settings
    async initializeDefaultSettings() {
        try {
            const defaults = this.getDefaultSettings();
            await this.updateSettings(defaults);
            console.log('✅ Default settings initialized');
        } catch (error) {
            console.log('ℹ️ Settings table not created yet. Using in-memory defaults.');
        }
    }
}

module.exports = new SettingsDAL();

