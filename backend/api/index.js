const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { seedDatabase } = require('../src/utils/seedData');

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (!isInitialized) {
      await seedDatabase();
      isInitialized = true;
    }
  } catch (error) {
    console.error('[Vercel Serverless] DB initialization error:', error.message);
  }

  return app(req, res);
};
