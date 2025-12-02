import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { connectCloudinary } from './config/cloudinary';

// ===========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ===========================================
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * ===========================================
 * START SERVER (Single Instance - Render Safe)
 * ===========================================
 * No cluster mode - Render handles scaling
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary
    connectCloudinary();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('\n===========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`📚 Docs: http://localhost:${PORT}/api-docs`);
      console.log('===========================================\n');
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal: string) => {
      console.log(`\n👋 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ===========================================
// GLOBAL ERROR HANDLERS
// ===========================================
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason.message || reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// ===========================================
// START THE SERVER
// ===========================================
startServer();
