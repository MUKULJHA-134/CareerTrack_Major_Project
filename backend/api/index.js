const app = require('../src/app');
const { connectDB } = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless] MongoDB connection error:', error.message);
  }
  return app(req, res);
};

