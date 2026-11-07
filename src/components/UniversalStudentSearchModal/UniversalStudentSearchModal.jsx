import React, { useState, useEffect, useRef, useMemo } from 'react';
import './UniversalStudentSearchModal.css';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';
import { isTransferredOrFailed } from '../../utils/studentStatus';
import {
  Search,
  X,
  User,
  GraduationCap,
  Fingerprint,
  Phone,
  Eye,
  Pencil,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Hash,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

/**
 * Format a 12-digit Aadhaar / APAAR with 4-digit groups (e.g. 9446 8689 0759)
 */
const formatAadhaar = (val) => {
  if (!val || val === '—' || val === 'Not Recorded' || val === 'Pending') return val || '—';
  const clean = String(val).replace(/\D/g, '');
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
  }
  return val;
};

const UniversalStudentSearchModal = ({
  isOpen,
  onClose,
  students = [],
  onViewStudent,
  onEditStudent,
  onNavigateToClass
}) => {
  const [query, setQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL'); // 'ALL' | 'primary' | 'elementary' | 'secondary' | 'senior'
  const inputRef = useRef(null);
  const modalCardRef = useRef(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      setQuery('');
      setWingFilter('ALL');
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Lookup class metadata helper
  const getClassMeta = (classId) => {
    return SCHOOL_CLASSES.find((c) => c.id === classId) || {
      id: classId,
      name: classId || 'Class',
      wing: 'General Wing',
      category: 'primary'
    };
  };

  // Search matching logic across all student fields
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const digitsOnly = query.replace(/\D/g, '');

    return students.filter((s) => {
      // Wing category filter
      if (wingFilter !== 'ALL') {
        const meta = getClassMeta(s.classId);
        if (meta.category !== wingFilter) return false;
      }

      // 1. Student Name
      const sName = (s.name || '').toLowerCase();
      if (sName.includes(trimmed)) return true;

      // 2. Father / Guardian Name
      const sFather = (s.father || s.guardian || '').toLowerCase();
      if (sFather.includes(trimmed)) return true;

      // 3. Mother Name
      const sMother = (s.mother || '').toLowerCase();
      if (sMother.includes(trimmed)) return true;

      // 4. Aadhaar Number (matched with or without spaces)
      if (digitsOnly.length >= 3) {
        const sAadhaarDigits = (s.aadhaar || '').replace(/\D/g, '');
        if (sAadhaarDigits.includes(digitsOnly)) return true;
      }

      // 5. PEN Number
      const sPen = (s.penNumber || '').toLowerCase();
      if (sPen.includes(trimmed)) return true;

      // 6. APAAR ID
      const sApaar = (s.apaarId || '').toLowerCase();
      if (sApaar.includes(trimmed)) return true;

      // 7. Phone
      const sPhone = (s.phone || '').replace(/\D/g, '');
      if (digitsOnly.length >= 3 && sPhone.includes(digitsOnly)) return true;

      // 8. Roll number & Class
      const meta = getClassMeta(s.classId);
      if (meta.name.toLowerCase().includes(trimmed)) return true;
      if (String(s.roll || '') === trimmed) return true;

      return false;
    });
  }, [students, query, wingFilter]);

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    const st = status || 'Enrolled';
    let cls = 'status-enrolled';
    if (st === 'Transferred') cls = 'status-transferred';
    else if (st === 'Failed') cls = 'status-failed';
    else if (st === 'Leave') cls = 'status-leave';
    else if (st === 'Alumni') cls = 'status-alumni';

    return <span className={`universal-status-badge ${cls}`}>{st}</span>;
  };

  // Determine which fields matched the query for helpful badges
  const getMatchHighlights = (student) => {
    const trimmed = query.trim().toLowerCase();
    const digitsOnly = query.replace(/\D/g, '');
    const matches = [];

    if (!trimmed) return matches;

    const sName = (student.name || '').toLowerCase();
    const sFather = (student.father || student.guardian || '').toLowerCase();
    const sMother = (student.mother || '').toLowerCase();
    const sAadhaarDigits = (student.aadhaar || '').replace(/\D/g, '');
    const sPen = (student.penNumber || '').toLowerCase();

    if (sName.includes(trimmed)) matches.push('Student Name');
    if (sFather.includes(trimmed)) matches.push("Father's Name");
    if (sMother.includes(trimmed)) matches.push("Mother's Name");
    if (digitsOnly.length >= 3 && sAadhaarDigits.includes(digitsOnly)) matches.push('Aadhaar Number');
    if (sPen.includes(trimmed)) matches.push('PEN Number');

    return matches;
  };

  return (
    <div className="universal-search-backdrop" onClick={onClose}>
      <div 
        className="universal-search-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        ref={modalCardRef}
      >
        {/* Modal Topbar Search Input */}
        <div className="universal-search-header">
          <div className="universal-search-input-wrapper">
            <Search size={22} className="universal-input-icon" />
            <input
              ref={inputRef}
              type="text"
              className="universal-modal-input"
              placeholder="Search by student name, father's name, mother's name, or Aadhaar number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button 
                type="button" 
                className="universal-clear-btn" 
                onClick={() => setQuery('')}
                title="Clear query"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="universal-search-close-group">
            <span className="esc-hint">ESC</span>
            <button 
              type="button" 
              className="universal-modal-close-btn" 
              onClick={onClose}
              title="Close search"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Grade Category Filters & Results Bar */}
        <div className="universal-search-subbar">
          <div className="universal-category-pills">
            <button
              type="button"
              className={`cat-pill ${wingFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setWingFilter('ALL')}
            >
              All Grades (I–XII)
            </button>
            <button
              type="button"
              className={`cat-pill primary ${wingFilter === 'primary' ? 'active' : ''}`}
              onClick={() => setWingFilter('primary')}
            >
              Primary (I–V)
            </button>
            <button
              type="button"
              className={`cat-pill elementary ${wingFilter === 'elementary' ? 'active' : ''}`}
              onClick={() => setWingFilter('elementary')}
            >
              Elementary (VI–VIII)
            </button>
            <button
              type="button"
              className={`cat-pill secondary ${wingFilter === 'secondary' ? 'active' : ''}`}
              onClick={() => setWingFilter('secondary')}
            >
              Secondary (IX–X)
            </button>
            <button
              type="button"
              className={`cat-pill senior ${wingFilter === 'senior' ? 'active' : ''}`}
              onClick={() => setWingFilter('senior')}
            >
              Higher Secondary (XI–XII)
            </button>
          </div>

          <div className="universal-results-counter">
            {query.trim() ? (
              <span>
                Found <strong>{searchResults.length}</strong> matching student{searchResults.length === 1 ? '' : 's'}
              </span>
            ) : (
              <span>Searching across <strong>{students.length}</strong> registered student records</span>
            )}
          </div>
        </div>

        {/* Modal Body: Results or Search Guide */}
        <div className="universal-search-results-body">
          {query.trim() === '' ? (
            /* Empty Query Guide */
            <div className="universal-search-guide">
              <div className="guide-icon-circle">
                <Search size={32} />
              </div>
              <h3>Universal Student Directory Search</h3>
              <p>Type any keyword to search across all grades from Class 1 to Class 12 instantaneously:</p>

              <div className="guide-examples-grid">
                <div className="guide-card" onClick={() => setQuery('Das')}>
                  <span className="guide-card-tag">Student Name</span>
                  <h4>Student Full Name</h4>
                  <p>e.g. "Arjita Das", "Abhijit", "Sayan"</p>
                </div>

                <div className="guide-card" onClick={() => setQuery('Biswajit')}>
                  <span className="guide-card-tag">Father / Guardian</span>
                  <h4>Father's Name</h4>
                  <p>e.g. "Biswajit Singha Roy", "Ajoy Das"</p>
                </div>

                <div className="guide-card" onClick={() => setQuery('Krishna')}>
                  <span className="guide-card-tag">Mother's Name</span>
                  <h4>Mother's Name</h4>
                  <p>e.g. "Krishna Rani Das", "Dulan Deb"</p>
                </div>

                <div className="guide-card" onClick={() => setQuery('9446')}>
                  <span className="guide-card-tag">Identity Document</span>
                  <h4>Aadhaar Number</h4>
                  <p>Enter any 4 to 12 digits of Aadhaar card</p>
                </div>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found */
            <div className="universal-no-results">
              <div className="no-res-icon">
                <AlertCircle size={36} />
              </div>
              <h3>No Students Found Matching "{query}"</h3>
              <p>
                We could not find any student matching your query across Classes 1–12.
              </p>
              <div className="no-res-hints">
                <span>Tips:</span>
                <ul>
                  <li>Check spelling of the student, father, or mother's name.</li>
                  <li>Try entering just the first name or surname.</li>
                  <li>For Aadhaar search, enter 4 or more digits from the card.</li>
                  <li>Switch the grade filter to "All Grades (I–XII)".</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Matching Results List */
            <div className="universal-results-list">
              {searchResults.map((st) => {
                const classMeta = getClassMeta(st.classId);
                const isGirl = (st.gender || '').trim().toLowerCase() === 'girl';
                const highlights = getMatchHighlights(st);

                return (
                  <div key={st.id || st.studentId || `${st.classId}-${st.roll}`} className="universal-result-card">
                    {/* Top Row: Avatar, Name, Gender, Class Pill, Status */}
                    <div className="u-card-header">
                      <div className="u-card-left">
                        <div className={`u-avatar ${isGirl ? 'girl' : 'boy'}`}>
                          {st.name ? st.name.charAt(0) : 'S'}
                        </div>
                        <div className="u-name-group">
                          <div className="u-title-row">
                            <h4 className="u-student-name">{st.name}</h4>
                            <span className={`u-gender-chip ${isGirl ? 'girl' : 'boy'}`}>
                              {isGirl ? <GirlIcon size={12} /> : <BoyIcon size={12} />}
                              <span>{isGirl ? 'Girl' : 'Boy'}</span>
                            </span>
                            {renderStatusBadge(st.status)}
                          </div>
                          <div className="u-class-row">
                            <span className="u-class-badge" title={classMeta.wing}>
                              <GraduationCap size={13} />
                              <strong>{classMeta.name}</strong>
                              <span className="u-wing-sub">({classMeta.wing})</span>
                            </span>
                            <span className="u-roll-badge">Roll #{st.roll || '—'}</span>
                            {st.caste && <span className="u-caste-badge font-mono">{st.caste}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="u-card-actions">
                        {onViewStudent && (
                          <button
                            type="button"
                            className="u-action-btn view"
                            onClick={() => {
                              onViewStudent(st);
                            }}
                            title={`View Full Profile for ${st.name}`}
                          >
                            <Eye size={14} />
                            <span>View Profile</span>
                          </button>
                        )}

                        {onNavigateToClass && (
                          <button
                            type="button"
                            className="u-action-btn navigate"
                            onClick={() => {
                              onNavigateToClass(st.classId);
                              onClose();
                            }}
                            title={`Open ${classMeta.name} Class Roster`}
                          >
                            <span>Go to Class</span>
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {onEditStudent && (
                          <button
                            type="button"
                            className="u-action-btn edit"
                            onClick={() => {
                              onEditStudent(st);
                            }}
                            title={`Edit Student Details for ${st.name}`}
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Matched Field Callout Tags */}
                    {highlights.length > 0 && (
                      <div className="u-matched-tags-row">
                        <span className="match-tag-label">Matched:</span>
                        {highlights.map((h, i) => (
                          <span key={i} className="match-tag-pill">
                            <CheckCircle2 size={11} />
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Information Grid: Parents, Aadhaar, Identifiers */}
                    <div className="u-details-grid">
                      {/* Father / Guardian */}
                      <div className="u-detail-item">
                        <span className="u-item-label">Father's Name:</span>
                        <span className={`u-item-val ${query && (st.father || '').toLowerCase().includes(query.toLowerCase()) ? 'highlighted' : ''}`}>
                          {st.father || st.guardian || '—'}
                        </span>
                      </div>

                      {/* Mother */}
                      <div className="u-detail-item">
                        <span className="u-item-label">Mother's Name:</span>
                        <span className={`u-item-val ${query && (st.mother || '').toLowerCase().includes(query.toLowerCase()) ? 'highlighted' : ''}`}>
                          {st.mother || '—'}
                        </span>
                      </div>

                      {/* Aadhaar Number */}
                      <div className="u-detail-item">
                        <span className="u-item-label">
                          <Fingerprint size={12} />
                          <span>Aadhaar No:</span>
                        </span>
                        <span className={`u-item-val font-mono ${query.replace(/\D/g, '').length >= 3 && (st.aadhaar || '').replace(/\D/g, '').includes(query.replace(/\D/g, '')) ? 'highlighted' : ''}`}>
                          {st.aadhaar ? formatAadhaar(st.aadhaar) : <span className="text-muted">Not Recorded</span>}
                        </span>
                      </div>

                      {/* PEN Number */}
                      <div className="u-detail-item">
                        <span className="u-item-label">
                          <Hash size={12} />
                          <span>PEN No:</span>
                        </span>
                        <span className={`u-item-val font-mono ${query && (st.penNumber || '').toLowerCase().includes(query.toLowerCase()) ? 'highlighted' : ''}`}>
                          {st.penNumber || <span className="text-muted">—</span>}
                        </span>
                      </div>

                      {/* Contact Phone */}
                      <div className="u-detail-item">
                        <span className="u-item-label">
                          <Phone size={12} />
                          <span>Phone:</span>
                        </span>
                        <span className="u-item-val font-mono">
                          {st.phone ? (
                            <a href={`tel:${st.phone.split('/')[0].trim()}`} onClick={(e) => e.stopPropagation()}>
                              {st.phone}
                            </a>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </span>
                      </div>

                      {/* Attendance */}
                      <div className="u-detail-item">
                        <span className="u-item-label">Attendance:</span>
                        <span className="u-item-val">
                          {st.attendance || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with quick shortcuts */}
        <div className="universal-search-footer">
          <div className="footer-shortcuts">
            <span className="shortcut-item">
              <span className="key-cap">ESC</span> to Close
            </span>
            <span className="shortcut-item">
              <span className="key-cap">Ctrl</span> + <span className="key-cap">K</span> to Open Anytime
            </span>
          </div>
          <div className="footer-actions">
            <button type="button" className="footer-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalStudentSearchModal;
