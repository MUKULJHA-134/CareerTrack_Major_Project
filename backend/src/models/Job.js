const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
      default: 'Full-time'
    },
    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Executive'],
      default: 'Mid-level'
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering'
    },
    salaryMin: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
      default: 0
    },
    salaryMax: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      default: 0
    },
    salaryCurrency: {
      type: String,
      default: 'USD'
    },
    isSalaryDisclosed: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    responsibilities: {
      type: [String],
      default: []
    },
    qualifications: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    benefits: {
      type: [String],
      default: []
    },
    applicationInstructions: {
      type: String,
      default: 'Submit your application and résumé through this portal. Our recruitment team will review submissions on a rolling basis.'
    },
    status: {
      type: String,
      enum: ['Published', 'Unpublished', 'Closed', 'Draft'],
      default: 'Published'
    },
    postingDate: {
      type: Date,
      default: Date.now
    },
    applicationDeadline: {
      type: Date,
      default: null
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for quick text search across jobs
jobSchema.index({
  title: 'text',
  company: 'text',
  skills: 'text',
  description: 'text'
});

// Single and compound indexes for common filter queries
jobSchema.index({ status: 1, postingDate: -1 });
jobSchema.index({ employmentType: 1, experienceLevel: 1 });
jobSchema.index({ applicationDeadline: 1 });

// Helper method to check if job is currently open for applications
jobSchema.methods.isOpenForApplication = function () {
  if (this.status !== 'Published') {
    return false;
  }
  if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
    return false;
  }
  return true;
};

module.exports = mongoose.model('Job', jobSchema);
