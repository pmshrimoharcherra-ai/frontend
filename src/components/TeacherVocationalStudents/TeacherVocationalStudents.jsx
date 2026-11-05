import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './TeacherVocationalStudents.css';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Download,
  Eye,
  Pencil,
  Copy,
  Check,
  Laptop,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  UserX
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { isTransferredStudent } from '../../utils/studentStatus';
import { getStudentSector } from '../../data/curriculumData';
import EditStudentModal from '../EditStudentModal/EditStudentModal';
import StudentDetailsModal from '../StudentDetailsModal/StudentDetailsModal';
import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';

const API_STUDENTS = `${API_BASE_URL}/api/students`;

// Helper to determine whether a student is enrolled in vocational subject (IT/ITeS) or has a sector
export const isVocationalStudent = (st) => {
  if (!st) return false;
  if (st.sector === 'Sector 1' || st.sector === 'Sector 2') return true;
  if (st.vocationalSector === 'Sector 1' || st.vocationalSector === 'Sector 2') return true;
  const sec = getStudentSector(st);
  if (sec === 'Sector 1' || sec === 'Sector 2') return true;

  if (Array.isArray(st.subjects)) {
    const hasVoc = st.subjects.some((sub) => {
      const s = String(sub).toLowerCase();
      return s.includes('it') || s.includes('ites') || s.includes('vocation') || s.includes('information technology');
    });
    if (hasVoc) return true;
  }

  const opt = String(st.optionalSubject || st.vocationalSubject || st.sixthSubject || '').toLowerCase();
  return opt.includes('it') || opt.includes('vocation');
};

const VOCATIONAL_CLASS_TABS = [
  { id: 'all', label: 'All Classes', shortLabel: 'All' },
  { id: 'class-9', label: 'Class IX', shortLabel: 'Class IX' },
  { id: 'class-10', label: 'Class X', shortLabel: 'Class X' },
  { id: 'class-11', label: 'Class XI (Arts & Science)', shortLabel: 'Class XI' },
  { id: 'class-12', label: 'Class XII (Arts & Science)', shortLabel: 'Class XII' }
];

