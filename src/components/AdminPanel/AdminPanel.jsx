import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './AdminPanel.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminStudents from '../AdminStudents/AdminStudents';
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
  PanelLeftOpen
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);

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

  useEffect(() => {
    const loadOverviewStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students`);
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Error fetching students for overview:', err);
      }
    };
    loadOverviewStudents();
  }, []);

  // Real Notices Data from DB for Overview Dashboard
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const loadOverviewNotices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notices`);
        const data = await res.json();
        if (data.success && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      } catch (err) {
        console.warn('Error loading notices for overview:', err);
      }
    };
    loadOverviewNotices();
  }, [activeTab]);

  // Official Faculty Data (19 Teachers)
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);

  useEffect(() => {
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
    loadTeachers();
  }, []);

  // Form states for modals
  const [newStudent, setNewStudent] = useState({ name: '', class: 'Class X-A', roll: '', guardian: '', phone: '' });
  const [newNotice, setNewNotice] = useState({ title: '', category: 'Academic', audience: 'All Students' });

  // Filter students based on search and selected class
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.roll.includes(searchQuery) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || s.class.startsWith(selectedClass);
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.roll) return;
    const studentEntry = {
      id: `PMS-2026-${String(students.length + 1).padStart(3, '0')}`,
      name: newStudent.name,
      class: newStudent.class,
      roll: newStudent.roll,
      guardian: newStudent.guardian || 'Guardian',
      phone: newStudent.phone || '+91 98765 00000',
      attendance: '100%',
      status: 'Enrolled'
    };
    setStudents([studentEntry, ...students]);
    setNewStudent({ name: '', class: 'Class X-A', roll: '', guardian: '', phone: '' });
    setShowAddStudentModal(false);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student record?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    const noticeEntry = {
      id: Date.now(),
      title: newNotice.title,
      category: newNotice.category,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      audience: newNotice.audience,
      pinned: false
    };
    setNotices([noticeEntry, ...notices]);
    setNewNotice({ title: '', category: 'Academic', audience: 'All Students' });
    setShowAddNoticeModal(false);
  };

  const handleDeleteNotice = (id) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  return (
    <div className="admin-layout">
      {/* Separate Admin Sidebar Component */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
                  <button className="action-btn-primary" onClick={() => setActiveTab('students')}>
                    <Plus size={16} />
                    <span>New Admission</span>
                  </button>
                  <button className="action-btn-secondary" onClick={() => setShowAddNoticeModal(true)}>
                    <Bell size={16} />
                    <span>Post Notice</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper students">
                    <GraduationCap size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Enrolled Students</span>
                    <h3 className="stat-value">1,248</h3>
                    <span className="stat-subtext positive">+5.4% from last academic session</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('teachers')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper teachers">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Teaching Staff</span>
                    <h3 className="stat-value">{teachers.length}</h3>
                    <span className="stat-subtext">{teachers.length} Official Teachers Roster</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper attendance">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Today's Attendance</span>
                    <h3 className="stat-value">95.8%</h3>
                    <span className="stat-subtext positive">1,196 Students Present Today</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper notices">
                    <FileText size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Active School Notices</span>
                    <h3 className="stat-value">{notices.length}</h3>
                    <span className="stat-subtext">2 Pinned on Public Website</span>
                  </div>
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
                    <button className="card-link-btn" onClick={() => setActiveTab('students')}>
                      View All Students
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
                        {students.slice(0, 5).map((s) => (
                          <tr key={s.id}>
                            <td className="code-font">{s.id}</td>
                            <td className="bold-font">{s.name}</td>
                            <td><span className="class-pill">{s.className || s.class || 'Class VI'}</span></td>
                            <td>{s.roll}</td>
                            <td><span className="status-pill active">{s.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notices Manager Preview */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h4>Published Notices</h4>
                      <p>Announcements active on the school website</p>
                    </div>
                    <button className="card-link-btn" onClick={() => setActiveTab('notices')}>
                      Manage Notices
                    </button>
                  </div>
                  <div className="notices-list">
                    {notices.map((n) => (
                      <div key={n._id || n.id} className="notice-mini-item">
                        <div className="notice-meta">
                          <span className="notice-badge">{n.category || 'General'}</span>
                          <span className="notice-date">{n.publishDate || n.date}</span>
                        </div>
                        <h5 className="notice-title">{n.title}</h5>
                        <div className="notice-footer">
                          <span className="notice-audience">Audience: {n.audience || 'All Students'}</span>
                          {n.pinned && <span className="pinned-tag">Pinned</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS MANAGEMENT (CLASS 1 - 12) */}
          {activeTab === 'students' && (
            <AdminStudents />
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
            <AdminNotices />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
