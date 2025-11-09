const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTService {
    // Generate JWT token
    generateToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // Generate refresh token (longer expiry)
    generateRefreshToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
    }
}

module.exports = new JWTService();