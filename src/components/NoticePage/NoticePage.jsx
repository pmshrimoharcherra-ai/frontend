import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './NoticePage.css';
import {
  FileText,
  Download,
  Calendar,
  Search,
  Pin,
  Sparkles,
  Home,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  X,
  FileCheck,
  LayoutGrid,
  List,
  ArrowDownToLine,
  ShieldCheck
} from 'lucide-react';

const API_NOTICES = `${API_BASE_URL}/api/notices`;

const NoticePage = ({ onNavigate = () => {} }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Sort & View Mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Download feedback toast state
  const [downloadToast, setDownloadToast] = useState(null);

  // Fetch notices from API
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_NOTICES);
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNotices(data.notices);
      } else {
        throw new Error(data.message || 'Failed to load notices.');
      }
    } catch (err) {
      console.warn('API fetch failed:', err);
      setError('Unable to load notices from the school database. Please check back shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter & Sort
  const filteredNotices = useMemo(() => {
    let result = [...notices];

    // Filter by Title Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((n) => n.title?.toLowerCase().includes(q));
    }

    // Sort: Pinned notices first, then by timestamp
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      const dateA = new Date(a.createdAt || a.publishDate).getTime() || 0;
      const dateB = new Date(b.createdAt || b.publishDate).getTime() || 0;

      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notices, searchQuery, sortBy]);

  // Handle Download Notice
  const handleDownloadNotice = (notice, e) => {
    if (e) e.stopPropagation();

    const downloadUrl = `${API_BASE_URL}/api/notices/${notice._id}/download`;

    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', notice.pdfFileName || 'Notice.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show toast notification
    setDownloadToast({
      title: notice.title,
      fileName: notice.pdfFileName || 'Notice.pdf'
    });

    setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
  };

  return (
    <div className="notice-page-wrapper">
      {/* Toast Feedback Notification */}
      {downloadToast && (
        <div className="notice-download-toast" role="alert">
          <div className="toast-icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="toast-text">
            <strong>Downloading Notice PDF</strong>
            <span>{downloadToast.fileName}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setDownloadToast(null)}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ====================================================================
          01 — HERO SECTION
          ==================================================================== */}
      <section className="notice-hero-section">
        <div className="notice-hero-overlay"></div>
        <div className="notice-hero-container">
          <div className="notice-hero-content">
            {/* Top Eyebrow Tag */}
            <div className="notice-eyebrow-wrap">
              <span className="notice-eyebrow">OFFICIAL NOTICES & CIRCULARS</span>
              <div className="notice-eyebrow-line"></div>
            </div>

            {/* Main Title */}
            <h1 className="notice-hero-title">
              <span className="title-navy">School </span>
              <span className="title-orange">Notice Board</span>
            </h1>

            {/* Subtitle */}
            <h2 className="notice-hero-subtitle">
              Official Announcements <span className="subtitle-dot">•</span> Examination Schedules <span className="subtitle-dot">•</span> Board Orders
            </h2>

            {/* Description */}
            <p className="notice-hero-desc">
              Stay informed with real-time official announcements, TBSE board circulars, examination routines, and administrative notices from PM SHRI Moharcherra H.S. School.
            </p>

            {/* Breadcrumb Navigation */}
            <div className="notice-breadcrumb-nav">
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => onNavigate('home')}
              >
                <Home size={14} />
                <span>Home</span>
              </button>
              <span className="breadcrumb-divider">/</span>
              <span className="breadcrumb-current">Notices & Circulars</span>
            </div>

            {/* Quick Hero Highlights */}
            <div className="notice-hero-stats">
              <div className="hero-stat-card">
                <span className="stat-count">{notices.length}</span>
                <span className="stat-label">Published Notices</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-count text-orange">
                  {notices.filter((n) => n.pinned).length}
                </span>
                <span className="stat-label">Important / Pinned</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-count text-green">PDF</span>
                <span className="stat-label">Official Document</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          02 — BODY SECTION (Clean Toolbar + Notices Cards)
          ==================================================================== */}
      <section className="notice-body-section" id="notices-list">
        <div className="notice-body-container">
          {/* Controls Toolbar: Search, View Mode & Sort */}
          <div className="notice-toolbar-panel">
            {/* Search Box */}
            <div className="notice-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search notices by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Right Controls: View Switcher + Sort */}
            <div className="notice-controls-right">
              {/* View Switcher */}
              <div className="notice-view-switcher" role="group" aria-label="View layout">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Sort Selector */}
              <div className="notice-sort-group">
                <label htmlFor="notice-sort-select">Sort by:</label>
                <select
                  id="notice-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="notice-sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="notice-results-bar">
            <span className="results-text">
              Showing <strong>{filteredNotices.length}</strong>{' '}
              {filteredNotices.length === 1 ? 'official notice' : 'official notices'}
              {searchQuery && (
                <> matching "<strong>{searchQuery}</strong>"</>
              )}
            </span>
            {searchQuery && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>

          {/* ── NOTICES CARDS / LIST ── */}
          {loading ? (
            <div className="notices-loading-state">
              <RefreshCw size={36} className="spin-icon" />
              <h4>Loading Official Notices...</h4>
              <p>Fetching real-time updates from the school database.</p>
            </div>
          ) : error ? (
            <div className="notices-error-state">
              <AlertCircle size={38} />
              <h4>Unable to Load Notices</h4>
              <p>{error}</p>
              <button type="button" className="retry-btn" onClick={fetchNotices}>
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="notices-empty-state">
              <FolderOpen size={48} />
              <h4>No Notices Found</h4>
              <p>
                {searchQuery
                  ? 'No announcements match your search. Try searching with different keywords.'
                  : 'No notices posted yet. Please check back later.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => setSearchQuery('')}
                >
                  View All Notices
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* ── GRID VIEW ── */
            <div className="notices-cards-grid">
              {filteredNotices.map((notice) => (
                <div
                  key={notice._id || notice.id}
                  className={`notice-tile-card ${notice.pinned ? 'is-pinned' : ''}`}
                  onClick={(e) => handleDownloadNotice(notice, e)}
                  title={`Click to download: ${notice.title}`}
                >
                  {/* Card Header: Badge & Date */}
                  <div className="notice-card-header">
                    {notice.pinned ? (
                      <span className="notice-status-badge badge-pinned">
                        <Pin size={12} />
                        <span>Important / Pinned</span>
                      </span>
                    ) : (
                      <span className="notice-status-badge badge-official">
                        <FileCheck size={12} />
                        <span>Official Circular</span>
                      </span>
                    )}

                    <div className="notice-card-date">
                      <Calendar size={13} className="date-icon" />
                      <span>{notice.publishDate}</span>
                    </div>
                  </div>

                  {/* Notice Title */}
                  <div className="notice-card-body">
                    <h3 className="notice-card-title">{notice.title}</h3>

                    {/* PDF Document Preview Box */}
                    <div className="notice-pdf-attachment-card">
                      <div className="pdf-doc-icon-box">
                        <FileText size={22} className="pdf-doc-svg" />
                      </div>
                      <div className="pdf-doc-meta">
                        <span className="pdf-doc-name" title={notice.pdfFileName}>
                          {notice.pdfFileName || 'Official_Notice.pdf'}
                        </span>
                        <span className="pdf-doc-sub">
                          {notice.pdfFileSize || 'PDF'} • Signed Circular
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action Button */}
                  <div className="notice-card-footer">
                    <span className="card-click-hint">Click card to download</span>
                    <button
                      type="button"
                      className="download-notice-action-btn"
                      onClick={(e) => handleDownloadNotice(notice, e)}
                      title="Download PDF"
                    >
                      <Download size={14} className="download-btn-icon" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="notices-list-container">
              {filteredNotices.map((notice, idx) => (
                <div
                  key={notice._id || notice.id}
                  className={`notice-list-row ${notice.pinned ? 'is-pinned' : ''}`}
                  onClick={(e) => handleDownloadNotice(notice, e)}
                  title={`Click to download: ${notice.title}`}
                >
                  <div className="list-row-left">
                    <div className="list-pdf-icon-wrap">
                      <FileText size={22} />
                    </div>
                    <div className="list-row-info">
                      <div className="list-badges-row">
                        {notice.pinned ? (
                          <span className="notice-status-badge badge-pinned">
                            <Pin size={11} />
                            <span>Pinned</span>
                          </span>
                        ) : (
                          <span className="notice-status-badge badge-official">
                            <FileCheck size={11} />
                            <span>Official</span>
                          </span>
                        )}
                        <span className="list-date-chip">
                          <Calendar size={12} />
                          {notice.publishDate}
                        </span>
                      </div>
                      <h4 className="list-notice-title">{notice.title}</h4>
                      <div className="list-file-info">
                        <span>{notice.pdfFileName || 'Notice.pdf'}</span>
                        <span className="bullet-sep">•</span>
                        <span>{notice.pdfFileSize || 'PDF Document'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="list-row-right">
                    <button
                      type="button"
                      className="download-notice-action-btn"
                      onClick={(e) => handleDownloadNotice(notice, e)}
                      title="Download PDF"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Info / Attestation Banner at Bottom */}
          <div className="notice-info-banner">
            <div className="info-banner-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="info-banner-text">
              <h4>Official Notice & Document Verification</h4>
              <p>
                All uploaded circulars are digitally signed and maintained under the Directorate of School Education, Govt. of Tripura. For certified physical copies or archived gazettes, please contact the school administrative desk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoticePage;
