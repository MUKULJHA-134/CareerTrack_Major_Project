import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  Share2,
  Wifi,
  AlertTriangle,
  Send,
  Check
} from 'lucide-react';
import { fetchPublicJobById } from '../services/api';
import ApplyModal from '../components/ApplyModal';
import { useToast } from '../context/ToastContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const res = await fetchPublicJobById(id);
        setJob(res.job);
      } catch (err) {
        showToast(err.message || 'Unable to retrieve job details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, showToast]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Job opening link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatSalary = () => {
    if (!job?.isSalaryDisclosed || (!job?.salaryMin && !job?.salaryMax)) {
      return 'Competitive Compensation';
    }
    const currency = job.salaryCurrency === 'USD' ? '$' : '₹';
    const min = job.salaryMin ? `${currency}${job.salaryMin.toLocaleString()}` : '';
    const max = job.salaryMax ? `${currency}${job.salaryMax.toLocaleString()}` : '';
    if (min && max) return `${min} – ${max} per year`;
    if (min) return `From ${min} per year`;
    return `Up to ${max} per year`;
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
        <p style={{ color: 'var(--text-secondary)' }}>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Job Opening Unavailable</h2>
        <p style={{ marginBottom: '24px' }}>
          This job posting may have expired, been unpublished, or removed by the recruitment administrator.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 0 60px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} />
          Back to all openings
        </Link>
      </div>

      {/* Hero Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '36px',
          marginBottom: '32px',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--primary-400)',
                  letterSpacing: '0.02em'
                }}
              >
                {job.company}
              </span>

              {job.department && (
                <span className="badge badge-pill">{job.department}</span>
              )}

              {job.isRemote && (
                <span
                  className="badge"
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#67E8F9',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <Wifi size={12} />
                  Remote Friendly
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#FFFFFF', marginBottom: '16px' }}>
              {job.title}
            </h1>

            {/* Meta Tags */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                fontSize: '0.925rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--primary-400)" />
                {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="var(--accent-purple)" />
                {job.employmentType}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--accent-amber)" />
                {job.experienceLevel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                <DollarSign size={16} />
                {formatSalary()}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              title="Share Job"
              style={{ padding: '10px 14px' }}
            >
              {copiedLink ? <Check size={18} color="#10B981" /> : <Share2 size={18} />}
            </button>

            {job.isAcceptingApplications ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="btn btn-primary btn-lg"
                style={{ gap: '10px' }}
              >
                <Send size={18} />
                Apply for this Position
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" disabled>
                Applications Closed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Content & Sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
          gap: '32px'
        }}
        className="job-content-grid"
      >
        {/* Left Column: Job Details */}
        <div>
          {/* Overview */}
          <section className="glass-card" style={{ padding: '32px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '16px' }}>
              About the Role
            </h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.975rem' }}>
              {job.description}
            </p>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="glass-card" style={{ padding: '32px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '16px' }}>
                Core Responsibilities
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {job.responsibilities.map((resp, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--primary-400)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <section className="glass-card" style={{ padding: '32px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '16px' }}>
                Qualifications & Requirements
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {job.qualifications.map((qual, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <section className="glass-card" style={{ padding: '32px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '16px' }}>
                Benefits & Perks
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {job.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Sidebar: Quick Snapshot & Sticky CTA */}
        <div>
          <div
            className="glass-card"
            style={{
              padding: '28px',
              position: 'sticky',
              top: '94px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div>
              <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px' }}>
                Job Overview
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Company</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{job.company}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{job.location}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Employment Type</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{job.employmentType}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{job.experienceLevel}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Posting Date</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                    {new Date(job.postingDate).toLocaleDateString()}
                  </span>
                </div>

                {job.applicationDeadline && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deadline</span>
                    <span style={{ fontWeight: 600, color: job.isExpired ? 'var(--accent-rose)' : '#FFFFFF' }}>
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '10px' }}>
                  Required Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar CTA */}
            {job.isAcceptingApplications ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Apply Now
              </button>
            ) : (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  color: '#FDA4AF',
                  fontSize: '0.85rem'
                }}
              >
                Applications for this role are currently closed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={job}
      />

      <style>{`
        @media (max-width: 900px) {
          .job-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobDetailPage;
