import React from 'react';
import { Search, MapPin, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

const SearchFilterBar = ({
  search,
  setSearch,
  location,
  setLocation,
  employmentType,
  setEmploymentType,
  experienceLevel,
  setExperienceLevel,
  isRemote,
  setIsRemote,
  sortBy,
  setSortBy,
  onReset
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        marginBottom: '32px',
        background: 'rgba(15, 23, 42, 0.9)'
      }}
    >
      {/* Primary Search Inputs Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}
      >
        {/* Keyword Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by job title, company, or tech skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Location Search */}
        <div style={{ position: 'relative' }}>
          <MapPin
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Filter by city, state, or country..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Dropdowns & Toggles Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '16px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Employment Type */}
          <select
            className="form-select"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="All">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          {/* Experience Level */}
          <select
            className="form-select"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="All">All Experience Levels</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Mid-level">Mid-level</option>
            <option value="Senior-level">Senior-level</option>
            <option value="Lead">Lead / Staff</option>
          </select>

          {/* Remote Only Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: isRemote ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: isRemote ? '1px solid var(--primary-500)' : '1px solid var(--border-light)'
            }}
          >
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ accentColor: 'var(--primary-500)', cursor: 'pointer' }}
            />
            Remote Only
          </label>
        </div>

        {/* Sort and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="salaryHigh">Sort: Highest Salary</option>
              <option value="deadline">Sort: Application Deadline</option>
            </select>
          </div>

          <button
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            title="Reset All Filters"
            style={{ padding: '8px 12px' }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
