const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../PL/views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../PL/public')));

// **Routes – order matters!**

// 1️⃣ API routes
const apiRoutes = require('./routes/index');
app.use('/api', apiRoutes);

// 2️⃣ Forgot/Reset password routes
const forgotRoutes = require('./routes/forgot');
app.use('/', forgotRoutes);

// 3️⃣ View routes (other page rendering)
const viewRoutes = require('./routes/views');
app.use('/', viewRoutes);

// 404 handler (must be last, after all routes)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;
