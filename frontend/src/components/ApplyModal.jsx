import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  FileText
} from 'lucide-react';
import Modal from './Modal';
import { applyForJob } from '../services/api';
import { useToast } from '../context/ToastContext';

const ApplyModal = ({ isOpen, onClose, job }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    education: '',
    experienceYears: '',
    currentRole: '',
    technicalSkills: '',
    coverLetter: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB = 5242880 bytes)
    if (file.size > 5242880) {
      setErrorMessage('Selected file exceeds the 5 MB limit. Please upload a smaller PDF or DOCX file.');
      return;
    }

    // Validate extension
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setErrorMessage('Invalid file type. Please upload a résumé in PDF or DOCX format.');
      return;
    }

    setErrorMessage('');
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resumeFile) {
      setErrorMessage('Please attach your résumé (PDF or DOCX format).');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('candidateName', formData.candidateName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('education', formData.education);
      data.append('experienceYears', formData.experienceYears);
      data.append('currentRole', formData.currentRole);
      data.append('technicalSkills', formData.technicalSkills);
      data.append('coverLetter', formData.coverLetter);
      data.append('resume', resumeFile);

      const res = await applyForJob(job._id, data);
      setSuccessData(res);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (successData?.applicationReferenceId) {
      navigator.clipboard.writeText(successData.applicationReferenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      candidateName: '',
      email: '',
      phone: '',
      education: '',
      experienceYears: '',
      currentRole: '',
      technicalSkills: '',
      coverLetter: ''
    });
    setResumeFile(null);
    setErrorMessage('');
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? 'Application Received' : `Apply for ${job.title}`}
      maxWidth="680px"
    >
      {successData ? (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '2px solid rgba(16, 185, 129, 0.4)'
            }}
          >
            <CheckCircle2 size={36} color="#10B981" />
          </div>

          <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '8px' }}>
            Application Successfully Submitted!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Thank you for applying to <strong>{job.company}</strong> for the position of{' '}
            <strong>{job.title}</strong>. Your qualifications have been registered in our recruitment pipeline.
          </p>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '16px 20px',
              maxWidth: '380px',
              margin: '0 auto 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Application Reference ID
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--primary-400)',
                  fontFamily: 'monospace'
                }}
              >
                {successData.applicationReferenceId}
              </div>
            </div>

            <button
              onClick={handleCopyId}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 10px' }}
              title="Copy Reference ID"
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button onClick={handleClose} className="btn btn-primary" style={{ minWidth: '160px' }}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Quick Notice */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: 'var(--primary-200)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FileText size={18} color="#818CF8" />
            <span>
              Public candidate application. No registration or account required.
            </span>
          </div>

          {errorMessage && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.875rem',
                color: '#FDA4AF',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} color="#F43F5E" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Row 1: Full Name & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="candidateName"
                className="form-input"
                placeholder="e.g. Jordan Smith"
                value={formData.candidateName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="jordan.smith@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Phone & Highest Education */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Educational Qualification <span className="required">*</span>
              </label>
              <input
                type="text"
                name="education"
                className="form-input"
                placeholder="B.S. in Computer Science / Equivalent"
                value={formData.education}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Years Experience & Current Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Years of Relevant Experience <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                name="experienceYears"
                className="form-input"
                placeholder="e.g. 4.5"
                value={formData.experienceYears}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Role & Company</label>
              <input
                type="text"
                name="currentRole"
                className="form-input"
                placeholder="e.g. Software Engineer at TechCorp"
                value={formData.currentRole}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4: Technical Skills */}
          <div className="form-group">
            <label className="form-label">Key Technical Skills</label>
            <input
              type="text"
              name="technicalSkills"
              className="form-input"
              placeholder="e.g. React.js, Node.js, MongoDB, TypeScript, Docker (comma separated)"
              value={formData.technicalSkills}
              onChange={handleChange}
            />
            <span className="form-hint">Separate individual skills with commas.</span>
          </div>

          {/* Row 5: Résumé File Upload */}
          <div className="form-group">
            <label className="form-label">
              Upload Résumé (PDF or DOCX) <span className="required">*</span>
            </label>
            <div
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                background: resumeFile ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                borderColor: resumeFile ? 'var(--primary-500)' : 'var(--border-light)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              {resumeFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <FileCheck size={26} color="#10B981" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                      {resumeFile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(resumeFile.size / 1024).toFixed(1)} KB — Click to change file
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={32} color="var(--primary-400)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                    Click or drag & drop résumé file here
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports PDF, DOCX, DOC up to 5 MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 6: Cover Letter */}
          <div className="form-group">
            <label className="form-label">Cover Letter & Additional Notes</label>
            <textarea
              name="coverLetter"
              rows={4}
              className="form-textarea"
              placeholder="Introduce yourself, your key achievements, and why you are excited about this position..."
              value={formData.coverLetter}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '16px'
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '160px' }}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={15} />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ApplyModal;
