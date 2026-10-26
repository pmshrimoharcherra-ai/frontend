import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './TeacherDashboard.css';
import TeacherSidebar from '../TeacherSidebar/TeacherSidebar';
import TeacherExaminations from '../TeacherExaminations/TeacherExaminations';
import {
  Users,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Save,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Check,
  Globe,
  TrendingUp,
  UserCheck,
  UserX,
  ShieldCheck,
  Info,
  Menu,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronDown,
  Layers,
  ArrowRight,
  CheckSquare,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';

const API_STUDENTS = `${API_BASE_URL}/api/students`;

// Helper to determine if a class or student is in Class IX (Board Registration year)
const isClassIX = (classIdentifier) => {
  if (!classIdentifier) return false;
  const s = String(classIdentifier).trim().toLowerCase();
  return (
    s === 'class-9' ||
    s === 'class-ix' ||
    s === 'class 9' ||
    s === 'class ix' ||
    s === '9' ||
    s === 'ix' ||
    s.includes('class ix') ||
    s.includes('class-ix') ||
    s.includes('class 9') ||
    s.includes('class-9')
  );
};

const TeacherDashboard = ({ currentUser, onLogout, defaultTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read stored user as fallback if props haven't populated yet
  const storedUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('pmshri_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const activeUser = currentUser || storedUser;

  // Active Tab: 'dashboard' | 'attendance' | 'examinations'
  const getTabFromPath = (path) => {
    if (path.includes('/attendance')) return 'attendance';
    if (path.includes('/examinations') || path.includes('/exams')) return 'examinations';
    return defaultTab || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/teacher/dashboard');
    else if (tab === 'attendance') navigate('/teacher/attendance');
    else if (tab === 'examinations') navigate('/teacher/examinations');
  };

  // Sidebar collapse & mobile drawer state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pmshri_teacher_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pmshri_teacher_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut (Ctrl+B / Cmd+B) to toggle sidebar
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

  // If user data in props doesn't have assignedClassId, try to pull fresh teacher info
  const [teacherData, setTeacherData] = useState(activeUser || {});
  const [assignedClassId, setAssignedClassId] = useState(
    activeUser?.assignedClassId || 'class-9'
  );
  const [assignedClassName, setAssignedClassName] = useState(
    activeUser?.assignedClassName || 'Class IX'
  );

  // Student list state for attendance
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected date for attendance (defaults to current date YYYY-MM-DD)
  const todayIso = new Date().toISOString().split('T')[0];
  const [attendanceDate, setAttendanceDate] = useState(todayIso);

  // Today's attendance state map: { [studentId]: 'present' | 'absent' | 'late' }
  const [dailyAttendance, setDailyAttendance] = useState({});

  // Filtering & Search for Attendance
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL' | 'Boy' | 'Girl'

  // Saving state & feedback for Attendance
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Class IX check for Attendance (Board Registration year)
  const isAttClassIX = useMemo(() => {
    return isClassIX(assignedClassId) || (students.length > 0 && isClassIX(students[0]?.classId));
  }, [assignedClassId, students]);

  // Fetch teacher's latest profile to keep assignedClass and teaching assignments in sync
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      const teacherId = activeUser?.teacherId || activeUser?.id;
      if (!teacherId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}`);
        const data = await res.json();
        if (data.success && data.teacher) {
          setTeacherData(data.teacher);
          if (data.teacher.assignedClassId) {
            setAssignedClassId(data.teacher.assignedClassId);
            setAssignedClassName(data.teacher.assignedClassName || 'Class IX');
          }
        }
      } catch (err) {
        console.warn('Could not sync teacher profile from server:', err);
      }
    };

    fetchTeacherProfile();
  }, [activeUser]);

  // Fetch students for attendance (assigned class)
  const fetchClassStudents = async (classId) => {
    if (!classId) {
      setLoading(false);
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_STUDENTS}?classId=${classId}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);

        // Initialize today's attendance map (default all enrolled to present)
        const initialStatus = {};
        data.students.forEach((s) => {
          const id = s.studentId || s.id;
          initialStatus[id] = 'present';
        });
        setDailyAttendance(initialStatus);
      } else {
        throw new Error(data.message || 'Failed to fetch student roster.');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Unable to load class students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignedClassId) {
      fetchClassStudents(assignedClassId);
    } else {
      setLoading(false);
    }
  }, [assignedClassId]);

  // Toggle single student status
  const handleToggleStatus = (studentId, status) => {
    setDailyAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setSaveSuccess(false);
  };

  // Mark all students present
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      const id = s.studentId || s.id;
      updated[id] = 'present';
    });
    setDailyAttendance(updated);
    setSaveSuccess(false);
  };

  // Mark all students absent
  const handleMarkAllAbsent = () => {
    const updated = {};
    students.forEach((s) => {
      const id = s.studentId || s.id;
      updated[id] = 'absent';
    });
    setDailyAttendance(updated);
    setSaveSuccess(false);
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (students.length === 0) return;

    try {
      setSaving(true);
      setSaveMessage('');

      const updatedStudentsPayload = students.map((s) => {
        const id = s.studentId || s.id;
        const status = dailyAttendance[id] || 'present';

        const currentPctNum = parseInt(s.attendance, 10) || 94;
        let newPct = currentPctNum;
        if (status === 'present') {
          newPct = Math.min(100, currentPctNum + (currentPctNum < 98 ? 1 : 0));
        } else if (status === 'absent') {
          newPct = Math.max(70, currentPctNum - 1);
        }

        return {
          studentId: id,
          attendance: `${newPct}%`
        };
      });

      const res = await fetch(`${API_STUDENTS}/bulk-attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedStudentsPayload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save attendance records.');
      }

      setSaveSuccess(true);
      setSaveMessage(`Attendance recorded for ${students.length} students on ${attendanceDate}!`);

      setTimeout(() => {
        fetchClassStudents(assignedClassId);
      }, 500);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      alert(`Error saving attendance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Filtered students for attendance display
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.roll?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.enrollmentNo?.toLowerCase().includes(q) ||
        s.registrationNo?.toLowerCase().includes(q);

      const matchesGender =
        genderFilter === 'ALL' ||
        (genderFilter === 'Boy' && (s.gender === 'Boy' || !s.gender)) ||
        (genderFilter === 'Girl' && s.gender === 'Girl');

      return matchesSearch && matchesGender;
    });
  }, [students, searchQuery, genderFilter]);

  // Dynamic statistics for today's register
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    students.forEach((s) => {
      const id = s.studentId || s.id;
      const st = dailyAttendance[id] || 'present';
      if (st === 'present') presentCount++;
      else if (st === 'absent') absentCount++;
      else if (st === 'late') lateCount++;
    });

    const total = students.length;
    const rate = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

    return {
      total,
      presentCount,
      absentCount,
      lateCount,
      rate
    };
  }, [students, dailyAttendance]);

  // ── Available Classes & Subjects for Examinations ──
  const teachingList = useMemo(() => {
    const list = Array.isArray(teacherData?.teachingAssignments)
      ? [...teacherData.teachingAssignments]
      : [];
    if (assignedClassId && !list.some((a) => a.classId === assignedClassId)) {
      list.unshift({
        classId: assignedClassId,
        className: assignedClassName || 'Class IX',
        subject: teacherData?.subject || 'Primary Subject'
      });
    }
    return list;
  }, [teacherData, assignedClassId, assignedClassName]);

  // Unauthenticated Guard
  if (!activeUser) {
    return (
      <div className="teacher-portal-layout">
        <main className="teacher-auth-required-screen">
          <div className="auth-required-card">
            <div className="auth-card-icon">
              <ShieldCheck size={32} />
            </div>
            <h3>Faculty Authentication Required</h3>
            <p>
              Please sign in with your Teacher ID (e.g. <code>TR76404582</code> or <code>TR45208338</code>) or official email to access the Teacher Portal.
            </p>
            <div className="auth-card-actions">
              <button
                type="button"
                className="save-attendance-btn"
                onClick={() => navigate('/login')}
              >
                Sign In to Teacher Portal
              </button>
              <button
                type="button"
                className="teacher-nav-pill-btn"
                onClick={() => navigate('/')}
              >
                Go to Public Website
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const teacherName = teacherData?.name || activeUser?.name || 'Faculty Member';
  const teacherSubject = teacherData?.subject || activeUser?.subject || 'English';
  const teacherIdCode = teacherData?.teacherId || activeUser?.teacherId || 'TR76404582';

  return (
    <div className="teacher-portal-layout">
      {/* =========================================================================
          TEACHER SIDEBAR (Dashboard, Attendance, Examinations)
         ========================================================================= */}
      <TeacherSidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        teacherName={teacherName}
        assignedClassName={assignedClassName}
        primarySubject={teacherSubject}
        onLogout={onLogout}
        onNavigateHome={() => navigate('/')}
      />

      {/* =========================================================================
          RIGHT CONTENT PANE (Header + Main Tab Contents)
         ========================================================================= */}
      <div className="teacher-content-pane">
        {/* Top Navbar */}
        <header className="teacher-top-navbar">
          <div className="teacher-navbar-inner">
            {/* Left: Mobile Drawer Trigger, Desktop Sidebar Toggle & Active Breadcrumb */}
            <div className="teacher-header-left">
              <button
                type="button"
                className="teacher-mobile-menu-btn"
                onClick={() => setMobileSidebarOpen(true)}
                title="Open menu"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <button
                type="button"
                className="teacher-desktop-sidebar-toggle"
                onClick={toggleSidebarCollapse}
                title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
              </button>

              <div className="teacher-breadcrumb-group">
                <span className="breadcrumb-root">FACULTY PORTAL</span>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">
                  {activeTab === 'dashboard' && 'Dashboard Overview'}
                  {activeTab === 'attendance' && 'Class Attendance Register'}
                  {activeTab === 'examinations' && 'Examinations & Marks Evaluation'}
                </span>
              </div>
            </div>

            {/* Right: Public Website, Date Pill & Exact Teacher Badge */}
            <div className="teacher-header-actions">
              <button
                type="button"
                className="teacher-nav-pill-btn"
                onClick={() => navigate('/')}
                title="View Public School Website"
              >
                <Globe size={14} />
                <span>Public Portal</span>
              </button>

              <div className="teacher-date-badge">
                <Calendar size={14} className="calendar-mini-icon" />
                <span>
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Exact Teacher Badge from User Screenshot */}
              <div className="user-logged-pill teacher-header-pill">
                <div className="user-logged-info">
                  <span className="user-logged-role">TEACHER</span>
                  <span className="user-logged-name">{teacherName}</span>
                </div>
                <button
                  type="button"
                  className="logout-icon-btn"
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="teacher-dashboard-main">
          {/* =====================================================================
              TAB 1: DASHBOARD OVERVIEW
             ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="tab-pane-fade-in">
              {/* Welcome Faculty Banner */}
              <div className="teacher-welcome-banner">
                <div className="welcome-banner-content">
                  <div className="welcome-avatar-wrap">
                    <div className="welcome-avatar">
                      {teacherName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="welcome-text-col">
                    <div className="welcome-title-row">
                      <h2>Welcome, {teacherName}</h2>
                      <span className="welcome-teacher-id font-mono">{teacherIdCode}</span>
                      <span className="welcome-status-tag">
                        <ShieldCheck size={13} />
                        <span>Authorized Faculty</span>
                      </span>
                    </div>
                    <p className="welcome-subtitle">
                      {assignedClassId ? (
                        <>
                          You are the <strong>Class Teacher</strong> of <strong>{assignedClassName || 'Class IX'}</strong>. You manage daily roll call, verify attendance records and submit class registers for this class.
                        </>
                      ) : (
                        <>Welcome to the Faculty Portal. You are currently not assigned as a Class Teacher for attendance.</>
                      )}
                    </p>
                    <div className="welcome-meta-chips">
                      <div className="meta-chip">
                        <BookOpen size={13} />
                        <span>Primary Subject: <strong>{teacherSubject}</strong></span>
                      </div>
                      {assignedClassId && (
                        <div className="meta-chip active-class-chip">
                          <GraduationCap size={13} />
                          <span>Class Teacher (Attendance): <strong>{assignedClassName}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Teaching Allotments Chips */}
                    {teacherData?.teachingAssignments && teacherData.teachingAssignments.length > 0 && (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={13} style={{ color: '#f59e0b' }} />
                          <span>Your Teaching Subjects & Classes Allotment</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {teacherData.teachingAssignments.map((a, i) => (
                            <span key={i} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.12)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '12.5px',
                              color: '#f8fafc'
                            }}>
                              <strong style={{ color: '#fed7aa' }}>{a.className || a.classId}:</strong>
                              <span>{a.subject}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="attendance-stat-grid">
                <div className="stat-card stat-total">
                  <div className="stat-icon-wrap icon-blue">
                    <Users size={22} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Total Enrolled</span>
                    <div className="stat-val-row">
                      <span className="stat-val">{stats.total}</span>
                      <span className="stat-unit">Students</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-present">
                  <div className="stat-icon-wrap icon-green">
                    <UserCheck size={22} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Present Today</span>
                    <div className="stat-val-row">
                      <span className="stat-val text-green">{stats.presentCount}</span>
                      <span className="stat-sub-text">
                        {stats.total > 0 ? Math.round((stats.presentCount / stats.total) * 100) : 0}% of class
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-absent">
                  <div className="stat-icon-wrap icon-red">
                    <UserX size={22} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Absent Today</span>
                    <div className="stat-val-row">
                      <span className="stat-val text-red">{stats.absentCount}</span>
                      <span className="stat-sub-text">
                        {stats.total > 0 ? Math.round((stats.absentCount / stats.total) * 100) : 0}% of class
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-rate">
                  <div className="stat-icon-wrap icon-amber">
                    <TrendingUp size={22} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Daily Attendance Rate</span>
                    <div className="stat-val-row">
                      <span className="stat-val text-amber">{stats.rate}%</span>
                      <span className="stat-sub-text">Class Average</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="dashboard-quick-cards-grid">
                {/* Attendance Quick Card */}
                <div className="quick-action-card">
                  <div className="quick-card-header">
                    <div className="quick-card-icon icon-att">
                      <CalendarCheck size={22} />
                    </div>
                    <div>
                      <h4>Daily Attendance Register</h4>
                      <p>Class Teacher: <strong>{assignedClassName}</strong></p>
                    </div>
                  </div>
                  <p className="quick-card-body">
                    Take student roll call for {assignedClassName}, record Present/Absent/Late records, and update central records in MongoDB.
                  </p>
                  <button
                    type="button"
                    className="quick-card-action-btn"
                    onClick={() => handleTabChange('attendance')}
                  >
                    <span>Manage Attendance Register</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Examinations Quick Card */}
                <div className="quick-action-card">
                  <div className="quick-card-header">
                    <div className="quick-card-icon icon-exam">
                      <Award size={22} />
                    </div>
                    <div>
                      <h4>Examinations & Marks Evaluation</h4>
                      <p>Continuous Comprehensive Evaluation (CCE)</p>
                    </div>
                  </div>
                  <p className="quick-card-body">
                    Record term exam scores and test results for classes you teach, compute grades automatically, and generate evaluation grade sheets.
                  </p>
                  <button
                    type="button"
                    className="quick-card-action-btn"
                    onClick={() => handleTabChange('examinations')}
                  >
                    <span>Open Examinations Portal</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: ATTENDANCE REGISTER
             ===================================================================== */}
          {activeTab === 'attendance' && (
            <div className="tab-pane-fade-in">
              {!assignedClassId ? (
                <div className="unassigned-class-alert">
                  <AlertCircle size={24} className="alert-icon" />
                  <div>
                    <h3>No Class Assigned for Attendance</h3>
                    <p>
                      You are not currently assigned as a Class Teacher to take attendance for a specific class. Please contact the administrative office to link your account to a class roster.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="attendance-register-card">
                  {/* Card Header & Controls */}
                  <div className="register-header">
                    <div className="register-header-left">
                      <div className="register-header-icon">
                        <CalendarCheck size={20} />
                      </div>
                      <div>
                        <h3>Daily Attendance Register — {assignedClassName}</h3>
                        <p>Mark daily student attendance for {assignedClassName} and save to school database</p>
                      </div>
                    </div>

                    {/* Primary Action: Save Attendance Button */}
                    <div className="register-header-actions">
                      <button
                        type="button"
                        className="save-attendance-btn"
                        onClick={handleSaveAttendance}
                        disabled={saving || loading || students.length === 0}
                      >
                        {saving ? (
                          <>
                            <RefreshCw size={16} className="spin-icon" />
                            <span>Saving...</span>
                          </>
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Saved Successfully!</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Attendance</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Success Notification Banner */}
                  {saveSuccess && (
                    <div className="save-success-banner">
                      <CheckCircle2 size={18} />
                      <span>{saveMessage || 'Attendance submitted and updated in database!'}</span>
                    </div>
                  )}

                  {/* Register Toolbar: Date Picker, Quick Buttons, Search, Filters */}
                  <div className="register-toolbar">
                    <div className="toolbar-left-controls">
                      {/* Attendance Date Picker */}
                      <div className="date-picker-group">
                        <label htmlFor="att-date-picker" className="date-picker-label">
                          <Calendar size={15} className="date-picker-icon" />
                          <span>Date:</span>
                        </label>
                        <input
                          id="att-date-picker"
                          type="date"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                          className="attendance-date-input"
                        />
                      </div>

                      {/* Quick Action: Mark All Present */}
                      <button
                        type="button"
                        className="quick-action-btn btn-mark-all"
                        onClick={handleMarkAllPresent}
                        title="Mark all students as Present"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark All Present</span>
                      </button>

                      {/* Quick Action: Clear / Mark Absent */}
                      <button
                        type="button"
                        className="quick-action-btn btn-mark-absent"
                        onClick={handleMarkAllAbsent}
                        title="Mark all students as Absent"
                      >
                        <XCircle size={14} />
                        <span>Mark All Absent</span>
                      </button>
                    </div>

                    <div className="toolbar-right-controls">
                      {/* Search Input */}
                      <div className="register-search-box">
                        <Search size={15} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search student or roll..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => setSearchQuery('')}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Gender Filter Pills */}
                      <div className="gender-filter-pills">
                        <button
                          type="button"
                          className={`gender-pill ${genderFilter === 'ALL' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('ALL')}
                        >
                          All ({students.length})
                        </button>
                        <button
                          type="button"
                          className={`gender-pill ${genderFilter === 'Boy' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('Boy')}
                        >
                          <BoyIcon size={14} />
                          <span>Boys</span>
                        </button>
                        <button
                          type="button"
                          className={`gender-pill ${genderFilter === 'Girl' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('Girl')}
                        >
                          <GirlIcon size={14} />
                          <span>Girls</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Roster Table */}
                  <div className="register-table-wrapper">
                    {loading ? (
                      <div className="register-loading-state">
                        <RefreshCw size={28} className="spin-icon" />
                        <p>Loading {assignedClassName} student roster...</p>
                      </div>
                    ) : error ? (
                      <div className="register-error-state">
                        <AlertCircle size={28} />
                        <p>{error}</p>
                        <button
                          type="button"
                          className="retry-btn"
                          onClick={() => fetchClassStudents(assignedClassId)}
                        >
                          Retry
                        </button>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="register-empty-state">
                        <Users size={32} />
                        <p>No students found matching your search filter.</p>
                      </div>
                    ) : (
                      <table className="teacher-roster-table">
                        <thead>
                          <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>Roll No.</th>
                            <th>Student Name</th>
                            <th style={{ width: isAttClassIX ? '160px' : '130px' }}>
                              {isAttClassIX ? 'Registration Number' : 'Student ID'}
                            </th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Gender</th>
                            <th style={{ width: '110px', textAlign: 'center' }}>Overall %</th>
                            <th style={{ width: '250px', textAlign: 'center' }}>
                              Attendance on {attendanceDate}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((st) => {
                            const studentKey = st.studentId || st.id;
                            const currentStatus = dailyAttendance[studentKey] || 'present';
                            const isBoy = st.gender === 'Boy' || !st.gender;
                            const isStClassIX = isAttClassIX || isClassIX(st.classId) || isClassIX(st.className);
                            const regNumber = st.enrollmentNo || st.registrationNo;
                            const attDisplayedId = isStClassIX
                              ? (regNumber && regNumber !== '-' && regNumber !== '—' ? regNumber : (st.studentId || '—'))
                              : (st.studentId || '—');

                            return (
                              <tr
                                key={studentKey}
                                className={`roster-row status-${currentStatus}`}
                              >
                                {/* Roll Number */}
                                <td style={{ textAlign: 'center' }}>
                                  <span className="roster-roll-pill font-mono">
                                    #{st.roll || '00'}
                                  </span>
                                </td>

                                {/* Student Name */}
                                <td>
                                  <div className="roster-student-cell">
                                    <div className={`roster-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                                      {isBoy ? <BoyIcon size={16} /> : <GirlIcon size={16} />}
                                    </div>
                                    <div className="roster-student-info">
                                      <span className="student-name font-bold">
                                        {st.name}
                                      </span>
                                      {isStClassIX && regNumber && regNumber !== '-' && regNumber !== '—' ? (
                                        <span className="student-enr-mini font-mono">
                                          Reg: {regNumber}
                                        </span>
                                      ) : st.enrollmentNo ? (
                                        <span className="student-enr-mini font-mono">
                                          ENR: {st.enrollmentNo}
                                        </span>
                                      ) : st.studentId ? (
                                        <span className="student-enr-mini font-mono">
                                          {st.studentId}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>

                                {/* Registration Number / Student ID */}
                                <td>
                                  <span
                                    className="student-id-badge font-mono"
                                    title={isStClassIX ? `Registration Number: ${attDisplayedId}` : `Student ID: ${attDisplayedId}`}
                                  >
                                    {attDisplayedId}
                                  </span>
                                </td>

                                {/* Gender */}
                                <td style={{ textAlign: 'center' }}>
                                  <span className={`gender-badge ${isBoy ? 'gender-boy' : 'gender-girl'}`}>
                                    {isBoy ? 'Boy' : 'Girl'}
                                  </span>
                                </td>

                                {/* Overall Percentage */}
                                <td style={{ textAlign: 'center' }}>
                                  <span className="overall-pct-pill">
                                    {st.attendance || '95%'}
                                  </span>
                                </td>

                                {/* Attendance Toggle Buttons */}
                                <td style={{ textAlign: 'center' }}>
                                  <div className="attendance-toggle-group">
                                    <button
                                      type="button"
                                      className={`att-toggle-btn btn-present ${currentStatus === 'present' ? 'active' : ''}`}
                                      onClick={() => handleToggleStatus(studentKey, 'present')}
                                      title="Mark Present"
                                    >
                                      <Check size={14} className="toggle-check" />
                                      <span>Present</span>
                                    </button>

                                    <button
                                      type="button"
                                      className={`att-toggle-btn btn-absent ${currentStatus === 'absent' ? 'active' : ''}`}
                                      onClick={() => handleToggleStatus(studentKey, 'absent')}
                                      title="Mark Absent"
                                    >
                                      <XCircle size={14} className="toggle-cross" />
                                      <span>Absent</span>
                                    </button>

                                    <button
                                      type="button"
                                      className={`att-toggle-btn btn-late ${currentStatus === 'late' ? 'active' : ''}`}
                                      onClick={() => handleToggleStatus(studentKey, 'late')}
                                      title="Mark Late"
                                    >
                                      <Clock size={14} className="toggle-clock" />
                                      <span>Late</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Register Footer */}
                  <div className="register-footer">
                    <div className="register-footer-info">
                      <span>
                        Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students for <strong>{assignedClassName}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="save-attendance-btn bottom-save"
                      onClick={handleSaveAttendance}
                      disabled={saving || loading || students.length === 0}
                    >
                      <Save size={15} />
                      <span>{saving ? 'Saving...' : 'Save & Submit Attendance'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 3: EXAMINATIONS & EVALUATION (Componentized)
             ===================================================================== */}
          {activeTab === 'examinations' && (
            <TeacherExaminations
              activeUser={activeUser}
              teacherName={teacherName}
              teachingList={teachingList}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
