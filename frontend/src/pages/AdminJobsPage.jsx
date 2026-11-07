import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import {
  fetchAdminJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob
} from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

const AdminJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const initialFormState = {
    title: '',
    company: '',
    location: '',
    isRemote: false,
    department: 'Engineering',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    isSalaryDisclosed: true,
    description: '',
    responsibilities: '',
    qualifications: '',
    skills: '',
    benefits: '',
    applicationDeadline: '',
    status: 'Published'
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter
      };
      if (search.trim()) params.search = search.trim();

      const res = await fetchAdminJobs(params);
      setJobs(res.jobs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast(err.message || 'Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search, showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Open create modal if URL has ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      openCreateModal();
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      isRemote: !!job.isRemote,
      department: job.department || 'Engineering',
      employmentType: job.employmentType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Mid-level',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      salaryCurrency: job.salaryCurrency || 'USD',
      isSalaryDisclosed: job.isSalaryDisclosed !== false,
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      qualifications: Array.isArray(job.qualifications) ? job.qualifications.join('\n') : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      status: job.status || 'Published'
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : 0,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : 0,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : null,
        skills: formData.skills
          ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      if (editingJob) {
        await updateJob(editingJob._id, payload);
        showToast('Job posting updated successfully!', 'success');
      } else {
        await createJob(payload);
        showToast('New job posting created successfully!', 'success');
      }

      setIsFormModalOpen(false);
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Error saving job posting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      showToast(`Job status changed to ${newStatus}`, 'success');
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmJob) return;
    try {
      await deleteJob(deleteConfirmJob._id);
      showToast('Job and associated applications removed.', 'success');
      setDeleteConfirmJob(null);
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Failed to delete job', 'error');
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
            Job Postings Management
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Publish, edit, unpublish, and manage all career openings.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={16} />
          Create Job Posting
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by job title, company or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published (Active)</option>
            <option value="Draft">Draft</option>
            <option value="Unpublished">Unpublished</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
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
            <p>Loading jobs database...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#FFFFFF', marginBottom: '6px' }}>No Job Postings Found</h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
              Create your first opening or modify your search criteria.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              <Plus size={14} /> Create Job Now
            </button>
          </div>
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title & Company</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)' }}>{job.company}</div>
                    </td>
                    <td>{job.department || 'General'}</td>
                    <td>
                      {job.location} {job.isRemote && '(Remote)'}
                    </td>
                    <td>{job.employmentType}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: job.totalApplications > 0 ? 'var(--primary-400)' : 'var(--text-muted)'
                        }}
                      >
                        {job.totalApplications || 0}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Quick toggle status */}
                        {job.status === 'Published' ? (
                          <button
                            onClick={() => handleStatusChange(job._id, 'Unpublished')}
                            className="btn btn-secondary btn-sm"
                            title="Unpublish Job"
                            style={{ padding: '4px 8px' }}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(job._id, 'Published')}
                            className="btn btn-secondary btn-sm"
                            title="Publish Job"
                            style={{ padding: '4px 8px' }}
                          >
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(job)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Job Details"
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmJob(job)}
                          className="btn btn-danger btn-sm"
                          title="Delete Job"
                          style={{ padding: '6px 8px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingJob ? `Edit Job: ${editingJob.title}` : 'Post New Job Opening'}
        maxWidth="740px"
      >
        <form onSubmit={handleFormSubmit}>
          {/* Row 1: Title & Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Job Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="company"
                className="form-input"
                placeholder="e.g. InnovateTech Solutions"
                value={formData.company}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Location, Remote checkbox, Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Location <span className="required">*</span>
              </label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA or Austin, TX"
                value={formData.location}
                onChange={handleFormChange}
                required
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleFormChange}
                  style={{ accentColor: 'var(--primary-500)' }}
                />
                Remote Work Available
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g. Engineering, Design, Product"
                value={formData.department}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* Row 3: Employment Type, Experience Level, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                name="employmentType"
                className="form-select"
                value={formData.employmentType}
                onChange={handleFormChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                name="experienceLevel"
                className="form-select"
                value={formData.experienceLevel}
                onChange={handleFormChange}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
                <option value="Lead">Lead / Staff</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Publication Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 4: Salary & Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Salary Min ($/yr)</label>
              <input
                type="number"
                name="salaryMin"
                className="form-input"
                placeholder="e.g. 120000"
                value={formData.salaryMin}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary Max ($/yr)</label>
              <input
                type="number"
                name="salaryMax"
                className="form-input"
                placeholder="e.g. 160000"
                value={formData.salaryMax}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                className="form-input"
                value={formData.applicationDeadline}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* Row 5: Description */}
          <div className="form-group">
            <label className="form-label">
              Role Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              className="form-textarea"
              placeholder="Comprehensive summary of what the candidate will be doing..."
              value={formData.description}
              onChange={handleFormChange}
              required
            />
          </div>

          {/* Row 6: Skills */}
          <div className="form-group">
            <label className="form-label">Technical Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="e.g. React.js, Node.js, Express, MongoDB, Docker, AWS"
              value={formData.skills}
              onChange={handleFormChange}
            />
          </div>

          {/* Row 7: Responsibilities & Qualifications (Multiline) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Key Responsibilities (one per line)</label>
              <textarea
                name="responsibilities"
                rows={4}
                className="form-textarea"
                placeholder="Design REST APIs&#10;Lead architectural reviews&#10;Optimize MongoDB indexing"
                value={formData.responsibilities}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualifications (one per line)</label>
              <textarea
                name="qualifications"
                rows={4}
                className="form-textarea"
                placeholder="5+ years in full-stack JavaScript&#10;B.S. in Computer Science&#10;Experience in microservices"
                value={formData.qualifications}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* Row 8: Benefits */}
          <div className="form-group">
            <label className="form-label">Benefits & Perks (one per line)</label>
            <textarea
              name="benefits"
              rows={3}
              className="form-textarea"
              placeholder="Health, dental, and vision insurance&#10;Remote work stipend&#10;Unlimited PTO"
              value={formData.benefits}
              onChange={handleFormChange}
            />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px',
              marginTop: '16px'
            }}
          >
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingJob ? 'Update Posting' : 'Publish Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmJob}
        onClose={() => setDeleteConfirmJob(null)}
        title="Confirm Deletion of Job Posting"
        maxWidth="480px"
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <AlertTriangle size={42} color="var(--accent-rose)" style={{ margin: '0 auto 16px' }} />
          <h4 style={{ color: '#FFFFFF', marginBottom: '8px' }}>
            Are you sure you want to delete "{deleteConfirmJob?.title}"?
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            This action cannot be undone. All candidate applications submitted for this job will also be removed.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => setDeleteConfirmJob(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminJobsPage;
