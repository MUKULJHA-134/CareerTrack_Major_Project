const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true
    },
    authorName: {
      type: String,
      default: 'Admin'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationReferenceId: {
      type: String,
      unique: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true
    },
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    education: {
      type: String,
      required: [true, 'Educational qualification is required'],
      trim: true
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    currentRole: {
      type: String,
      trim: true,
      default: ''
    },
    technicalSkills: {
      type: [String],
      default: []
    },
    coverLetter: {
      type: String,
      trim: true,
      default: ''
    },
    resume: {
      originalName: {
        type: String,
        required: [true, 'Original resume filename is required']
      },
      fileName: {
        type: String,
        required: [true, 'Stored resume filename is required']
      },
      filePath: {
        type: String,
        required: [true, 'Stored resume filepath is required']
      },
      mimeType: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      }
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Selected',
        'Rejected'
      ],
      default: 'Submitted',
      index: true
    },
    notes: {
      type: [noteSchema],
      default: []
    },
    duplicateFlag: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness per candidate email per job
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

// Auto-generate human-friendly reference ID before validation
applicationSchema.pre('validate', function (next) {
  if (!this.applicationReferenceId) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const year = new Date().getFullYear();
    this.applicationReferenceId = `CT-${year}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
