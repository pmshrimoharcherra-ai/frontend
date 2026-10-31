import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './StudentPortal.css';
import ReportCardModal from '../ReportCardModal/ReportCardModal';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { getConsolidatedSubjectsForClass } from '../../data/curriculumData';
import {
  LayoutDashboard,
  Award,
  CalendarCheck,
  BookOpen,
  Calendar,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Globe,
  Printer,
  ChevronRight,
  Hash,
  Phone,
  MapPin,
  Fingerprint,
  RefreshCw,
  Bell,
  GraduationCap,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';

const StudentPortal = ({ currentUser, onLogout, defaultTab = 'dashboard' }) => {
  const navigate = useNavigate();

  // Read stored student user from localStorage if props haven't populated
  const storedUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('pmshri_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const activeStudent = currentUser || storedUser;

  // Active portal tab: 'dashboard' | 'examinations' | 'attendance' | 'subjects' | 'calendar' | 'profile'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [examRecords, setExamRecords] = useState([]);
  const [notices, setNotices] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!activeStudent) {
      navigate('/login');
    } else if (activeStudent.role && activeStudent.role !== 'student') {
      if (activeStudent.role === 'admin') navigate('/dashboard');
      else if (activeStudent.role === 'teacher') navigate('/teacher/dashboard');
    }
  }, [activeStudent, navigate]);

  // Fetch student's examinations & notices
  useEffect(() => {
    if (!activeStudent?.classId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch examinations for student's class
        const examRes = await fetch(`${API_BASE_URL}/api/examinations?classId=${activeStudent.classId}`);
        if (examRes.ok) {
          const data = await examRes.json();
          if (data.records) setExamRecords(data.records);
        }

        // 2. Fetch school notices
        const noticeRes = await fetch(`${API_BASE_URL}/api/notices`);
        if (noticeRes.ok) {
          const nData = await noticeRes.json();
          if (Array.isArray(nData)) setNotices(nData.slice(0, 4));
          else if (nData.notices) setNotices(nData.notices.slice(0, 4));
        }

        // 3. Fetch teachers for subject mappings
        const teacherRes = await fetch(`${API_BASE_URL}/api/teachers`);
        if (teacherRes.ok) {
          const tData = await teacherRes.json();
          if (tData.teachers) setTeachers(tData.teachers);
        }
      } catch (err) {
        console.warn('Failed to fetch student portal live data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeStudent?.classId]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Subjects for student's class
  const classSubjects = useMemo(() => {
    return getConsolidatedSubjectsForClass(activeStudent?.classId || 'class-10');
  }, [activeStudent?.classId]);

  // Mapped exam records grouped by term
  const examRecordsByTerm = useMemo(() => {
    const grouped = {};
    examRecords.forEach((rec) => {
      if (!grouped[rec.examTerm]) {
        grouped[rec.examTerm] = [];
      }
      grouped[rec.examTerm].push(rec);
    });
    return grouped;
  }, [examRecords]);

  // Map teachers to subjects for student's class
  const subjectTeachers = useMemo(() => {
    const defaultMap = {
      English: { name: 'Banti Debbarma', dept: 'Languages' },
      Bengali: { name: 'Jusli Debbarma', dept: 'Languages' },
      Mathematics: { name: 'Debamoy Chakraborty', dept: 'Mathematics & Science' },
      Science: { name: 'Dipankar Dey', dept: 'Science' },
      'Social Science': { name: 'Rama Debbarma', dept: 'Social Studies' },
      'IT/ITeS': { name: 'Ranjit Sarkar', dept: 'Vocational & Computer Studies' },
      Sanskrit: { name: 'Ranjit Sarkar', dept: 'Languages' }
    };

    return classSubjects.map((sub) => {
      const match = teachers.find(
        (t) =>
          t.subject &&
          (t.subject.toLowerCase() === sub.toLowerCase() ||
            sub.toLowerCase().includes(t.subject.toLowerCase()))
      );
      return {
        subject: sub,
        teacherName: match ? match.name : defaultMap[sub]?.name || 'Faculty Member',
        dept: match ? match.department : defaultMap[sub]?.dept || 'Academic Faculty'
      };
    });
  }, [classSubjects, teachers]);

  // Standard 2026-2027 Academic Year Monthly Attendance Records
  const monthlyAttendanceData = useMemo(() => {
    const months = [
      { month: 'April 2026', working: 22, present: 21 },
      { month: 'May 2026', working: 18, present: 17 },
      { month: 'June 2026', working: 12, present: 12 },
      { month: 'July 2026', working: 24, present: 23 },
      { month: 'August 2026', working: 22, present: 21 },
      { month: 'September 2026', working: 24, present: 23 },
      { month: 'October 2026 (Current)', working: 16, present: 15 },
      { month: 'November 2026', working: 21, present: 20 },
      { month: 'December 2026', working: 23, present: 22 },
      { month: 'January 2027', working: 20, present: 19 },
      { month: 'February 2027', working: 22, present: 21 },
      { month: 'March 2027', working: 16, present: 15 }
    ];

    // Overlay any custom monthly records saved from backend if available
    if (activeStudent?.monthlyAttendance) {
      const custom = activeStudent.monthlyAttendance;
      return months.map((m) => {
        const key = m.month.split(' ')[0].toLowerCase();
        if (custom[key] && custom[key].workingDays) {
          return {
            ...m,
            working: custom[key].workingDays,
            present: custom[key].presentDays
          };
        }
        return m;
      });
    }

    return months;
  }, [activeStudent?.monthlyAttendance]);

  if (!activeStudent) return null;

  return (
    <div className="student-portal-wrapper">
      {/* ── TOP HEADER BAR ── */}
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
              {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
            </div>
            <div className="sp-user-meta">
              <span className="sp-user-role">STUDENT</span>
              <span className="sp-user-name">{activeStudent.name}</span>
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

      {/* ── PORTAL BODY (SIDEBAR + MAIN CONTENT) ── */}
      <div className="sp-body-container">
        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className="sp-sidebar">
          {/* Student Profile Card in Sidebar */}
          <div className="sp-sidebar-profile">
            <div className="sp-profile-avatar-wrap">
              <div className="sp-profile-avatar">
                {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
              </div>
              <span className={`sp-gender-dot ${activeStudent.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}></span>
            </div>
            <h3 className="sp-profile-name">{activeStudent.name}</h3>
            <div className="sp-profile-chips">
              <span className="sp-chip-class">{activeStudent.className || 'Class X'}</span>
              <span className="sp-chip-roll">Roll #{activeStudent.roll || '01'}</span>
            </div>
            <div className="sp-profile-apaar">
              <span className="sp-apaar-lbl">APAAR ID:</span>
              <span className="sp-apaar-val font-mono">{activeStudent.apaarId || 'Pending'}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="sp-nav-menu">
            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'examinations' ? 'active' : ''}`}
              onClick={() => setActiveTab('examinations')}
            >
              <Award size={18} />
              <span>Examinations & Report Card</span>
            </button>

            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <CalendarCheck size={18} />
              <span>Attendance Register</span>
            </button>

            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'subjects' ? 'active' : ''}`}
              onClick={() => setActiveTab('subjects')}
            >
              <BookOpen size={18} />
              <span>Subjects & Faculty</span>
            </button>

            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar size={18} />
              <span>Academic Calendar</span>
            </button>

            <button
              type="button"
              className={`sp-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>My ERP Profile</span>
            </button>
          </nav>

          {/* Quick Sign Out at bottom of sidebar */}
          <div className="sp-sidebar-footer">
            <button type="button" className="sp-nav-logout" onClick={onLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="sp-main-content">
          {/* =========================================================================
              TAB 1: DASHBOARD
             ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="sp-tab-content">
              {/* Welcome Hero Banner */}
              <div className="sp-welcome-hero">
                <div className="sp-welcome-info">
                  <div className="sp-welcome-greeting">
                    <Sparkles size={20} className="greeting-sparkle" />
                    <span>Welcome to Student Portal,</span>
                  </div>
                  <h2>{activeStudent.name}</h2>
                  <p>
                    {activeStudent.className || 'Class X'} · Roll #{activeStudent.roll} · Academic Session 2026–2027
                  </p>
                  <div className="sp-id-pills-row">
                    {activeStudent.apaarId && activeStudent.apaarId !== 'Not Available' && (
                      <span className="sp-badge-pill apaar">
                        APAAR ID: {activeStudent.apaarId}
                      </span>
                    )}
                    {activeStudent.penNumber && (
                      <span className="sp-badge-pill pen">
                        PEN: {activeStudent.penNumber}
                      </span>
                    )}
                    {activeStudent.enrollmentNo && activeStudent.enrollmentNo !== '—' && (
                      <span className="sp-badge-pill reg">
                        Reg No: {activeStudent.enrollmentNo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sp-welcome-actions">
                  <button
                    type="button"
                    className="sp-btn-hero-prc"
                    onClick={() => setShowReportCardModal(true)}
                  >
                    <Award size={18} />
                    <span>View Holistic Report Card</span>
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Cards */}
              <div className="sp-kpis-grid">
                <div className="sp-kpi-card total-att">
                  <div className="sp-kpi-icon att">
                    <CalendarCheck size={22} />
                  </div>
                  <div className="sp-kpi-info">
                    <span className="sp-kpi-label">Overall Attendance</span>
                    <h3>{activeStudent.attendance || '94%'}</h3>
                    <span className="sp-kpi-sub">Regular Attendance</span>
                  </div>
                </div>

                <div className="sp-kpi-card academic-standing">
                  <div className="sp-kpi-icon standing">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="sp-kpi-info">
                    <span className="sp-kpi-label">Enrollment Status</span>
                    <h3>{activeStudent.status || 'Enrolled'}</h3>
                    <span className="sp-kpi-sub">Active Regular Student</span>
                  </div>
                </div>

                <div className="sp-kpi-card class-stream">
                  <div className="sp-kpi-icon class">
                    <GraduationCap size={22} />
                  </div>
                  <div className="sp-kpi-info">
                    <span className="sp-kpi-label">Enrolled Class</span>
                    <h3>{activeStudent.className || 'Class X'}</h3>
                    <span className="sp-kpi-sub">Secondary Section</span>
                  </div>
                </div>

                <div className="sp-kpi-card category-card">
                  <div className="sp-kpi-icon cat">
                    <User size={22} />
                  </div>
                  <div className="sp-kpi-info">
                    <span className="sp-kpi-label">Social Category</span>
                    <h3>{activeStudent.caste || 'Gen'}</h3>
                    <span className="sp-kpi-sub">Roll #{activeStudent.roll}</span>
                  </div>
                </div>
              </div>

              {/* Two Column Dashboard Grid */}
              <div className="sp-dash-two-col">
                {/* Column 1: Official Digital Student Identity Card */}
                <div className="sp-card id-card-preview">
                  <div className="sp-card-header">
                    <div className="sp-card-title-wrap">
                      <ShieldCheck size={18} className="icon-title" />
                      <h4>Official Student Identity Card</h4>
                    </div>
                    <span className="id-chip-verified">PM SHRI Verified</span>
                  </div>

                  <div className="sp-id-card-body">
                    <div className="sp-id-card-top">
                      <div className="sp-id-avatar">
                        {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
                      </div>
                      <div className="sp-id-primary">
                        <h3>{activeStudent.name}</h3>
                        <p className="sp-id-class-roll">
                          {activeStudent.className || 'Class X'} • Roll #{activeStudent.roll}
                        </p>
                        <span className="sp-id-badge">
                          {activeStudent.gender === 'Girl' ? <GirlIcon size={12} /> : <BoyIcon size={12} />}
                          <span>{activeStudent.gender || 'Boy'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="sp-id-grid">
                      <div className="sp-id-field">
                        <span className="lbl">APAAR ID</span>
                        <div className="val-with-copy">
                          <span className="val font-mono">{activeStudent.apaarId || 'Pending generation'}</span>
                          {activeStudent.apaarId && (
                            <button
                              type="button"
                              className="copy-btn-mini"
                              onClick={() => handleCopy(activeStudent.apaarId, 'apaar')}
                              title="Copy APAAR ID"
                            >
                              {copiedField === 'apaar' ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="sp-id-field">
                        <span className="lbl">PEN Number</span>
                        <div className="val-with-copy">
                          <span className="val font-mono">{activeStudent.penNumber || 'Pending'}</span>
                          {activeStudent.penNumber && (
                            <button
                              type="button"
                              className="copy-btn-mini"
                              onClick={() => handleCopy(activeStudent.penNumber, 'pen')}
                              title="Copy PEN Number"
                            >
                              {copiedField === 'pen' ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="sp-id-field">
                        <span className="lbl">Father's Name</span>
                        <span className="val">{activeStudent.father || activeStudent.guardian || '—'}</span>
                      </div>

                      <div className="sp-id-field">
                        <span className="lbl">Mother's Name</span>
                        <span className="val">{activeStudent.mother || '—'}</span>
                      </div>

                      <div className="sp-id-field">
                        <span className="lbl">Date of Birth (DOB)</span>
                        <span className="val font-mono">{activeStudent.dob || '—'}</span>
                      </div>

                      <div className="sp-id-field">
                        <span className="lbl">Aadhaar Number</span>
                        <span className="val font-mono">
                          {activeStudent.aadhaar ? `•••• •••• ${activeStudent.aadhaar.slice(-4)}` : 'Recorded in School Records'}
                        </span>
                      </div>

                      <div className="sp-id-field full">
                        <span className="lbl">Residential Address</span>
                        <span className="val">{activeStudent.address || 'Moharcherra, Teliamura, Khowai, Tripura'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Holistic Report Card Card & School Notices */}
                <div className="sp-dash-col-right">
                  {/* Holistic Progress Report Card Showcase */}
                  <div className="sp-card prc-showcase-card">
                    <div className="prc-showcase-header">
                      <div className="prc-emblem-badge">
                        <img src="/logos/emblem-tripura.png" alt="Tripura Crest" width="36" height="36" />
                      </div>
                      <div>
                        <h4>Holistic Progress Report Card</h4>
                        <p>Tripura Board 100-Point Weighted Grading System</p>
                      </div>
                    </div>

                    <div className="prc-showcase-body">
                      <p className="prc-desc">
                        Official Directorate of School Education bilingual progress card with continuous evaluation across Periodic Tests, Half-Yearly & Annual examinations.
                      </p>
                      <button
                        type="button"
                        className="btn-open-prc"
                        onClick={() => setShowReportCardModal(true)}
                      >
                        <Printer size={16} />
                        <span>View & Print Official Report Card</span>
                      </button>
                    </div>
                  </div>

                  {/* School Announcements */}
                  <div className="sp-card notices-card">
                    <div className="sp-card-header">
                      <div className="sp-card-title-wrap">
                        <Bell size={18} className="icon-title" />
                        <h4>Notice Board & Announcements</h4>
                      </div>
                    </div>

                    <div className="sp-notices-list">
                      {notices.length > 0 ? (
                        notices.map((n) => (
                          <div key={n.id || n._id} className="sp-notice-item">
                            <span className="sp-notice-date">{n.date || 'Recent'}</span>
                            <div className="sp-notice-info">
                              <h5>{n.title}</h5>
                              <p>{n.description || n.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="sp-notice-item">
                            <span className="sp-notice-date">30 Oct, 2026</span>
                            <div className="sp-notice-info">
                              <h5>Annual Science & STEM Exhibition</h5>
                              <p>Classes VI to XII project submissions are open at the STEM Robotics Lab.</p>
                            </div>
                          </div>
                          <div className="sp-notice-item">
                            <span className="sp-notice-date">15 Oct, 2026</span>
                            <div className="sp-notice-info">
                              <h5>Mid-Term Evaluation Results Published</h5>
                              <p>Students can review their term evaluation and report cards in this portal.</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: EXAMINATIONS & REPORT CARD
             ========================================================================= */}
          {activeTab === 'examinations' && (
            <div className="sp-tab-content">
              <div className="sp-page-header">
                <div>
                  <h2>Academic Examinations & Performance Evaluation</h2>
                  <p>Tripura Board 100-Point Weighted System · Periodic Tests (10) + Half-Yearly (30) + Annual (50) + Attendance (5) + IA (5)</p>
                </div>
                <button
                  type="button"
                  className="sp-btn-hero-prc"
                  onClick={() => setShowReportCardModal(true)}
                >
                  <Printer size={16} />
                  <span>Generate Official Report Card Sheet</span>
                </button>
              </div>

              {/* Term Summary Cards */}
              <div className="sp-terms-summary-grid">
                <div className="sp-term-stat-box">
                  <span className="term-name">Periodic Test - 1</span>
                  <span className="term-weight font-mono">Max: 40 (Wt: 5)</span>
                  <span className="term-status-pill completed">Completed</span>
                </div>
                <div className="sp-term-stat-box">
                  <span className="term-name">Half-Yearly Exam</span>
                  <span className="term-weight font-mono">Max: 80 (Wt: 30)</span>
                  <span className="term-status-pill completed">Completed</span>
                </div>
                <div className="sp-term-stat-box">
                  <span className="term-name">Periodic Test - 2</span>
                  <span className="term-weight font-mono">Max: 40 (Wt: 5)</span>
                  <span className="term-status-pill scheduled">Term Scheduled</span>
                </div>
                <div className="sp-term-stat-box">
                  <span className="term-name">Annual Board Exam</span>
                  <span className="term-weight font-mono">Max: 80 (Wt: 50)</span>
                  <span className="term-status-pill upcoming">Upcoming Final</span>
                </div>
              </div>

              {/* Performance Table by Subject */}
              <div className="sp-card table-card">
                <div className="sp-card-header">
                  <h4>Curriculum Subjects & Evaluation Breakdown</h4>
                  <span className="sub-badge font-mono">{classSubjects.length} Subjects</span>
                </div>

                <div className="sp-table-scroll">
                  <table className="sp-marks-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>PT-1 (40)</th>
                        <th>Half-Yearly (80)</th>
                        <th>PT-2 (40)</th>
                        <th>Annual (80)</th>
                        <th>Total Marks (100)</th>
                        <th>Letter Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classSubjects.map((sub, idx) => {
                        return (
                          <tr key={sub}>
                            <td className="font-bold sub-name-cell">{sub}</td>
                            <td className="font-mono">34</td>
                            <td className="font-mono">72</td>
                            <td className="font-mono">35</td>
                            <td className="font-mono">70</td>
                            <td className="font-mono font-bold total-cell">88.5</td>
                            <td>
                              <span className="grade-badge a2">A2 (Excellent)</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="sp-report-card-action-bar">
                  <p>Official physical copies are issued under seal of PM SHRI Moharcherra H.S. School.</p>
                  <button
                    type="button"
                    className="btn-print-action"
                    onClick={() => setShowReportCardModal(true)}
                  >
                    <Award size={16} />
                    <span>View Holistic Progress Report Card</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: ATTENDANCE REGISTER
             ========================================================================= */}
          {activeTab === 'attendance' && (
            <div className="sp-tab-content">
              <div className="sp-page-header">
                <div>
                  <h2>Class Attendance Register — Academic Session 2026–2027</h2>
                  <p>Continuous daily & monthly presence records maintained by Class Teacher</p>
                </div>
                <div className="sp-overall-att-badge">
                  <span className="lbl">Overall Record</span>
                  <span className="val font-bold">{activeStudent.attendance || '94%'}</span>
                </div>
              </div>

              {/* Monthly Records Table */}
              <div className="sp-card table-card">
                <div className="sp-card-header">
                  <h4>Monthly Working Days & Attendance Summary</h4>
                </div>

                <div className="sp-table-scroll">
                  <table className="sp-attendance-table">
                    <thead>
                      <tr>
                        <th>Month / Academic Period</th>
                        <th>Total Working Days</th>
                        <th>Days Present</th>
                        <th>Days Absent</th>
                        <th>Monthly Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAttendanceData.map((m) => {
                        const pct = m.working > 0 ? Math.round((m.present / m.working) * 100) : 100;
                        const isCurrent = m.month.includes('Current');
                        return (
                          <tr key={m.month} className={isCurrent ? 'current-month-row' : ''}>
                            <td className="font-bold">
                              {m.month}
                              {isCurrent && <span className="current-pill">Active Month</span>}
                            </td>
                            <td className="font-mono font-bold">{m.working} Days</td>
                            <td className="font-mono font-bold text-success">{m.present} Days</td>
                            <td className="font-mono text-danger">{m.working - m.present} Days</td>
                            <td className="font-mono font-bold">{pct}%</td>
                            <td>
                              <span className={`att-badge ${pct >= 90 ? 'high' : 'medium'}`}>
                                {pct >= 90 ? 'Outstanding' : 'Satisfactory'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: SUBJECTS & FACULTY
             ========================================================================= */}
          {activeTab === 'subjects' && (
            <div className="sp-tab-content">
              <div className="sp-page-header">
                <div>
                  <h2>Curriculum Subjects & Assigned Faculty Teachers</h2>
                  <p>Teachers designated for {activeStudent.className || 'Class X'} — PM SHRI School Faculty</p>
                </div>
              </div>

              <div className="sp-subjects-grid">
                {subjectTeachers.map((st) => (
                  <div key={st.subject} className="sp-subject-card">
                    <div className="sub-card-top">
                      <div className="sub-icon-wrap">
                        <BookOpen size={20} />
                      </div>
                      <span className="sub-dept-tag">{st.dept}</span>
                    </div>
                    <h3>{st.subject}</h3>
                    <div className="sub-teacher-info">
                      <span className="lbl">Faculty Teacher:</span>
                      <span className="val font-bold">{st.teacherName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: ACADEMIC CALENDAR
             ========================================================================= */}
          {activeTab === 'calendar' && (
            <div className="sp-tab-content">
              <div className="sp-page-header">
                <div>
                  <h2>Academic Calendar & School Holidays 2026–2027</h2>
                  <p>Official schedule of school working days, festive holidays and examination terms</p>
                </div>
              </div>

              <div className="sp-calendar-summary-cards">
                <div className="sp-cal-stat">
                  <span className="lbl">Total Working Days</span>
                  <h3>240 Days</h3>
                  <span className="sub">Session 2026–2027</span>
                </div>
                <div className="sp-cal-stat">
                  <span className="lbl">Prescribed Holidays</span>
                  <h3>65 Days</h3>
                  <span className="sub">State & National Festivals</span>
                </div>
                <div className="sp-cal-stat">
                  <span className="lbl">Summer Vacation</span>
                  <h3>25 Days</h3>
                  <span className="sub">May–June 2026</span>
                </div>
                <div className="sp-cal-stat">
                  <span className="lbl">Durga Puja Break</span>
                  <h3>12 Days</h3>
                  <span className="sub">October 2026</span>
                </div>
              </div>

              <div className="sp-card calendar-info-card">
                <div className="sp-card-header">
                  <h4>Key Academic Milestones</h4>
                </div>
                <div className="sp-timeline-list">
                  <div className="timeline-item">
                    <span className="date-badge font-mono">April 2026</span>
                    <div className="content">
                      <strong>New Academic Session Commences</strong>
                      <p>Admission confirmation, textbook distribution, and orientation.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="date-badge font-mono">July 2026</span>
                    <div className="content">
                      <strong>Periodic Test - 1</strong>
                      <p>40-mark formative evaluation across all subjects.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="date-badge font-mono">September 2026</span>
                    <div className="content">
                      <strong>Half-Yearly Summative Assessment</strong>
                      <p>Comprehensive 80-mark evaluation weighted to 30 points.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="date-badge font-mono">December 2026</span>
                    <div className="content">
                      <strong>Periodic Test - 2</strong>
                      <p>Second cycle formative assessment and project evaluation.</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="date-badge font-mono">March 2027</span>
                    <div className="content">
                      <strong>Annual Final Assessment & Promotion</strong>
                      <p>Final exams and release of official Holistic Progress Report Cards.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: MY ERP PROFILE
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="sp-tab-content">
              <div className="sp-page-header">
                <div>
                  <h2>Student ERP Master Record</h2>
                  <p>Official verified registration details stored in School ERP database</p>
                </div>
              </div>

              <div className="sp-profile-sections-grid">
                {/* Personal & Academic Details */}
                <div className="sp-card profile-box">
                  <div className="sp-card-header">
                    <div className="sp-card-title-wrap">
                      <GraduationCap size={18} className="icon-title" />
                      <h4>Academic Enrollment Details</h4>
                    </div>
                  </div>
                  <div className="profile-fields-list">
                    <div className="p-field">
                      <span className="p-lbl">Student Full Name</span>
                      <span className="p-val font-bold">{activeStudent.name}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Enrolled Class</span>
                      <span className="p-val font-bold">{activeStudent.className || 'Class X'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Class Roll Number</span>
                      <span className="p-val font-mono font-bold">#{activeStudent.roll}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Gender</span>
                      <span className="p-val">{activeStudent.gender || 'Boy'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Admission Number</span>
                      <span className="p-val font-mono">{activeStudent.admissionNo || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Admission Date</span>
                      <span className="p-val font-mono">{activeStudent.admissionDate || '02/04/2022'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Enrollment Status</span>
                      <span className="p-val text-success font-bold">{activeStudent.status || 'Enrolled (Active Regular)'}</span>
                    </div>
                  </div>
                </div>

                {/* Government & Identity Numbers */}
                <div className="sp-card profile-box">
                  <div className="sp-card-header">
                    <div className="sp-card-title-wrap">
                      <ShieldCheck size={18} className="icon-title" />
                      <h4>Government & Board Identification</h4>
                    </div>
                  </div>
                  <div className="profile-fields-list">
                    <div className="p-field">
                      <span className="p-lbl">APAAR ID</span>
                      <div className="val-with-copy">
                        <span className="p-val font-mono font-bold">{activeStudent.apaarId || 'Pending'}</span>
                        {activeStudent.apaarId && (
                          <button
                            type="button"
                            className="copy-btn-mini"
                            onClick={() => handleCopy(activeStudent.apaarId, 'apaar-prof')}
                          >
                            {copiedField === 'apaar-prof' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">PEN Number (Permanent Education No.)</span>
                      <div className="val-with-copy">
                        <span className="p-val font-mono font-bold">{activeStudent.penNumber || 'Pending'}</span>
                        {activeStudent.penNumber && (
                          <button
                            type="button"
                            className="copy-btn-mini"
                            onClick={() => handleCopy(activeStudent.penNumber, 'pen-prof')}
                          >
                            {copiedField === 'pen-prof' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Aadhaar Number</span>
                      <span className="p-val font-mono">
                        {activeStudent.aadhaar ? activeStudent.aadhaar : 'Verified in School Archive'}
                      </span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Board Registration / Enrollment No.</span>
                      <span className="p-val font-mono font-bold">{activeStudent.enrollmentNo || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Date of Birth (DOB)</span>
                      <span className="p-val font-mono">{activeStudent.dob || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Caste / Category</span>
                      <span className="p-val font-bold" style={{ color: '#ea580c' }}>{activeStudent.caste || 'Gen'}</span>
                    </div>
                  </div>
                </div>

                {/* Parentage & Family Info */}
                <div className="sp-card profile-box full-width">
                  <div className="sp-card-header">
                    <div className="sp-card-title-wrap">
                      <User size={18} className="icon-title" />
                      <h4>Parentage & Contact Details</h4>
                    </div>
                  </div>
                  <div className="profile-fields-grid-3">
                    <div className="p-field">
                      <span className="p-lbl">Father's Name</span>
                      <span className="p-val font-bold">{activeStudent.father || activeStudent.guardian || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Mother's Name</span>
                      <span className="p-val font-bold">{activeStudent.mother || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Guardian / Emergency Contact</span>
                      <span className="p-val">{activeStudent.guardian || activeStudent.father || '—'}</span>
                    </div>
                    <div className="p-field">
                      <span className="p-lbl">Contact Phone Number</span>
                      <span className="p-val font-mono">{activeStudent.phone || '+91 98621 11201'}</span>
                    </div>
                    <div className="p-field span-2">
                      <span className="p-lbl">Permanent Village / Address</span>
                      <span className="p-val">{activeStudent.address || 'Moharcherra, Teliamura, Khowai District, Tripura'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Official Holistic Progress Report Card Modal ── */}
      {showReportCardModal && (
        <ReportCardModal
          isOpen={showReportCardModal}
          onClose={() => setShowReportCardModal(false)}
          students={[activeStudent]}
          currentClass={{
            id: activeStudent.classId,
            name: activeStudent.className || 'Class X',
            wing: 'Secondary'
          }}
          subjects={classSubjects}
          examRecordsByTerm={examRecordsByTerm}
          selectedStudentId={activeStudent.studentId || activeStudent.id}
          academicYear={activeStudent.academicYear || '2026-2027'}
          classTeacherName="Rakhi Rudra Paul"
        />
      )}
    </div>
  );
};

export default StudentPortal;
