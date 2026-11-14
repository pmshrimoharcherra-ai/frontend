import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Hash,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { formatToIsoDate, formatToDisplayDate } from '../EditTeacherModal/EditTeacherModal';

const ForgotTeacherPasswordModal = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  onPasswordChanged = () => {}
}) => {
  // Step: 1 = Verify (Teacher ID + DOB), 2 = Enter New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form Fields
  const [teacherId, setTeacherId] = useState(initialIdentifier || '');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedTeacher, setVerifiedTeacher] = useState(null);

  const dobPickerRef = useRef(null);

  // Sync initial identifier if changed
  useEffect(() => {
    if (initialIdentifier && !teacherId) {
      setTeacherId(initialIdentifier.toUpperCase());
    }
  }, [initialIdentifier]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      setVerifiedTeacher(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Verify National Teacher ID and Date of Birth
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = teacherId.trim().toUpperCase();
    const cleanDob = dob.trim();

    if (!cleanId) {
      setError('Please enter your Government / National Teacher ID.');
      return;
    }
    if (!cleanDob) {
      setError('Please enter or select your Date of Birth.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/teacher-verify-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: cleanId,
          dob: cleanDob
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Credentials verification failed.');
      }

      setVerifiedTeacher(data.teacher);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Verification failed. Please make sure Teacher ID and DOB match school records.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify and retype.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/teacher-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: verifiedTeacher.teacherId || teacherId.trim().toUpperCase(),
          dob: dob.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setStep(3);
    } catch (err) {
      setError(err.message || 'Network error updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Finish and populate login credentials
  const handleComplete = () => {
    const finalId = verifiedTeacher?.teacherId || teacherId.trim().toUpperCase();
    onPasswordChanged({
      teacherId: finalId,
      newPassword: newPassword.trim()
    });
    onClose();
  };

  return (
    <div className="login-modal-overlay recovery-overlay" onClick={onClose}>
      <div className="recovery-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* ── Modal Header ── */}
        <div className="recovery-modal-header">
          <div className="recovery-icon-badge warning" style={{ background: '#fff7ed', color: '#ea580c', borderColor: '#ffedd5' }}>
            {step === 3 ? <CheckCircle2 size={24} style={{ color: '#16a34a' }} /> : <KeyRound size={22} />}
          </div>
          <h3>{step === 3 ? 'Password Updated!' : step === 2 ? 'Set New Password' : 'Reset Teacher Password'}</h3>
          <p>
            {step === 1 && 'Verify your National Teacher ID and Date of Birth to update your portal password.'}
            {step === 2 && 'Create a new secure password for your Teacher Portal access.'}
            {step === 3 && 'Your new password is now active and synchronized across the portal.'}
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="login-feedback-banner error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} className="feedback-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: VERIFY CREDENTIALS ── */}
        {step === 1 && (
          <form onSubmit={handleVerify} className="recovery-form">
            <div className="recovery-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* National Teacher ID */}
              <div className="form-group full-span">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                  <Hash size={14} style={{ color: '#ea580c' }} />
                  <span>National / Government Teacher ID *</span>
                </label>
                <div className="input-wrapper">
                  <Hash size={16} className="input-icon" style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. TR45208338 or TP00693724"
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value.toUpperCase());
                      if (error) setError('');
                    }}
                    className="form-input font-mono font-bold"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  />
                </div>
              </div>

              {/* Date of Birth (DOB) */}
              <div className="form-group full-span">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                  <Calendar size={14} style={{ color: '#ea580c' }} />
                  <span>Date of Birth (DOB) *</span>
                </label>
                <div
                  className="input-wrapper dob-input-wrapper"
                  onClick={() => {
                    try {
                      dobPickerRef.current?.showPicker?.();
                    } catch (err) {
                      dobPickerRef.current?.focus();
                    }
                  }}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <Calendar size={16} className="input-icon" style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/YYYY e.g. 12/04/1987"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (error) setError('');
                    }}
                    className="form-input dob-text-input font-mono"
                    style={{ paddingRight: '40px' }}
                  />
                  <input
                    type="date"
                    ref={dobPickerRef}
                    value={formatToIsoDate(dob)}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDob(formatToDisplayDate(e.target.value));
                        if (error) setError('');
                      }
                    }}
                    className="dob-native-picker"
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '24px',
                      height: '24px',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        dobPickerRef.current?.showPicker?.();
                      } catch (err) {
                        dobPickerRef.current?.focus();
                      }
                    }}
                    title="Choose Date of Birth from calendar"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#ea580c',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="recovery-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="recovery-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="recovery-btn-submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinning-loader" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Credentials</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: ENTER NEW PASSWORD ── */}
        {step === 2 && verifiedTeacher && (
          <form onSubmit={handleResetPassword} className="recovery-form">
            {/* Verified Teacher Card Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '16px'
                }}
              >
                {verifiedTeacher.name?.charAt(0) || 'T'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                    {verifiedTeacher.name}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      color: '#16a34a',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '1px 6px',
                      borderRadius: '5px'
                    }}
                  >
                    <UserCheck size={11} />
                    Verified
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>
                  <strong>{verifiedTeacher.role || 'Faculty'}</strong> • {verifiedTeacher.subject || 'General'}
                </div>
                <div style={{ fontSize: '11px', color: '#ea580c', fontFamily: 'monospace', fontWeight: '700' }}>
                  ID: {verifiedTeacher.teacherId}
                </div>
              </div>
            </div>

            <div className="recovery-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* New Password */}
              <div className="form-group full-span">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                  <Lock size={14} style={{ color: '#ea580c' }} />
                  <span>New Password *</span>
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <Lock size={16} className="input-icon" style={{ color: '#94a3b8' }} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Enter new password (min. 4 characters)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group full-span">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                  <ShieldCheck size={14} style={{ color: '#ea580c' }} />
                  <span>Confirm New Password *</span>
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <Lock size={16} className="input-icon" style={{ color: '#94a3b8' }} />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Retype new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="recovery-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="recovery-btn-cancel"
                onClick={() => setStep(1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="recovery-btn-submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinning-loader" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Change Password</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 3 && (
          <div className="recovery-result-card" style={{ textAlign: 'center', paddingTop: '8px' }}>
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '16px',
                padding: '20px 16px',
                marginBottom: '20px'
              }}
            >
              <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 10px', display: 'block' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#15803d', margin: '0 0 6px' }}>
                Password Updated Successfully!
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0', lineHeight: '1.5' }}>
                Your portal password for <strong>{verifiedTeacher?.name}</strong> (<code>{verifiedTeacher?.teacherId || teacherId}</code>) has been updated.
              </p>
            </div>

            <button
              type="button"
              className="recovery-btn-submit"
              onClick={handleComplete}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '14px' }}
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotTeacherPasswordModal;
