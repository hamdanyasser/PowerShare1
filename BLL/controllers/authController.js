const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDAL = require('../../DAL/userDAL');

class AuthController {
    // Register new user
    async register(req, res) {
        try {

            const { full_name, email, password, phone, address, role } = req.body;

            // ===== BACKEND VALIDATION =====
            const errors = [];

            // Validate full name
            if (!full_name || full_name.trim().length < 3) {
                errors.push('Full name must be at least 3 characters');
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                errors.push('Invalid email address');
            }

            // Validate phone
            const phoneRegex = /^(\+961|961)?[0-9]{8,10}$/;
            if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) {
                errors.push('Invalid phone number');
            }

            // Validate address
            if (!address || address.trim().length < 5) {
                errors.push('Address must be at least 5 characters');
            }

            // Validate password
            if (!password || password.length < 8) {
                errors.push('Password must be at least 8 characters');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                errors.push('Password must contain at least one special character');
            }

            // Validate role
            const validRoles = ['household', 'owner', 'admin'];
            if (!role || !validRoles.includes(role)) {
                errors.push('Invalid role');
            }

            // If there are validation errors, return them
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: errors.join('. ')
                });
            }

            // ===== CHECK FOR EXISTING EMAIL =====
            try {
                const existingUser = await userDAL.findByEmail(email);

                if (existingUser) {
                    console.log('Email already exists:', email); // Debug log
                    return res.status(400).json({
                        success: false,
                        message: 'This email is already registered. Please use a different email or try logging in.'
                    });
                }
            } catch (error) {
                console.error('Error checking existing user:', error);
                // Continue with registration if there's an error checking
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Get profile image path if uploaded
            const profile_image = req.file ? `/uploads/profile-images/${req.file.filename}` : null;

            // Create user
            const userId = await userDAL.createUser({
                full_name,
                email,
                password,
                phone,
                address,
                role,
                profile_image
            });

            console.log('User registered successfully:', userId); // Debug log

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { userId }
            });

        } catch (error) {
            console.error('Registration error:', error);

            // Check if error is due to duplicate email (MySQL error code 1062)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered. Please use a different email or try logging in.'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Registration failed. Please try again.'
            });
        }
    }

    // Login user
    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await userDAL.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // ✅ Generate JWT
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // ✅ Store in httpOnly cookie (secure, persists after browser close)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            delete user.password_hash;

            res.json({
                success: true,
                message: 'Login successful',
                data: { user }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }


    // Logout user (clear JWT cookie only)
    async logout(req, res) {
        try {
            // Clear the JWT cookie
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }

    // Get current user (uses JWT from middleware)
    async getCurrentUser(req, res) {
        try {
            // req.user is set by authenticate middleware from JWT cookie
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const user = await userDAL.findById(req.user.user_id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Remove password from response
            delete user.password_hash;

            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user data'
            });
        }
    }

    // Verify token
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            res.json({
                success: true,
                data: { decoded }
            });

        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const userId = req.user.user_id;
            const { current_password, new_password } = req.body;

            if (!current_password || !new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            // Get user from database
            const user = await userDAL.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user's password hash
            const userWithPassword = await userDAL.findByEmail(user.email);
            
            // Verify current password
            const isValidPassword = await bcrypt.compare(current_password, userWithPassword.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password with the same rules as registration
            const errors = [];
            
            if (new_password.length < 8) {
                errors.push('Password must be at least 8 characters');
            }
            if (!/[A-Z]/.test(new_password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(new_password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(new_password)) {
                errors.push('Password must contain at least one number');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(new_password)) {
                errors.push('Password must contain at least one special character');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: errors.join('. ')
                });
            }

            // Update password
            await userDAL.updatePassword(userId, new_password);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
}

module.exports = new AuthController();