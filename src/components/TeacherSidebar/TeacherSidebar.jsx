import React from 'react';
import './TeacherSidebar.css';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  LogOut,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  Laptop
} from 'lucide-react';

const TeacherSidebar = ({
  activeTab = 'dashboard',
  onSelectTab = () => {},
  sidebarCollapsed = false,
  toggleSidebarCollapse = () => {},
  mobileSidebarOpen = false,
  setMobileSidebarOpen = () => {},
  teacherName = 'Faculty Member',
  assignedClassId = '',
  assignedClassName = '',
  primarySubject = 'General',
  teacherRole = '',
  teachingAssignments = [],
  onLogout = () => {},
  onNavigateHome = () => {}
}) => {
  const handleTabClick = (tab) => {
    onSelectTab(tab);
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const isClassTeacher = Boolean(assignedClassId || assignedClassName);

  const isVocationalSubject = (str = '') => {
    const s = String(str || '').toLowerCase();
    return /\b(it|ites)\b/i.test(s) || s.includes('information technology') || s.includes('vocational');
  };

  const isVocationalTeacher = Boolean(
    teacherRole === 'VT' ||
    /\bvt\b/i.test(String(teacherRole || '')) ||
    String(teacherRole || '').toLowerCase().includes('vocational') ||
    isVocationalSubject(primarySubject) ||
    (Array.isArray(teachingAssignments) && teachingAssignments.some(a => 
      isVocationalSubject(a?.subject)
    )) ||
    String(teacherName || '').toLowerCase().includes('kiran samanta')
  );

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    ...(isClassTeacher
      ? [
          {
            id: 'attendance',
            label: 'Attendance',
            icon: CalendarCheck,
            badge: assignedClassName ? assignedClassName.split(' (')[0] : null,
            badgeTitle: 'Assigned Class Register'
          },
          {
            id: 'students',
            label: "Student's Database",
            icon: Users,
            badge: assignedClassName ? assignedClassName.split(' (')[0] : null,
            badgeTitle: 'Assigned Class Students'
          }
        ]
      : []),
    ...(isVocationalTeacher
      ? [
          {
            id: 'vocational-students',
            label: 'Vocational Students',
            icon: Laptop,
            badge: 'IT/ITeS',
            badgeTitle: 'All Vocational Students Database'
          }
        ]
      : []),
    {
      id: 'examinations',
      label: 'Examinations',
      icon: Award,
      badge: 'Evaluation',
      badgeTitle: 'Marks & Assessment'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="teacher-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Teacher Sidebar */}
      <aside
        className={`teacher-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileSidebarOpen ? 'open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="teacher-sidebar-brand">
          <div className="teacher-brand-main">
            <img src="/logo.png" alt="PM SHRI Logo" className="teacher-brand-logo" />
            <div className="teacher-brand-titles">
              <h3>TEACHER'S PORTAL</h3>
              <span>PM SHRI Moharcherra</span>
            </div>
          </div>

          {/* Desktop Collapse / Expand Toggle Arrow */}
          <button
            type="button"
            className="teacher-sidebar-collapse-btn"
            onClick={toggleSidebarCollapse}
            title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            className="teacher-sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            title="Close menu"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="teacher-sidebar-nav">
          <div className="nav-section-label">
            <span>PORTAL NAVIGATION</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`teacher-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
                title={item.label}
              >
                <div className="nav-item-icon-wrap">
                  <Icon size={19} className="nav-item-icon" />
                </div>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && (
                  <span
                    className={`nav-item-badge ${isActive ? 'badge-active' : ''}`}
                    title={item.badgeTitle || ''}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Quick Faculty Card & Actions */}
        <div className="teacher-sidebar-footer">
          {/* Faculty Mini Card (Visible when expanded) */}
          <div className="teacher-footer-user-card">
            <div className="footer-avatar">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div className="footer-user-meta">
              <span className="footer-user-name">{teacherName}</span>
              <span className="footer-user-role">
                {assignedClassName
                  ? `Class Teacher • ${assignedClassName}`
                  : primarySubject && primarySubject !== 'General'
                  ? `${primarySubject} Faculty`
                  : 'Faculty Member'}
              </span>
            </div>
          </div>

          {/* Public Portal Button */}
          <button
            type="button"
            className="teacher-footer-btn site-btn"
            onClick={onNavigateHome}
            title="View Public Portal"
          >
            <Globe size={16} />
            <span className="footer-btn-label">Public Website</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            className="teacher-footer-btn logout-btn"
            onClick={onLogout}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span className="footer-btn-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
