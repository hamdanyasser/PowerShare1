const app = require('./BLL/app');
const db = require('./DAL/dbConnection');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 PowerShare Server Running        ║
║   📡 Port: ${PORT}                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
║   💾 Database: Connected              ║
╚════════════════════════════════════════╝
    `);
    console.log(`🔗 Local: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        db.end();
        process.exit(0);
    });
});

