const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  downloadResume,
  exportApplicationsCSV,
  sendCandidateEmail
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const { applicationValidationRules, validate } = require('../middleware/validator');

// Public route: Apply for job (supports multipart/form-data for résumé file)
router.post(
  '/apply/:jobId',
  uploadResume,
  applicationValidationRules,
  validate,
  submitApplication
);

// Admin protected routes
router.get('/admin/all', protect, getApplications);
router.get('/admin/export/csv', protect, exportApplicationsCSV);
router.get('/admin/:id', protect, getApplicationById);
router.patch('/admin/:id/status', protect, updateApplicationStatus);
router.post('/admin/:id/notes', protect, addApplicationNote);
router.post('/admin/:id/send-email', protect, sendCandidateEmail);
router.get('/admin/:id/resume', protect, downloadResume);

module.exports = router;
