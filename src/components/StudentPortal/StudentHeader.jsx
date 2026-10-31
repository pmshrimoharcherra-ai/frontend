import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, LogOut } from 'lucide-react';
import './StudentHeader.css';

const StudentHeader = ({ activeStudent, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="sp-top-header">
      <div className="sp-header-left">
        <div className="sp-logo-wrap">
          <img src="/logo.png" alt="PM SHRI Logo" className="sp-logo-img" />
        </div>
        <div className="sp-branding">
          <div className="sp-school-title">
            <span className="sp-pm">PM </span>
            <span className="sp-shri">SHRI </span>
            <span className="sp-school-name">Moharcherra H.S. School</span>
          </div>
          <div className="sp-portal-badge-row">
            <span className="sp-portal-badge">Student's Portal</span>
            <span className="sp-session-tag">Academic Session: 2026–2027</span>
          </div>
        </div>
      </div>

      <div className="sp-header-right">
        <button 
          type="button" 
          className="sp-public-btn"
          onClick={() => navigate('/')}
          title="Return to Public Website"
        >
          <Globe size={14} />
          <span>Public Website</span>
        </button>

        <div className="sp-user-badge">
          <div className="sp-user-avatar">
            {activeStudent?.name ? activeStudent.name.charAt(0) : 'S'}
          </div>
          <div className="sp-user-meta">
            <span className="sp-user-role">STUDENT</span>
            <span className="sp-user-name">{activeStudent?.name}</span>
          </div>
        </div>

        <button 
          type="button" 
          className="sp-signout-btn"
          onClick={onLogout}
          title="Sign Out from Portal"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default StudentHeader;