const TeacherVocationalStudents = ({
  teacher,
  activeUser,
  teacherName = 'Faculty Member',
  onNavigateExaminations = () => {}
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const [selectedClassTab, setSelectedClassTab] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all'); // 'all' | 'Sector 1' | 'Sector 2'
  const [selectedStream, setSelectedStream] = useState('all'); // 'all' | 'Arts' | 'Science'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Boy' | 'Girl'
  const [casteFilter, setCasteFilter] = useState('all'); // 'all' | 'GEN' | 'OBC' | 'SC' | 'ST'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Enrolled' | 'Transferred' | 'Leave' | 'Failed'
  const [searchQuery, setSearchQuery] = useState('');

  // View & Sort State
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [sortBy, setSortBy] = useState('roll'); // 'roll' | 'name' | 'class' | 'sector'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Modals state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch vocational students
  const fetchVocationalStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Request students with vocational=true from backend
      const res = await fetch(`${API_STUDENTS}?vocational=true`);
      const data = await res.json();

      if (data.success && Array.isArray(data.students)) {
        // Double-check client-side vocational verification
        const vocStudents = data.students.filter(isVocationalStudent);
        setStudents(vocStudents.length > 0 ? vocStudents : data.students);
      } else {
        throw new Error(data.message || 'Failed to load vocational student directory.');
      }
    } catch (err) {
      console.error('Error fetching vocational students:', err);
      setError(err.message || 'Unable to connect to school student database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVocationalStudents();
  }, []);

  // Copy to clipboard helper
  const handleCopyText = (text, key) => {
    if (!text || text === 'Not Available' || text === 'Pending' || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Save student updates (from Edit Modal)
  const handleSaveStudent = async (updatedStudent) => {
    const targetId = updatedStudent.studentId || updatedStudent.id || updatedStudent._id;
    if (!targetId) return;

    try {
      const res = await fetch(`${API_STUDENTS}/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save student profile.');
      }

      const updatedRecord = data.student || updatedStudent;

      // Update state locally
      setStudents((prev) =>
        prev.map((s) => {
          const match =
            (s.studentId && s.studentId === targetId) ||
            (s.id && s.id === targetId) ||
            (s._id && s._id === targetId);
          return match ? { ...s, ...updatedRecord } : s;
        })
      );

      setFeedbackMsg({
        type: 'success',
        text: `Student ${updatedRecord.name} (Roll #${updatedRecord.roll}) updated successfully!`
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.error('Error updating student:', err);
      setFeedbackMsg({
        type: 'error',
        text: `Error updating student: ${err.message}`
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
      throw err;
    }
  };

  // Calculate overview counts for metrics and tab badges
  const classCounts = useMemo(() => {
    const counts = {
      all: students.length,
      'class-9': 0,
      'class-10': 0,
      'class-11': 0,
      'class-12': 0,
      class10_sec1: 0,
      class10_sec2: 0,
      class11_arts: 0,
      class11_sci: 0,
      class12_arts: 0,
      class12_sci: 0,
      boys: 0,
      girls: 0
    };

    students.forEach((s) => {
      const cid = String(s.classId || '').toLowerCase();
      const cname = String(s.className || '').toLowerCase();
      const sec = getStudentSector(s);
      const isBoy = s.gender === 'Boy' || !s.gender;

      if (isBoy) counts.boys++;
      else counts.girls++;

      if (cid.includes('9') || cname.includes('ix')) {
        counts['class-9']++;
      } else if (cid.includes('10') || cname.includes('class x') || cname.endsWith(' x')) {
        counts['class-10']++;
        if (sec === 'Sector 1') counts.class10_sec1++;
        else if (sec === 'Sector 2') counts.class10_sec2++;
      } else if (cid.includes('11') || cname.includes('xi')) {
        counts['class-11']++;
        if (cid.includes('sci') || cname.includes('sci')) counts.class11_sci++;
        else counts.class11_arts++;
      } else if (cid.includes('12') || cname.includes('xii')) {
        counts['class-12']++;
        if (cid.includes('sci') || cname.includes('sci')) counts.class12_sci++;
        else counts.class12_arts++;
      }
    });

    return counts;
  }, [students]);

  // Filter students based on active controls
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const cid = String(s.classId || '').toLowerCase();
        const cname = String(s.className || '').toLowerCase();
        const sec = getStudentSector(s);

        // 1. Class Tab Filter
        if (selectedClassTab === 'class-9') {
          if (!cid.includes('9') && !cname.includes('ix')) return false;
        } else if (selectedClassTab === 'class-10') {
          if (!cid.includes('10') && !cname.includes('class x') && !cname.endsWith(' x')) return false;
        } else if (selectedClassTab === 'class-11') {
          if (!cid.includes('11') && !cname.includes('xi')) return false;
        } else if (selectedClassTab === 'class-12') {
          if (!cid.includes('12') && !cname.includes('xii')) return false;
        }

        // 2. Sector Filter (Active for Class X or all)
        if (selectedSector !== 'all') {
          if (sec !== selectedSector) return false;
        }

        // 3. Stream Filter (for Senior Secondary)
        if (selectedStream !== 'all') {
          const isSci = cid.includes('sci') || cname.includes('sci') || cname.includes('science');
          const isArts = cid.includes('arts') || cname.includes('arts');
          if (selectedStream === 'Science' && !isSci) return false;
          if (selectedStream === 'Arts' && !isArts) return false;
        }

        // 4. Gender Filter
        if (genderFilter !== 'all') {
          const isBoy = s.gender === 'Boy' || !s.gender;
          if (genderFilter === 'Boy' && !isBoy) return false;
          if (genderFilter === 'Girl' && isBoy) return false;
        }

        // 5. Caste Filter
        if (casteFilter !== 'all') {
          const c = String(s.caste || '').trim().toUpperCase();
          if (casteFilter === 'GEN') {
            if (c !== 'GEN' && c !== 'GENERAL' && c !== 'UR' && c !== 'UNRESERVED') return false;
          } else if (casteFilter === 'OBC') {
            if (!c.includes('OBC')) return false;
          } else if (casteFilter === 'SC') {
            if (c !== 'SC') return false;
          } else if (casteFilter === 'ST') {
            if (c !== 'ST') return false;
          }
        }

        // 6. Status Filter
        if (statusFilter !== 'all') {
          const st = s.status || 'Enrolled';
          if (st.toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        // 7. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = String(s.name || '').toLowerCase();
          const roll = String(s.roll || '').toLowerCase();
          const apaar = String(s.apaarId || '').toLowerCase();
          const pen = String(s.penNumber || '').toLowerCase();
          const aadhaar = String(s.aadhaar || '').toLowerCase();
          const phone = String(s.phone || '').toLowerCase();
          const father = String(s.father || '').toLowerCase();
          const mother = String(s.mother || '').toLowerCase();
          const guardian = String(s.guardian || '').toLowerCase();
          const address = String(s.address || '').toLowerCase();
          const enr = String(s.enrollmentNo || '').toLowerCase();

          const matches =
            name.includes(q) ||
            roll.includes(q) ||
            apaar.includes(q) ||
            pen.includes(q) ||
            aadhaar.includes(q) ||
            phone.includes(q) ||
            father.includes(q) ||
            mother.includes(q) ||
            guardian.includes(q) ||
            address.includes(q) ||
            enr.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'roll') {
          const rA = parseInt(a.roll || a.rollNumber || 0, 10);
          const rB = parseInt(b.roll || b.rollNumber || 0, 10);
          comp = rA - rB;
        } else if (sortBy === 'name') {
          comp = String(a.name || '').localeCompare(String(b.name || ''));
        } else if (sortBy === 'class') {
          comp = String(a.classId || '').localeCompare(String(b.classId || ''));
        } else if (sortBy === 'sector') {
          const sA = getStudentSector(a) || 'Sector Z';
          const sB = getStudentSector(b) || 'Sector Z';
          comp = sA.localeCompare(sB);
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    students,
    selectedClassTab,
    selectedSector,
    selectedStream,
    genderFilter,
    casteFilter,
    statusFilter,
    searchQuery,
    sortBy,
    sortDirection
  ]);

  // Export current filtered list as CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'Roll No',
      'Student Name',
      'Class',
      'Stream / Wing',
      'Vocational Sector',
      'APAAR ID',
      'PEN Number',
      'Gender',
      'Caste',
      "Father's Name",
      "Mother's Name",
      'Phone',
      'Aadhaar',
      'Address',
      'Attendance',
      'Status'
    ];

    const rows = filteredStudents.map((st) => [
      st.roll || '',
      `"${(st.name || '').replace(/"/g, '""')}"`,
      st.className || st.classId || '',
      st.classId?.includes('sci') ? 'Science' : st.classId?.includes('arts') ? 'Arts' : 'General',
      getStudentSector(st) || 'IT/ITeS',
      st.apaarId || 'Not Available',
      st.penNumber || '',
      st.gender || 'Boy',
      st.caste || 'GEN',
      `"${(st.father || '').replace(/"/g, '""')}"`,
      `"${(st.mother || '').replace(/"/g, '""')}"`,
      st.phone || '',
      st.aadhaar ? `'${st.aadhaar}` : '',
      `"${(st.address || '').replace(/"/g, '""')}"`,
      st.attendance || '95%',
      st.status || 'Enrolled'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `vocational_students_${selectedClassTab}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print current view
  const handlePrint = () => {
    window.print();
  };

  // Helper to format APAAR ID into 4-digit groups (e.g. 2774 0368 5704)
  const formatIdGrouped = (val) => {
    if (!val || val === 'Not Available' || val === 'Pending') return val;
    const clean = String(val).replace(/\s+/g, '');
    if (clean.length === 12) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
    }
    return val;
  };

  // Helper to get printable active class label
  const activeClassLabel = useMemo(() => {
    const tab = VOCATIONAL_CLASS_TABS.find((t) => t.id === selectedClassTab);
    return tab ? tab.label : 'All Vocational Classes';
  }, [selectedClassTab]);

  return (
    <div className="vocational-students-wrapper">
      {/* =========================================================================
          TOP BANNER: VOCATIONAL FACULTY CONTEXT
         ========================================================================= */}
      <div className="vocational-hero-banner">
        <div className="hero-banner-main">
          <div className="hero-icon-badge">
            <Laptop size={28} />
          </div>
          <div className="hero-text-col">
            <div className="hero-badge-row">
              <span className="voc-role-chip">
                <Sparkles size={12} />
                <span>NSQF VOCATIONAL EDUCATION</span>
              </span>
              <span className="voc-subject-chip">
                <Award size={12} />
                <span>Trade: Information Technology (IT/ITeS)</span>
              </span>
              <span className="voc-session-chip">Academic Year 2026-2027</span>
            </div>
            <h2>Vocational Student Directory</h2>
            <p>
              Official student database for NSQF Vocational Education. Managing <strong>{classCounts.all} vocational students</strong> enrolled across Classes IX, X, XI, and XII under Vocational Teacher <strong>{teacherName}</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons in Banner */}
        <div className="hero-banner-actions no-print">
          <button
            type="button"
            className="hero-action-btn btn-export"
            onClick={handleExportCSV}
            title="Download Vocational Directory as CSV / Excel"
            disabled={filteredStudents.length === 0}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="hero-action-btn btn-print"
            onClick={handlePrint}
            title="Print clean vocational roster"
          >
            <Printer size={15} />
            <span>Print Roster</span>
          </button>

          <button
            type="button"
            className="hero-action-btn btn-refresh"
            onClick={() => fetchVocationalStudents(true)}
            disabled={refreshing || loading}
            title="Refresh student database"
          >
            <RefreshCw size={15} className={refreshing ? 'spinning-icon' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Notification / Feedback Banner */}
      {feedbackMsg && (
        <div className={`feedback-alert ${feedbackMsg.type}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            className="close-alert-btn"
            onClick={() => setFeedbackMsg(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          KEY STATS CARDS (Total, Class IX, Class X, Class XI, Class XII, Gender)
         ========================================================================= */}
      <div className="voc-stats-grid">
        {/* Total Card */}
        <div
          className={`voc-stat-card card-total ${selectedClassTab === 'all' ? 'active-stat' : ''}`}
          onClick={() => setSelectedClassTab('all')}
          title="Click to view all vocational students"
        >
          <div className="stat-card-icon icon-purple">
            <Users size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Total Vocational</span>
            <div className="stat-card-value-row">
              <span className="stat-card-value font-mono">{classCounts.all}</span>
              <span className="stat-card-unit">Students</span>
            </div>
            <span className="stat-card-subtext">IT/ITeS (Classes IX-XII)</span>
          </div>
        </div>

        {/* Class IX Card */}
        <div
          className={`voc-stat-card ${selectedClassTab === 'class-9' ? 'active-stat' : ''}`}
          onClick={() => setSelectedClassTab('class-9')}
          title="Click to filter Class IX"
        >
          <div className="stat-card-icon icon-blue">
            <GraduationCap size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Class IX</span>
            <div className="stat-card-value-row">
              <span className="stat-card-value font-mono">{classCounts['class-9']}</span>
              <span className="stat-card-unit">Enrolled</span>
            </div>
            <span className="stat-card-subtext">Secondary Foundation</span>
          </div>
        </div>

        {/* Class X Card */}
        <div
          className={`voc-stat-card ${selectedClassTab === 'class-10' ? 'active-stat' : ''}`}
          onClick={() => setSelectedClassTab('class-10')}
          title="Click to filter Class X (Board Year)"
        >
          <div className="stat-card-icon icon-amber">
            <Award size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Class X (Board)</span>
            <div className="stat-card-value-row">
              <span className="stat-card-value font-mono">{classCounts['class-10']}</span>
              <span className="stat-card-unit">Enrolled</span>
            </div>
            <span className="stat-card-subtext">
              Sec 1: <strong>{classCounts.class10_sec1}</strong> • Sec 2: <strong>{classCounts.class10_sec2}</strong>
            </span>
          </div>
        </div>

        {/* Class XI Card */}
        <div
          className={`voc-stat-card ${selectedClassTab === 'class-11' ? 'active-stat' : ''}`}
          onClick={() => setSelectedClassTab('class-11')}
          title="Click to filter Class XI"
        >
          <div className="stat-card-icon icon-teal">
            <Layers size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Class XI</span>
            <div className="stat-card-value-row">
              <span className="stat-card-value font-mono">{classCounts['class-11']}</span>
              <span className="stat-card-unit">Enrolled</span>
            </div>
            <span className="stat-card-subtext">
              Arts: <strong>{classCounts.class11_arts}</strong> • Sci: <strong>{classCounts.class11_sci}</strong>
            </span>
          </div>
        </div>

        {/* Class XII Card */}
        <div
          className={`voc-stat-card ${selectedClassTab === 'class-12' ? 'active-stat' : ''}`}
          onClick={() => setSelectedClassTab('class-12')}
          title="Click to filter Class XII"
        >
          <div className="stat-card-icon icon-indigo">
            <Building size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Class XII (H.S.)</span>
            <div className="stat-card-value-row">
              <span className="stat-card-value font-mono">{classCounts['class-12']}</span>
              <span className="stat-card-unit">Enrolled</span>
            </div>
            <span className="stat-card-subtext">
              Arts: <strong>{classCounts.class12_arts}</strong> • Sci: <strong>{classCounts.class12_sci}</strong>
            </span>
          </div>
        </div>

        {/* Gender Breakdown Card */}
        <div className="voc-stat-card card-gender">
          <div className="stat-card-icon icon-pink">
            <UserCheck size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-title">Gender Ratio</span>
            <div className="gender-mini-split">
              <div className="split-col boy-col">
                <BoyIcon size={14} />
                <span>{classCounts.boys} Boys</span>
              </div>
              <span className="split-sep">•</span>
              <div className="split-col girl-col">
                <GirlIcon size={14} />
                <span>{classCounts.girls} Girls</span>
              </div>
            </div>
            <span className="stat-card-subtext">
              {classCounts.all > 0 ? `${Math.round((classCounts.girls / classCounts.all) * 100)}% Female Enrollment` : 'All Enrolled'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN ROSTER SECTION
         ========================================================================= */}
      <div className="voc-roster-card">
        {/* Class Tabs Navigation */}
        <div className="voc-class-tabs-bar no-print">
          <div className="tabs-list">
            {VOCATIONAL_CLASS_TABS.map((tab) => {
              const count = classCounts[tab.id] || 0;
              const isActive = selectedClassTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`voc-class-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedClassTab(tab.id)}
                >
                  <span className="tab-name">{tab.shortLabel}</span>
                  <span className={`tab-count-pill ${isActive ? 'count-active' : ''}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick link to Examinations */}
          <button
            type="button"
            className="evaluate-shortcut-btn"
            onClick={onNavigateExaminations}
            title="Open Examinations & Marks Evaluation for IT/ITeS"
          >
            <Award size={14} />
            <span>Marks Evaluation</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Filter Controls & Search Toolbar */}
        <div className="voc-filter-toolbar no-print">
          <div className="toolbar-top-row">
            {/* Search Input Box */}
            <div className="voc-search-input-wrap">
              <Search size={16} className="search-box-icon" />
              <input
                type="text"
                placeholder="Search by student name, roll, APAAR ID, PEN, phone, parents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Table vs Cards) */}
            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={15} />
                <span>Table</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <LayoutGrid size={15} />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters Bar */}
          <div className="toolbar-bottom-row">
            {/* Sector Filter (Active for Class X or all) */}
            {(selectedClassTab === 'class-10' || selectedClassTab === 'all') && (
              <div className="filter-pill-select-wrap">
                <span className="filter-chip-label">Sector:</span>
                <div className="filter-chip-buttons">
                  <button
                    type="button"
                    className={`filter-chip ${selectedSector === 'all' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedSector('all')}
                  >
                    All Sectors
                  </button>
                  <button
                    type="button"
                    className={`filter-chip sector-1-chip ${selectedSector === 'Sector 1' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedSector('Sector 1')}
                  >
                    Sector 1 ({classCounts.class10_sec1})
                  </button>
                  <button
                    type="button"
                    className={`filter-chip sector-2-chip ${selectedSector === 'Sector 2' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedSector('Sector 2')}
                  >
                    Sector 2 ({classCounts.class10_sec2})
                  </button>
                </div>
              </div>
            )}

            {/* Stream Filter (for Senior Secondary Class XI & XII) */}
            {(selectedClassTab === 'class-11' || selectedClassTab === 'class-12' || selectedClassTab === 'all') && (
              <div className="filter-pill-select-wrap">
                <span className="filter-chip-label">Stream:</span>
                <div className="filter-chip-buttons">
                  <button
                    type="button"
                    className={`filter-chip ${selectedStream === 'all' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedStream('all')}
                  >
                    All Streams
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${selectedStream === 'Arts' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedStream('Arts')}
                  >
                    Arts Stream
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${selectedStream === 'Science' ? 'chip-active' : ''}`}
                    onClick={() => setSelectedStream('Science')}
                  >
                    Science Stream
                  </button>
                </div>
              </div>
            )}

            {/* Gender Filter */}
            <div className="filter-pill-select-wrap">
              <span className="filter-chip-label">Gender:</span>
              <div className="filter-chip-buttons">
                <button
                  type="button"
                  className={`filter-chip ${genderFilter === 'all' ? 'chip-active' : ''}`}
                  onClick={() => setGenderFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`filter-chip ${genderFilter === 'Boy' ? 'chip-active' : ''}`}
                  onClick={() => setGenderFilter('Boy')}
                >
                  <BoyIcon size={12} />
                  <span>Boys</span>
                </button>
                <button
                  type="button"
                  className={`filter-chip ${genderFilter === 'Girl' ? 'chip-active' : ''}`}
                  onClick={() => setGenderFilter('Girl')}
                >
                  <GirlIcon size={12} />
                  <span>Girls</span>
                </button>
              </div>
            </div>

            {/* Caste / Category Filter */}
            <div className="filter-pill-select-wrap">
              <span className="filter-chip-label">Category:</span>
              <div className="filter-chip-buttons">
                {['all', 'GEN', 'OBC', 'SC', 'ST'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-chip ${casteFilter === cat ? 'chip-active' : ''}`}
                    onClick={() => setCasteFilter(cat)}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-pill-select-wrap">
              <span className="filter-chip-label">Status:</span>
              <div className="filter-chip-buttons">
                {['all', 'Enrolled', 'Transferred', 'Failed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-chip ${statusFilter === st ? 'chip-active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st === 'all' ? 'All Status' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters Shortcut (if active) */}
            {(selectedSector !== 'all' ||
              selectedStream !== 'all' ||
              genderFilter !== 'all' ||
              casteFilter !== 'all' ||
              statusFilter !== 'all' ||
              searchQuery) && (
              <button
                type="button"
                className="reset-filters-chip-btn"
                onClick={() => {
                  setSelectedSector('all');
                  setSelectedStream('all');
                  setGenderFilter('all');
                  setCasteFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                title="Reset all filters"
              >
                <X size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter & Sort Bar */}
        <div className="voc-results-subbar">
          <div className="results-counter">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> vocational students
            {selectedClassTab !== 'all' && (
              <span className="filter-highlight-tag">in {activeClassLabel}</span>
            )}
            {selectedSector !== 'all' && (
              <span className="filter-highlight-tag">({selectedSector})</span>
            )}
            {searchQuery && (
              <span className="filter-highlight-tag">matching "{searchQuery}"</span>
            )}
          </div>

          <div className="sort-controls-row no-print">
            <span className="sort-label">
              <ArrowUpDown size={13} />
              <span>Sort by:</span>
            </span>
            <select
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="roll">Roll Number</option>
              <option value="name">Student Name</option>
              <option value="class">Class</option>
              <option value="sector">Vocational Sector</option>
            </select>
            <button
              type="button"
              className="sort-direction-btn"
              onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              title={sortDirection === 'asc' ? 'Ascending (1 to 9)' : 'Descending (9 to 1)'}
            >
              {sortDirection === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>

        {/* Print Header (Visible only when printed) */}
        <div className="printable-only-header">
          <div className="school-print-title">
            <h2>PM SHRI MOHARCHERRA H.S. SCHOOL</h2>
            <h3>VOCATIONAL EDUCATION (NSQF) — IT/ITeS STUDENT DIRECTORY</h3>
            <p>
              Class: <strong>{activeClassLabel}</strong> {selectedSector !== 'all' ? `• ${selectedSector}` : ''} | Total Students: <strong>{filteredStudents.length}</strong> | Date: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* =====================================================================
            DATA VIEW (TABLE OR CARDS)
           ===================================================================== */}
        {loading ? (
          <div className="voc-loading-container">
            <RefreshCw size={36} className="spinning-icon" />
            <p>Loading vocational student records...</p>
          </div>
        ) : error ? (
          <div className="voc-error-container">
            <AlertCircle size={36} />
            <p>{error}</p>
            <button
              type="button"
              className="retry-fetch-btn"
              onClick={() => fetchVocationalStudents()}
            >
              Retry Loading Database
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="voc-empty-container">
            <Users size={40} />
            <h4>No vocational students found</h4>
            <p>No student records match your selected filters or search keyword.</p>
            <button
              type="button"
              className="clear-filters-btn"
              onClick={() => {
                setSelectedClassTab('all');
                setSelectedSector('all');
                setSelectedStream('all');
                setGenderFilter('all');
                setCasteFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ===================================================================
              1. RICH TABLE VIEW
             =================================================================== */
          <div className="voc-table-responsive-wrapper">
            <table className="voc-students-table">
              <thead>
                <tr>
                  <th style={{ width: '75px', textAlign: 'center' }}>Roll</th>
                  <th>Student & PEN</th>
                  <th style={{ width: '135px' }}>Class / Wing</th>
                  <th style={{ width: '125px', textAlign: 'center' }}>Sector / Trade</th>
                  <th style={{ width: '155px' }}>APAAR ID</th>
                  <th style={{ width: '145px' }}>Aadhaar No.</th>
                  <th>Parents / Guardian</th>
                  <th style={{ width: '120px' }}>Contact</th>
                  <th style={{ width: '75px', textAlign: 'center' }}>Caste</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Att %</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '110px', textAlign: 'center' }} className="no-print">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const studentKey = st.studentId || st.id || st._id;
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const sector = getStudentSector(st);
                  const pen = st.penNumber || st.pen || '';
                  const apaar = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : '';
                  const aadhaar = st.aadhaar || '';
                  const isClassX = String(st.classId || '').includes('10');
                  const isTransferred = isTransferredStudent(st);

                  return (
                    <tr key={studentKey} className={`voc-student-row ${isTransferred ? 'transferred-row' : ''}`}>
                      {/* Roll No */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="voc-roll-pill font-mono">
                          #{st.roll || '00'}
                        </span>
                      </td>

                      {/* Student Name & Avatar & PEN */}
                      <td>
                        <div className="voc-name-cell">
                          <div className={`voc-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                            {isBoy ? <BoyIcon size={16} /> : <GirlIcon size={16} />}
                          </div>
                          <div className="voc-name-meta">
                            <span className="voc-student-fullname font-bold">
                              {st.name}
                            </span>
                            <div className="voc-sub-meta-row">
                              {pen ? (
                                <span
                                  className="voc-pen-badge font-mono"
                                  title="Click to copy PEN Number"
                                  onClick={() => handleCopyText(pen, `pen-${studentKey}`)}
                                >
                                  <span>PEN: {pen}</span>
                                  {copiedId === `pen-${studentKey}` ? (
                                    <Check size={11} className="copied-icon" />
                                  ) : (
                                    <Copy size={11} className="copy-icon" />
                                  )}
                                </span>
                              ) : (
                                <span className="voc-pen-badge badge-pending font-mono">
                                  PEN: Pending
                                </span>
                              )}
                              {st.admissionNo && (
                                <span className="voc-adm-tag">Adm #{st.admissionNo}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class / Wing */}
                      <td>
                        <div className="voc-class-cell">
                          <span className="voc-class-badge font-bold">
                            {st.className || st.classId || 'Class'}
                          </span>
                          <span className="voc-wing-text">
                            {st.classId?.includes('sci')
                              ? 'Science Stream'
                              : st.classId?.includes('arts')
                              ? 'Arts Stream'
                              : isClassX
                              ? 'Secondary (Board)'
                              : 'Secondary'}
                          </span>
                        </div>
                      </td>

                      {/* Sector / Trade */}
                      <td style={{ textAlign: 'center' }}>
                        {sector === 'Sector 1' ? (
                          <span className="voc-sector-pill sector-1-pill font-bold" title="Sector 1 IT/ITeS Batch">
                            Sector 1
                          </span>
                        ) : sector === 'Sector 2' ? (
                          <span className="voc-sector-pill sector-2-pill font-bold" title="Sector 2 IT/ITeS Batch">
                            Sector 2
                          </span>
                        ) : (
                          <span className="voc-sector-pill sector-general-pill" title="NSQF IT/ITeS Trade">
                            IT/ITeS
                          </span>
                        )}
                      </td>

                      {/* APAAR ID */}
                      <td>
                        {apaar ? (
                          <span
                            className="voc-id-pill font-mono"
                            title="Click to copy 12-digit APAAR ID"
                            onClick={() => handleCopyText(apaar, `apaar-${studentKey}`)}
                          >
                            <span>{formatIdGrouped(apaar)}</span>
                            {copiedId === `apaar-${studentKey}` ? (
                              <Check size={12} className="copied-icon" />
                            ) : (
                              <Copy size={12} className="copy-icon" />
                            )}
                          </span>
                        ) : (
                          <span className="voc-id-pill badge-pending font-mono">
                            {st.apaarId === 'Not Available' ? 'Not Available' : 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Aadhaar */}
                      <td>
                        {aadhaar ? (
                          <span
                            className="voc-aadhaar-pill font-mono"
                            title="Aadhaar Card No. (Click to copy)"
                            onClick={() => handleCopyText(aadhaar, `aadhaar-${studentKey}`)}
                          >
                            <span>{formatIdGrouped(aadhaar)}</span>
                            {copiedId === `aadhaar-${studentKey}` ? (
                              <Check size={11} className="copied-icon" />
                            ) : (
                              <Copy size={11} className="copy-icon" />
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-dash font-mono">—</span>
                        )}
                      </td>

                      {/* Parents / Guardian */}
                      <td>
                        <div className="voc-parents-cell">
                          {st.father && (
                            <span className="parent-line">
                              <strong>F:</strong> {st.father}
                            </span>
                          )}
                          {st.mother && (
                            <span className="parent-line text-muted">
                              <strong>M:</strong> {st.mother}
                            </span>
                          )}
                          {!st.father && !st.mother && st.guardian && (
                            <span className="parent-line">
                              <strong>G:</strong> {st.guardian}
                            </span>
                          )}
                          {!st.father && !st.mother && !st.guardian && (
                            <span className="text-muted-dash">—</span>
                          )}
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td>
                        {st.phone ? (
                          <a
                            href={`tel:${st.phone}`}
                            className="voc-phone-link font-mono"
                            title={`Call ${st.phone}`}
                          >
                            <Phone size={12} />
                            <span>{st.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-dash font-mono">—</span>
                        )}
                      </td>

                      {/* Caste / Category */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`voc-caste-pill caste-${(st.caste || 'GEN').toLowerCase()}`}>
                          {st.caste || 'GEN'}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="voc-att-pill font-mono font-bold">
                          {st.attendance || '95%'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`voc-status-pill status-${(st.status || 'Enrolled').toLowerCase()}`}
                        >
                          {st.status || 'Enrolled'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: 'center' }} className="no-print">
                        <div className="voc-actions-row">
                          <button
                            type="button"
                            className="voc-action-icon-btn view-btn"
                            onClick={() => setViewingStudent(st)}
                            title="View Full Student Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="voc-action-icon-btn edit-btn"
                            onClick={() => setEditingStudent(st)}
                            title="Edit Student Details"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ===================================================================
              2. RICH CARD VIEW
             =================================================================== */
          <div className="voc-cards-grid">
            {filteredStudents.map((st) => {
              const studentKey = st.studentId || st.id || st._id;
              const isBoy = st.gender === 'Boy' || !st.gender;
              const sector = getStudentSector(st);
              const pen = st.penNumber || st.pen || '';
              const apaar = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : '';
              const aadhaar = st.aadhaar || '';

              return (
                <div key={studentKey} className="voc-student-card">
                  {/* Card Header */}
                  <div className="card-top-row">
                    <div className="card-profile-col">
                      <div className={`card-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                        {isBoy ? <BoyIcon size={18} /> : <GirlIcon size={18} />}
                      </div>
                      <div className="card-name-block">
                        <h4 className="card-student-name">{st.name}</h4>
                        <div className="card-roll-class-row">
                          <span className="card-roll-tag font-mono">Roll #{st.roll || '00'}</span>
                          <span className="card-class-tag">{st.className || st.classId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-sector-col">
                      {sector === 'Sector 1' ? (
                        <span className="voc-sector-pill sector-1-pill font-bold">Sector 1</span>
                      ) : sector === 'Sector 2' ? (
                        <span className="voc-sector-pill sector-2-pill font-bold">Sector 2</span>
                      ) : (
                        <span className="voc-sector-pill sector-general-pill">IT/ITeS</span>
                      )}
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="card-details-list">
                    {/* APAAR ID */}
                    <div className="card-detail-item">
                      <span className="detail-item-label">APAAR ID</span>
                      {apaar ? (
                        <span
                          className="detail-item-value font-mono copyable"
                          onClick={() => handleCopyText(apaar, `apaar-${studentKey}`)}
                          title="Click to copy APAAR ID"
                        >
                          <span>{formatIdGrouped(apaar)}</span>
                          {copiedId === `apaar-${studentKey}` ? <Check size={12} /> : <Copy size={12} />}
                        </span>
                      ) : (
                        <span className="detail-item-value font-mono text-pending">
                          {st.apaarId === 'Not Available' ? 'Not Available' : 'Pending'}
                        </span>
                      )}
                    </div>

                    {/* PEN Number */}
                    <div className="card-detail-item">
                      <span className="detail-item-label">PEN Number</span>
                      {pen ? (
                        <span
                          className="detail-item-value font-mono copyable"
                          onClick={() => handleCopyText(pen, `pen-${studentKey}`)}
                          title="Click to copy PEN"
                        >
                          <span>{pen}</span>
                          {copiedId === `pen-${studentKey}` ? <Check size={12} /> : <Copy size={12} />}
                        </span>
                      ) : (
                        <span className="detail-item-value font-mono text-pending">Pending</span>
                      )}
                    </div>

                    {/* Parents */}
                    <div className="card-detail-item">
                      <span className="detail-item-label">Parents</span>
                      <span className="detail-item-value text-ellipsis" title={`Father: ${st.father || '—'}, Mother: ${st.mother || '—'}`}>
                        {st.father || st.mother || st.guardian || '—'}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="card-detail-item">
                      <span className="detail-item-label">Phone</span>
                      {st.phone ? (
                        <a href={`tel:${st.phone}`} className="card-phone-link font-mono">
                          <Phone size={12} />
                          <span>{st.phone}</span>
                        </a>
                      ) : (
                        <span className="detail-item-value font-mono text-muted">—</span>
                      )}
                    </div>

                    {/* Meta chips: Gender, Caste, Attendance */}
                    <div className="card-chips-row">
                      <span className={`card-chip ${isBoy ? 'chip-boy' : 'chip-girl'}`}>
                        {isBoy ? 'Boy' : 'Girl'}
                      </span>
                      <span className="card-chip chip-caste">{st.caste || 'GEN'}</span>
                      <span className="card-chip chip-att">{st.attendance || '95%'} Att.</span>
                      <span className={`card-chip chip-status status-${(st.status || 'Enrolled').toLowerCase()}`}>
                        {st.status || 'Enrolled'}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="card-actions-footer no-print">
                    <button
                      type="button"
                      className="card-action-btn btn-view"
                      onClick={() => setViewingStudent(st)}
                    >
                      <Eye size={14} />
                      <span>Full Profile</span>
                    </button>
                    <button
                      type="button"
                      className="card-action-btn btn-edit"
                      onClick={() => setEditingStudent(st)}
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Card Footer */}
        <div className="voc-roster-footer">
          <div className="footer-count-text">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> total vocational students enrolled in IT/ITeS
          </div>

          <div className="footer-actions-wrap no-print">
            <button
              type="button"
              className="footer-btn btn-export-bottom"
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
            >
              <Download size={14} />
              <span>Download CSV Report</span>
            </button>
            <button
              type="button"
              className="footer-btn btn-print-bottom"
              onClick={handlePrint}
            >
              <Printer size={14} />
              <span>Print Student List</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: VIEW FULL STUDENT PROFILE (StudentDetailsModal)
         ========================================================================= */}
      {viewingStudent && (
        <StudentDetailsModal
          student={viewingStudent}
          currentClass={
            SCHOOL_CLASSES.find((c) => c.id === viewingStudent.classId) || {
              id: viewingStudent.classId,
              name: viewingStudent.className || 'Class',
              wing: 'Secondary / Senior Secondary'
            }
          }
          onClose={() => setViewingStudent(null)}
          onEdit={(st) => {
            setViewingStudent(null);
            setEditingStudent(st);
          }}
        />
      )}

      {/* =========================================================================
          MODAL 2: EDIT STUDENT DETAILS (EditStudentModal)
         ========================================================================= */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          classes={SCHOOL_CLASSES}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
};

export default TeacherVocationalStudents;