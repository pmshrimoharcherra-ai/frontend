import React from 'react';
import './AdminSidebar.css';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Award,
  CalendarDays,
  Images,
  FileText,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  toggleSidebarCollapse,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  teachersCount = 0,
  onNavigate,
  onLogout
}) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileSidebarOpen ? 'open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-main">
            <img src="/logo.png" alt="PM SHRI Logo" className="admin-logo" />
            <div className="brand-text">
              <h3>PM SHRI ERP</h3>
              <span>Moharcherra H.S. School</span>
            </div>
          </div>

          {/* Desktop Collapse / Expand Toggle Arrow */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleSidebarCollapse}
            title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            title="Close menu"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
            title="Dashboard"
            data-tooltip="Dashboard"
          >
            <LayoutDashboard size={20} className="nav-icon" />
            <span className="nav-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => handleTabClick('students')}
            title="Students (Class 1-12)"
            data-tooltip="Students (Class 1-12)"
          >
            <GraduationCap size={20} className="nav-icon" />
            <span className="nav-label">Students (Class 1-12)</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => handleTabClick('teachers')}
            title={`Teachers & Staff (${teachersCount})`}
            data-tooltip={`Teachers & Staff (${teachersCount})`}
          >
            <Users size={20} className="nav-icon" />
            <span className="nav-label">Teachers & Staff ({teachersCount})</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'examinations' ? 'active' : ''}`}
            onClick={() => handleTabClick('examinations')}
            title="Examinations & Marks Evaluation"
            data-tooltip="Examinations & Marks Evaluation"
          >
            <Award size={20} className="nav-icon" />
            <span className="nav-label">Examinations</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => handleTabClick('calendar')}
            title="Academic Calendar"
            data-tooltip="Academic Calendar"
          >
            <CalendarDays size={20} className="nav-icon" />
            <span className="nav-label">Academic Calendar</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleTabClick('gallery')}
            title="Media Gallery"
            data-tooltip="Media Gallery"
          >
            <Images size={20} className="nav-icon" />
            <span className="nav-label">Media Gallery</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => handleTabClick('notices')}
            title="Notices & Circulars"
            data-tooltip="Notices & Circulars"
          >
            <FileText size={20} className="nav-icon" />
            <span className="nav-label">Notices & Circulars</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="view-site-btn"
            onClick={() => onNavigate('home')}
            title="View Public Site"
            data-tooltip="View Public Site"
          >
            <ExternalLink size={18} className="footer-icon" />
            <span className="footer-label">View Public Site</span>
          </button>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Sign Out"
            data-tooltip="Sign Out"
          >
            <LogOut size={18} className="footer-icon" />
            <span className="footer-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
