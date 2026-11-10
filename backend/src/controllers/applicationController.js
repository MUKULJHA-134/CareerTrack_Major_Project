const path = require('path');
const fs = require('fs');
const os = require('os');
const Application = require('../models/Application');
const Job = require('../models/Job');
const {
  sendCandidateApplicationConfirmation,
  sendAdminApplicationNotification,
  sendStatusUpdateNotification,
  sendAdminDirectMessage
} = require('../utils/emailService');

// @desc    Submit candidate application for a job (Public)
// @route   POST /api/applications/apply/:jobId
// @access  Public
const submitApplication = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const {
      candidateName,
      email,
      phone,
      education,
      experienceYears,
      currentRole,
      technicalSkills,
      coverLetter
    } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      // Remove uploaded file if job not found
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(404).json({
        success: false,
        message: 'The job posting you are applying for does not exist.'
      });
    }

    // Check if job is active and accepting applications
    if (!job.isOpenForApplication()) {
      if (req.file) fs.unlink(req.file.path, () => { });
      return res.status(400).json({
        success: false,
        message: 'This job posting is currently unpublished, closed, or the application deadline has passed.'
      });
    }

    // Validate that résumé file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your résumé in PDF or DOCX format.'
      });
    }

    // Check for duplicate application
    const normalizedEmail = email.toLowerCase().trim();
    const existingApplication = await Application.findOne({
      job: jobId,
      email: normalizedEmail
    });

    if (existingApplication) {
      // Clean up newly uploaded file
      fs.unlink(req.file.path, () => { });
      return res.status(409).json({
        success: false,
        message: `Duplicate Submission: An application from '${normalizedEmail}' has already been registered for '${job.title}'.`
      });
    }

    // Parse technical skills if sent as string
    let parsedSkills = [];
    if (technicalSkills) {
      if (Array.isArray(technicalSkills)) {
        parsedSkills = technicalSkills;
      } else if (typeof technicalSkills === 'string') {
        parsedSkills = technicalSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Create Application
    const newApplication = new Application({
      job: jobId,
      candidateName: candidateName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      education: education.trim(),
      experienceYears: parseFloat(experienceYears) || 0,
      currentRole: currentRole ? currentRole.trim() : '',
      technicalSkills: parsedSkills,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      resume: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
      },
      status: 'Submitted'
    });

    await newApplication.save();

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

    // Send automated email notifications (candidate confirmation + admin notification)
    sendCandidateApplicationConfirmation(newApplication, job).catch((err) =>
      console.error('Candidate confirmation email failed:', err.message)
    );
    sendAdminApplicationNotification(newApplication, job).catch((err) =>
      console.error('Admin application notification email failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Your application has been successfully submitted! Our recruiting team will review your qualifications.',
      applicationReferenceId: newApplication.applicationReferenceId,
      submittedAt: newApplication.createdAt
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => { });
    next(error);
  }
};

