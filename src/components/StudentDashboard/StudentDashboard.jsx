import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './StudentDashboard.css';
import ReportCardModal from '../ReportCardModal/ReportCardModal';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { getConsolidatedSubjectsForClass } from '../../data/curriculumData';
import {
  Sparkles,
  Award,
  CalendarCheck,
  ShieldCheck,
  GraduationCap,
  User,
  Copy,
  Check,
  Printer,
  Bell
} from 'lucide-react';

const StudentDashboard = ({ student: propStudent }) => {
  const context = useOutletContext();
  const activeStudent = propStudent || context?.activeStudent || (() => {
    try {
      const s = localStorage.getItem('pmshri_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [notices, setNotices] = useState([]);
  const [examRecords, setExamRecords] = useState([]);

  useEffect(() => {
    if (!activeStudent?.classId) return;

    // Fetch notices & examinations for report card
    const loadData = async () => {
      try {
        const [noticeRes, examRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/notices`),
          fetch(`${API_BASE_URL}/api/examinations?classId=${activeStudent.classId}`)
        ]);

        if (noticeRes.ok) {
          const nData = await noticeRes.json();
          if (Array.isArray(nData)) setNotices(nData.slice(0, 4));
          else if (nData.notices) setNotices(nData.notices.slice(0, 4));
        }

        if (examRes.ok) {
          const eData = await examRes.json();
          if (eData.records) setExamRecords(eData.records);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      }
    };

    loadData();
  }, [activeStudent?.classId]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const classSubjects = useMemo(() => {
    return getConsolidatedSubjectsForClass(activeStudent?.classId || 'class-10');
  }, [activeStudent?.classId]);

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

  if (!activeStudent) return null;

  return (
    <div className="student-dashboard-page">
      {/* Welcome Hero Banner */}
      <div className="sp-welcome-hero">
        <div className="sp-welcome-info">
          <div className="sp-welcome-greeting">
            <Sparkles size={20} className="greeting-sparkle" />
            <span>Welcome to Student Portal,</span>
          </div>
          <h2>{activeStudent.name}</h2>
          <p>
            {activeStudent.className || 'Class VIII'} · Roll #{activeStudent.roll || '01'} · Academic Session 2026–2027
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
            <h3>{activeStudent.attendance || '95%'}</h3>
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
            <h3>{activeStudent.className || 'Class VIII'}</h3>
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
            <span className="sp-kpi-sub">Roll #{activeStudent.roll || '01'}</span>
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
                  {activeStudent.className || 'Class VIII'} • Roll #{activeStudent.roll || '01'}
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

        {/* Column 2: Holistic Report Card Showcase & School Notices */}
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

      {/* Report Card Modal */}
      {showReportCardModal && (
        <ReportCardModal
          isOpen={showReportCardModal}
          onClose={() => setShowReportCardModal(false)}
          students={[activeStudent]}
          currentClass={{
            id: activeStudent.classId,
            name: activeStudent.className || 'Class VIII',
            wing: 'Secondary'
          }}
          subjects={classSubjects}
          examRecordsByTerm={examRecordsByTerm}
          selectedStudentId={activeStudent.studentId || activeStudent.id}
          academicYear={activeStudent.academicYear || '2026-2027'}
          classTeacherName="Faculty Member"
        />
      )}
    </div>
  );
};

export default StudentDashboard;
