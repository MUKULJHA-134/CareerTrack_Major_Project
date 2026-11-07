const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get public published and active jobs with search, filters, sorting & pagination
// @route   GET /api/jobs
// @access  Public
const getPublicJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      employmentType,
      experienceLevel,
      department,
      isRemote,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      status: 'Published'
    };

    // Filter by active deadline (future date or no deadline)
    query.$or = [
      { applicationDeadline: null },
      { applicationDeadline: { $gte: new Date() } }
    ];

    // Text search or regex search on title, company, skills
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { skills: { $in: [searchRegex] } },
          { location: searchRegex }
        ]
      });
    }

    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    if (employmentType && employmentType !== 'All') {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    if (department && department !== 'All') {
      query.department = new RegExp(department.trim(), 'i');
    }

    if (isRemote === 'true') {
      query.isRemote = true;
    }

    // Sorting
    let sortOptions = { postingDate: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { postingDate: 1 };
    } else if (sortBy === 'salaryHigh') {
      sortOptions = { salaryMax: -1 };
    } else if (sortBy === 'salaryLow') {
      sortOptions = { salaryMin: 1 };
    } else if (sortBy === 'deadline') {
      sortOptions = { applicationDeadline: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single public job details
// @route   GET /api/jobs/:id
// @access  Public
const getPublicJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'The requested job opening could not be found.'
      });
    }

    // If job is unpublished or draft and viewer is not logged-in admin, disallow
    if (job.status === 'Draft' || job.status === 'Unpublished') {
      return res.status(403).json({
        success: false,
        message: 'This job posting is currently not active or available to the public.'
      });
    }

    const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

    res.status(200).json({
      success: true,
      job: {
        ...job.toObject(),
        isExpired,
        isAcceptingApplications: job.isOpenForApplication()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for admin dashboard (all statuses) with search, filter, pagination
// @route   GET /api/jobs/admin/all
// @access  Private (Admin only)
const getAdminJobs = async (req, res, next) => {
  try {
    const {
      search,
      status,
      employmentType,
      experienceLevel,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (employmentType && employmentType !== 'All') {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'title') sort = { title: 1 };
    if (sortBy === 'applications') sort = { totalApplications: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Admin only)
const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.admin ? req.admin._id : null
    };

    // Format arrays if passed as comma strings
    ['responsibilities', 'qualifications', 'skills', 'benefits'].forEach((field) => {
      if (typeof jobData[field] === 'string') {
        jobData[field] = jobData[field]
          .split('\n')
          .map((item) => item.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
    });

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Admin only)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    const updateData = { ...req.body };

    ['responsibilities', 'qualifications', 'skills', 'benefits'].forEach((field) => {
      if (typeof updateData[field] === 'string') {
        updateData[field] = updateData[field]
          .split('\n')
          .map((item) => item.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
    });

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change job status (Publish, Unpublish, Close, Draft)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Admin only)
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Published', 'Unpublished', 'Closed', 'Draft'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting and optionally clean associated applications
// @route   DELETE /api/jobs/:id
// @access  Private (Admin only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and associated candidate applications have been deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/jobs/admin/analytics/summary
// @access  Private (Admin only)
const getDashboardMetrics = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalJobs,
      publishedJobs,
      closedJobs,
      expiredJobs,
      totalApplications,
      applicationsByStatus,
      recentApplications,
      recentJobs
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({
        status: 'Published',
        $or: [{ applicationDeadline: null }, { applicationDeadline: { $gte: now } }]
      }),
      Job.countDocuments({ status: 'Closed' }),
      Job.countDocuments({
        applicationDeadline: { $lt: now, $ne: null }
      }),
      Application.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Application.find()
        .populate('job', 'title company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Job.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    // Format status breakdown map
    const statusBreakdown = {
      Submitted: 0,
      'Under Review': 0,
      Shortlisted: 0,
      'Interview Scheduled': 0,
      Selected: 0,
      Rejected: 0
    };

    applicationsByStatus.forEach((item) => {
      if (statusBreakdown[item._id] !== undefined) {
        statusBreakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalJobs,
        activeJobs: publishedJobs,
        closedJobs,
        expiredJobs,
        totalApplications,
        statusBreakdown,
        recentApplications,
        recentJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicJobs,
  getPublicJobById,
  getAdminJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getDashboardMetrics
};
