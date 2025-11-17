require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startJobs } = require('./jobs');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('✓ Database connected successfully');

    // Start scheduled jobs
    if (process.env.ENABLE_JOBS === 'true') {
      startJobs();
      logger.info('✓ Scheduled jobs started');
    }

    // Start server
    server = app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════╗
║                                                ║
║        🚀 IMAGE9 BACKEND SERVER RUNNING       ║
║                                                ║
║        Environment: ${process.env.NODE_ENV?.padEnd(28) || 'development'.padEnd(28)}║
║        Port: ${PORT.toString().padEnd(35)}║
║        URL: http://localhost:${PORT}${' '.repeat(19)}║
║                                                ║
╚════════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} signal received: closing HTTP server`);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      
      // Close database connection
      const mongoose = require('mongoose');
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

module.exports = server;