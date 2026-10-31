import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  CalendarCheck,
  BookOpen,
  Calendar,
  User,
  LogOut
} from 'lucide-react';
import './StudentSidebar.css';

const StudentSidebar = ({ activeStudent, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { id: 'examinations', label: 'Examinations & Report Card', path: '/student/examinations', icon: Award },
    { id: 'attendance', label: 'Attendance Register', path: '/student/attendance', icon: CalendarCheck },
    { id: 'subjects', label: 'Subjects & Faculty', path: '/student/subjects', icon: BookOpen },
    { id: 'calendar', label: 'Academic Calendar', path: '/student/calendar', icon: Calendar },
    { id: 'profile', label: 'My ERP Profile', path: '/student/profile', icon: User }
  ];

  const currentPath = location.pathname;

  return (
    <aside className="sp-sidebar">
      {/* Student Profile Card in Sidebar */}
      <div className="sp-sidebar-profile">
        <div className="sp-profile-avatar-wrap">
          <div className="sp-profile-avatar">
            {activeStudent?.name ? activeStudent.name.charAt(0) : 'S'}
          </div>
          <span className={`sp-gender-dot ${activeStudent?.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}></span>
        </div>
        <h3 className="sp-profile-name">{activeStudent?.name || 'Student'}</h3>
        <div className="sp-profile-chips">
          <span className="sp-chip-class">{activeStudent?.className || 'Class VIII'}</span>
          <span className="sp-chip-roll">Roll #{activeStudent?.roll || '01'}</span>
        </div>
        <div className="sp-profile-apaar">
          <span className="sp-apaar-lbl">APAAR ID:</span>
          <span className="sp-apaar-val font-mono">{activeStudent?.apaarId || 'Pending'}</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sp-nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.id === 'dashboard' && currentPath === '/student');

          return (
            <button
              key={item.id}
              type="button"
              className={`sp-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Sign Out at bottom of sidebar */}
      <div className="sp-sidebar-footer">
        <button type="button" className="sp-nav-logout" onClick={onLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
