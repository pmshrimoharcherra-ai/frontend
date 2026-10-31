import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import './LoginModal.css';
import { 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('kiransamanta88@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'teacher', label: 'Teacher', icon: Briefcase },
    { id: 'admin', label: 'Admin', icon: ShieldCheck }
  ];

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setSuccess('');
    if (roleId === 'admin') {
      setIdentifier('kiransamanta88@gmail.com');
    } else {
      setIdentifier('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role: selectedRole
        })
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        // Response was not JSON (e.g., 502/503 HTML gateway error or inactive server)
        throw new Error('Server is currently inactive or unavailable. Please try again after some time.');
      }

      if (!response.ok || !data?.success) {
        if (response.status >= 500) {
          throw new Error('Server is currently inactive or unavailable. Please try again after some time.');
        }
        throw new Error(data?.message || 'Login failed. Please check your credentials.');
      }

      // Save token and user details to localStorage
      localStorage.setItem('pmshri_token', data.token);
      localStorage.setItem('pmshri_user', JSON.stringify(data.user));

      setSuccess(`Welcome, ${data.user.name}! Login successful.`);

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      // Close modal after brief success confirmation
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1200);

    } catch (err) {
      const msg = err?.message || '';
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed') ||
        msg.includes('inactive or unavailable') ||
        msg.includes('port 5000') ||
        err.name === 'TypeError'
      ) {
        setError('Server is currently inactive or unavailable. Please try again after some time.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div 
        className="login-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-logo-wrapper">
            <img src="/logo.png" alt="PM SHRI Logo" className="modal-logo-img" />
          </div>
          <h2 className="modal-title">
            <span className="modal-title-pm">PM </span>
            <span className="modal-title-shri">SHRI</span> Portal Login
          </h2>
          <p className="modal-subtitle">Moharcherra H.S. School ERP System</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                className={`role-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleRoleChange(role.id)}
              >
                <Icon size={16} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error / Success Feedback Banners */}
        {error && (
          <div className="login-feedback-banner error">
            <AlertCircle size={17} className="feedback-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-feedback-banner success">
            <CheckCircle2 size={17} className="feedback-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="modal-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="user-id">
              {selectedRole === 'student' ? 'APAAR ID' : selectedRole === 'teacher' ? 'Teacher ID / Email' : 'Admin Username / Email'}
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="user-id"
                type="text"
                placeholder={
                  selectedRole === 'student' 
                    ? 'Enter 12-digit APAAR ID (e.g. 723387030675)' 
                    : selectedRole === 'teacher' 
                    ? 'Enter Teacher ID (e.g. TR45208338) or Email' 
                    : 'Enter Admin username or email'
                }
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                required
                className="form-input"
              />
            </div>
            {selectedRole === 'student' && (
              <span className="student-login-hint">
                Students can also use their 11-digit PEN Number if APAAR ID is pending.
              </span>
            )}
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label className="form-label" htmlFor="user-password">Password</label>
              {selectedRole === 'student' && (
                <span className="password-format-tag">Format: FirstName + Roll + Class</span>
              )}
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={
                  selectedRole === 'student'
                    ? 'e.g. Kiran01IX (FirstName + Roll + Class)'
                    : selectedRole === 'teacher'
                    ? 'e.g. JoydebPhysics'
                    : 'Enter your password'
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {selectedRole === 'student' && (
              <span className="student-login-hint student-pass-hint">
                Example: <strong>Kiran01IX</strong> (for Kiran, Roll 01, Class IX) or <strong>Aditya03X</strong>
              </span>
            )}
          </div>

          <div className="form-meta">
            <label className="remember-me">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Please contact the school administrative desk to reset your credentials.'); }}>
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinning-loader" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
