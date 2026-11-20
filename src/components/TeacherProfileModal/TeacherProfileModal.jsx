import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import './TeacherProfileModal.css';
import {
  X,
  User,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Check,
  Copy,
  Upload,
  Trash2,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  Layers
} from 'lucide-react';

const TeacherProfileModal = ({
  teacher,
  isOpen,
  onClose,
  onSignatureUpdated
}) => {
  if (!isOpen || !teacher) return null;

  const [copiedField, setCopiedField] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(teacher.signature || '');
  const [pendingSignature, setPendingSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'signature'
  const fileInputRef = useRef(null);

  const teacherId = teacher.teacherId || teacher.id;
  const isClassTeacher = Boolean(teacher.assignedClassId || teacher.assignedClassName);
  const assignedClass = teacher.assignedClassName || (teacher.assignedClassId ? `Class ${teacher.assignedClassId.replace('class-', '').toUpperCase()}` : '');

  // Keep preview in sync if teacher prop changes
  useEffect(() => {
    setSignaturePreview(teacher.signature || '');
    setPendingSignature(null);
    setStatusMsg(null);
  }, [teacher]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Convert uploaded image to clean optimized data URL
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please upload a valid image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'File size too large. Please select an image under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize on canvas: scale to reasonable size for signature while keeping crisp resolution
        const canvas = document.createElement('canvas');
        const maxW = 600;
        const maxH = 240;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const optimizedDataUrl = canvas.toDataURL('image/png', 0.92);
        setPendingSignature(optimizedDataUrl);
        setStatusMsg({ type: 'info', text: 'Signature loaded. Click "Save Signature" to activate it on official marksheets.' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save signature to backend
  const handleSaveSignature = async () => {
    const sigToSave = pendingSignature !== null ? pendingSignature : signaturePreview;
    if (!teacherId) return;

    try {
      setIsSaving(true);
      setStatusMsg(null);

      const res = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: sigToSave })
      });

      const data = await res.json();
      if (data.success) {
        setSignaturePreview(sigToSave);
        setPendingSignature(null);
        setStatusMsg({ type: 'success', text: 'Official signature successfully saved! It will now appear on Class IX & XI marksheets.' });

        // Update stored session if matching active user
        try {
          const currentStored = localStorage.getItem('pmshri_user');
          if (currentStored) {
            const parsed = JSON.parse(currentStored);
            parsed.signature = sigToSave;
            localStorage.setItem('pmshri_user', JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn('Error updating stored user signature:', e);
        }

        if (onSignatureUpdated) {
          onSignatureUpdated(sigToSave);
        }
      } else {
        throw new Error(data.message || 'Failed to update signature.');
      }
    } catch (err) {
      console.error('Error saving teacher signature:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Could not save signature. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Remove signature from backend
  const handleRemoveSignature = async () => {
    if (!window.confirm('Are you sure you want to remove your digital signature? Marksheets will revert to using the standard text signature.')) {
      return;
    }

    try {
      setIsSaving(true);
      setStatusMsg(null);

      const res = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: '' })
      });

      const data = await res.json();
      if (data.success) {
        setSignaturePreview('');
        setPendingSignature(null);
        setStatusMsg({ type: 'success', text: 'Signature removed. Marksheets will display standard text signature.' });

        try {
          const currentStored = localStorage.getItem('pmshri_user');
          if (currentStored) {
            const parsed = JSON.parse(currentStored);
            parsed.signature = '';
            localStorage.setItem('pmshri_user', JSON.stringify(parsed));
          }
        } catch {}

        if (onSignatureUpdated) {
          onSignatureUpdated('');
        }
      }
    } catch (err) {
      console.error('Error removing signature:', err);
      setStatusMsg({ type: 'error', text: 'Could not remove signature.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeDisplaySignature = pendingSignature || signaturePreview;

  return (
    <div className="teacher-profile-backdrop" onClick={onClose}>
      <div
        className="teacher-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="t-profile-title"
      >
        {/* Header */}
        <div className="tp-modal-header">
          <div className="tp-header-left">
            <div className="tp-header-avatar">
              {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h3 id="t-profile-title">{teacher.name}</h3>
              <p className="tp-header-sub">
                Official Faculty Record • Government Teacher ID: <strong>{teacher.teacherId}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="tp-close-btn"
            onClick={onClose}
            title="Close Profile (Esc)"
            aria-label="Close Profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Identity Banner */}
        <div className="tp-hero-banner">
          <div className="tp-banner-meta">
            <span className="tp-role-pill font-bold">
              <Briefcase size={13} />
              {teacher.role || 'Faculty Member'}
            </span>
            {isClassTeacher ? (
              <span className="tp-classteacher-pill font-bold">
                <ShieldCheck size={14} />
                Class Teacher • {assignedClass}
              </span>
            ) : (
              <span className="tp-subjectteacher-pill">
                <BookOpen size={13} />
                Subject Faculty
              </span>
            )}
            <span className="tp-dept-pill">
              {teacher.department || 'Teaching Faculty'}
            </span>
          </div>

          <div className="tp-tabs-nav">
            <button
              type="button"
              className={`tp-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={15} />
              <span>Faculty Details</span>
            </button>
            <button
              type="button"
              className={`tp-tab-btn ${activeTab === 'signature' ? 'active' : ''}`}
              onClick={() => setActiveTab('signature')}
            >
              <Award size={15} />
              <span>Official Signature</span>
              {isClassTeacher && signaturePreview && (
                <span className="tp-tab-dot" title="Signature active" />
              )}
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {statusMsg && (
          <div className={`tp-status-alert ${statusMsg.type}`}>
            {statusMsg.type === 'success' ? (
              <Check size={16} />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="tp-modal-body">
          {activeTab === 'profile' && (
            <div className="tp-details-grid">
              {/* Box 1: Teacher ID */}
              <div className="tp-info-box">
                <span className="tp-box-label">Government Teacher ID</span>
                <div className="tp-box-val-row">
                  <span className="font-mono font-bold tp-val-highlight">{teacher.teacherId}</span>
                  <button
                    type="button"
                    className="tp-copy-btn"
                    onClick={() => handleCopy(teacher.teacherId, 'id')}
                    title="Copy Teacher ID"
                  >
                    {copiedField === 'id' ? <Check size={12} className="copied" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Box 2: Primary Subject */}
              <div className="tp-info-box">
                <span className="tp-box-label">Primary Teaching Subject</span>
                <div className="tp-box-val-row">
                  <span className="font-bold">{teacher.subject || 'General'}</span>
                </div>
              </div>

              {/* Box 3: Qualification */}
              <div className="tp-info-box">
                <span className="tp-box-label">Highest Qualification</span>
                <div className="tp-box-val-row">
                  <span>{teacher.qualification || 'B.Ed. / Post Graduate'}</span>
                </div>
              </div>

              {/* Box 4: Date of Birth */}
              <div className="tp-info-box">
                <span className="tp-box-label">Date of Birth (DOB)</span>
                <div className="tp-box-val-row">
                  <span className="font-mono">{teacher.dob || 'Not Recorded'}</span>
                </div>
              </div>

              {/* Box 5: Contact Phone */}
              <div className="tp-info-box">
                <span className="tp-box-label">Contact Mobile / Phone</span>
                <div className="tp-box-val-row">
                  <span className="font-mono">{teacher.phone || '—'}</span>
                  {teacher.phone && (
                    <button
                      type="button"
                      className="tp-copy-btn"
                      onClick={() => handleCopy(teacher.phone, 'phone')}
                      title="Copy Phone Number"
                    >
                      {copiedField === 'phone' ? <Check size={12} className="copied" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Box 6: Email */}
              <div className="tp-info-box">
                <span className="tp-box-label">Official Registered Email</span>
                <div className="tp-box-val-row">
                  <span className="tp-email-text">{teacher.email || '—'}</span>
                  {teacher.email && (
                    <button
                      type="button"
                      className="tp-copy-btn"
                      onClick={() => handleCopy(teacher.email, 'email')}
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check size={12} className="copied" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Box 7: Class Teacher Allocation */}
              <div className="tp-info-box tp-box-full">
                <span className="tp-box-label">Class Teacher Allocation (Roll-Call & Register Authority)</span>
                <div className="tp-box-val-row">
                  {isClassTeacher ? (
                    <div className="tp-assigned-class-badge">
                      <ShieldCheck size={16} />
                      <span>Appointed Class Teacher of <strong>{assignedClass}</strong></span>
                    </div>
                  ) : (
                    <span className="text-muted">Not assigned as a Class Teacher. You are currently designated as a Subject Teacher.</span>
                  )}
                </div>
              </div>

              {/* Box 8: Teaching Assignments */}
              <div className="tp-info-box tp-box-full">
                <span className="tp-box-label">Your Teaching Subjects &amp; Classes Allotment</span>
                <div className="tp-teaching-list">
                  {Array.isArray(teacher.teachingAssignments) && teacher.teachingAssignments.length > 0 ? (
                    teacher.teachingAssignments.map((a, i) => (
                      <div key={i} className="tp-teaching-chip">
                        <span className="tp-chip-class font-bold">{a.className || a.classId}</span>
                        <span className="tp-chip-divider">:</span>
                        <span className="tp-chip-subject">{a.subject}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted">No specific class-subject allotments assigned.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="tp-signature-section">
              {isClassTeacher ? (
                <>
                  <div className="tp-sig-intro-card">
                    <div className="tp-sig-intro-icon">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4>Official Marksheet Signature Endorsement</h4>
                      <p>
                        As the appointed <strong>Class Teacher of {assignedClass}</strong>, you can upload your official signature below. Once saved, your uploaded signature will be automatically stamped on all <strong>Class IX &amp; XI student marksheets</strong> in place of the typed text signature.
                      </p>
                    </div>
                  </div>

                  {/* Active / Pending Signature Preview */}
                  <div className="tp-sig-workspace">
                    <span className="tp-sig-preview-label">
                      {pendingSignature
                        ? 'New Signature Preview (Unsaved)'
                        : signaturePreview
                        ? 'Currently Active Signature on Marksheets'
                        : 'No Signature Uploaded Yet (Using Default Typed Signature)'}
                    </span>

                    <div className="tp-sig-card-container">
                      {activeDisplaySignature ? (
                        <div className="tp-sig-display-box">
                          <img
                            src={activeDisplaySignature}
                            alt="Class Teacher Official Signature"
                            className="tp-signature-img-preview"
                          />
                          <div className="tp-sig-rule-line" />
                          <div className="tp-sig-caption">
                            <span>Signature of Class Teacher</span>
                            <span className="tp-sig-name-caption">{teacher.name} ({assignedClass})</span>
                          </div>
                        </div>
                      ) : (
                        <div className="tp-sig-empty-placeholder">
                          <FileText size={36} className="text-muted" />
                          <p className="tp-empty-title">No official signature on record</p>
                          <p className="tp-empty-sub">
                            Marksheets currently display: <code>{teacher.name}</code> in typed cursive.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="tp-sig-actions-row">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />

                      <button
                        type="button"
                        className="tp-upload-btn"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        disabled={isSaving}
                      >
                        <Upload size={16} />
                        <span>{signaturePreview || pendingSignature ? 'Upload Different Signature' : 'Upload Signature Image'}</span>
                      </button>

                      {pendingSignature && (
                        <button
                          type="button"
                          className="tp-save-sig-btn font-bold"
                          onClick={handleSaveSignature}
                          disabled={isSaving}
                        >
                          <Check size={16} />
                          <span>{isSaving ? 'Saving Signature...' : 'Save Signature & Apply to Marksheets'}</span>
                        </button>
                      )}

                      {!pendingSignature && signaturePreview && (
                        <button
                          type="button"
                          className="tp-remove-sig-btn"
                          onClick={handleRemoveSignature}
                          disabled={isSaving}
                          title="Remove signature and revert to typed cursive signature"
                        >
                          <Trash2 size={15} />
                          <span>Remove Signature</span>
                        </button>
                      )}
                    </div>

                    <div className="tp-sig-guidelines-box">
                      <span className="guidelines-title">Tips for Best Quality on Marksheets:</span>
                      <ul>
                        <li>Sign clearly with dark blue or black ink on clean white paper.</li>
                        <li>Crop closely around your signature before uploading.</li>
                        <li>PNG format with transparent background is recommended for highest print clarity.</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="tp-sig-restricted-card">
                  <div className="tp-lock-icon-wrap">
                    <Lock size={32} />
                  </div>
                  <h4>Class Teacher Endorsement Only</h4>
                  <p>
                    Signature upload is reserved exclusively for designated <strong>Class Teachers</strong>. According to official academic evaluation protocol, student marksheets for Classes IX &amp; XI are officially signed and certified by their respective Class Teacher.
                  </p>
                  <p className="tp-restricted-sub">
                    You are currently registered as a Subject Teacher. If you are assigned as a Class Teacher in the future, this signature endorsement panel will become available automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="tp-modal-footer">
          <span className="tp-footer-meta">
            Academic Year 2026–2027 • PM SHRI Moharcherra H.S. School
          </span>
          <button
            type="button"
            className="tp-close-footer-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
