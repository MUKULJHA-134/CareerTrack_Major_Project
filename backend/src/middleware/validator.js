const { body, validationResult } = require('express-validator');

// Middleware to check validation results and respond if errors exist
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please verify the submitted data.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Admin Login Validation Rules
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Job Creation & Update Validation Rules
const jobValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 120 })
    .withMessage('Job title cannot exceed 120 characters'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('employmentType')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'])
    .withMessage('Valid employment type is required'),
  body('experienceLevel')
    .isIn(['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Executive'])
    .withMessage('Valid experience level is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long')
];

// Candidate Application Form Validation Rules
const applicationValidationRules = [
  body('candidateName')
    .trim()
    .notEmpty()
    .withMessage('Candidate full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number (e.g. +1 555-0199 or 9876543210)'),
  body('education')
    .trim()
    .notEmpty()
    .withMessage('Educational qualification is required'),
  body('experienceYears')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isFloat({ min: 0 })
    .withMessage('Experience must be a non-negative number')
];

module.exports = {
  validate,
  loginValidationRules,
  jobValidationRules,
  applicationValidationRules
};
