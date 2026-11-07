import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  LogOut,
  LogIn,
  Menu,
  X,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { isAuthenticated, admin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Administrator session logged out safely.', 'info');
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Briefcase size={22} color="#FFFFFF" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                lineHeight: 1.1
              }}
            >
              Career<span style={{ color: '#6366F1', WebkitTextFillColor: '#6366F1' }}>Track</span>
            </span>
            <span
              style={{
                fontSize: '0.675rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              Recruitment System
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}
          className="desktop-nav"
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.925rem',
              transition: 'color 0.2s',
              borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
              paddingBottom: '4px'
            })}
          >
            Browse Openings
          </NavLink>

          <NavLink
            to="/contact"
            style={({ isActive }) => ({
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.925rem',
              transition: 'color 0.2s',
              borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
              paddingBottom: '4px'
            })}
          >
            Contact Us
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                  borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                  paddingBottom: '4px'
                })}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/jobs"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                  borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                  paddingBottom: '4px'
                })}
              >
                <Briefcase size={16} />
                Manage Jobs
              </NavLink>

              <NavLink
                to="/admin/applications"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                  borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                  paddingBottom: '4px'
                })}
              >
                <Users size={16} />
                Applications
              </NavLink>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginLeft: '12px',
                  paddingLeft: '16px',
                  borderLeft: '1px solid var(--border-light)'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {admin?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--primary-400)' }}>
                    {admin?.role?.toUpperCase() || 'ADMINISTRATOR'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout Administrator"
                  style={{ gap: '4px', padding: '6px 10px' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px'
              }}
            >
              <Shield size={15} color="#818CF8" />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px'
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#111827',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#FFFFFF', fontWeight: 600 }}
          >
            Browse Openings
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#FFFFFF', fontWeight: 600 }}
          >
            Contact Us
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#FFFFFF' }}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/jobs"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#FFFFFF' }}
              >
                Manage Jobs
              </Link>
              <Link
                to="/admin/applications"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#FFFFFF' }}
              >
                Applications
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: '8px' }}
              >
                Logout ({admin?.name})
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              Admin Portal Login
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
