import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminTeachers.css';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import EditTeacherModal from '../EditTeacherModal/EditTeacherModal';
import AddTeacherModal from '../AddTeacherModal/AddTeacherModal';
import {
  Users,
  Search,
  BookOpen,
  Phone,
  Mail,
  Copy,
  Check,
  LayoutGrid,
  List,
  ShieldCheck,
  Sparkles,
  X,
  ExternalLink,
  Award,
  Pencil,
  UserPlus,
  Trash2,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

const AdminTeachers = ({ onTeacherCountChange }) => {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedId, setCopiedId] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSaveTeacher = (updatedTeacher) => {
    setTeachers((prev) =>
      prev.map((t) =>
        (t._id && t._id === updatedTeacher._id) ||
        (t.teacherId && t.teacherId === updatedTeacher.teacherId)
          ? { ...t, ...updatedTeacher }
          : t
      )
    );
  };

  const handleAddTeacher = (newTeacher) => {
    setTeachers((prev) => {
      const updated = [newTeacher, ...prev];
      if (onTeacherCountChange) {
        onTeacherCountChange(updated.length, updated);
      }
      return updated;
    });
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!teacher) return;
    try {
      setDeleting(true);
      const id = teacher._id || teacher.id || teacher.teacherId;
      const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete teacher record');
      }

      setTeachers((prev) => {
        const updated = prev.filter(
          (t) =>
            (t._id ? t._id !== teacher._id : true) &&
            t.teacherId !== teacher.teacherId
        );
        if (onTeacherCountChange) {
          onTeacherCountChange(updated.length, updated);
        }
        return updated;
      });
      setTeacherToDelete(null);
    } catch (err) {
      alert(err.message || 'Error deleting teacher');
    } finally {
      setDeleting(false);
    }
  };

  // Fetch from backend API with fallback to INITIAL_TEACHERS
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/teachers`);
        const data = await res.json();
        if (data.success && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setTeachers(data.teachers);
          if (onTeacherCountChange) {
            onTeacherCountChange(data.teachers.length, data.teachers);
          }
        }
      } catch (err) {
        console.warn('Backend fetch for teachers failed, using bundled official teachers list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [onTeacherCountChange]);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Helper to check if a teacher has a Head / Leadership designation
  const checkIsHead = (role) => {
    if (!role) return false;
    return (
      ['HM', 'TIC', 'AHM'].includes(role) ||
      role.includes('Teacher-In-Charge') ||
      role.includes('H.M.') ||
      role.includes('Head')
    );
  };

  // Dynamic faculty statistics according to Tripura School Cadre:
  // TIC/HM/AHM, PGT, UGT, GT, TGT
  const ticHmAhmCount = useMemo(() => {
    return teachers.filter((t) => checkIsHead(t.role)).length;
  }, [teachers]);

  const pgtCount = useMemo(() => {
    return teachers.filter((t) => {
      if (checkIsHead(t.role)) return false;
      const r = (t.role || '').toUpperCase();
      return r.includes('PGT') || r.includes('SENIOR');
    }).length;
  }, [teachers]);

  const ugtCount = useMemo(() => {
    return teachers.filter((t) => {
      if (checkIsHead(t.role)) return false;
      const r = (t.role || '').toUpperCase();
      return r.includes('UGT') || r.includes('UNDER GRADUATE');
    }).length;
  }, [teachers]);

  const gtCount = useMemo(() => {
    return teachers.filter((t) => {
      if (checkIsHead(t.role)) return false;
      const r = (t.role || '').toUpperCase();
      if (r.includes('PGT') || r.includes('TGT') || r.includes('UGT')) return false;
      return r === 'GT' || r.includes('GRADUATE') || /\bGT\b/.test(r);
    }).length;
  }, [teachers]);

  const tgtCount = useMemo(() => {
    return teachers.filter((t) => {
      if (checkIsHead(t.role)) return false;
      const r = (t.role || '').toUpperCase();
      return r.includes('TGT') || r.includes('TRAINED GRADUATE');
    }).length;
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.teacherId?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.role?.toLowerCase().includes(q) ||
        String(t.slNo).includes(q)
      );
    });
  }, [teachers, searchQuery]);

  return (
    <div className="admin-teachers-container">
      {/* Top Banner Header */}
      <div className="teachers-banner-header">
        <div className="banner-title-wrap">
          <div className="banner-icon-avatar">
            <Users size={24} />
          </div>
          <div>
            <h2>Teaching & Administrative Staff</h2>
            <p>PM SHRI Moharcherra H.S. School Faculty Roster for Academic Year 2026–27</p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="teachers-quick-stats">
          <div className="stat-pill-item highlight">
            <span className="stat-pill-label">Total Faculty</span>
            <span className="stat-pill-num">{teachers.length}</span>
          </div>
          <div className="stat-pill-item">
            <span className="stat-pill-label">TIC/HM/AHM</span>
            <span className="stat-pill-num">{ticHmAhmCount}</span>
          </div>
          <div className="stat-pill-item">
            <span className="stat-pill-label">PGT</span>
            <span className="stat-pill-num">{pgtCount}</span>
          </div>
          <div className="stat-pill-item">
            <span className="stat-pill-label">UGT</span>
            <span className="stat-pill-num">{ugtCount}</span>
          </div>
          <div className="stat-pill-item">
            <span className="stat-pill-label">GT</span>
            <span className="stat-pill-num">{gtCount}</span>
          </div>
          <div className="stat-pill-item">
            <span className="stat-pill-label">TGT</span>
            <span className="stat-pill-num">{tgtCount}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search, Add Teacher, View Switcher */}
      <div className="teachers-toolbar">
        {/* Search Input */}
        <div className="teachers-search-box">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Teacher Name, ID (e.g. TR45208338, TP00693724), Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Toolbar Actions: Add Teacher & View Switch */}
        <div className="teachers-toolbar-actions">
          <button
            type="button"
            className="add-teacher-btn"
            onClick={() => setShowAddModal(true)}
            title="Register a new teacher to faculty roster"
          >
            <UserPlus size={16} />
            <span>Add Teacher</span>
          </button>

          {/* View Switch Buttons */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Official Table View"
            >
              <List size={16} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>


      {/* Results Count Summary */}
      <div className="results-summary-row">
        <span>
          Showing <strong>{filteredTeachers.length}</strong> of <strong>{teachers.length}</strong> official teachers
        </span>
        {searchQuery && (
          <span className="search-filter-tag">Filtered by: "{searchQuery}"</span>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: MODERN GRID CARDS VIEW
         ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="teachers-cards-grid">
          {filteredTeachers.map((t) => {
            const isHead = checkIsHead(t.role);
            return (
              <div
                key={t.teacherId}
                className={`teacher-faculty-card ${isHead ? 'head-card' : ''}`}
                onClick={() => setViewingTeacher(t)}
              >
                {/* Card Top: Sl No, Avatar, Name & Role */}
                <div className="faculty-card-header">
                  <div className="faculty-avatar-wrap">
                    <div className={`faculty-avatar ${isHead ? 'head-avatar' : ''}`}>
                      {t.name.charAt(0)}
                    </div>
                    <span className="faculty-sl-badge">#{String(t.slNo).padStart(2, '0')}</span>
                  </div>

                  <div className="faculty-meta">
                    <div className="faculty-title-row">
                      <h4 className="faculty-name">{t.name}</h4>
                      {isHead && (
                        <span className="head-badge">
                          <Award size={12} />
                          <span>Head of School</span>
                        </span>
                      )}
                    </div>
                    <span className={`faculty-role ${isHead ? 'head-role' : ''}`}>{t.role}</span>
                  </div>
                </div>

                {/* Teacher ID Pill with Copy button */}
                <div className="faculty-id-strip" onClick={(e) => e.stopPropagation()}>
                  <div className="id-left">
                    <span className="id-label">Teacher ID:</span>
                    <span className="id-value font-mono">{t.teacherId}</span>
                  </div>
                  <button
                    type="button"
                    className="copy-id-btn"
                    onClick={() => handleCopy(t.teacherId, t.teacherId)}
                    title="Copy Teacher ID"
                  >
                    {copiedId === t.teacherId ? (
                      <>
                        <Check size={13} className="text-green" />
                        <span className="text-green">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Body: Subject & Contact Details */}
                <div className="faculty-card-body">
                  <div className="faculty-detail-item">
                    <BookOpen size={15} className="detail-icon" />
                    <span>Primary Subject: <strong>{t.subject}</strong></span>
                  </div>

                  <div className="faculty-detail-item">
                    <GraduationCap size={15} className="detail-icon" />
                    <span>Class Teacher: <strong style={{ color: t.assignedClassName ? '#ea580c' : '#94a3b8' }}>{t.assignedClassName || 'None (Unassigned)'}</strong></span>
                  </div>

                  {t.teachingAssignments && t.teachingAssignments.length > 0 && (
                    <div className="faculty-detail-item" style={{ alignItems: 'flex-start' }}>
                      <Award size={15} className="detail-icon" style={{ marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '1px' }}>
                        {t.teachingAssignments.map((a, i) => (
                          <span key={i} style={{
                            fontSize: '11px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: '#334155'
                          }}>
                            <strong>{a.className || a.classId}:</strong> {a.subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="faculty-detail-item">
                    <Phone size={15} className="detail-icon" />
                    <span className="contact-text">{t.phone || '+91 94361 00000'}</span>
                  </div>

                  <div className="faculty-detail-item">
                    <Mail size={15} className="detail-icon" />
                    <span className="contact-text email-text">{t.email || `${t.name.toLowerCase().replace(/\s+/g, '.')}@pmshri.ac.in`}</span>
                  </div>
                </div>

                {/* Card Footer: Status & Actions */}
                <div className="faculty-card-footer">
                  <span className="active-faculty-tag">
                    <span className="live-dot" />
                    <span>{t.status || 'Active Faculty'}</span>
                  </span>
                  <div className="faculty-card-actions">
                    <button
                      type="button"
                      className="faculty-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTeacher(t);
                      }}
                      title="Edit teacher details"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="faculty-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeacherToDelete(t);
                      }}
                      title="Delete teacher record"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: OFFICIAL TABLE ROSTER VIEW
         ========================================================================= */}
      {viewMode === 'table' && (
        <div className="teachers-table-card">
          <div className="table-responsive">
            <table className="official-teachers-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Sl. No.</th>
                  <th style={{ width: '160px' }}>Teacher ID</th>
                  <th>Teacher Name</th>
                  <th>Role / Designation</th>
                  <th>Primary Subject</th>
                  <th>Class Teacher Of</th>
                  <th>Teaching Allotments</th>
                  <th>Contact Info</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t) => {
                  const isHead = checkIsHead(t.role);
                  return (
                    <tr
                      key={t.teacherId}
                      className={`teacher-table-row ${isHead ? 'head-row' : ''}`}
                      onClick={() => setViewingTeacher(t)}
                    >
                      {/* Sl. No */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="table-sl-pill">#{String(t.slNo).padStart(2, '0')}</span>
                      </td>

                      {/* Teacher ID with copy */}
                      <td>
                        <div className="table-id-wrap" onClick={(e) => e.stopPropagation()}>
                          <span className="table-id-badge font-mono">{t.teacherId}</span>
                          <button
                            type="button"
                            className="table-copy-mini"
                            onClick={() => handleCopy(t.teacherId, `tbl-${t.teacherId}`)}
                            title="Copy Teacher ID"
                          >
                            {copiedId === `tbl-${t.teacherId}` ? (
                              <Check size={12} className="text-green" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Teacher Name */}
                      <td>
                        <div className="table-name-cell">
                          <div className={`table-avatar ${isHead ? 'head-avatar' : ''}`}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <span className="table-teacher-name font-bold">{t.name}</span>
                            {isHead && <span className="head-badge-mini">Head of School</span>}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`table-role-badge ${isHead ? 'head-role-badge' : ''}`}>
                          {t.role}
                        </span>
                      </td>

                      {/* Subject */}
                      <td>
                        <span className="table-subject-val">{t.subject}</span>
                      </td>

                      {/* Class Teacher Of */}
                      <td>
                        <span className="table-class-badge" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: t.assignedClassName ? '#fff7ed' : '#f1f5f9',
                          color: t.assignedClassName ? '#c2410c' : '#64748b',
                          border: t.assignedClassName ? '1px solid #ffedd5' : '1px solid #e2e8f0'
                        }}>
                          {t.assignedClassName || '—'}
                        </span>
                      </td>

                      {/* Teaching Allotments */}
                      <td>
                        {t.teachingAssignments && t.teachingAssignments.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                            {t.teachingAssignments.map((a, i) => (
                              <span key={i} style={{
                                fontSize: '11px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                <strong>{a.className || a.classId}:</strong> {a.subject}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="table-contact-wrap">
                          <span className="table-phone-text">{t.phone}</span>
                          <span className="table-email-text">{t.email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="table-status-pill">
                          <span className="live-dot" />
                          <span>{t.status || 'Active'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="table-edit-btn"
                            onClick={() => setEditingTeacher(t)}
                            title="Edit teacher details"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => setTeacherToDelete(t)}
                            title="Delete teacher record"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEACHER FULL PROFILE MODAL
         ========================================================================= */}
      {viewingTeacher && (
        <div className="teacher-modal-backdrop" onClick={() => setViewingTeacher(null)}>
          <div className="teacher-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-strip">
              <div className="modal-header-left">
                <div className="modal-avatar">
                  {viewingTeacher.name.charAt(0)}
                </div>
                <div>
                  <div className="modal-sl-row">
                    <span className="modal-sl-tag">Faculty #{String(viewingTeacher.slNo).padStart(2, '0')}</span>
                    <span className="modal-status-badge">Active Faculty</span>
                  </div>
                  <h3>{viewingTeacher.name}</h3>
                  <span className="modal-role-text">{viewingTeacher.role}</span>
                </div>
              </div>

              <button className="modal-close-btn" onClick={() => setViewingTeacher(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-box id-box">
                <span className="box-label">Tripura Government Teacher ID</span>
                <div className="box-value-row">
                  <span className="id-val-highlight font-mono">{viewingTeacher.teacherId}</span>
                  <button
                    className="modal-copy-btn"
                    onClick={() => handleCopy(viewingTeacher.teacherId, 'modal-id')}
                  >
                    {copiedId === 'modal-id' ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    <span>{copiedId === 'modal-id' ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>

              <div className="modal-info-box">
                <span className="box-label">Primary Subject</span>
                <span className="box-val font-bold">{viewingTeacher.subject}</span>
              </div>

              <div className="modal-info-box">
                <span className="box-label">Class Teacher of (Attendance)</span>
                <span className="box-val font-bold" style={{ color: viewingTeacher.assignedClassName ? '#ea580c' : '#64748b' }}>
                  {viewingTeacher.assignedClassName || 'Not Assigned as Class Teacher'}
                </span>
              </div>

              <div className="modal-info-box" style={{ gridColumn: 'span 2' }}>
                <span className="box-label">Teaching Subjects & Classes Allotment</span>
                {viewingTeacher.teachingAssignments && viewingTeacher.teachingAssignments.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {viewingTeacher.teachingAssignments.map((a, i) => (
                      <span key={i} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 9px',
                        fontSize: '12px'
                      }}>
                        <strong style={{ color: '#ea580c' }}>{a.className || a.classId}:</strong>
                        <span>{a.subject}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="box-val" style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                    No specific class-subject teaching allotments recorded yet
                  </span>
                )}
              </div>

              <div className="modal-info-box id-box">
                <span className="box-label">Portal Login Password</span>
                <div className="box-value-row">
                  <span className="id-val-highlight font-mono">
                    {viewingTeacher.password || `${viewingTeacher.name.trim().split(/\s+/)[0]}${viewingTeacher.subject?.replace(/[^\w]/g, '')}`}
                  </span>
                  <button
                    className="modal-copy-btn"
                    onClick={() =>
                      handleCopy(
                        viewingTeacher.password ||
                          `${viewingTeacher.name.trim().split(/\s+/)[0]}${viewingTeacher.subject?.replace(/[^\w]/g, '')}`,
                        'modal-pwd'
                      )
                    }
                  >
                    {copiedId === 'modal-pwd' ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    <span>{copiedId === 'modal-pwd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="modal-info-box">
                <span className="box-label">Official Email</span>
                <a href={`mailto:${viewingTeacher.email}`} className="box-link">
                  <Mail size={14} />
                  <span>{viewingTeacher.email}</span>
                </a>
              </div>

              <div className="modal-info-box">
                <span className="box-label">Contact Phone</span>
                <a href={`tel:${viewingTeacher.phone}`} className="box-link">
                  <Phone size={14} />
                  <span>{viewingTeacher.phone}</span>
                </a>
              </div>
            </div>

            <div className="modal-bottom-actions">
              <button
                type="button"
                className="modal-action-btn edit"
                onClick={() => {
                  const t = viewingTeacher;
                  setViewingTeacher(null);
                  setEditingTeacher(t);
                }}
              >
                <Pencil size={14} />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                className="modal-action-btn delete"
                onClick={() => {
                  const t = viewingTeacher;
                  setViewingTeacher(null);
                  setTeacherToDelete(t);
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                className="modal-close-action-btn"
                onClick={() => setViewingTeacher(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD TEACHER MODAL
         ========================================================================= */}
      {showAddModal && (
        <AddTeacherModal
          onClose={() => setShowAddModal(false)}
          onTeacherAdded={handleAddTeacher}
        />
      )}

      {/* =========================================================================
          EDIT TEACHER MODAL
         ========================================================================= */}
      {editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSave={handleSaveTeacher}
        />
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {teacherToDelete && (
        <div
          className="teacher-delete-backdrop"
          onClick={() => !deleting && setTeacherToDelete(null)}
        >
          <div
            className="teacher-delete-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="delete-card-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Delete Teacher Record?</h3>
            <p className="delete-card-text">
              Are you sure you want to delete <strong>{teacherToDelete.name}</strong>{' '}
              (ID: <span className="font-mono">{teacherToDelete.teacherId}</span>)? This will permanently remove the teacher from the official PM SHRI faculty roster.
            </p>
            <div className="delete-card-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => setTeacherToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={() => handleDeleteTeacher(teacherToDelete)}
                disabled={deleting}
              >
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Yes, Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
