import React, { useState } from 'react';
import './StudentDetailsModal.css';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import {
  X,
  User,
  Users,
  Phone,
  Calendar,
  ShieldCheck,
  Fingerprint,
  GraduationCap,
  Sparkles,
  CalendarCheck,
  Pencil,
  Copy,
  Check,
  Hash,
  AlertCircle,
  Clock
} from 'lucide-react';

const StudentDetailsModal = ({ student, currentClass, onClose, onEdit, onMarkAttendance }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!student) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const isTransferred = student.status === 'Transferred' || (student.father && student.father.toLowerCase() === 't/c');
  const isFailed = student.status === 'Failed';
  const isClass8 = student.classId === 'class-8' || currentClass?.id === 'class-8';
  const isClassIXtoXII = ['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(student.classId || currentClass?.id);
  const hasEnrollment = isClassIXtoXII;

  return (
    <div className="student-details-backdrop" onClick={onClose}>
      <div 
        className="student-details-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-details-title"
      >
        {/* Modal Header */}
        <div className="details-header-banner">
          <div className="details-header-profile">
            <div className="details-avatar">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
            <div className="details-header-info">
              <div className="details-badge-row">
                <span className="details-roll-badge">Roll #{student.roll}</span>
                <span className="details-class-badge">
                  {currentClass?.name || student.className || 'Class VIII'}
                  {currentClass?.wing ? ` · ${currentClass.wing}` : ''}
                </span>
                <span className={`details-gender-badge ${student.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}>
                  {student.gender?.toLowerCase() === 'girl' ? <GirlIcon size={12} /> : <BoyIcon size={12} />}
                  <span>{student.gender === 'Girl' ? 'Girl' : 'Boy'}</span>
                </span>
                {isClassIXtoXII && student.enrollmentNo && student.enrollmentNo !== '—' && (
                  <span className="details-enr-badge" title={`Registration No: ${student.enrollmentNo}`}>
                    Reg: {student.enrollmentNo}
                  </span>
                )}
                <span className={`details-status-badge ${isTransferred ? 'transferred' : (isFailed ? 'failed' : (student.status === 'Leave' ? 'leave' : 'enrolled'))}`}>
                  {isTransferred ? 'Transferred (TC Issued)' : (isFailed ? 'Failed' : (student.status || 'Enrolled'))}
                </span>
              </div>
              <h2 id="student-details-title" className="details-student-name">
                {student.name}
              </h2>
              <div className="details-header-meta">
                <span className="details-session-tag">Academic Session: {student.academicYear || '2026-2027'}</span>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="details-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="details-body-scroll">
          {isTransferred && (
            <div className="transferred-notice-card">
              <AlertCircle size={18} className="notice-icon" />
              <div>
                <strong>Transfer Certificate Issued</strong>
                <p>This student has been issued a Transfer Certificate (T/C) and is archived as a transferred record.</p>
              </div>
            </div>
          )}

          {/* SECTION 1: Personal & Family Information */}
          <div className="details-section-card">
            <div className="section-header-row">
              <div className="section-icon-wrap user-theme">
                <Users size={16} />
              </div>
              <h3>Personal & Family Details</h3>
            </div>
            <div className="details-info-grid">
              <div className="detail-item-box">
                <span className="detail-label">Gender</span>
                <div className="detail-value-row">
                  {student.gender?.toLowerCase() === 'girl' ? (
                    <GirlIcon size={15} style={{ color: '#be185d' }} />
                  ) : (
                    <BoyIcon size={15} style={{ color: '#1d4ed8' }} />
                  )}
                  <span className={`detail-val-text font-bold ${student.gender?.toLowerCase() === 'girl' ? 'gender-girl-text' : 'gender-boy-text'}`}>
                    {student.gender || 'Boy'}
                  </span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">Date of Birth (DOB)</span>
                <div className="detail-value-row">
                  <Calendar size={14} className="field-icon" />
                  <span className="detail-val-text font-semibold">{student.dob || '—'}</span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">Father's Name</span>
                <div className="detail-value-row">
                  <span className="detail-val-text font-bold">
                    {student.father || (isTransferred ? 'Transfer Certificate (T/C)' : '—')}
                  </span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">Mother's Name</span>
                <div className="detail-value-row">
                  <span className="detail-val-text font-bold">{student.mother || '—'}</span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">Primary Guardian</span>
                <div className="detail-value-row">
                  <span className="detail-val-text">
                    {student.guardian || student.father || (isTransferred ? 'TC Issued' : '—')}
                  </span>
                </div>
              </div>

              {student.caste && (
                <div className="detail-item-box">
                  <span className="detail-label">Caste / Category</span>
                  <div className="detail-value-row">
                    <span className="detail-val-text font-bold" style={{ color: '#ea580c' }}>
                      {student.caste}
                    </span>
                  </div>
                </div>
              )}

              {student.address && (
                <div className="detail-item-box">
                  <span className="detail-label">Address / Village</span>
                  <div className="detail-value-row">
                    <span className="detail-val-text">
                      {student.address}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Identity & Government Identification */}
          <div className="details-section-card highlight-card">
            <div className="section-header-row">
              <div className="section-icon-wrap shield-theme">
                <Fingerprint size={16} />
              </div>
              <div className="section-title-wrap">
                <h3>Identity & Government Credentials</h3>
                <span className="confidential-pill">Confidential ERP Record</span>
              </div>
            </div>
            <div className="details-info-grid">
              <div className="detail-item-box aadhaar-item-box">
                <span className="detail-label">Aadhaar Number</span>
                <div className="detail-value-row aadhaar-row">
                  <span className="aadhaar-number-display">
                    {student.aadhaar ? student.aadhaar : <span className="text-muted">Not Recorded / Pending</span>}
                  </span>
                  {student.aadhaar && (
                    <button
                      type="button"
                      className="copy-field-btn"
                      onClick={() => handleCopy(student.aadhaar, 'aadhaar')}
                      title="Copy Aadhaar Number"
                    >
                      {copiedField === 'aadhaar' ? (
                        <>
                          <Check size={14} className="copied-icon" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">PEN Number (Permanent Education No.)</span>
                <div className="detail-value-row">
                  <Hash size={14} className="field-icon" />
                  <span className="erp-id-display" style={{ letterSpacing: '0.5px' }}>
                    {student.penNumber ? student.penNumber : <span className="text-muted">Not Recorded / Pending</span>}
                  </span>
                  {student.penNumber && (
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => handleCopy(student.penNumber, 'penNumber')}
                      title="Copy PEN Number"
                    >
                      {copiedField === 'penNumber' ? <Check size={12} className="copied-icon" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">APAAR ID</span>
                <div className="detail-value-row">
                  <Sparkles size={14} className="field-icon" />
                  <span className="erp-id-display" style={{ letterSpacing: '0.5px' }}>
                    {student.apaarId ? student.apaarId : <span className="text-muted">Not Generated / Pending</span>}
                  </span>
                  {student.apaarId && (
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => handleCopy(student.apaarId, 'apaarId')}
                      title="Copy APAAR ID"
                    >
                      {copiedField === 'apaarId' ? <Check size={12} className="copied-icon" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic & Attendance Profile */}
          <div className="details-section-card">
            <div className="section-header-row">
              <div className="section-icon-wrap academic-theme">
                <GraduationCap size={16} />
              </div>
              <h3>Academic Record & Attendance</h3>
            </div>
            <div className="details-info-grid">
              <div className="detail-item-box">
                <span className="detail-label">Class & Section</span>
                <div className="detail-value-row">
                  <span className="detail-val-text font-bold">
                    {student.className || currentClass?.name || 'Class VIII'}
                  </span>
                </div>
              </div>

              <div className="detail-item-box">
                <span className="detail-label">Roll Number</span>
                <div className="detail-value-row">
                  <span className="roll-pill-val">{student.roll}</span>
                </div>
              </div>

              {student.admissionNo && (
                <div className="detail-item-box">
                  <span className="detail-label">Admission Number</span>
                  <div className="detail-value-row">
                    <span className="font-mono font-bold" style={{ color: '#0f766e', fontSize: '13px' }}>
                      #{student.admissionNo}
                    </span>
                  </div>
                </div>
              )}

              {student.admissionDate && (
                <div className="detail-item-box">
                  <span className="detail-label">Admission Date</span>
                  <div className="detail-value-row">
                    <Calendar size={14} className="field-icon" />
                    <span className="detail-val-text font-semibold">
                      {student.admissionDate}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-item-box">
                <span className="detail-label">Overall Attendance Percentage</span>
                <div className="detail-value-row att-progress-row">
                  <div className="att-pill-badge-lg">
                    <CalendarCheck size={14} />
                    <span>{student.attendance || '0%'}</span>
                  </div>
                  <button
                    type="button"
                    className="view-register-btn"
                    onClick={() => {
                      onClose();
                      onMarkAttendance && onMarkAttendance(student);
                    }}
                  >
                    View Monthly Sheet
                  </button>
                </div>
              </div>

              {hasEnrollment ? (
                <>
                  <div className="detail-item-box enr-box-highlight">
                    <span className="detail-label">Enrollment / Registration No.</span>
                    <div className="detail-value-row">
                      <span className="font-mono font-bold enr-val-text">
                        {student.enrollmentNo && student.enrollmentNo !== '—' 
                          ? student.enrollmentNo 
                          : <span className="text-muted">Not Yet Assigned / Pending</span>}
                      </span>
                      {student.enrollmentNo && student.enrollmentNo !== '—' && (
                        <button
                          type="button"
                          className="copy-mini-btn"
                          onClick={() => handleCopy(student.enrollmentNo, 'enr')}
                          title="Copy Enrollment Number"
                        >
                          {copiedField === 'enr' ? <Check size={12} className="copied-icon" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="detail-item-box enr-box-highlight">
                    <span className="detail-label">Enrollment Year</span>
                    <div className="detail-value-row">
                      <span className="enr-yr-pill font-bold">
                        {student.enrollmentYear || '2026'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-item-box">
                  <span className="detail-label">Curriculum / Board</span>
                  <div className="detail-value-row">
                    <span className="detail-val-text">TBSE Elementary Curriculum</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Contact Information */}
          <div className="details-section-card">
            <div className="section-header-row">
              <div className="section-icon-wrap phone-theme">
                <Phone size={16} />
              </div>
              <h3>Contact & Communication</h3>
            </div>
            <div className="details-info-grid">
              <div className="detail-item-box full-width">
                <span className="detail-label">Registered Phone Number</span>
                <div className="detail-value-row contact-row">
                  {student.phone ? (
                    <>
                      <a href={`tel:${student.phone.split('/')[0].trim()}`} className="phone-call-link">
                        <Phone size={15} />
                        <span>{student.phone}</span>
                      </a>
                      <button
                        type="button"
                        className="copy-field-btn"
                        onClick={() => handleCopy(student.phone, 'phone')}
                        title="Copy Phone Number"
                      >
                        {copiedField === 'phone' ? (
                          <>
                            <Check size={14} className="copied-icon" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="text-muted">No phone number on record</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="details-modal-footer">
          <div className="footer-left-actions">
            <button
              type="button"
              className="footer-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="footer-right-actions">
            <button
              type="button"
              className="footer-btn-attendance"
              onClick={() => {
                onClose();
                onMarkAttendance && onMarkAttendance(student);
              }}
            >
              <CalendarCheck size={15} />
              <span>Mark Attendance</span>
            </button>
            <button
              type="button"
              className="footer-btn-primary"
              onClick={() => {
                onClose();
                onEdit && onEdit(student);
              }}
            >
              <Pencil size={15} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
