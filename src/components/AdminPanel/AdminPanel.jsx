import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './AdminPanel.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminStudents, { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';
import AdminAcademicCalendar from '../AdminAcademicCalendar/AdminAcademicCalendar';
import AdminGallery from '../AdminGallery/AdminGallery';
import AdminTeachers from '../AdminTeachers/AdminTeachers';
import AdminNotices from '../AdminNotices/AdminNotices';
import AdminExaminations from '../AdminExaminations/AdminExaminations';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  BookOpen,
  Settings,
  Bell,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Calendar,
  TrendingUp,
  Download,
  AlertCircle,
  Menu,
  X,
  Phone,
  Mail,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

const AdminPanel = ({ currentUser, onLogout, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    if (path.includes('/student')) return 'students';
    if (path.includes('/teacher')) return 'teachers';
    if (path.includes('/exam')) return 'examinations';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/notice')) return 'notices';
    return 'overview';
  };

  const activeTab = getTabFromPath(location.pathname);

  const setActiveTab = (tab) => {
    const isUnderAdmin = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/gallery');
    let target = '/dashboard';
    if (tab === 'students') target = '/students';
    else if (tab === 'teachers') target = '/teachers';
    else if (tab === 'examinations') target = '/admin/examinations';
    else if (tab === 'calendar') target = '/calendar';
    else if (tab === 'gallery') target = '/admin/gallery';
    else if (tab === 'notices') target = '/admin/notices';
    else if (tab === 'overview') target = '/dashboard';
    
    if (isUnderAdmin && target !== '/admin/gallery') {
      target = `/admin${target === '/dashboard' ? '/dashboard' : target}`;
    }
    navigate(target);
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pmshri_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Dynamic deep-linking states for child tabs
  const [openStudentAddModal, setOpenStudentAddModal] = useState(false);
  const [selectedClassFromDashboard, setSelectedClassFromDashboard] = useState(null);
  const [openNoticeCreateModal, setOpenNoticeCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pmshri_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Real Students Data from DB
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const loadOverviewStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/students`);
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students for overview:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewStudents();
  }, []);

  // Real Notices Data from DB for Overview Dashboard
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const loadOverviewNotices = async () => {
    try {
      setNoticesLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notices`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.warn('Error loading notices for overview:', err);
    } finally {
      setNoticesLoading(false);
    }
  };

  useEffect(() => {
    loadOverviewNotices();
  }, [activeTab]);

  // Official Faculty Data
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);

  const loadTeachers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teachers`);
      const data = await res.json();
      if (data.success && Array.isArray(data.teachers) && data.teachers.length > 0) {
        setTeachers(data.teachers);
      }
    } catch (err) {
      console.warn('API fetch for teachers failed, using official initial teachers:', err);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Refresh entire overview data
  const handleRefreshOverview = async () => {
    setIsRefreshing(true);
    await Promise.all([loadOverviewStudents(), loadOverviewNotices(), loadTeachers()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // --- Dynamic Dashboard Metrics & Analytics ---
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  // Active Teachers
  const activeTeachersCount = useMemo(() => {
    return teachers.filter(t => !t.status || t.status.toLowerCase() === 'active').length;
  }, [teachers]);

  // Dynamic Average Attendance calculation
  const avgAttendance = useMemo(() => {
    if (!students || students.length === 0) return '94.8';
    const parsed = students.map((s) => {
      const val = parseFloat(s.attendance);
      return isNaN(val) ? 92 : val;
    });
    const sum = parsed.reduce((a, b) => a + b, 0);
    return (sum / parsed.length).toFixed(1);
  }, [students]);

  // Dynamic Students Present Today
  const presentStudentsToday = useMemo(() => {
    if (!students || students.length === 0) return 0;
    return Math.round((students.length * parseFloat(avgAttendance)) / 100);
  }, [students, avgAttendance]);

  // Dynamic Pinned Notices Count
  const pinnedNoticesCount = useMemo(() => {
    return notices.filter((n) => n.pinned).length;
  }, [notices]);

  // Class-wise count breakdown
  const classStats = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      const cid = s.classId || s.class;
      if (cid) counts[cid] = (counts[cid] || 0) + 1;
    });
    return counts;
  }, [students]);

  // Recent Student Admissions (sorted by createdAt desc, fallback to index)
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  }, [students]);

  // Quick Action Handlers
  const handleNewAdmissionClick = () => {
    setSelectedClassFromDashboard(null);
    setOpenStudentAddModal(true);
    setActiveTab('students');
  };

  const handlePostNoticeClick = () => {
    setOpenNoticeCreateModal(true);
    setActiveTab('notices');
  };

  const handleOpenClassView = (classId) => {
    setSelectedClassFromDashboard(classId);
    setOpenStudentAddModal(false);
    setActiveTab('students');
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          // Reset deep link flags when navigating via sidebar
          setOpenStudentAddModal(false);
          setSelectedClassFromDashboard(null);
          setOpenNoticeCreateModal(false);
          setActiveTab(tab);
        }}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        teachersCount={teachers.length}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            {/* Mobile Open Toggle */}
            <button 
              type="button"
              className="mobile-sidebar-toggle" 
              onClick={() => setMobileSidebarOpen(true)}
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Quick Toggle Button */}
            <button 
              type="button"
              className="desktop-sidebar-toggle" 
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            <div className="breadcrumb">
              <h2>PM SHRI School Admin Portal</h2>
              <span className="session-badge">Session: 2026-2027</span>
            </div>
          </div>

          <div className="topbar-right">
            <button 
              type="button" 
              className={`topbar-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefreshOverview}
              title="Refresh Live Data"
              aria-label="Refresh Data"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>

            <div className="admin-profile-badge">
              <div className="avatar-circle">
                <ShieldCheck size={18} />
              </div>
              <div className="profile-details">
                <span className="profile-name">{currentUser?.name || 'Kiran Samanta'}</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>

            <button className="topbar-logout-btn" onClick={onLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="admin-content-area">
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Welcome Banner */}
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h3>Welcome to the PM SHRI Administration Portal</h3>
                  <p>
                    Manage student admissions, faculty roster, examination schedules, and public notices in alignment with NEP 2020 guidelines for PM SHRI Moharcherra H.S. School.
                  </p>
                </div>
                <div className="quick-banner-actions">
                  <button className="action-btn-primary" onClick={handleNewAdmissionClick}>
                    <Plus size={16} />
                    <span>+ New Admission</span>
                  </button>
                  <button className="action-btn-secondary" onClick={handlePostNoticeClick}>
                    <Bell size={16} />
                    <span>Post Notice</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Stat Cards Grid */}
              <div className="stats-grid">
                {/* Total Enrolled Students Card */}
                <div 
                  className="stat-card clickable-stat-card" 
                  onClick={() => {
                    setSelectedClassFromDashboard(null);
                    setOpenStudentAddModal(false);
                    setActiveTab('students');
                  }}
                  title="Click to view all enrolled students"
                >
                  <div className="stat-icon-wrapper students">
                    <GraduationCap size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Enrolled Students</span>
                    <h3 className="stat-value">
                      {studentsLoading ? '...' : totalStudents.toLocaleString('en-IN')}
                    </h3>
                    <span className="stat-subtext positive">
                      {totalStudents > 0 ? `${totalStudents} Active Students Across Classes` : 'Live Database Sync'}
                    </span>
                  </div>
                </div>

                {/* Teaching Staff Card */}
                <div 
                  className="stat-card clickable-stat-card" 
                  onClick={() => setActiveTab('teachers')}
                  title="Click to view teaching staff roster"
                >
                  <div className="stat-icon-wrapper teachers">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Teaching Staff</span>
                    <h3 className="stat-value">{totalTeachers}</h3>
                    <span className="stat-subtext">
                      {activeTeachersCount} Official Faculty & Staff Roster
                    </span>
                  </div>
                </div>

                {/* Today's Attendance Card */}
                <div 
                  className="stat-card clickable-stat-card"
                  onClick={() => {
                    setSelectedClassFromDashboard(null);
                    setOpenStudentAddModal(false);
                    setActiveTab('students');
                  }}
                  title="Click to view student attendance records"
                >
                  <div className="stat-icon-wrapper attendance">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Today's Attendance</span>
                    <h3 className="stat-value">{avgAttendance}%</h3>
                    <span className="stat-subtext positive">
                      {presentStudentsToday.toLocaleString('en-IN')} Students Present Today
                    </span>
                  </div>
                </div>

                {/* Active School Notices Card */}
                <div 
                  className="stat-card clickable-stat-card" 
                  onClick={() => {
                    setOpenNoticeCreateModal(false);
                    setActiveTab('notices');
                  }}
                  title="Click to manage official notices"
                >
                  <div className="stat-icon-wrapper notices">
                    <FileText size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Active School Notices</span>
                    <h3 className="stat-value">
                      {noticesLoading ? '...' : notices.length}
                    </h3>
                    <span className="stat-subtext">
                      {pinnedNoticesCount} Pinned on Public Website
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Class-wise Distribution Breakdown */}
              <div className="dashboard-section-card class-distribution-section">
                <div className="section-card-header">
                  <div>
                    <h4>Class-Wise Student Distribution</h4>
                    <p>Real-time strength breakdown across primary, elementary, secondary, and higher secondary wings</p>
                  </div>
                  <button 
                    className="card-link-btn"
                    onClick={() => {
                      setSelectedClassFromDashboard(null);
                      setOpenStudentAddModal(false);
                      setActiveTab('students');
                    }}
                  >
                    Manage Classes <ChevronRight size={14} />
                  </button>
                </div>
                <div className="classes-pills-grid">
                  {(SCHOOL_CLASSES || []).map((cls) => {
                    const count = classStats[cls.id] || 0;
                    return (
                      <div 
                        key={cls.id} 
                        className="class-badge-item"
                        onClick={() => handleOpenClassView(cls.id)}
                        title={`Click to view students in ${cls.name}`}
                      >
                        <div className="class-badge-top">
                          <span className="class-name-text">{cls.name}</span>
                          <span className="class-wing-pill">{cls.wing.split(' ')[0]}</span>
                        </div>
                        <div className="class-badge-bottom">
                          <span className="class-count-number">{count}</span>
                          <span className="class-count-label">Students</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two Column Section: Recent Students & Recent Notices */}
              <div className="dashboard-columns">
                {/* Recent Students Table */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h4>Recent Student Admissions</h4>
                      <p>Latest enrollments for the 2026-27 batch</p>
                    </div>
                    <button 
                      className="card-link-btn" 
                      onClick={() => {
                        setSelectedClassFromDashboard(null);
                        setOpenStudentAddModal(false);
                        setActiveTab('students');
                      }}
                    >
                      View All Students <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Class</th>
                          <th>Roll</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentStudents.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty-table-cell">
                              {studentsLoading ? 'Loading student records...' : 'No enrolled students found.'}
                            </td>
                          </tr>
                        ) : (
                          recentStudents.map((s) => (
                            <tr 
                              key={s._id || s.id || s.studentId} 
                              className="clickable-row"
                              onClick={() => {
                                if (s.classId) {
                                  handleOpenClassView(s.classId);
                                } else {
                                  setActiveTab('students');
                                }
                              }}
                              title="Click to view in Students Manager"
                            >
                              <td className="code-font">{s.studentId || s.id}</td>
                              <td className="bold-font">{s.name}</td>
                              <td>
                                <span className="class-pill">
                                  {s.className || s.classId || s.class || 'Class X'}
                                </span>
                              </td>
                              <td>{s.roll || '-'}</td>
                              <td>
                                <span className={`status-pill ${s.status === 'Enrolled' || !s.status ? 'active' : ''}`}>
                                  {s.status || 'Enrolled'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notices Manager Preview */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h4>Published Notices</h4>
                      <p>Official announcements on the school website</p>
                    </div>
                    <button 
                      className="card-link-btn" 
                      onClick={() => {
                        setOpenNoticeCreateModal(false);
                        setActiveTab('notices');
                      }}
                    >
                      Manage Notices <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="notices-list">
                    {notices.length === 0 ? (
                      <div className="empty-notices-box">
                        <FileText size={32} className="empty-icon" />
                        <p>{noticesLoading ? 'Loading notices...' : 'No notices published yet.'}</p>
                        <button className="action-btn-primary small-btn" onClick={handlePostNoticeClick}>
                          <Plus size={14} /> Post First Notice
                        </button>
                      </div>
                    ) : (
                      notices.slice(0, 5).map((n) => (
                        <div key={n._id || n.id} className="notice-mini-item">
                          <div className="notice-meta">
                            <span className="notice-badge">{n.category || 'General'}</span>
                            <span className="notice-date">
                              {n.publishDate || (n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today')}
                            </span>
                          </div>
                          <h5 className="notice-title">{n.title}</h5>
                          <div className="notice-footer">
                            <span className="notice-audience">
                              Audience: {n.audience || 'All Students & Guardians'}
                            </span>
                            {n.pinned && <span className="pinned-tag">Pinned</span>}
                            {(n.pdfUrl || n._id) && (
                              <a
                                href={`${API_BASE_URL}/api/notices/${n._id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="notice-download-link"
                                onClick={(e) => e.stopPropagation()}
                                title="Download Notice PDF"
                              >
                                <Download size={13} />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS MANAGEMENT (CLASS 1 - 12) */}
          {activeTab === 'students' && (
            <AdminStudents 
              initialOpenAdd={openStudentAddModal}
              initialSelectedClassId={selectedClassFromDashboard}
            />
          )}

          {/* TAB 3: TEACHERS & STAFF */}
          {activeTab === 'teachers' && (
            <AdminTeachers onTeacherCountChange={(cnt) => {
              if (teachers.length !== cnt) {
                setTeachers(prev => prev.length === cnt ? prev : [...prev]);
              }
            }} />
          )}

          {/* TAB 3B: EXAMINATIONS & MARKS EVALUATION */}
          {activeTab === 'examinations' && (
            <AdminExaminations />
          )}

          {/* TAB 4: ACADEMIC CALENDAR & HOLIDAYS */}
          {activeTab === 'calendar' && (
            <AdminAcademicCalendar />
          )}

          {/* TAB 5: MEDIA GALLERY */}
          {activeTab === 'gallery' && (
            <AdminGallery />
          )}

          {/* TAB 6: NOTICES & CIRCULARS */}
          {activeTab === 'notices' && (
            <AdminNotices 
              initialOpenModal={openNoticeCreateModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;