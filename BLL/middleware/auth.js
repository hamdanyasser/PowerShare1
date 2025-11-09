const jwtService = require('../security/jwt');
const userDAL = require('../../DAL/userDAL');

// Verify JWT token from cookie or header
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwtService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Get user from database
        const user = await userDAL.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Authenticate for view routes (redirects to login instead of JSON error)
const authenticateView = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.redirect('/login');
        }

        // Verify token
        const decoded = jwtService.verifyToken(token);
        if (!decoded) {
            return res.redirect('/login');
        }

        // Get user from database
        const user = await userDAL.findById(decoded.userId);
        if (!user) {
            return res.redirect('/login');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/login');
    }
};

module.exports = { authenticate, authorize, authenticateView };