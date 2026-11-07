import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  Wifi
} from 'lucide-react';

const JobCard = ({ job, onApply }) => {
  const formatSalary = () => {
    if (!job.isSalaryDisclosed || (!job.salaryMin && !job.salaryMax)) {
      return 'Competitive Salary';
    }
    const currencySymbol = job.salaryCurrency === 'USD' ? '$' : '₹';
    const min = job.salaryMin ? `${currencySymbol}${(job.salaryMin / 1000).toFixed(0)}k` : '';
    const max = job.salaryMax ? `${currencySymbol}${(job.salaryMax / 1000).toFixed(0)}k` : '';

    if (min && max) return `${min} - ${max} / yr`;
    if (min) return `From ${min} / yr`;
    return `Up to ${max} / yr`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpiringSoon = () => {
    if (!job.applicationDeadline) return false;
    const diffDays = Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        {/* Top Company & Badges Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--primary-400)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              {job.company}
            </span>
            <h3
              style={{
                marginTop: '4px',
                fontSize: '1.25rem',
                color: '#FFFFFF'
              }}
            >
              <Link to={`/job/${job._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {job.title}
              </Link>
            </h3>
          </div>

          {job.isRemote && (
            <span
              className="badge"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#67E8F9',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <Wifi size={12} />
              Remote
            </span>
          )}
        </div>

        {/* Key Job Meta Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={15} color="var(--primary-400)" />
            {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Briefcase size={15} color="var(--accent-purple)" />
            {job.employmentType}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} color="var(--accent-amber)" />
            {job.experienceLevel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            <DollarSign size={15} />
            {formatSalary()}
          </span>
        </div>

        {/* Short Summary Description */}
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            marginBottom: '18px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {job.description}
        </p>

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '20px'
            }}
          >
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Buttons */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          <div>Posted {formatDate(job.postingDate)}</div>
          {isExpiringSoon() && (
            <div style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
              Deadline closing soon
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/job/${job._id}`}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 12px' }}
          >
            Details
          </Link>

          <button
            onClick={() => onApply(job)}
            className="btn btn-primary btn-sm"
            style={{ padding: '6px 14px' }}
          >
            Apply Now
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
