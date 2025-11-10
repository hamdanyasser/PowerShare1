const db = require('./dbConnection');
const bcrypt = require('bcryptjs');

class UserDAL {
    // Create new user
    async createUser(userData) {
        const { full_name, email, password, phone, address, role, profile_image } = userData;

        if (!password) {
            throw new Error('Password is undefined in createUser()');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, password_hash, phone, address, role, profile_image) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, password_hash, phone, address, role || 'household', profile_image || null]
        );

        return result.insertId;
    }

    // Find user by email
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find user by ID
    async findById(userId) {
        const [rows] = await db.execute(
            'SELECT user_id, full_name, email, phone, address, role, profile_image, created_at FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    // Update user profile (not password)
    async updateUser(userId, updates) {
        const { full_name, phone, address, profile_image } = updates;
        
        if (profile_image !== undefined) {
            // Update with profile image
            await db.execute(
                'UPDATE users SET full_name = ?, phone = ?, address = ?, profile_image = ? WHERE user_id = ?',
                [full_name, phone, address, profile_image, userId]
            );
        } else {
            // Update without profile image
            await db.execute(
                'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?',
                [full_name, phone, address, userId]
            );
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        const [rows] = await db.execute(
            'SELECT user_id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // ✅ NEW METHOD: Update user password (for reset password feature)
    async updatePassword(userId, newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [hashed, userId]
        );
    }

    // Get user notification preferences
    async getUserPreferences(userId) {
        const [rows] = await db.execute(
            'SELECT email_notifications, outage_alerts, sms_notifications, theme FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    // Update user notification preferences
    async updateUserPreferences(userId, preferences) {
        const { email_notifications, outage_alerts, sms_notifications, theme } = preferences;

        await db.execute(
            'UPDATE users SET email_notifications = ?, outage_alerts = ?, sms_notifications = ?, theme = ? WHERE user_id = ?',
            [email_notifications, outage_alerts, sms_notifications, theme, userId]
        );
    }
}

module.exports = new UserDAL();
