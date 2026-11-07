const express = require('express');
const router = express.Router();
const {
  getPublicJobs,
  getPublicJobById,
  getAdminJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getDashboardMetrics
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { jobValidationRules, validate } = require('../middleware/validator');

// Public routes
router.get('/', getPublicJobs);
router.get('/:id', getPublicJobById);

// Admin protected routes
router.get('/admin/all', protect, getAdminJobs);
router.get('/admin/analytics/summary', protect, getDashboardMetrics);
router.post('/', protect, jobValidationRules, validate, createJob);
router.put('/:id', protect, jobValidationRules, validate, updateJob);
router.patch('/:id/status', protect, updateJobStatus);
router.delete('/:id', protect, deleteJob);

module.exports = router;
