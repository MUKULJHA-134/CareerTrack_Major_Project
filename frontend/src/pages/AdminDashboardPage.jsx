import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { fetchDashboardMetrics, exportApplicationsCsv } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const res = await fetchDashboardMetrics();
        setMetrics(res.metrics);
      } catch (err) {
        showToast(err.message || 'Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [showToast]);

  const handleExportCsv = async () => {
    try {
      showToast('Preparing CSV export...', 'info');
      await exportApplicationsCsv();
      showToast('Candidate applications CSV exported successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'CSV export failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}
        />
        <p style={{ color: 'var(--text-secondary)' }}>Loading recruitment intelligence...</p>
      </div>
    );
  }

  const {
    totalJobs = 0,
    activeJobs = 0,
    closedJobs = 0,
    totalApplications = 0,
    statusBreakdown = {},
    recentApplications = []
  } = metrics || {};

  const pipelineStages = [
    { label: 'Submitted', key: 'Submitted', color: '#94A3B8' },
    { label: 'Under Review', key: 'Under Review', color: '#06B6D4' },
    { label: 'Shortlisted', key: 'Shortlisted', color: '#8B5CF6' },
    { label: 'Interview Scheduled', key: 'Interview Scheduled', color: '#F59E0B' },
    { label: 'Selected', key: 'Selected', color: '#10B981' },
    { label: 'Rejected', key: 'Rejected', color: '#F43F5E' }
  ];

  return (
    <div className="container" style={{ padding: '40px 0 60px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '36px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '6px' }}>
            Recruitment Command Center
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry, job publication status, and candidate pipeline tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary" style={{ gap: '8px' }}>
            <FileSpreadsheet size={16} color="#10B981" />
            Export CSV
          </button>
          <Link to="/admin/jobs?create=true" className="btn btn-primary" style={{ gap: '8px' }}>
            <Plus size={16} />
            Post New Job
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}
      >
        {/* Card 1: Total Jobs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              TOTAL POSTINGS
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Briefcase size={18} color="var(--primary-400)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>{totalJobs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            All active, draft & closed
          </div>
        </div>

        {/* Card 2: Active Published Jobs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ACTIVE JOBS
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>{activeJobs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            Accepting public applications
          </div>
        </div>

        {/* Card 3: Closed Jobs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              CLOSED / EXPIRED
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} color="var(--accent-rose)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>{closedJobs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Archived or deadline expired
          </div>
        </div>

        {/* Card 4: Total Applications */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              TOTAL CANDIDATES
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>{totalApplications}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            Applications in database
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Funnel Status Chart */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '4px' }}>
              Candidate Recruitment Pipeline Funnel
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              Distribution of candidates across each stage of review and hiring.
            </p>
          </div>
          <Link to="/admin/applications" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            View Pipeline <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {pipelineStages.map((stage) => {
            const count = statusBreakdown[stage.key] || 0;
            const percentage = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;

            return (
              <div
                key={stage.key}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {stage.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>{count}</span>
                  <span style={{ fontSize: '0.8rem', color: stage.color }}>({percentage}%)</span>
                </div>
                {/* Visual mini bar */}
                <div
                  style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(percentage, count > 0 ? 8 : 0)}%`,
                      backgroundColor: stage.color,
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '4px' }}>
              Recent Candidate Submissions
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Latest applicants seeking placement.</p>
          </div>
          <Link to="/admin/applications" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            All Applications ({totalApplications}) <ArrowRight size={14} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p style={{ padding: '24px 0', textAlign: 'center' }}>No applications recorded yet.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Role</th>
                  <th>Experience</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{app.candidateName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{app.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.job?.title || 'Position Deleted'}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                    </td>
                    <td>{app.experienceYears} yrs</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link
                        to={`/admin/applications?id=${app._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
