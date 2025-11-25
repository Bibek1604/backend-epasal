import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import { exec } from 'child_process';
import app from './app';
import connectDB from './config/db';
import { connectCloudinary } from './config/cloudinary';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NUM_CPUS = os.cpus().length;

/**
 * Start server function
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary
    connectCloudinary();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
      
      if (cluster.isWorker) {
        console.log(`👷 Worker ${process.pid} started`);
      }

      // Auto-open Swagger UI in development for convenience
      try {
        const docsUrl = `http://localhost:${PORT}/api/v1/docs`;
        const isDev = (process.env.NODE_ENV || 'development') !== 'production';
        if (isDev) {
          const startCmd = process.platform === 'win32'
            ? `start "" "${docsUrl}"`
            : process.platform === 'darwin'
              ? `open "${docsUrl}"`
              : `xdg-open "${docsUrl}"`;
          exec(startCmd, (err) => {
            if (err) console.warn('Could not open browser for Swagger UI:', err.message || err);
          });
        }
      } catch (err) {
        console.warn('Auto-open skipped:', err);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Cluster mode for production
 */
if (process.argv.includes('--cluster') && cluster.isPrimary) {
  console.log(`\n🏭 Master process ${process.pid} is running`);
  console.log(`🔥 Starting ${NUM_CPUS} worker processes...\n`);

  // Fork workers
  for (let i = 0; i < NUM_CPUS; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker, _code, _signal) => {
    console.warn(`⚠️  Worker ${worker.process.pid} died. Spawning a new one...`);
    cluster.fork();
  });
} else {
  // Single process mode (development or single worker)
  startServer();
}

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

/**
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

/**
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
