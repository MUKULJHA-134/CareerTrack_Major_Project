const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` CareerTrack Backend API is live on port ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Public Jobs:  http://localhost:${PORT}/api/jobs`);
      console.log('====================================================');
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
