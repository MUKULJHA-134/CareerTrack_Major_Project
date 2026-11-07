const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidationRules, validate } = require('../middleware/validator');

router.post('/login', loginValidationRules, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
