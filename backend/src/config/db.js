const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careertrack';

  try {
    // Attempt connecting to the configured URI with a 3-second timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to primary MongoDB (${primaryUri}): ${error.message}`);
    console.log('[Database] Starting seamless in-memory MongoDB fallback instance for zero-setup local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${inMemoryUri}`);
    } catch (inMemError) {
      console.error('[Database] Fatal: Failed to initialize in-memory database:', inMemError.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] Disconnected successfully');
  } catch (err) {
    console.error('[Database] Disconnection error:', err);
  }
};

module.exports = { connectDB, disconnectDB };
