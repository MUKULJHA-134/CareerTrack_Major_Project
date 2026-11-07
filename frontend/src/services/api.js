const API_BASE = import.meta.env.VITE_API_URL || '';

// Helper to get auth header with Bearer token
const getAuthHeaders = () => {
  const token = localStorage.getItem('careertrack_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== PUBLIC API ENDPOINTS ==================== //

export const fetchPublicJobs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/jobs?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch jobs');
  return data;
};

export const fetchPublicJobById = async (id) => {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Job opening not found');
  return data;
};

export const applyForJob = async (jobId, formData) => {
  // Uses multipart/form-data via fetch
  const res = await fetch(`${API_BASE}/api/applications/apply/${jobId}`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Application submission failed');
  return data;
};

export const submitContactMessage = async (contactData) => {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit contact message');
  return data;
};

// ==================== ADMIN AUTH ENDPOINTS ==================== //

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Authentication failed');
  return data;
};

export const fetchAdminProfile = async () => {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify session');
  return data;
};

// ==================== ADMIN JOBS ENDPOINTS ==================== //

export const fetchAdminJobs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/jobs/admin/all?${query}`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch administrator job records');
  return data;
};

export const createJob = async (jobData) => {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(jobData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create job posting');
  return data;
};

export const updateJob = async (id, jobData) => {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(jobData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update job posting');
  return data;
};

export const updateJobStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/api/jobs/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update job publication status');
  return data;
};

export const deleteJob = async (id) => {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete job posting');
  return data;
};

export const fetchDashboardMetrics = async () => {
  const res = await fetch(`${API_BASE}/api/jobs/admin/analytics/summary`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load dashboard metrics');
  return data;
};

// ==================== ADMIN APPLICATIONS ENDPOINTS ==================== //

export const fetchApplications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/applications/admin/all?${query}`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch candidate applications');
  return data;
};

export const fetchApplicationById = async (id) => {
  const res = await fetch(`${API_BASE}/api/applications/admin/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Application record not found');
  return data;
};

export const updateApplicationStatus = async (id, status, customNote = '') => {
  const res = await fetch(`${API_BASE}/api/applications/admin/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status, customNote })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update candidate status');
  return data;
};

export const sendApplicationEmail = async (id, emailData) => {
  const res = await fetch(`${API_BASE}/api/applications/admin/${id}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(emailData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send candidate email');
  return data;
};

export const addApplicationNote = async (id, note) => {
  const res = await fetch(`${API_BASE}/api/applications/admin/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ note })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add recruitment note');
  return data;
};

export const downloadResumeFile = async (id, originalName) => {
  const token = localStorage.getItem('careertrack_admin_token');
  const res = await fetch(`${API_BASE}/api/applications/admin/${id}/resume`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Unable to download résumé file');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = originalName || 'resume.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const exportApplicationsCsv = async (params = {}) => {
  const token = localStorage.getItem('careertrack_admin_token');
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/applications/admin/export/csv?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to generate CSV export');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `careertrack_applications_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
