import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import SearchFilterBar from '../components/SearchFilterBar';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { fetchPublicJobs } from '../services/api';
import { useToast } from '../context/ToastContext';

const HomePage = () => {
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('All');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [isRemote, setIsRemote] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        sortBy
      };

      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (employmentType !== 'All') params.employmentType = employmentType;
      if (experienceLevel !== 'All') params.experienceLevel = experienceLevel;
      if (isRemote) params.isRemote = 'true';

      const res = await fetchPublicJobs(params);
      setJobs(res.jobs || []);
      setTotalJobs(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast(err.message || 'Error loading job vacancies', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, location, employmentType, experienceLevel, isRemote, sortBy, showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setEmploymentType('All');
    setExperienceLevel('All');
    setIsRemote(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '72px 0 48px',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--primary-200)',
              fontSize: '0.825rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <Sparkles size={14} color="#818CF8" />
            <span>Discover High-Impact Career Opportunities</span>
          </div>

          <h1
            style={{
              maxWidth: '820px',
              margin: '0 auto 16px',
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Connect With Leading Tech Teams & Innovators
          </h1>

          <p
            style={{
              maxWidth: '640px',
              margin: '0 auto 36px',
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            Explore verified, published openings across engineering, product, and design. Apply effortlessly in minutes without mandatory account registration.
          </p>

          {/* Quick Stats Counter Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '32px',
              margin: '0 auto 40px',
              maxWidth: '680px',
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                {totalJobs}+
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Openings</div>
            </div>

            <div style={{ width: '1px', background: 'var(--border-light)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Employers</div>
            </div>

            <div style={{ width: '1px', background: 'var(--border-light)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                Zero
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Login Barrier to Apply</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container">
        {/* Search & Filter Bar */}
        <SearchFilterBar
          search={search}
          setSearch={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          location={location}
          setLocation={(val) => {
            setLocation(val);
            setCurrentPage(1);
          }}
          employmentType={employmentType}
          setEmploymentType={(val) => {
            setEmploymentType(val);
            setCurrentPage(1);
          }}
          experienceLevel={experienceLevel}
          setExperienceLevel={(val) => {
            setExperienceLevel(val);
            setCurrentPage(1);
          }}
          isRemote={isRemote}
          setIsRemote={(val) => {
            setIsRemote(val);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
        />

        {/* Results Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 600 }}>
            {loading ? 'Searching opportunities...' : `Available Positions (${totalJobs})`}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Jobs Grid or Loading State */}
        {loading ? (
          <div
            style={{
              padding: '60px 0',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
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
            <p>Fetching active job openings from CareerTrack...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '0 auto'
            }}
          >
            <Search size={42} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#FFFFFF' }}>
              No Openings Found
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
              We could not find any active job postings matching your selected filters. Try broadening your keywords or clearing selected filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}
          >
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={(target) => setSelectedJobForApply(target)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '16px'
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0 8px' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* How It Works Feature Cards */}
        <div
          id="how-it-works"
          style={{
            marginTop: '80px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '60px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '10px' }}>
              How CareerTrack Works for Candidates
            </h2>
            <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '0.95rem' }}>
              Built specifically to eliminate tedious recruitment friction and respect candidate privacy.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="glass-card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'var(--primary-400)'
                }}
              >
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '8px' }}>
                1. Browse & Filter
              </h3>
              <p style={{ fontSize: '0.875rem' }}>
                Quickly locate suitable roles by tech stack, experience level, salary range, and remote flexibility with zero paywalls.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'var(--accent-emerald)'
                }}
              >
                <FileCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '8px' }}>
                2. Instant Application
              </h3>
              <p style={{ fontSize: '0.875rem' }}>
                Apply directly with your résumé and credentials without the requirement to register an account or create passwords.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'var(--accent-cyan)'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '8px' }}>
                3. Private & Direct Review
              </h3>
              <p style={{ fontSize: '0.875rem' }}>
                Your data is stored securely in MongoDB and accessed exclusively by authorized administrators and recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          job={selectedJobForApply}
        />
      )}
    </div>
  );
};

export default HomePage;
