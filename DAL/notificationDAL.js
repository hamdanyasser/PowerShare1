const db = require('./dbConnection');

class NotificationDAL {
    // Create notification
    async createNotification(notificationData) {
        const { user_id, title, message, type } = notificationData;

        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, ?, ?, ?)`,
            [user_id, title, message, type]
        );

        return result.insertId;
    }

    // Get notifications by user
    async getByUserId(userId, limit = 50) {
        const [rows] = await db.execute(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT ?`,
            [userId, limit]
        );
        return rows;
    }

    // Get unread notifications
    async getUnreadByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT * FROM notifications
             WHERE user_id = ? AND is_read = FALSE
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    // Mark as read
    async markAsRead(notificationId) {
        await db.execute(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
            [notificationId]
        );
    }

    // Mark all as read
    async markAllAsRead(userId) {
        await db.execute(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [userId]
        );
    }

    // Delete notification
    async deleteNotification(notificationId) {
        await db.execute('DELETE FROM notifications WHERE notification_id = ?', [notificationId]);
    }

    // Bulk create notifications for subscribers
    async notifySubscribers(generatorId, title, message, type) {
        await db.execute(
            `INSERT INTO notifications (user_id, title, message, type)
             SELECT s.user_id, ?, ?, ?
             FROM subscriptions s
             WHERE s.generator_id = ? AND s.status = 'active'`,
            [title, message, type, generatorId]
        );
    }

    // Get notification count
    async getUnreadCount(userId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }
}

module.exports = new NotificationDAL();