import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, KeyRound, CheckCircle2, AlertCircle, Copy, Check, ArrowRight, Loader2, Hash, Calendar, GraduationCap, Eye, EyeOff, User } from 'lucide-react';

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

const ForgotStudentPasswordModal = ({ isOpen, onClose, onSelectPassword, onSetIdentifier }) => {
  const [classId, setClassId] = useState('class-10');
  const [roll, setRoll] = useState('');
  const [father, setFather] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPass, setShowPass] = useState(true);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/student-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          roll: roll.trim(),
          father: father.trim(),
          dob: dob.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to verify details. Please make sure Class, Roll, Father Name and DOB are accurate.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePassword = () => {
    if (result) {
      if (onSelectPassword && result.password) {
        onSelectPassword(result.password);
      }
      if (onSetIdentifier && result.apaarId) {
        onSetIdentifier(result.apaarId);
      }
    }
    onClose();
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="login-modal-overlay recovery-overlay" onClick={onClose}>
      <div className="recovery-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="recovery-modal-header">
          <div className="recovery-icon-badge warning">
            <KeyRound size={22} />
          </div>
          <h3>Student Password Recovery</h3>
          <p>Verify your enrollment credentials to retrieve your portal password</p>
        </div>

        {error && (
          <div className="login-feedback-banner error">
            <AlertCircle size={16} className="feedback-icon" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="recovery-form">
            <div className="recovery-form-grid">
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

              {/* Father's Name */}
              <div className="form-group full-span">
                <label className="form-label">Father's Name (or Guardian) *</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter father or guardian name as per records"
                    value={father}
                    onChange={(e) => setFather(e.target.value)}
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Retrieve Password</span>
                    <KeyRound size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="recovery-result-card">
            <div className="result-success-badge">
              <CheckCircle2 size={18} />
              <span>Identity Verified</span>
            </div>

            <div className="password-display-hero">
              <span className="p-desc">Your Student Portal Password:</span>
              <div className="p-box">
                <span className="p-pass font-mono">
                  {showPass ? result.password : '••••••••••'}
                </span>
                <div className="p-controls">
                  <button
                    type="button"
                    className="p-btn"
                    onClick={() => setShowPass(!showPass)}
                    title={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    className="p-btn copy"
                    onClick={() => handleCopy(result.password)}
                    title="Copy password"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <p className="student-ref-info">
                Registered for <strong>{result.studentName}</strong> ({result.className}, Roll #{result.roll})
              </p>
            </div>

            <div className="recovery-actions">
              <button type="button" className="recovery-btn-cancel" onClick={handleReset}>
                Verify Another
              </button>
              <button type="button" className="recovery-btn-submit" onClick={handleUsePassword}>
                <span>Apply & Sign In</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotStudentPasswordModal;
