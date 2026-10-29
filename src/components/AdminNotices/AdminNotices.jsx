import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminNotices.css';
import {
  Plus,
  Search,
  Trash2,
  Download,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Pin,
  Calendar,
  X,
  FileCheck,
  Check
} from 'lucide-react';

const API_NOTICES = `${API_BASE_URL}/api/notices`;

const AdminNotices = ({ initialOpenModal = false }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [showCreateModal, setShowCreateModal] = useState(initialOpenModal);

  useEffect(() => {
    if (initialOpenModal) {
      setShowCreateModal(true);
    }
  }, [initialOpenModal]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form Fields (Title & PDF File only)
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch notices from Backend
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
      console.error('Error fetching notices:', err);
      setError('Server is currently inactive or unavailable. Please try again after some time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Open Create Modal
  const handleOpenModal = () => {
    setTitle('');
    setSelectedFile(null);
    setFormError('');
    setFormSuccess('');
    setShowCreateModal(true);
  };

  // Handle PDF File selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Please upload a valid PDF document (.pdf file format only).');
      setSelectedFile(null);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFormError('File size exceeds the 25MB limit.');
      setSelectedFile(null);
      return;
    }

    setFormError('');
    setSelectedFile(file);
  };

  // Submit Notice Form to Backend (Title & PDF only)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Please enter the notice title / subject.');
      return;
    }

    if (!selectedFile) {
      setFormError('Please attach and upload a Notice PDF file.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('noticePdf', selectedFile);

      const res = await fetch(API_NOTICES, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish notice.');
      }

      setFormSuccess('Notice published successfully! Displaying on the public Notice Board.');
      setTimeout(() => {
        setShowCreateModal(false);
        fetchNotices();
      }, 1000);
    } catch (err) {
      console.error('Error submitting notice:', err);
      setFormError(err.message || 'Error occurred while saving notice.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (noticeId, noticeTitle) => {
    if (!window.confirm(`Are you sure you want to delete this notice?\n\n"${noticeTitle}"`)) {
      return;
    }

    try {
      const res = await fetch(`${API_NOTICES}/${noticeId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not delete notice.');
      }
      setNotices((prev) => prev.filter((n) => n._id !== noticeId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Toggle Pin Status
  const handleTogglePin = async (noticeId) => {
    try {
      const res = await fetch(`${API_NOTICES}/${noticeId}/pin`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success && data.notice) {
        setNotices((prev) =>
          prev.map((n) => (n._id === noticeId ? { ...n, pinned: data.pinned } : n))
        );
      }
    } catch (err) {
      console.error('Pin toggle failed:', err);
    }
  };

  // Filtered notices for admin table/list
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || n.title?.toLowerCase().includes(q);
    });
  }, [notices, searchQuery]);

  return (
    <div className="admin-notices-container">
      {/* ── Tab Header ── */}
      <div className="admin-notices-header">
        <div>
          <h3>Notices & Circulars Management</h3>
          <p>Publish and organize announcements displayed on the public school portal</p>
        </div>
        <button
          type="button"
          className="btn-create-notice-action"
          onClick={handleOpenModal}
        >
          <Plus size={16} />
          <span>Create Notice</span>
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="admin-notices-stats">
        <div className="stat-pill-card">
          <span className="stat-pill-num">{notices.length}</span>
          <span className="stat-pill-text">Total Published</span>
        </div>
        <div className="stat-pill-card">
          <span className="stat-pill-num text-orange">
            {notices.filter((n) => n.pinned).length}
          </span>
          <span className="stat-pill-text">Pinned to Top</span>
        </div>
        <div className="stat-pill-card">
          <span className="stat-pill-num text-green">100%</span>
          <span className="stat-pill-text">PDF Verified</span>
        </div>
      </div>

      {/* ── Toolbar: Search ── */}
      <div className="admin-notices-toolbar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search notices by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="refresh-notices-btn"
          onClick={fetchNotices}
          title="Refresh Notices"
        >
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Table / Grid of Notices ── */}
      {loading ? (
        <div className="admin-notices-loading">
          <RefreshCw size={32} className="spin-icon" />
          <p>Loading notices from database...</p>
        </div>
      ) : error ? (
        <div className="admin-notices-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button type="button" onClick={fetchNotices} className="btn-retry">
            Retry Connection
          </button>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="admin-notices-empty">
          <FileText size={42} />
          <h4>No Notices Found</h4>
          <p>
            {searchQuery
              ? 'No notices match your search.'
              : 'No announcements posted yet. Click "+ Create Notice" above to publish your first notice.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="btn-retry"
              onClick={() => {
                setSearchQuery('');
              }}
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <div className="admin-notices-table-wrap">
          <table className="admin-notices-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Sl No.</th>
                <th>Notice Title / Subject</th>
                <th style={{ width: '160px' }}>Date</th>
                <th style={{ width: '220px' }}>PDF Document</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((n, idx) => (
                <tr key={n._id || n.id} className={n.pinned ? 'row-pinned' : ''}>
                  <td style={{ textAlign: 'center' }}>
                    <span className="ref-pill font-mono">#{idx + 1}</span>
                  </td>
                  <td>
                    <div className="notice-title-cell">
                      <div className="title-row">
                        <span className="notice-main-title">{n.title}</span>
                        {n.pinned && (
                          <span className="pinned-badge-mini" title="Pinned to top">
                            <Pin size={11} />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-date-cell">
                      <Calendar size={14} className="calendar-mini-icon" />
                      <span>{n.publishDate}</span>
                    </div>
                  </td>
                  <td>
                    <a
                      href={`${API_BASE_URL}/api/notices/${n._id}/download`}
                      download={n.pdfFileName || 'Notice.pdf'}
                      className="pdf-download-link"
                      title="Download PDF"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={15} className="pdf-icon-red" />
                      <span className="pdf-name-text">
                        {n.pdfFileName || 'Download PDF'}
                      </span>
                      <Download size={13} className="dl-icon" />
                    </a>
                  </td>
                  <td>
                    <div className="admin-action-btn-group">
                      <button
                        type="button"
                        className={`pin-toggle-btn ${n.pinned ? 'is-pinned' : ''}`}
                        onClick={() => handleTogglePin(n._id)}
                        title={n.pinned ? 'Unpin Notice' : 'Pin to Top'}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteNotice(n._id, n.title)}
                        title="Delete Notice"
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

      {/* =====================================================================
          MODAL: CREATE & PUBLISH NOTICE WITH PDF UPLOAD
         ===================================================================== */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => !submitting && setShowCreateModal(false)}>
          <div className="admin-dialog-card notice-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title-group">
                <div className="dialog-icon-wrap">
                  <FileText size={20} />
                </div>
                <div>
                  <h4>Publish New Notice / Circular</h4>
                  <p>Upload official document and broadcast on school notice board</p>
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => !submitting && setShowCreateModal(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="modal-alert-box alert-error">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="modal-alert-box alert-success">
                <CheckCircle2 size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="dialog-form">
              {/* Field 1: Title */}
              <div className="form-field">
                <label>
                  Notice Title / Subject <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TBSE Pre-Board Examination Routine & Instructions 2026–27"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Field 2: PDF File Upload Area */}
              <div className="form-field">
                <label>
                  Upload Notice PDF File <span className="req">*</span>
                </label>
                <div
                  className={`pdf-dropzone ${selectedFile ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {selectedFile ? (
                    <div className="file-preview-card">
                      <div className="file-preview-left">
                        <FileCheck size={32} className="file-check-icon" />
                        <div className="file-info-text">
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-meta">
                            {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-empty">
                      <UploadCloud size={34} className="dropzone-cloud-icon" />
                      <div className="dropzone-text">
                        <strong>Click to browse or drag & drop Notice PDF here</strong>
                        <span>Supports official signed PDF documents up to 25MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create-notice-action"
                  disabled={submitting || !selectedFile || !title.trim()}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="spin-icon" />
                      <span>Publishing Notice...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Post & Publish Notice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
