const userDAL = require('../../DAL/userDAL');

class UserController {
    // Get all users (admin only)
    async getAllUsers(req, res) {
        try {
            const users = await userDAL.getAllUsers();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }

    // Get user by ID
    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await userDAL.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user.user_id;
            const { full_name, phone, address } = req.body;

            const updateData = {
                full_name,
                phone,
                address
            };

            // Add profile image if uploaded
            if (req.file) {
                updateData.profile_image = `/uploads/profile-images/${req.file.filename}`;
            }

            await userDAL.updateUser(userId, updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }

    // Update user notification preferences
    async updatePreferences(req, res) {
        try {
            const userId = req.user.user_id;
            const { email_notifications, sms_notifications, reminder_notifications } = req.body;

            // Update preferences in user table
            await userDAL.updateUser(userId, {
                email_notifications: email_notifications !== undefined ? email_notifications : true,
                sms_notifications: sms_notifications !== undefined ? sms_notifications : true,
                reminder_notifications: reminder_notifications !== undefined ? reminder_notifications : true
            });

            res.json({
                success: true,
                message: 'Preferences updated successfully'
            });
        } catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update preferences'
            });
        }
    }
}

module.exports = new UserController();