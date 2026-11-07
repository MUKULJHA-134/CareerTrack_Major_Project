const express = require('express');
const router = express.Router();
const { submitContactMessage } = require('../controllers/contactController');

// Public route to submit contact inquiry
router.post('/', submitContactMessage);

module.exports = router;

