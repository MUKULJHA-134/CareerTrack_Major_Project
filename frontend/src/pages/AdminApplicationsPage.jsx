import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  FileText,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Clock,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  fetchApplications,
  fetchApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  downloadResumeFile,
  exportApplicationsCsv,
  fetchAdminJobs,
  sendApplicationEmail
} from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

const AdminApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter lists & jobs list for dropdown
  const [jobsList, setJobsList] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');

  // Selected Candidate Drawer/Modal
  const [activeApp, setActiveApp] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Email Candidate Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetApp, setEmailTargetApp] = useState(null);
  const [emailCategory, setEmailCategory] = useState('Application Update');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const getEmailTemplate = (category, app) => {
    if (!app) return { subject: '', body: '' };
    const name = app.candidateName || 'Candidate';
    const jobTitle = app.job?.title || 'the role';
    const company = app.job?.company || 'our company';
    const refId = app.applicationReferenceId || '';

    switch (category) {
      case 'Interview Scheduled':
        return {
          subject: `Interview Scheduled: ${jobTitle} at ${company}`,
          body: `Dear ${name},\n\nWe were impressed with your application for the ${jobTitle} position at ${company}. We would like to invite you for a virtual interview session to discuss your background and technical experience.\n\nPlease reply with your available time slots over the coming days, or let us know if you need any accommodations.\n\nLooking forward to speaking with you!\n\nBest regards,\nRecruitment Team\n${company}`
        };
      case 'Shortlisted':
        return {
          subject: `Great News! You are Shortlisted for ${jobTitle} at ${company}`,
          body: `Dear ${name},\n\nWe are pleased to inform you that your profile has been shortlisted for the ${jobTitle} opportunity at ${company} (Ref: ${refId}).\n\nOur hiring team is currently preparing the next evaluation stage and will reach out with scheduling instructions shortly.\n\nBest regards,\nRecruitment Team\n${company}`
        };
      case 'Selected':
        return {
          subject: `Congratulations! Selection Offer for ${jobTitle} at ${company}`,
          body: `Dear ${name},\n\nCongratulations! We are delighted to announce that following our evaluation, you have been selected for the ${jobTitle} position at ${company}.\n\nOur Human Resources department will be in touch shortly with the formal offer details, salary package, and onboarding schedule.\n\nWelcome to the team!\n\nWarm regards,\nHiring Team\n${company}`
        };
      case 'Rejected':
        return {
          subject: `Update regarding your application for ${jobTitle} at ${company}`,
          body: `Dear ${name},\n\nThank you very much for taking the time to apply for the ${jobTitle} position at ${company} (Ref: ${refId}).\n\nWhile our team was impressed with your qualifications and experience, we have decided to proceed with other applicants whose specific skill set more closely aligns with our immediate requirements for this role.\n\nWe wish you all the best in your continued job search and career journey.\n\nSincerely,\nRecruitment Team\n${company}`
        };
      case 'Application Update':
      default:
        return {
          subject: `Recruitment Update: ${jobTitle} at ${company}`,
          body: `Dear ${name},\n\nWe are writing to share an update regarding your application for ${jobTitle} at ${company} (Reference ID: ${refId}).\n\nOur team is actively reviewing submissions and will keep you informed of any updates.\n\nBest regards,\nRecruitment Team\n${company}`
        };
    }
  };

  const openEmailModal = (app) => {
    setEmailTargetApp(app);
    setEmailCategory('Application Update');
    const { subject, body } = getEmailTemplate('Application Update', app);
    setEmailSubject(subject);
    setEmailBody(body);
    setEmailModalOpen(true);
  };

  const handleCategoryChange = (category) => {
    setEmailCategory(category);
    const { subject, body } = getEmailTemplate(category, emailTargetApp);
    setEmailSubject(subject);
    setEmailBody(body);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailTargetApp || !emailSubject.trim() || !emailBody.trim()) {
      showToast('Please provide a subject and message.', 'error');
      return;
    }

    setSendingEmail(true);
    try {
      const res = await sendApplicationEmail(emailTargetApp._id, {
        subject: emailSubject,
        message: emailBody,
        messageType: emailCategory
      });

      showToast(`Email sent to ${emailTargetApp.candidateName} (${emailTargetApp.email})!`, 'success');
      setEmailModalOpen(false);

      // If review modal is active, update its notes
      if (activeApp && activeApp._id === emailTargetApp._id && res.notes) {
        setActiveApp((prev) => ({ ...prev, notes: res.notes }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to dispatch email.', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  // Load available jobs for filter dropdown
  useEffect(() => {
    const loadJobsList = async () => {
      try {
        const res = await fetchAdminJobs({ limit: 100 });
        setJobsList(res.jobs || []);
      } catch (err) {
        console.error('Failed to load jobs list for filter', err);
      }
    };
    loadJobsList();
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10
      };
      if (selectedJobId !== 'All') params.jobId = selectedJobId;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await fetchApplications(params);
      setApplications(res.applications || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast(err.message || 'Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedJobId, selectedStatus, search, showToast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Open candidate review if URL query param ?id=... is present
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId) {
      openCandidateReview(targetId);
    }
  }, [searchParams]);

  const openCandidateReview = async (appId) => {
    setDrawerLoading(true);
    try {
      const res = await fetchApplicationById(appId);
      setActiveApp(res.application);
    } catch (err) {
      showToast(err.message || 'Unable to open candidate details', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      showToast(`Status updated to "${newStatus}" & email dispatched to candidate!`, 'success');

      // Update in local list
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );

      // Update active app if open
      if (activeApp && activeApp._id === appId) {
        setActiveApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !activeApp) return;

    setSubmittingNote(true);
    try {
      const res = await addApplicationNote(activeApp._id, newNote);
      setActiveApp((prev) => ({ ...prev, notes: res.notes }));
      setNewNote('');
      showToast('Internal recruitment note logged.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDownloadResume = async (app) => {
    try {
      showToast('Downloading résumé securely...', 'info');
      await downloadResumeFile(app._id, app.resume?.originalName || 'resume.pdf');
    } catch (err) {
      showToast(err.message || 'Résumé download failed', 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      showToast('Generating CSV export...', 'info');
      const params = {};
      if (selectedJobId !== 'All') params.jobId = selectedJobId;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      await exportApplicationsCsv(params);
      showToast('Applications CSV generated and downloaded.', 'success');
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0 60px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '6px' }}>
            Candidate Applications Management
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Review candidate qualifications, update statuses, add internal notes, and export records.
          </p>
        </div>

        <button onClick={handleExportCsv} className="btn btn-secondary" style={{ gap: '8px' }}>
          <FileSpreadsheet size={16} color="#10B981" />
          Export Candidate CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '18px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search candidate name, email, or reference ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Job Filter */}
          <select
            className="form-select"
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="All">All Job Openings</option>
            {jobsList.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.company})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="All">All Pipeline Stages</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: 'var(--primary-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }}
            />
            <p>Loading candidate pipeline...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#FFFFFF', marginBottom: '6px' }}>No Applications Found</h4>
            <p style={{ fontSize: '0.875rem' }}>
              No candidates match the specified filter criteria.
            </p>
          </div>
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Candidate</th>
                  <th>Applied Position</th>
                  <th>Experience</th>
                  <th>Applied Date</th>
                  <th>Recruitment Status</th>
                  <th>Résumé</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: 'var(--primary-400)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '3px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {app.applicationReferenceId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{app.candidateName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{app.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.job?.title || 'Job Deleted'}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                    </td>
                    <td>{app.experienceYears} yrs</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      {/* Status Dropdown */}
                      <select
                        className="form-select"
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 8px',
                          width: 'auto',
                          borderRadius: '6px'
                        }}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadResume(app)}
                        className="btn btn-secondary btn-sm"
                        title="Download Candidate Résumé"
                        style={{ padding: '4px 8px', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <Download size={13} color="var(--primary-400)" />
                        Résumé
                      </button>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => openEmailModal(app)}
                        className="btn btn-secondary btn-sm"
                        title="Send Direct Email via Gmail"
                        style={{ padding: '5px 10px', marginRight: '6px', gap: '4px' }}
                      >
                        <Mail size={13} color="var(--primary-400)" />
                        Email
                      </button>
                      <button
                        onClick={() => openCandidateReview(app._id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '5px 12px' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px'
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Candidate Profile Review Modal */}
      <Modal
        isOpen={!!activeApp}
        onClose={() => setActiveApp(null)}
        title={activeApp ? `Review Candidate: ${activeApp.candidateName}` : 'Candidate Details'}
        maxWidth="760px"
      >
        {activeApp && (
          <div>
            {/* Top Bar with Reference & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Application Reference
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-400)' }}>
                  {activeApp.applicationReferenceId}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                <select
                  className="form-select"
                  value={activeApp.status}
                  onChange={(e) => handleStatusUpdate(activeApp._id, e.target.value)}
                  style={{ width: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Candidate Info Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} /> Email Address
                </div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px', fontSize: '0.875rem' }}>
                  {activeApp.email}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> Phone
                </div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px', fontSize: '0.875rem' }}>
                  {activeApp.phone}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> Experience
                </div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px', fontSize: '0.875rem' }}>
                  {activeApp.experienceYears} Years
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={13} /> Education
                </div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '4px', fontSize: '0.875rem' }}>
                  {activeApp.education}
                </div>
              </div>
            </div>

            {/* Current Role & Job */}
            <div style={{ marginBottom: '20px', fontSize: '0.875rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Target Job Opening</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
                {activeApp.job?.title} at {activeApp.job?.company}
              </div>
              {activeApp.currentRole && (
                <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Current Role: <strong>{activeApp.currentRole}</strong>
                </div>
              )}
            </div>

            {/* Technical Skills */}
            {activeApp.technicalSkills && activeApp.technicalSkills.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Candidate Technical Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeApp.technicalSkills.map((skill, idx) => (
                    <span key={idx} className="badge badge-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé Download Card */}
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={26} color="var(--primary-400)" />
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                    {activeApp.resume?.originalName || 'Candidate_Resume.pdf'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Uploaded {new Date(activeApp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadResume(activeApp)}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <Download size={14} /> Download Résumé
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => openEmailModal(activeApp)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
              >
                <Mail size={16} color="var(--primary-400)" />
                Compose & Send Email to Candidate
              </button>
            </div>

            {/* Cover Letter */}
            {activeApp.coverLetter && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Cover Letter & Candidate Notes
                </div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {activeApp.coverLetter}
                </div>
              </div>
            )}

            {/* Internal Notes Section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <MessageSquare size={16} color="var(--accent-amber)" />
                <h4 style={{ fontSize: '1rem', color: '#FFFFFF' }}>Internal Recruiter Notes</h4>
              </div>

              {/* Notes thread */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {activeApp.notes && activeApp.notes.length > 0 ? (
                  activeApp.notes.map((noteItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                          {noteItem.authorName || 'Administrator'}
                        </span>
                        <span>{new Date(noteItem.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                        {noteItem.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No recruitment notes added yet. Add private notes below for your team.
                  </p>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type an internal note (e.g. Cleared phone screen, strong system design background)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={submittingNote || !newNote.trim()}
                  style={{ gap: '6px' }}
                >
                  <Send size={14} /> Add
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Email Candidate Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title={emailTargetApp ? `Send Email: ${emailTargetApp.candidateName}` : 'Send Email'}
        maxWidth="680px"
      >
        {emailTargetApp && (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>To: </span>
                <strong style={{ color: '#FFFFFF' }}>{emailTargetApp.candidateName}</strong>{' '}
                <span style={{ color: 'var(--primary-400)' }}>&lt;{emailTargetApp.email}&gt;</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Role: </span>
                <span style={{ color: '#E2E8F0' }}>{emailTargetApp.job?.title} at {emailTargetApp.job?.company}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Reference ID: </span>
                <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>{emailTargetApp.applicationReferenceId}</span>
              </div>
            </div>

            {/* Quick Template Selector */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px' }}>
                Email Template / Notification Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Application Update',
                  'Interview Scheduled',
                  'Shortlisted',
                  'Selected',
                  'Rejected'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`btn btn-sm ${emailCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">
                Subject Line <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Interview Scheduled: Senior Engineer"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="form-label">
                Email Message (HTML branded template applied automatically) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                required
                rows={8}
                className="form-input"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Compose your message to candidate..."
                style={{ resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="btn btn-secondary"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingEmail}
                className="btn btn-primary"
                style={{ gap: '6px' }}
              >
                <Mail size={15} />
                {sendingEmail ? 'Sending via Gmail...' : 'Send Email Now'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminApplicationsPage;
