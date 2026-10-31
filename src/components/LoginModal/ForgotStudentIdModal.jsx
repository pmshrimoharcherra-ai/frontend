import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, Search, CheckCircle2, AlertCircle, Copy, Check, ArrowRight, Loader2, User, Hash, Calendar, GraduationCap } from 'lucide-react';

const CLASS_OPTIONS = [
  { id: 'class-6', label: 'Class VI' },
  { id: 'class-7', label: 'Class VII' },
  { id: 'class-8', label: 'Class VIII' },
  { id: 'class-9', label: 'Class IX' },
  { id: 'class-10', label: 'Class X' },
  { id: 'class-11-arts', label: 'Class XI (Arts)' },
  { id: 'class-11-sci', label: 'Class XI (Science)' },
  { id: 'class-12-arts', label: 'Class XII (Arts)' },
  { id: 'class-12-sci', label: 'Class XII (Science)' }
];

const ForgotStudentIdModal = ({ isOpen, onClose, onSelectIdentifier }) => {
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('class-10');
  const [roll, setRoll] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    if (!text || text === 'Not Available') return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setFoundStudent(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/student-find-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          classId,
          roll: roll.trim(),
          dob: dob.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No matching student record found.');
      }

      setFoundStudent(data.student);
    } catch (err) {
      setError(err.message || 'Failed to search student record. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFoundStudent(null);
    setError('');
  };

  const handleUseId = () => {
    const chosen = (foundStudent.apaarId && foundStudent.apaarId !== 'Not Available') 
      ? foundStudent.apaarId 
      : (foundStudent.penNumber || '');
    if (onSelectIdentifier && chosen) {
      onSelectIdentifier(chosen);
    }
    onClose();
  };

  return (
    <div className="login-modal-overlay recovery-overlay" onClick={onClose}>
      <div className="recovery-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="recovery-modal-header">
          <div className="recovery-icon-badge">
            <Search size={22} />
          </div>
          <h3>Find APAAR ID / PEN Number</h3>
          <p>Verify student identity with school records to retrieve APAAR and PEN</p>
        </div>

        {error && (
          <div className="login-feedback-banner error">
            <AlertCircle size={16} className="feedback-icon" />
            <span>{error}</span>
          </div>
        )}

        {!foundStudent ? (
          <form onSubmit={handleSearch} className="recovery-form">
            <div className="recovery-form-grid">
              {/* Student Name */}
              <div className="form-group full-span">
                <label className="form-label">Student Full Name *</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter student's full name as per records"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Class */}
              <div className="form-group">
                <label className="form-label">Enrolled Class *</label>
                <div className="input-wrapper">
                  <GraduationCap size={16} className="input-icon" />
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="form-input form-select"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roll Number */}
              <div className="form-group">
                <label className="form-label">Roll Number *</label>
                <div className="input-wrapper">
                  <Hash size={16} className="input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder="e.g. 01 or 7"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text');
                      setRoll(text.replace(/\D/g, '').slice(0, 4));
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="form-group full-span">
                <label className="form-label">Date of Birth (DOB) *</label>
                <div className="input-wrapper">
                  <Calendar size={16} className="input-icon" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="recovery-actions">
              <button type="button" className="recovery-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="recovery-btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinning-loader" />
                    <span>Searching Records...</span>
                  </>
                ) : (
                  <>
                    <span>Search Records</span>
                    <Search size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="recovery-result-card">
            <div className="result-success-badge">
              <CheckCircle2 size={18} />
              <span>Record Verified Successfully</span>
            </div>

            <div className="result-details-grid">
              <div className="r-item highlight">
                <span className="r-lbl">APAAR ID</span>
                <div className="r-val-box">
                  <span className="r-val font-mono">{foundStudent.apaarId}</span>
                  {foundStudent.apaarId && foundStudent.apaarId !== 'Not Available' && (
                    <button
                      type="button"
                      className="r-copy-btn"
                      onClick={() => handleCopy(foundStudent.apaarId, 'apaar')}
                    >
                      {copiedField === 'apaar' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="r-item highlight">
                <span className="r-lbl">PEN Number</span>
                <div className="r-val-box">
                  <span className="r-val font-mono">{foundStudent.penNumber}</span>
                  {foundStudent.penNumber && foundStudent.penNumber !== 'Not Available' && (
                    <button
                      type="button"
                      className="r-copy-btn"
                      onClick={() => handleCopy(foundStudent.penNumber, 'pen')}
                    >
                      {copiedField === 'pen' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="r-item">
                <span className="r-lbl">Student Name</span>
                <span className="r-val bold">{foundStudent.name}</span>
              </div>

              <div className="r-item">
                <span className="r-lbl">Class & Roll</span>
                <span className="r-val">{foundStudent.className} (Roll #{foundStudent.roll})</span>
              </div>

              <div className="r-item">
                <span className="r-lbl">Date of Birth (DOB)</span>
                <span className="r-val font-mono">{foundStudent.dob}</span>
              </div>

              <div className="r-item">
                <span className="r-lbl">Father's Name</span>
                <span className="r-val">{foundStudent.father}</span>
              </div>

              <div className="r-item full-span">
                <span className="r-lbl">Mother's Name</span>
                <span className="r-val">{foundStudent.mother}</span>
              </div>
            </div>

            <div className="recovery-actions">
              <button type="button" className="recovery-btn-cancel" onClick={handleReset}>
                Search Another
              </button>
              <button type="button" className="recovery-btn-submit" onClick={handleUseId}>
                <span>Use ID to Sign In</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotStudentIdModal;