// @desc    Get all applications with filters, search & pagination (Admin)
// @route   GET /api/applications/admin/all
// @access  Private (Admin only)
const getApplications = async (req, res, next) => {
  try {
    const {
      jobId,
      status,
      search,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (jobId && jobId !== 'All') {
      query.job = jobId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { candidateName: regex },
        { email: regex },
        { phone: regex },
        { applicationReferenceId: regex }
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'experienceHigh') sort = { experienceYears: -1 };
    if (sortBy === 'candidateName') sort = { candidateName: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('job', 'title company department location employmentType')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details (Admin)
// @route   GET /api/applications/admin/:id
// @access  Private (Admin only)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location department status salaryMin salaryMax')
      .populate('notes.addedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidate application not found.'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate application recruitment status (Admin)
// @route   PATCH /api/applications/admin/:id/status
// @access  Private (Admin only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Submitted',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Selected',
      'Rejected'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid recruitment status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('job', 'title company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidate application not found'
      });
    }

    // Automatically send email notification to candidate about their status update
    sendStatusUpdateNotification(
      application,
      application.job,
      status,
      req.body.customNote || ''
    ).catch((err) =>
      console.error('Candidate status update email failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `Candidate application status updated to: ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add internal recruitment note to application (Admin)
// @route   POST /api/applications/admin/:id/notes
// @access  Private (Admin only)
const addApplicationNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty.'
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const newNote = {
      note: note.trim(),
      authorName: req.admin ? req.admin.name : 'Administrator',
      addedBy: req.admin ? req.admin._id : null,
      createdAt: new Date()
    };

    application.notes.unshift(newNote);
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Recruitment note added successfully',
      notes: application.notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dynamically generate a valid PDF resume summary if the physical file
 * was created on another machine (e.g. cross-platform Windows/Linux path differences)
 * or wiped by serverless ephemeral storage.
 */
const generateFallbackResumePdf = (application) => {
  const lines = [
    'CAREERTRACK CANDIDATE DOSSIER & RESUME',
    '======================================================================',
    `Candidate Name:   ${application.candidateName || 'N/A'}`,
    `Email Address:    ${application.email || 'N/A'}`,
    `Phone Number:     ${application.phone || 'N/A'}`,
    `Education:        ${application.education || 'N/A'}`,
    `Experience:       ${application.experienceYears || 0} Year(s)`,
    `Current Role:     ${application.currentRole || 'N/A'}`,
    `Skills:           ${(application.technicalSkills || []).join(', ') || 'N/A'}`,
    `Application Date: ${new Date(application.createdAt || Date.now()).toLocaleDateString()}`,
    '----------------------------------------------------------------------',
    'Cover Letter / Candidate Statement:',
    application.coverLetter
      ? application.coverLetter.substring(0, 1200)
      : 'No formal cover letter provided.'
  ];

  let streamContent = 'BT /F1 12 Tf 50 720 Td 18 TL ';
  lines.forEach((line, i) => {
    const sanitized = String(line).substring(0, 80).replace(/[()\\]/g, ' ');
    if (i === 0) streamContent += `(${sanitized}) Tj `;
    else streamContent += `T* (${sanitized}) Tj `;
  });
  streamContent += 'ET';
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  let offset = 9;
  const offsets = [offset];
  offset += Buffer.byteLength(obj1); offsets.push(offset);
  offset += Buffer.byteLength(obj2); offsets.push(offset);
  offset += Buffer.byteLength(obj3); offsets.push(offset);
  offset += Buffer.byteLength(obj4); offsets.push(offset);

  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  offsets.forEach((off) => {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  });

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset + Buffer.byteLength(obj5)}\n%%EOF\n`;
  return Buffer.from('%PDF-1.4\n' + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer, 'utf-8');
};

// @desc    Download or view candidate resume (Admin only)
// @route   GET /api/applications/admin/:id/resume
// @access  Private (Admin only)
const downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application || !application.resume) {
      return res.status(404).json({
        success: false,
        message: 'Résumé file record not found for this candidate.'
      });
    }

    let filePath = application.resume.filePath ? path.resolve(application.resume.filePath) : null;
    let fileExists = filePath && fs.existsSync(filePath);

    // If initial path does not exist (e.g. cross-platform paths or serverless /tmp), check common upload directories
    if (!fileExists) {
      const fileName = application.resume.fileName || (application.resume.filePath ? path.basename(application.resume.filePath) : null);
      if (fileName) {
        const candidateDirs = [
          path.join(__dirname, '../../uploads/resumes'),
          path.join(os.tmpdir(), 'uploads', 'resumes'),
          path.join(process.cwd(), 'uploads/resumes'),
          path.join(process.cwd(), 'backend/uploads/resumes'),
          path.join(__dirname, '../../../uploads/resumes')
        ];

        for (const dir of candidateDirs) {
          const candidatePath = path.join(dir, fileName);
          if (fs.existsSync(candidatePath)) {
            filePath = candidatePath;
            fileExists = true;
            break;
          }
        }
      }
    }

    const downloadFileName = application.resume.originalName || `${(application.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    // 1. If physical file exists on disk, stream it
    if (fileExists && filePath) {
      res.setHeader('Content-Type', application.resume.mimeType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(downloadFileName)}"`
      );
      return fs.createReadStream(filePath).pipe(res);
    }

    // 2. Fallback: Dynamically generate a valid PDF resume summary so the download never fails
    const pdfBuffer = generateFallbackResumePdf(application);
    const finalDownloadName = downloadFileName.toLowerCase().endsWith('.pdf') ? downloadFileName : `${downloadFileName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(finalDownloadName)}"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Export applications as CSV (Admin)
// @route   GET /api/applications/admin/export/csv
// @access  Private (Admin only)
const exportApplicationsCSV = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    const query = {};

    if (jobId && jobId !== 'All') query.job = jobId;
    if (status && status !== 'All') query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title company department')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV string
    const headers = [
      'Reference ID',
      'Candidate Name',
      'Email',
      'Phone',
      'Education',
      'Years Experience',
      'Current Role',
      'Technical Skills',
      'Job Title',
      'Company',
      'Department',
      'Recruitment Status',
      'Applied Date',
      'Resume File'
    ];

    const rows = applications.map((app) => [
      `"${app.applicationReferenceId || ''}"`,
      `"${(app.candidateName || '').replace(/"/g, '""')}"`,
      `"${(app.email || '').replace(/"/g, '""')}"`,
      `"${(app.phone || '').replace(/"/g, '""')}"`,
      `"${(app.education || '').replace(/"/g, '""')}"`,
      app.experienceYears ?? '',
      `"${(app.currentRole || '').replace(/"/g, '""')}"`,
      `"${(app.technicalSkills || []).join(', ').replace(/"/g, '""')}"`,
      `"${(app.job ? app.job.title : 'N/A').replace(/"/g, '""')}"`,
      `"${(app.job ? app.job.company : 'N/A').replace(/"/g, '""')}"`,
      `"${(app.job ? app.job.department : 'N/A').replace(/"/g, '""')}"`,
      `"${app.status || ''}"`,
      `"${app.createdAt ? new Date(app.createdAt).toISOString() : ''}"`,
      `"${(app.resume ? app.resume.originalName : '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const filename = `careertrack_applications_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin sends direct custom message or notification to candidate
// @route   POST /api/applications/admin/:id/send-email
// @access  Private (Admin only)
const sendCandidateEmail = async (req, res, next) => {
  try {
    const { subject, message, messageType } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title company');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidate application not found.'
      });
    }

    const result = await sendAdminDirectMessage({
      candidateName: application.candidateName,
      candidateEmail: application.email,
      jobTitle: application.job?.title || 'Job Opening',
      company: application.job?.company || 'CareerTrack',
      applicationReferenceId: application.applicationReferenceId,
      subject: subject ? subject.trim() : 'Application Update',
      message: message.trim(),
      messageType: messageType || 'Direct Notice'
    });

    // Also record this action in candidate's internal notes
    const adminName = req.admin?.name || 'Admin';
    application.notes.push({
      note: `[Email Sent: ${messageType || 'Direct Notice'}] ${subject || 'Application Update'} - "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
      authorName: adminName,
      addedBy: req.admin?._id || null,
      createdAt: new Date()
    });
    await application.save();

    res.status(200).json({
      success: true,
      message: `Email successfully sent to ${application.candidateName} (${application.email})`,
      delivery: result,
      notes: application.notes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  downloadResume,
  exportApplicationsCSV,
  sendCandidateEmail
};
