const { body, validationResult } = require('express-validator');

// Validation rules for registration
const registerValidation = [
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2-100 characters'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('phone')
        .optional()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Invalid phone number'),

    body('role')
        .optional()
        .isIn(['household', 'owner', 'admin'])
        .withMessage('Invalid role')
];

// Validation rules for login
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Password policy validation function
const validatePasswordPolicy = (password) => {
    const errors = [];
    
    // Minimum 8 characters
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    // At least 1 uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    // At least 1 lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    // At least 1 digit
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one digit (0-9)');
    }
    
    // At least 1 special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-={};\':"\\|,.<>/?)');
    }
    
    return errors;
};

// Validation rules for password reset
const resetPasswordValidation = [
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .custom((value) => {
            const errors = validatePasswordPolicy(value);
            if (errors.length > 0) {
                throw new Error(errors.join('. '));
            }
            return true;
        })
];

// Check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    resetPasswordValidation,
    validatePasswordPolicy,
    validate
};