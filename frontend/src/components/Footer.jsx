import React from 'react';
import { Briefcase, Heart, Shield, Code, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#070A11',
        borderTop: '1px solid var(--border-light)',
        padding: '48px 0 32px',
        marginTop: '60px'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px',
            marginBottom: '40px'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Briefcase size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>
                CareerTrack
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Next-generation Full-Stack Job Portal and Recruitment Management System built on the MERN stack. Connecting ambitious candidates with high-impact career opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Candidate Hub
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Explore Openings
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Contact Us & Support
                </Link>
              </li>
              <li>
                <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Application Workflow
                </a>
              </li>
              <li>
                <a href="#benefits" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Candidate Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Admin Management */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recruitment Portal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/admin/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="#818CF8" />
                  Administrator Login
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/jobs" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Job Postings & Pipelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack Spec */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Architecture
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-pill">MongoDB Atlas</span>
              <span className="badge badge-pill">Express.js</span>
              <span className="badge badge-pill">React 18</span>
              <span className="badge badge-pill">Node.js</span>
              <span className="badge badge-pill">JWT Auth</span>
              <span className="badge badge-pill">REST API</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} CareerTrack System. All rights reserved. Major Project Deliverable.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with modern MERN Stack standards
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
