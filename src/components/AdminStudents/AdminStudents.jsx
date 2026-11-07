import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './AdminStudents.css';
import StudentAttendanceModal from '../StudentAttendanceModal/StudentAttendanceModal';
import ClassAttendanceModal from '../ClassAttendanceModal/ClassAttendanceModal';
import EditStudentModal, { formatToIsoDate, formatToDisplayDate } from '../EditStudentModal/EditStudentModal';
import StudentDetailsModal from '../StudentDetailsModal/StudentDetailsModal';
import PendingStatusSection from '../PendingStatusSection/PendingStatusSection';
import PendingStatusModal, { isFieldPending, isTransferredStudent, isFailedStudent, isTransferredOrFailed } from '../PendingStatusModal/PendingStatusModal';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import GenderSelect from '../GenderSelect/GenderSelect';
import UniversalStudentSearchModal from '../UniversalStudentSearchModal/UniversalStudentSearchModal';
import {
  GraduationCap,
  Users,
  User,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  Filter,
  Phone,
  BookOpen,
  Sparkles,
  Hash,
  Fingerprint,
  ShieldAlert,
  Download,
  X,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  AlertCircle,
  Loader2,
  Eye,
  ShieldCheck,
  Layers,
  BarChart3,
  FileSpreadsheet,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { exportStudentsToExcel } from '../../utils/studentExcelExport';

// Classes Definition from Class 1 to 12 (Arts & Science for XI & XII only, no sections)
export const SCHOOL_CLASSES = [
  { id: 'class-1', name: 'Class I', wing: 'Primary Wing', category: 'primary' },
  { id: 'class-2', name: 'Class II', wing: 'Primary Wing', category: 'primary' },
  { id: 'class-3', name: 'Class III', wing: 'Primary Wing', category: 'primary' },
  { id: 'class-4', name: 'Class IV', wing: 'Primary Wing', category: 'primary' },
  { id: 'class-5', name: 'Class V', wing: 'Primary Wing', category: 'primary' },
  { id: 'class-6', name: 'Class VI', wing: 'Elementary', category: 'elementary' },
  { id: 'class-7', name: 'Class VII', wing: 'Elementary', category: 'elementary' },
  { id: 'class-8', name: 'Class VIII', wing: 'Elementary', category: 'elementary' },
  { id: 'class-9', name: 'Class IX', wing: 'Secondary', category: 'secondary' },
  { id: 'class-10', name: 'Class X', wing: 'Secondary', category: 'secondary' },
  { id: 'class-11-sci', name: 'Class XI (Science)', wing: 'Higher Secondary', category: 'senior', stream: 'Science' },
  { id: 'class-11-arts', name: 'Class XI (Arts)', wing: 'Higher Secondary', category: 'senior', stream: 'Arts' },
  { id: 'class-12-sci', name: 'Class XII (Science)', wing: 'Higher Secondary (TBSE H.S.)', category: 'senior', stream: 'Science' },
  { id: 'class-12-arts', name: 'Class XII (Arts)', wing: 'Higher Secondary (TBSE H.S.)', category: 'senior', stream: 'Arts' },
];

const API_BASE = `${API_BASE_URL}/api/students`;

/**
 * Reset scrolling across window and parent container (.admin-main) to top
 */
export const scrollAdminToTop = () => {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  const scrollContainers = document.querySelectorAll(
    '.admin-main, .admin-content-area, .admin-layout, .portal-main-content, .class-students-detail-view'
  );
  scrollContainers.forEach((el) => {
    if (el) el.scrollTop = 0;
  });

  const topAnchor =
    document.querySelector('.detail-navigation-bar') ||
    document.querySelector('.class-students-detail-view') ||
    document.querySelector('.admin-topbar');
  if (topAnchor && typeof topAnchor.scrollIntoView === 'function') {
    topAnchor.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
};

const AdminStudents = ({ initialOpenAdd = false, initialSelectedClassId = null }) => {
  const { classId: routeClassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClassId, setSelectedClassId] = useState(routeClassId || initialSelectedClassId || null);
  const [showScrollBack, setShowScrollBack] = useState(false);

  // Sync selectedClassId with URL parameter routeClassId (e.g. on direct visit, reload, or back/forward)
  useEffect(() => {
    if (routeClassId) {
      setSelectedClassId(routeClassId);
    } else if (initialSelectedClassId) {
      setSelectedClassId(initialSelectedClassId);
    } else {
      setSelectedClassId(null);
    }
  }, [routeClassId, initialSelectedClassId]);

  // Ensure entering a class, switching classes, or returning to list ALWAYS starts from the top
  useEffect(() => {
    scrollAdminToTop();
    const t1 = setTimeout(scrollAdminToTop, 20);
    const t2 = setTimeout(scrollAdminToTop, 80);
    const t3 = setTimeout(scrollAdminToTop, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [selectedClassId, routeClassId]);

  // Track scrolling inside .admin-main and window to toggle the floating Back/Top pill
  useEffect(() => {
    if (!selectedClassId) {
      setShowScrollBack(false);
      return;
    }

    const adminMain = document.querySelector('.admin-main');
    const target = adminMain || window;

    const handleScroll = () => {
      const scrollY = adminMain ? adminMain.scrollTop : window.scrollY;

      // Determine if the bottom navigation bar is entering or already in the viewport
      let bottomBarVisible = false;
      const bottomBar = document.querySelector('.class-detail-bottom-bar');
      if (bottomBar) {
        const rect = bottomBar.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        // Fade out slightly before bottom bar reaches the floating pill area (within 30px)
        if (rect.top <= viewportHeight + 30 && rect.bottom >= 0) {
          bottomBarVisible = true;
        }
      }

      setShowScrollBack(scrollY > 200 && !bottomBarVisible);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [selectedClassId]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [casteFilter, setCasteFilter] = useState('ALL');
  const [pendingFilter, setPendingFilter] = useState('ALL');
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingModalField, setPendingModalField] = useState('apaarId');
  const [pendingModalClass, setPendingModalClass] = useState('ALL');
  const [casteViewTab, setCasteViewTab] = useState('all'); // 'all', 'overall', 'upper', 'primary'
  const [showAddModal, setShowAddModal] = useState(initialOpenAdd);
  const [sortOrder, setSortOrder] = useState('roll'); // 'roll' | 'name-asc' | 'name-desc'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut to open Universal Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setUniversalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const sortDropdownRef = useRef(null);

  // Close sort dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownOpen]);

  useEffect(() => {
    if (initialOpenAdd) {
      setShowAddModal(true);
    }
  }, [initialOpenAdd]);
  const [selectedAttendanceStudent, setSelectedAttendanceStudent] = useState(null);
  const [showClassAttendanceModal, setShowClassAttendanceModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const addDobPickerRef = useRef(null);

  // New Student Form State (No section)
  const [newStudent, setNewStudent] = useState({
    name: '',
    classId: 'class-6',
    roll: '',
    gender: 'Boy',
    enrollmentNo: '',
    enrollmentYear: '2026',
    registrationYear: '',
    guardian: '',
    father: '',
    mother: '',
    caste: '',
    aadhaar: '',
    penNumber: '',
    apaarId: '',
    dob: '',
    phone: ''
  });

  // Fetch students from backend MongoDB API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        throw new Error(data.message || 'Failed to fetch students from DB');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Server is currently inactive or unavailable. Please try again after some time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle Export complete student roster as responsive Excel spreadsheet
  const handleExportExcel = (targetClassId = null) => {
    try {
      setExporting(true);
      let targetList = [];
      let classMeta = null;

      if (targetClassId) {
        targetList = students.filter((s) => s.classId === targetClassId);
        classMeta = SCHOOL_CLASSES.find((c) => c.id === targetClassId) || { name: targetClassId };
      } else {
        targetList = students;
        classMeta = { name: 'All Classes (School Master Roster)' };
      }

      if (targetList.length === 0) {
        alert('No student records found to export.');
        return;
      }

      const res = exportStudentsToExcel({
        students: targetList,
        currentClass: classMeta,
        includeTransferred: true
      });

      setExportNotice(`Exported ${res.count} student records to ${res.fileName}`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Failed to export students to Excel:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Current selected class object
  const currentClass = SCHOOL_CLASSES.find(c => c.id === selectedClassId);
  const isClass8 = currentClass ? ['class-6', 'class-7', 'class-8'].includes(currentClass.id) : false;
  const isEnrollmentClass = ['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(currentClass?.id);
  const isClass1to8 = currentClass ? ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'].includes(currentClass.id) : false;
  const showStudentId = false;

  const renderStatusBadge = (status) => {
    if (status === 'Transferred') {
      return <span className="enrolled-status-pill status-transferred">Transferred</span>;
    }
    if (status === 'Leave') {
      return <span className="enrolled-status-pill status-leave">Leave</span>;
    }
    if (status === 'Failed') {
      return <span className="enrolled-status-pill status-failed">Failed</span>;
    }
    if (status === 'Alumni') {
      return <span className="enrolled-status-pill status-alumni">Alumni</span>;
    }
    return <span className="enrolled-status-pill status-enrolled">{status || 'Enrolled'}</span>;
  };

  const getDefaultEnrollmentYear = (classId) => {
    if (classId === 'class-11-arts' || classId === 'class-11-sci') return '2024';
    if (classId === 'class-12-arts' || classId === 'class-12-sci') return '2025';
    return '2026';
  };

  const renderEnrollmentBadge = (enr, isMini = false) => {
    if (!enr || enr === '—') return <span style={{ color: '#94a3b8' }}>—</span>;
    if (enr === 'Not found') {
      return <span className={`not-found-badge ${isMini ? 'mini' : ''}`}>Not found</span>;
    }
    if (enr.toLowerCase().includes('duplicate')) {
      return <span className={`verify-duplicate-badge ${isMini ? 'mini' : ''}`}>Verify duplicate</span>;
    }
    if (enr.toLowerCase().includes('spelling')) {
      return <span className={`verify-spelling-badge ${isMini ? 'mini' : ''}`}>Verify spelling</span>;
    }
    const hasAsterisk = enr.endsWith('*');
    const cleanNumber = hasAsterisk ? enr.slice(0, -1) : enr;
    return (
      <span className="enr-code" title={hasAsterisk ? 'Spelling difference / variant in certificate' : ''}>
        {cleanNumber}
        {hasAsterisk && <span className="enr-asterisk-mark" title="Variant in certificate">*</span>}
      </span>
    );
  };

  const handleSaveStudentAttendance = async (updatedStudent) => {
    setStudents(prev => prev.map(s => (s.id === updatedStudent.id || s.studentId === updatedStudent.id) ? updatedStudent : s));
    if (selectedAttendanceStudent?.id === updatedStudent.id || selectedAttendanceStudent?.studentId === updatedStudent.id) {
      setSelectedAttendanceStudent(updatedStudent);
    }

    try {
      await fetch(`${API_BASE}/${updatedStudent.id || updatedStudent.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: updatedStudent.attendance,
          monthlyAttendance: updatedStudent.monthlyAttendance
        })
      });
    } catch (err) {
      console.error('Error saving student attendance to DB:', err);
    }
  };

  const handleSaveClassAttendance = async (updatedClassStudents) => {
    setStudents(prev => {
      const idMap = new Map(updatedClassStudents.map(st => [st.id || st.studentId, st]));
      return prev.map(s => idMap.has(s.id) ? idMap.get(s.id) : (idMap.has(s.studentId) ? idMap.get(s.studentId) : s));
    });

    try {
      await fetch(`${API_BASE}/bulk-attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedClassStudents })
      });
    } catch (err) {
      console.error('Error saving bulk attendance to DB:', err);
    }
  };

  const handleSaveEditedStudent = async (updatedStudent) => {
    setStudents(prev => prev.map(s => (s.id === updatedStudent.id || s.studentId === updatedStudent.id) ? updatedStudent : s));
    if (selectedAttendanceStudent?.id === updatedStudent.id || selectedAttendanceStudent?.studentId === updatedStudent.id) {
      setSelectedAttendanceStudent(updatedStudent);
    }

    try {
      await fetch(`${API_BASE}/${updatedStudent.id || updatedStudent.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
    } catch (err) {
      console.error('Error updating student in DB:', err);
    }
  };

  // Filter students based on class selection, caste filter, and search query, strictly in roll no wise order
  const displayedStudents = students
    .filter(s => {
      const matchesClass = selectedClassId ? s.classId === selectedClassId : true;

      const c = (s.caste || '').trim().toUpperCase();
      let matchesCaste = true;
      if (casteFilter === 'SC') matchesCaste = c === 'SC';
      else if (casteFilter === 'ST') matchesCaste = c === 'ST';
      else if (casteFilter === 'OBC') matchesCaste = c === 'OBC';
      else if (casteFilter === 'UR') matchesCaste = c === 'UR' || c === 'GEN' || c === 'GENERAL';

      let matchesPending = true;
      if (pendingFilter !== 'ALL') {
        if (isTransferredOrFailed(s)) {
          matchesPending = false;
        } else if (pendingFilter === 'apaarId') matchesPending = isFieldPending(s.apaarId);
        else if (pendingFilter === 'penNumber') matchesPending = isFieldPending(s.penNumber);
        else if (pendingFilter === 'aadhaar') matchesPending = isFieldPending(s.aadhaar);
        else if (pendingFilter === 'phone') matchesPending = isFieldPending(s.phone);
        else if (pendingFilter === 'any') matchesPending = isFieldPending(s.apaarId) || isFieldPending(s.penNumber) || isFieldPending(s.aadhaar) || isFieldPending(s.phone);
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch = (s.name || '').toLowerCase().includes(q) ||
                            String(s.roll || '').includes(searchQuery) ||
                            (s.gender || '').toLowerCase().includes(q) ||
                            (s.id || s.studentId || '').toLowerCase().includes(q) ||
                            (s.enrollmentNo || '').toLowerCase().includes(q) ||
                            (s.guardian || '').toLowerCase().includes(q) ||
                            (s.father || '').toLowerCase().includes(q) ||
                            (s.mother || '').toLowerCase().includes(q) ||
                            (s.aadhaar || '').toLowerCase().includes(q) ||
                            (s.caste || '').toLowerCase().includes(q) ||
                            (s.admissionNo || '').toLowerCase().includes(q) ||
                            (s.address || '').toLowerCase().includes(q) ||
                            (s.penNumber || '').toLowerCase().includes(q) ||
                            (s.apaarId || '').toLowerCase().includes(q) ||
                            (s.dob || '').toLowerCase().includes(q) ||
                            (s.status || '').toLowerCase().includes(q) ||
                            (s.phone || '').includes(searchQuery);
      return matchesClass && matchesCaste && matchesPending && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'name-asc') {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
        if (comp !== 0) return comp;
        const rollA = parseInt(a.roll, 10) || 0;
        const rollB = parseInt(b.roll, 10) || 0;
        return rollA - rollB;
      }
      if (sortOrder === 'name-desc') {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        const comp = nameB.localeCompare(nameA, undefined, { sensitivity: 'base', numeric: true });
        if (comp !== 0) return comp;
        const rollA = parseInt(a.roll, 10) || 0;
        const rollB = parseInt(b.roll, 10) || 0;
        return rollA - rollB;
      }
      const rollA = parseInt(a.roll, 10) || 0;
      const rollB = parseInt(b.roll, 10) || 0;
      return rollA - rollB;
    });

  // Count helper
  const getClassCount = (classId) => {
    return students.filter(s => s.classId === classId && !isTransferredOrFailed(s)).length;
  };

  // Class stats helper (Total, Boys, Girls)
  const getClassStats = (classId) => {
    const classStudents = students.filter(s => s.classId === classId && !isTransferredOrFailed(s));
    const total = classStudents.length;
    if (total === 0) {
      return { total: 0, boys: 0, girls: 0, boyPercent: 50, girlPercent: 50 };
    }
    let boys = 0;
    let girls = 0;
    classStudents.forEach(s => {
      const g = (s.gender || '').trim().toLowerCase();
      if (g === 'girl') {
        girls++;
      } else {
        boys++;
      }
    });
    const boyPercent = Math.round((boys / total) * 100);
    const girlPercent = 100 - boyPercent;
    return {
      total,
      boys,
      girls,
      boyPercent,
      girlPercent
    };
  };

  const totalBoys = students.filter(s => !isTransferredOrFailed(s) && (s.gender || '').trim().toLowerCase() !== 'girl').length;
  const totalGirls = students.filter(s => !isTransferredOrFailed(s) && (s.gender || '').trim().toLowerCase() === 'girl').length;

  // Helper to compute caste statistics for any subset of students
  const getCasteStats = (studentList = []) => {
    let sc = 0;
    let st = 0;
    let obc = 0;
    let ur = 0;
    let pending = 0;

    const activeList = studentList.filter(s => !isTransferredOrFailed(s));

    activeList.forEach(s => {
      const c = (s.caste || '').trim().toUpperCase();
      if (c === 'SC') {
        sc++;
      } else if (c === 'ST') {
        st++;
      } else if (c === 'OBC') {
        obc++;
      } else if (c === 'UR' || c === 'GEN' || c === 'GENERAL') {
        ur++;
      } else {
        pending++;
      }
    });

    const recordedTotal = sc + st + obc + ur;
    const total = activeList.length;

    return {
      total,
      recordedTotal,
      sc,
      st,
      obc,
      ur,
      pending,
      scPercent: total > 0 ? ((sc / total) * 100).toFixed(1) : '0.0',
      stPercent: total > 0 ? ((st / total) * 100).toFixed(1) : '0.0',
      obcPercent: total > 0 ? ((obc / total) * 100).toFixed(1) : '0.0',
      urPercent: total > 0 ? ((ur / total) * 100).toFixed(1) : '0.0',
      pendingPercent: total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0',
    };
  };

  // Wing-wise and overall caste statistics
  const overallCasteStats = getCasteStats(students);
  const upperCasteStats = getCasteStats(
    students.filter(s =>
      ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11-sci', 'class-11-arts', 'class-12-sci', 'class-12-arts'].includes(s.classId)
    )
  );
  const primaryCasteStats = getCasteStats(
    students.filter(s =>
      ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].includes(s.classId)
    )
  );
  const elementaryCasteStats = getCasteStats(
    students.filter(s => ['class-6', 'class-7', 'class-8'].includes(s.classId))
  );
  const secondaryCasteStats = getCasteStats(
    students.filter(s => ['class-9', 'class-10'].includes(s.classId))
  );
  const seniorCasteStats = getCasteStats(
    students.filter(s => ['class-11-sci', 'class-11-arts', 'class-12-sci', 'class-12-arts'].includes(s.classId))
  );

  // Render individual caste distribution card
  const renderCasteCard = (title, subtitle, badgeClass, stats) => {
    return (
      <div className={`caste-dist-card ${badgeClass}`}>
        <div className="caste-card-header">
          <div className="caste-card-title-wrap">
            <span className={`caste-wing-pill ${badgeClass}`}>{title}</span>
            <span className="caste-card-total-count">
              <strong>{stats.total}</strong> Students
            </span>
          </div>
          <span className="caste-card-sub-info">{subtitle}</span>
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="caste-ratio-bar-wrap">
          {stats.total > 0 ? (
            <div className="caste-ratio-segmented-bar">
              {stats.sc > 0 && (
                <div 
                  className="caste-segment sc" 
                  style={{ width: `${stats.scPercent}%` }} 
                  title={`SC: ${stats.sc} (${stats.scPercent}%)`}
                />
              )}
              {stats.obc > 0 && (
                <div 
                  className="caste-segment obc" 
                  style={{ width: `${stats.obcPercent}%` }} 
                  title={`OBC: ${stats.obc} (${stats.obcPercent}%)`}
                />
              )}
              {stats.ur > 0 && (
                <div 
                  className="caste-segment ur" 
                  style={{ width: `${stats.urPercent}%` }} 
                  title={`UR / General: ${stats.ur} (${stats.urPercent}%)`}
                />
              )}
              {stats.st > 0 && (
                <div 
                  className="caste-segment st" 
                  style={{ width: `${stats.stPercent}%` }} 
                  title={`ST: ${stats.st} (${stats.stPercent}%)`}
                />
              )}
              {stats.pending > 0 && (
                <div 
                  className="caste-segment pending" 
                  style={{ width: `${stats.pendingPercent}%` }} 
                  title={`Pending / Unrecorded: ${stats.pending} (${stats.pendingPercent}%)`}
                />
              )}
            </div>
          ) : (
            <div className="caste-ratio-empty-bar" title="No enrolled records">
              <span>No enrollments recorded</span>
            </div>
          )}
        </div>

        {/* Caste Stats Metrics Grid */}
        <div className="caste-metrics-grid">
          <div className="caste-metric-pill sc">
            <div className="caste-metric-header">
              <span className="caste-dot sc" />
              <span className="caste-metric-name">SC</span>
            </div>
            <div className="caste-metric-numbers">
              <strong className="caste-count">{stats.sc}</strong>
              <span className="caste-pct">{stats.scPercent}%</span>
            </div>
          </div>

          <div className="caste-metric-pill obc">
            <div className="caste-metric-header">
              <span className="caste-dot obc" />
              <span className="caste-metric-name">OBC</span>
            </div>
            <div className="caste-metric-numbers">
              <strong className="caste-count">{stats.obc}</strong>
              <span className="caste-pct">{stats.obcPercent}%</span>
            </div>
          </div>

          <div className="caste-metric-pill ur">
            <div className="caste-metric-header">
              <span className="caste-dot ur" />
              <span className="caste-metric-name">UR / Gen</span>
            </div>
            <div className="caste-metric-numbers">
              <strong className="caste-count">{stats.ur}</strong>
              <span className="caste-pct">{stats.urPercent}%</span>
            </div>
          </div>

          <div className="caste-metric-pill st">
            <div className="caste-metric-header">
              <span className="caste-dot st" />
              <span className="caste-metric-name">ST</span>
            </div>
            <div className="caste-metric-numbers">
              <strong className="caste-count">{stats.st}</strong>
              <span className="caste-pct">{stats.stPercent}%</span>
            </div>
          </div>

          {stats.pending > 0 && (
            <div className="caste-metric-pill pending" title={`${stats.pending} records awaiting caste entry`}>
              <div className="caste-metric-header">
                <span className="caste-dot pending" />
                <span className="caste-metric-name">Pending</span>
              </div>
              <div className="caste-metric-numbers">
                <strong className="caste-count">{stats.pending}</strong>
                <span className="caste-pct">{stats.pendingPercent}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCardMiddle = (classId) => {
    const stats = getClassStats(classId);
    const casteStats = getCasteStats(students.filter(s => s.classId === classId));
    const classPendingStudents = students.filter(s => s.classId === classId && !isTransferredOrFailed(s) && (isFieldPending(s.apaarId) || isFieldPending(s.penNumber) || isFieldPending(s.aadhaar) || isFieldPending(s.phone)));
    const pendingCount = classPendingStudents.length;

    return (
      <div className="class-card-middle">
        <h4 className="student-count-display">{stats.total}</h4>
        <span className="student-count-sub">Enrolled Students</span>

        <div className="card-gender-breakdown">
          <div className="card-gender-chip boy" title={`${stats.boys} Boys enrolled`}>
            <BoyIcon size={14} className="gender-chip-icon" />
            <span className="gender-chip-text">
              <strong>{stats.boys}</strong> Boys
            </span>
          </div>
          <div className="card-gender-chip girl" title={`${stats.girls} Girls enrolled`}>
            <GirlIcon size={14} className="gender-chip-icon" />
            <span className="gender-chip-text">
              <strong>{stats.girls}</strong> Girls
            </span>
          </div>
        </div>

        {stats.total > 0 && (
          <div 
            className="card-gender-ratio-bar" 
            title={`Gender Ratio: ${stats.boys} Boys (${stats.boyPercent}%) · ${stats.girls} Girls (${stats.girlPercent}%)`}
          >
            <div className="ratio-segment boy" style={{ width: `${stats.boyPercent}%` }} />
            <div className="ratio-segment girl" style={{ width: `${stats.girlPercent}%` }} />
          </div>
        )}

        {/* Caste breakdown mini tags inside class card */}
        {stats.total > 0 && casteStats.recordedTotal > 0 && (
          <div className="card-caste-mini-row" title={`Caste: SC: ${casteStats.sc}, OBC: ${casteStats.obc}, UR: ${casteStats.ur}, ST: ${casteStats.st}`}>
            {casteStats.sc > 0 && <span className="mini-caste-badge sc">SC {casteStats.sc}</span>}
            {casteStats.obc > 0 && <span className="mini-caste-badge obc">OBC {casteStats.obc}</span>}
            {casteStats.ur > 0 && <span className="mini-caste-badge ur">UR {casteStats.ur}</span>}
            {casteStats.st > 0 && <span className="mini-caste-badge st">ST {casteStats.st}</span>}
          </div>
        )}

        {/* Pending documents mini tag */}
        {stats.total > 0 && pendingCount > 0 && (
          <div 
            className="card-pending-mini-tag" 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPendingModal('any', classId);
            }}
            title={`${pendingCount} students have pending documents in ${SCHOOL_CLASSES.find(c => c.id === classId)?.name || 'this class'}. Click to inspect class-wise.`}
          >
            <AlertCircle size={10} />
            <span>{pendingCount} Pending Docs</span>
          </div>
        )}
      </div>
    );
  };

  const handleClassClick = (classId, filterPending = 'ALL') => {
    setSelectedClassId(classId);
    setSearchQuery('');
    setCasteFilter('ALL');
    setPendingFilter(filterPending || 'ALL');
    setSortOrder('roll');
    setSortDropdownOpen(false);
    const basePath = location.pathname.startsWith('/admin') ? '/admin/students' : '/students';
    navigate(`${basePath}/${classId}`);
    scrollAdminToTop();
    requestAnimationFrame(scrollAdminToTop);
  };

  const handleBackToAllClasses = () => {
    setSelectedClassId(null);
    setSearchQuery('');
    setCasteFilter('ALL');
    setPendingFilter('ALL');
    setSortOrder('roll');
    setSortDropdownOpen(false);
    const basePath = location.pathname.startsWith('/admin') ? '/admin/students' : '/students';
    navigate(basePath);
    scrollAdminToTop();
    requestAnimationFrame(scrollAdminToTop);
  };

  const handleOpenPendingModal = (fieldKey = 'apaarId', classId = 'ALL') => {
    setPendingModalField(fieldKey);
    setPendingModalClass(classId || 'ALL');
    setPendingModalOpen(true);
  };

  const handleNavigateFromPendingModal = (classId, pendingField) => {
    setPendingModalOpen(false);
    handleClassClick(classId, pendingField);
  };

  const handleOpenAddModal = (classId) => {
    const targetClass = classId || selectedClassId || 'class-6';
    setNewStudent({
      name: '',
      classId: targetClass,
      roll: String(getClassCount(targetClass) + 1).padStart(2, '0'),
      gender: 'Boy',
      enrollmentNo: '',
      enrollmentYear: getDefaultEnrollmentYear(targetClass),
      registrationYear: '',
      guardian: '',
      father: '',
      mother: '',
      aadhaar: '',
      dob: '',
      phone: ''
    });
    setShowAddModal(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.roll) return;

    const classObj = SCHOOL_CLASSES.find(c => c.id === newStudent.classId);
    const newEntry = {
      name: newStudent.name.trim(),
      classId: newStudent.classId,
      className: classObj?.name || `Class ${newStudent.classId.replace('class-', '')}`,
      roll: String(newStudent.roll).trim(),
      gender: newStudent.gender || 'Boy',
      enrollmentNo: newStudent.enrollmentNo?.trim() || '',
      enrollmentYear: newStudent.enrollmentYear?.trim() || getDefaultEnrollmentYear(newStudent.classId),
      registrationYear: newStudent.registrationYear?.trim() || '',
      guardian: newStudent.guardian?.trim() || newStudent.father?.trim() || '',
      father: newStudent.father?.trim() || '',
      mother: newStudent.mother?.trim() || '',
      aadhaar: newStudent.aadhaar?.trim() || '',
      dob: newStudent.dob?.trim() || '',
      phone: newStudent.phone?.trim() || '',
      attendance: '100%',
      status: 'Enrolled'
    };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      const data = await res.json();
      if (data.success && data.student) {
        setStudents(prev => [...prev, data.student]);
        setShowAddModal(false);
      } else {
        alert(data.message || 'Error enrolling student');
      }
    } catch (err) {
      console.error('Error enrolling student in DB:', err);
      // Local fallback
      const fallbackId = `PMS-26-${classObj?.name.replace(/[^0-9]/g, '') || '00'}-${String(newStudent.roll).padStart(2, '0')}`;
      setStudents(prev => [{ ...newEntry, id: fallbackId, studentId: fallbackId }, ...prev]);
      setShowAddModal(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      setStudents(prev => prev.filter(s => s.id !== id && s.studentId !== id));
      try {
        await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error deleting student from DB:', err);
      }
    }
  };

  return (
    <div className="admin-students-container">
      {/* VIEW 1: CLASS SELECTION OVERVIEW */}
      {!selectedClassId && (
        <div className="class-selection-view">
          <div className="students-page-header">
            <div>
              <h2>Class-wise Student Enrollment</h2>
              <p>Select any grade from Class 1 to Class 12 to view and manage enrolled students</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="universal-search-header-btn"
                onClick={() => setUniversalSearchOpen(true)}
                title="Search student across all classes (Ctrl+K)"
              >
                <Search size={16} />
                <span>Universal Search</span>
                <span className="kbd-shortcut-pill mini">Ctrl K</span>
              </button>

              <button
                type="button"
                className="export-excel-btn"
                onClick={() => handleExportExcel(null)}
                title="Export complete student details for all classes as responsive Excel spreadsheet"
                disabled={exporting}
              >
                {exporting ? <Loader2 size={16} className="spinning" /> : <FileSpreadsheet size={16} />}
                <span>{exporting ? 'Exporting...' : 'Export All (Excel)'}</span>
              </button>

              <button className="add-student-btn-primary" onClick={() => handleOpenAddModal('class-6')}>
                <Plus size={16} />
                <span>Enroll New Student</span>
              </button>
            </div>
          </div>

          {/* Universal Student Search Banner */}
          <div className="universal-search-trigger-banner">
            <div
              className="universal-search-input-mock"
              onClick={() => setUniversalSearchOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setUniversalSearchOpen(true);
                }
              }}
              title="Click or press Ctrl+K to open Universal Student Search across all classes"
            >
              <div className="mock-left">
                <Search size={20} className="mock-search-icon" />
                <span className="mock-placeholder">
                  Search across all classes by <strong className="mock-hi">Student Name</strong>, <strong className="mock-hi">Father's Name</strong>, <strong className="mock-hi">Mother's Name</strong>, or <strong className="mock-hi">Aadhaar No.</strong>...
                </span>
              </div>
              <div className="mock-right">
                <span className="kbd-shortcut-pill">
                  <span className="kbd-key">Ctrl</span> + <span className="kbd-key">K</span>
                </span>
                <span className="universal-search-action-btn">
                  Universal Search
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="students-summary-bar">
            <div className="summary-item">
              <span className="summary-label">Total Grades</span>
              <span className="summary-val">Classes 1 – 12</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Enrolled Records</span>
              <span className="summary-val">{students.filter(s => !isTransferredOrFailed(s)).length} Students</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Gender Breakdown</span>
              <span className="summary-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BoyIcon size={14} /> {totalBoys} Boys
                </span>
                <span>·</span>
                <span style={{ color: '#db2777', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <GirlIcon size={14} /> {totalGirls} Girls
                </span>
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Caste Breakdown (Overall)</span>
              <span className="summary-val caste-summary-tags-row">
                <span className="summary-caste-tag sc">SC: {overallCasteStats.sc}</span>
                <span className="summary-caste-tag obc">OBC: {overallCasteStats.obc}</span>
                <span className="summary-caste-tag ur">UR: {overallCasteStats.ur}</span>
                {overallCasteStats.st > 0 && <span className="summary-caste-tag st">ST: {overallCasteStats.st}</span>}
              </span>
            </div>
            <div 
              className="summary-item clickable-summary-item"
              onClick={() => handleOpenPendingModal('apaarId')}
              title="Click to view and audit pending student credentials (APAAR, PEN, Aadhaar, Contact)"
            >
              <span className="summary-label">Pending Credentials</span>
              <span className="summary-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#dc2626', cursor: 'pointer' }}>
                <AlertCircle size={14} />
                <span>{students.filter(s => !isTransferredOrFailed(s) && (isFieldPending(s.apaarId) || isFieldPending(s.penNumber) || isFieldPending(s.aadhaar) || isFieldPending(s.phone))).length} Incomplete</span>
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Academic Session</span>
              <span className="summary-val">2026 - 2027</span>
            </div>
          </div>

          {/* Social Category / Caste Distribution Section (Overall, Class VI - XII & I - V) */}
          <div className="caste-distribution-section">
            <div className="caste-section-header">
              <div className="caste-header-left">
                <div className="caste-header-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="caste-title-row">
                    <h3 className="caste-section-title">Social Category & Caste Distribution</h3>
                    <span className="caste-statutory-pill">UDISE+ Statutory Roster</span>
                  </div>
                  <p className="caste-section-subtitle">
                    Distribution of overall enrolled students (Classes I – XII), Higher Secondary Section (Classes VI – XII), and Primary Section (Classes I – V)
                  </p>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="caste-tab-toggle-group">
                <button
                  type="button"
                  className={`caste-toggle-btn ${casteViewTab === 'all' ? 'active' : ''}`}
                  onClick={() => setCasteViewTab('all')}
                >
                  All Sections
                </button>
                <button
                  type="button"
                  className={`caste-toggle-btn ${casteViewTab === 'overall' ? 'active' : ''}`}
                  onClick={() => setCasteViewTab('overall')}
                >
                  Overall (I – XII)
                </button>
                <button
                  type="button"
                  className={`caste-toggle-btn ${casteViewTab === 'upper' ? 'active' : ''}`}
                  onClick={() => setCasteViewTab('upper')}
                >
                  Class VI – XII
                </button>
                <button
                  type="button"
                  className={`caste-toggle-btn ${casteViewTab === 'primary' ? 'active' : ''}`}
                  onClick={() => setCasteViewTab('primary')}
                >
                  Class I – V
                </button>
              </div>
            </div>

            <div className="caste-cards-grid">
              {(casteViewTab === 'all' || casteViewTab === 'overall') &&
                renderCasteCard('Overall Students', 'Classes 1 – 12 · Entire School', 'overall', overallCasteStats)}
              {(casteViewTab === 'all' || casteViewTab === 'upper') &&
                renderCasteCard('Classes VI – XII', 'Higher Secondary Section', 'upper', upperCasteStats)}
              {(casteViewTab === 'all' || casteViewTab === 'primary') &&
                renderCasteCard('Classes I – V', 'Primary Section', 'primary', primaryCasteStats)}
            </div>
          </div>

          {/* SECTION 2: STUDENT DOCUMENTATION & PENDING STATUS TRACKER */}
          <PendingStatusSection
            students={students}
            onOpenModal={handleOpenPendingModal}
          />

          {/* WING 1: PRIMARY WING (Classes 1 - 5) */}
          <div className="wing-section">
            <div className="wing-title-row">
              <div className="wing-badge primary">Primary Wing</div>
              <h3>Classes 1 to 5 (Foundational & Preparatory Stage)</h3>
              <div className="wing-caste-pill" title="Primary Wing Caste Distribution">
                <span className="mini-tag sc">SC: {primaryCasteStats.sc}</span>
                <span className="mini-tag obc">OBC: {primaryCasteStats.obc}</span>
                <span className="mini-tag ur">UR: {primaryCasteStats.ur}</span>
                <span className="mini-tag st">ST: {primaryCasteStats.st}</span>
              </div>
            </div>
            <div className="class-cards-grid">
              {SCHOOL_CLASSES.filter(c => c.category === 'primary').map((cls) => (
                <div 
                  key={cls.id} 
                  className="class-card-item"
                  onClick={() => handleClassClick(cls.id)}
                >
                  <div className="class-card-top">
                    <div className="class-number-pill">{cls.name}</div>
                    <span className="class-wing-mini-pill">Primary</span>
                  </div>
                  {renderCardMiddle(cls.id)}
                  <div className="class-card-bottom">
                    <div className="view-link-row">
                      <span>View Students</span>
                      <ChevronRight size={16} className="chevron-arrow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WING 2: ELEMENTARY WING (Classes 6 - 8) */}
          <div className="wing-section">
            <div className="wing-title-row">
              <div className="wing-badge middle">Elementary</div>
              <h3>Classes 6 to 8 (Elementary Stage)</h3>
              <div className="wing-caste-pill" title="Elementary Wing Caste Distribution">
                <span className="mini-tag sc">SC: {elementaryCasteStats.sc}</span>
                <span className="mini-tag obc">OBC: {elementaryCasteStats.obc}</span>
                <span className="mini-tag ur">UR: {elementaryCasteStats.ur}</span>
                {elementaryCasteStats.st > 0 && <span className="mini-tag st">ST: {elementaryCasteStats.st}</span>}
              </div>
            </div>
            <div className="class-cards-grid">
              {SCHOOL_CLASSES.filter(c => c.category === 'elementary').map((cls) => (
                <div 
                  key={cls.id} 
                  className="class-card-item"
                  onClick={() => handleClassClick(cls.id)}
                >
                  <div className="class-card-top">
                    <div className="class-number-pill">{cls.name}</div>
                    <span className="class-wing-mini-pill middle">Elementary</span>
                  </div>
                  {renderCardMiddle(cls.id)}
                  <div className="class-card-bottom">
                    <div className="view-link-row">
                      <span>View Students</span>
                      <ChevronRight size={16} className="chevron-arrow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WING 3: SECONDARY (Classes 9 - 10) */}
          <div className="wing-section">
            <div className="wing-title-row">
              <div className="wing-badge secondary">Secondary</div>
              <h3>Classes 9 & 10</h3>
              <div className="wing-caste-pill" title="Secondary Wing Caste Distribution">
                <span className="mini-tag sc">SC: {secondaryCasteStats.sc}</span>
                <span className="mini-tag obc">OBC: {secondaryCasteStats.obc}</span>
                <span className="mini-tag ur">UR: {secondaryCasteStats.ur}</span>
                {secondaryCasteStats.st > 0 && <span className="mini-tag st">ST: {secondaryCasteStats.st}</span>}
              </div>
            </div>
            <div className="class-cards-grid">
              {SCHOOL_CLASSES.filter(c => c.category === 'secondary').map((cls) => (
                <div 
                  key={cls.id} 
                  className="class-card-item"
                  onClick={() => handleClassClick(cls.id)}
                >
                  <div className="class-card-top">
                    <div className="class-number-pill">{cls.name}</div>
                    <span className="class-wing-mini-pill secondary">Secondary</span>
                  </div>
                  {renderCardMiddle(cls.id)}
                  <div className="class-card-bottom">
                    <div className="view-link-row">
                      <span>View Students</span>
                      <ChevronRight size={16} className="chevron-arrow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WING 4: HIGHER SECONDARY (Classes 11 & 12: Arts & Science Streams Only) */}
          <div className="wing-section">
            <div className="wing-title-row">
              <div className="wing-badge senior">Higher Secondary (10+2)</div>
              <h3>Classes 11 & 12</h3>
              <div className="wing-caste-pill" title="Higher Secondary Wing Caste Distribution">
                <span className="mini-tag sc">SC: {seniorCasteStats.sc}</span>
                <span className="mini-tag obc">OBC: {seniorCasteStats.obc}</span>
                <span className="mini-tag ur">UR: {seniorCasteStats.ur}</span>
                {seniorCasteStats.st > 0 && <span className="mini-tag st">ST: {seniorCasteStats.st}</span>}
              </div>
            </div>
            <div className="class-cards-grid senior-grid">
              {SCHOOL_CLASSES.filter(c => c.category === 'senior').map((cls) => {
                const isScience = cls.stream === 'Science';
                return (
                  <div 
                    key={cls.id} 
                    className={`class-card-item senior-card ${isScience ? 'science-theme' : 'arts-theme'}`}
                    onClick={() => handleClassClick(cls.id)}
                  >
                    <div className="class-card-top">
                      <div className="class-number-pill stream-pill">
                        {cls.name}
                      </div>
                      <span className={`stream-tag ${isScience ? 'sci' : 'arts'}`}>
                        {cls.stream} Stream
                      </span>
                    </div>
                    {renderCardMiddle(cls.id)}
                    <div className="class-card-bottom">
                      <div className="view-link-row">
                        <span>View Students</span>
                        <ChevronRight size={16} className="chevron-arrow" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ENROLLED STUDENTS IN SELECTED CLASS */}
      {selectedClassId && currentClass && (
        <div className="class-students-detail-view">
          {/* Breadcrumb Navigation & Back Button */}
          <div className="detail-navigation-bar">
            <button className="back-to-classes-btn" onClick={handleBackToAllClasses}>
              <ArrowLeft size={16} />
              <span>Back to All Classes</span>
            </button>
            <div className="quick-class-selector">
              <span className="selector-label">Switch Class:</span>
              <select 
                value={selectedClassId} 
                onChange={(e) => handleClassClick(e.target.value)}
                className="class-dropdown-select"
              >
                {SCHOOL_CLASSES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Banner Card */}
          <div className="class-banner-card">
            <div className="banner-left">
              <div className="banner-class-title-row">
                <h2>{currentClass.name}</h2>
                <span className="banner-wing-badge">{currentClass.wing}</span>
                {currentClass.stream && (
                  <span className={`banner-stream-badge ${currentClass.stream === 'Science' ? 'sci' : 'arts'}`}>
                    {currentClass.stream} Stream
                  </span>
                )}
              </div>
              <p className="banner-meta">
                Total Students: <strong>{selectedClassId ? getClassStats(selectedClassId).total : students.filter(s => !isTransferredOrFailed(s)).length}</strong>
                {selectedClassId && (
                  <>
                    {' · '}
                    <span className="banner-gender-split">
                      <span className="banner-boy-tag">
                        <BoyIcon size={14} /> {getClassStats(selectedClassId).boys} Boys
                      </span>
                      {' · '}
                      <span className="banner-girl-tag">
                        <GirlIcon size={14} /> {getClassStats(selectedClassId).girls} Girls
                      </span>
                    </span>
                    {(() => {
                      const cs = getCasteStats(students.filter(s => s.classId === selectedClassId));
                      if (cs.recordedTotal === 0) return null;
                      return (
                        <>
                          {' · '}
                          <span className="banner-caste-split">
                            {cs.sc > 0 && <span className="banner-caste-tag sc">SC: {cs.sc}</span>}
                            {cs.obc > 0 && <span className="banner-caste-tag obc">OBC: {cs.obc}</span>}
                            {cs.ur > 0 && <span className="banner-caste-tag ur">UR: {cs.ur}</span>}
                            {cs.st > 0 && <span className="banner-caste-tag st">ST: {cs.st}</span>}
                          </span>
                        </>
                      );
                    })()}
                  </>
                )}
                {' · '}Academic Year: 2026-2027
              </p>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="universal-search-header-btn view2-btn"
                onClick={() => setUniversalSearchOpen(true)}
                title="Universal Student Search across all classes (Ctrl+K)"
              >
                <Search size={16} />
                <span>Universal Search</span>
                <span className="kbd-shortcut-pill mini">Ctrl K</span>
              </button>

              <button 
                type="button"
                className="export-excel-btn" 
                onClick={() => handleExportExcel(selectedClassId)}
                title={`Export complete details for all ${displayedStudents.length} students of ${currentClass.name} as Excel sheet (.xlsx)`}
                disabled={exporting}
              >
                {exporting ? <Loader2 size={16} className="spinning" /> : <FileSpreadsheet size={16} />}
                <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
              </button>

              <button 
                type="button"
                className="attendance-sheet-btn-secondary" 
                onClick={() => setShowClassAttendanceModal(true)}
                title={`Mark Monthly Attendance Register for ${currentClass.name}`}
              >
                <CalendarCheck size={16} />
                <span>Mark Class Attendance</span>
              </button>

              <button className="add-student-btn-primary" onClick={() => handleOpenAddModal(selectedClassId)}>
                <Plus size={16} />
                <span>Enroll Student in {currentClass.name}</span>
              </button>
            </div>
          </div>


          {/* Quick Search, Sort & Filters */}
          <div className="table-controls-bar">
            <div className="search-and-sort-group">
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${currentClass.name} students by name, roll no${currentClass.id === 'class-6' || isClass8 ? ', father, PEN no' : (isEnrollmentClass ? ', enrollment no' : (showStudentId ? ', or ID' : ''))}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={15} />
                </button>
              )}
            </div>

              {/* Sort Dropdown Button */}
              <div className="sort-dropdown-container" ref={sortDropdownRef}>
                <button
                  type="button"
                  className={`sort-trigger-btn ${sortOrder !== 'roll' ? 'active' : ''}`}
                  onClick={() => setSortDropdownOpen(prev => !prev)}
                  title="Sort student list alphabetically (A-Z or Z-A) or by Roll No"
                  aria-expanded={sortDropdownOpen}
                >
                  {sortOrder === 'name-asc' ? (
                    <>
                      <ArrowDownAZ size={16} className="sort-icon-active" />
                      <span className="sort-btn-label">Sort: <strong>A to Z</strong></span>
                    </>
                  ) : sortOrder === 'name-desc' ? (
                    <>
                      <ArrowUpZA size={16} className="sort-icon-active" />
                      <span className="sort-btn-label">Sort: <strong>Z to A</strong></span>
                    </>
                  ) : (
                    <>
                      <ArrowUpDown size={15} />
                      <span className="sort-btn-label">Sort</span>
                    </>
                  )}
                  <ChevronDown size={14} className={`sort-chevron ${sortDropdownOpen ? 'open' : ''}`} />
                </button>

                {sortDropdownOpen && (
                  <div className="sort-dropdown-menu">
                    <div className="sort-dropdown-title">Sort Student Roster</div>
                    <button
                      type="button"
                      className={`sort-dropdown-item ${sortOrder === 'roll' ? 'selected' : ''}`}
                      onClick={() => {
                        setSortOrder('roll');
                        setSortDropdownOpen(false);
                      }}
                    >
                      <div className="sort-item-info">
                        <ArrowUpDown size={15} className="sort-item-icon" />
                        <div>
                          <div className="sort-item-name">Roll No (Default)</div>
                          <div className="sort-item-sub">Ordered 01, 02, 03...</div>
                        </div>
                      </div>
                      {sortOrder === 'roll' && <Check size={15} className="sort-item-check" />}
                    </button>

                    <button
                      type="button"
                      className={`sort-dropdown-item ${sortOrder === 'name-asc' ? 'selected' : ''}`}
                      onClick={() => {
                        setSortOrder('name-asc');
                        setSortDropdownOpen(false);
                      }}
                    >
                      <div className="sort-item-info">
                        <ArrowDownAZ size={16} className="sort-item-icon az" />
                        <div>
                          <div className="sort-item-name">Alphabetical (A to Z)</div>
                          <div className="sort-item-sub">Student names from A to Z</div>
                        </div>
                      </div>
                      {sortOrder === 'name-asc' && <Check size={15} className="sort-item-check" />}
                    </button>

                    <button
                      type="button"
                      className={`sort-dropdown-item ${sortOrder === 'name-desc' ? 'selected' : ''}`}
                      onClick={() => {
                        setSortOrder('name-desc');
                        setSortDropdownOpen(false);
                      }}
                    >
                      <div className="sort-item-info">
                        <ArrowUpZA size={16} className="sort-item-icon za" />
                        <div>
                          <div className="sort-item-name">Alphabetical (Z to A)</div>
                          <div className="sort-item-sub">Student names from Z to A</div>
                        </div>
                      </div>
                      {sortOrder === 'name-desc' && <Check size={15} className="sort-item-check" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table Filters: Caste & Pending Documentation */}
            <div className="table-filters-container">
              {/* Quick Caste Filter Pills */}
              <div className="caste-filter-pills-row">
                <span className="caste-filter-label">Caste:</span>
                <button
                  type="button"
                  className={`caste-filter-btn ${casteFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setCasteFilter('ALL')}
                >
                  All ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s)).length})
                </button>
                <button
                  type="button"
                  className={`caste-filter-btn sc ${casteFilter === 'SC' ? 'active' : ''}`}
                  onClick={() => setCasteFilter(casteFilter === 'SC' ? 'ALL' : 'SC')}
                >
                  SC ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && (s.caste || '').trim().toUpperCase() === 'SC').length})
                </button>
                <button
                  type="button"
                  className={`caste-filter-btn obc ${casteFilter === 'OBC' ? 'active' : ''}`}
                  onClick={() => setCasteFilter(casteFilter === 'OBC' ? 'ALL' : 'OBC')}
                >
                  OBC ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && (s.caste || '').trim().toUpperCase() === 'OBC').length})
                </button>
                <button
                  type="button"
                  className={`caste-filter-btn ur ${casteFilter === 'UR' ? 'active' : ''}`}
                  onClick={() => setCasteFilter(casteFilter === 'UR' ? 'ALL' : 'UR')}
                >
                  UR ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && ['UR', 'GEN', 'GENERAL'].includes((s.caste || '').trim().toUpperCase())).length})
                </button>
                {students.some(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && (s.caste || '').trim().toUpperCase() === 'ST') && (
                  <button
                    type="button"
                    className={`caste-filter-btn st ${casteFilter === 'ST' ? 'active' : ''}`}
                    onClick={() => setCasteFilter(casteFilter === 'ST' ? 'ALL' : 'ST')}
                  >
                    ST ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && (s.caste || '').trim().toUpperCase() === 'ST').length})
                  </button>
                )}
              </div>

              {/* Quick Pending Status Filter Pills */}
              <div className="pending-filter-pills-row">
                <span className="pending-filter-label">Pending:</span>
                <button
                  type="button"
                  className={`pending-class-pill ${pendingFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('ALL')}
                >
                  All Status
                </button>
                <button
                  type="button"
                  className={`pending-class-pill apaar ${pendingFilter === 'apaarId' ? 'active' : ''}`}
                  onClick={() => setPendingFilter(pendingFilter === 'apaarId' ? 'ALL' : 'apaarId')}
                  title="Filter students missing APAAR ID"
                >
                  <Sparkles size={12} />
                  <span>APAAR ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && isFieldPending(s.apaarId)).length})</span>
                </button>
                <button
                  type="button"
                  className={`pending-class-pill pen ${pendingFilter === 'penNumber' ? 'active' : ''}`}
                  onClick={() => setPendingFilter(pendingFilter === 'penNumber' ? 'ALL' : 'penNumber')}
                  title="Filter students missing PEN Number"
                >
                  <Hash size={12} />
                  <span>PEN ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && isFieldPending(s.penNumber)).length})</span>
                </button>
                <button
                  type="button"
                  className={`pending-class-pill aadhaar ${pendingFilter === 'aadhaar' ? 'active' : ''}`}
                  onClick={() => setPendingFilter(pendingFilter === 'aadhaar' ? 'ALL' : 'aadhaar')}
                  title="Filter students missing Aadhaar Card"
                >
                  <Fingerprint size={12} />
                  <span>Aadhaar ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && isFieldPending(s.aadhaar)).length})</span>
                </button>
                <button
                  type="button"
                  className={`pending-class-pill phone ${pendingFilter === 'phone' ? 'active' : ''}`}
                  onClick={() => setPendingFilter(pendingFilter === 'phone' ? 'ALL' : 'phone')}
                  title="Filter students missing contact phone"
                >
                  <Phone size={12} />
                  <span>Phone ({students.filter(s => s.classId === selectedClassId && !isTransferredOrFailed(s) && isFieldPending(s.phone)).length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Sort Banner Indicator */}
          {sortOrder !== 'roll' && (
            <div className="sort-status-notice">
              <div className="sort-status-left">
                {sortOrder === 'name-asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
                <span>
                  Sorted <strong>Alphabetically ({sortOrder === 'name-asc' ? 'A to Z' : 'Z to A'})</strong> · {displayedStudents.filter(s => !isTransferredOrFailed(s)).length} Active Students listed (Original Roll Numbers preserved)
                </span>
              </div>
              <button 
                type="button" 
                className="sort-status-reset"
                onClick={() => setSortOrder('roll')}
                title="Reset to default Roll No order"
              >
                <RotateCcw size={12} />
                <span>Reset to Roll No</span>
              </button>
            </div>
          )}

          {/* Students Roster Container (Desktop Table + Mobile Cards) */}
          <div className="student-table-container">
            {/* 1. DESKTOP / TABLET TABLE VIEW (min-width: 769px) */}
            <div className="desktop-table-view">
              <table className="roster-table">
                <thead>
                  <tr>
                    <th 
                      style={{ width: '80px', textAlign: 'center' }}
                      className={`sortable-th ${sortOrder === 'roll' ? 'active-sort' : ''}`}
                      onClick={() => setSortOrder('roll')}
                      title="Sort by Roll Number (Default)"
                    >
                      <div className="th-sort-wrapper center">
                        <span>Roll No</span>
                        <ArrowUpDown size={12} className={`th-sort-icon ${sortOrder === 'roll' ? 'active' : 'muted'}`} />
                      </div>
                    </th>
                    {showStudentId && <th style={{ width: '140px' }}>Student ID</th>}
                    <th
                      className={`sortable-th ${sortOrder.startsWith('name') ? 'active-sort' : ''}`}
                      onClick={() => {
                        if (sortOrder === 'name-asc') setSortOrder('name-desc');
                        else if (sortOrder === 'name-desc') setSortOrder('roll');
                        else setSortOrder('name-asc');
                      }}
                      title="Click to sort alphabetically (A-Z / Z-A / Roll No)"
                    >
                      <div className="th-sort-wrapper">
                        <span>Student Full Name</span>
                        {sortOrder === 'name-asc' ? (
                          <ArrowDownAZ size={15} className="th-sort-icon active" />
                        ) : sortOrder === 'name-desc' ? (
                          <ArrowUpZA size={15} className="th-sort-icon active" />
                        ) : (
                          <ArrowUpDown size={13} className="th-sort-icon muted" />
                        )}
                      </div>
                    </th>
                    {isClass8 ? (
                      <>
                        <th>Father's Name</th>
                        <th>Mother's Name</th>
                      </>
                    ) : (
                      <th>Guardian Name</th>
                    )}
                    <th>Contact Phone</th>
                    <th style={{ width: '120px' }}>Attendance</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && students.length === 0 ? (
                    <tr>
                      <td colSpan={isClass8 || showStudentId ? 8 : 7} className="no-students-found">
                        <div className="empty-state-wrap" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#ff6b00' }} />
                        </div>
                      </td>
                    </tr>
                  ) : displayedStudents.length > 0 ? (
                    displayedStudents.map((st) => (
                      <tr key={st.id || st.studentId}>
                        <td className="roll-number-cell" style={{ textAlign: 'center' }}>
                          <span className="roll-badge">{st.roll}</span>
                        </td>
                        {showStudentId && <td className="code-id-cell">{st.id || st.studentId}</td>}
                        <td 
                          className="student-name-cell clickable-name-cell"
                          onClick={() => setViewingStudent(st)}
                          title={`Click to view full details for ${st.name}`}
                        >
                          <div className="student-avatar-mini">
                            {st.name.charAt(0)}
                          </div>
                          <div className="name-with-hint">
                            <div className="name-and-gender-row">
                              <span className="name-text interactive-name">{st.name}</span>
                              <span className={`student-gender-pill ${st.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}>
                                {st.gender === 'Girl' ? 'Girl' : 'Boy'}
                              </span>
                              {st.caste && (
                                <span className="student-caste-pill font-mono" style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 600 }}>
                                  {st.caste}
                                </span>
                              )}
                              {!isTransferredStudent(st) && isFieldPending(st.apaarId) && (
                                <span className="table-pending-mini-badge apaar" title="APAAR ID Pending / Unrecorded">
                                  No APAAR
                                </span>
                              )}
                              {!isTransferredStudent(st) && isFieldPending(st.penNumber) && (
                                <span className="table-pending-mini-badge pen" title="PEN Number Pending / Unrecorded">
                                  No PEN
                                </span>
                              )}
                              {!isTransferredStudent(st) && isFieldPending(st.aadhaar) && (
                                <span className="table-pending-mini-badge aadhaar" title="Aadhaar Pending / Unrecorded">
                                  No Aadhaar
                                </span>
                              )}
                            </div>
                            <span className="view-profile-hint">View Profile →</span>
                          </div>
                        </td>
                        {isClass8 ? (
                          <>
                            <td className="guardian-cell">{st.father || '—'}</td>
                            <td className="guardian-cell">{st.mother || '—'}</td>
                          </>
                        ) : (
                          <td className="guardian-cell">{st.guardian || '—'}</td>
                        )}
                        <td className="phone-cell">
                          {st.phone ? (
                            <a href={`tel:${st.phone.split('/')[0].trim()}`}>{st.phone}</a>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          <button 
                            type="button"
                            className="attendance-pill-btn"
                            onClick={() => setSelectedAttendanceStudent(st)}
                            title="Click to view & mark monthly attendance"
                          >
                            <CalendarCheck size={13} />
                            <span>{st.attendance}</span>
                          </button>
                        </td>
                        <td>
                          {renderStatusBadge(st.status)}
                        </td>
                        <td className="action-cell">
                          <div className="table-actions-row">
                            <button 
                              type="button"
                              className="view-btn-icon" 
                              onClick={() => setViewingStudent(st)}
                              title={`View Student Details for ${st.name}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              type="button"
                              className="edit-btn-icon" 
                              onClick={() => setEditingStudent(st)}
                              title={`Edit Student Details for ${st.name}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button 
                              type="button"
                              className="attendance-btn-icon" 
                              onClick={() => setSelectedAttendanceStudent(st)}
                              title={`Mark Monthly Attendance for ${st.name}`}
                            >
                              <CalendarCheck size={16} />
                            </button>
                            <button 
                              type="button"
                              className="delete-btn-icon" 
                              onClick={() => handleDeleteStudent(st.id || st.studentId)}
                              title="Delete Student Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isClass8 || showStudentId ? 8 : 7} className="no-students-found">
                        <div className="empty-state-wrap">
                          <Users size={36} className="empty-icon" />
                          <h4>No Students Found</h4>
                          <p>There are no student records matching your query in {currentClass.name}.</p>
                          <button 
                            className="add-student-btn-primary mini"
                            onClick={() => handleOpenAddModal(selectedClassId)}
                          >
                            <Plus size={15} />
                            <span>Enroll Student in {currentClass.name}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE RESPONSIVE STUDENT CARDS (max-width: 768px) */}
            <div className="mobile-students-card-view">
              {loading && students.length === 0 ? (
                <div className="mobile-empty-state" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#ff6b00' }} />
                </div>
              ) : displayedStudents.length > 0 ? (
                displayedStudents.map((st) => (
                  <div key={st.id || st.studentId} className="mobile-student-card-item">
                    {/* Top Row: Roll Badge, Avatar, Name & ID */}
                    <div className="m-card-top-row">
                      <div 
                        className="m-card-name-group clickable-m-name"
                        onClick={() => setViewingStudent(st)}
                        title={`Click to view full details for ${st.name}`}
                      >
                        <span className="m-roll-pill">#{st.roll}</span>
                        <div className="student-avatar-mini">{st.name.charAt(0)}</div>
                        <div className="m-name-id-wrap">
                          <div className="m-name-gender-row">
                            <h4 className="m-student-name interactive-name">{st.name}</h4>
                            <span className={`student-gender-pill mini ${st.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}>
                              {st.gender === 'Girl' ? 'Girl' : 'Boy'}
                            </span>
                            {!isTransferredStudent(st) && isFieldPending(st.apaarId) && (
                              <span className="table-pending-mini-badge apaar" title="APAAR ID Pending">
                                No APAAR
                              </span>
                            )}
                            {!isTransferredStudent(st) && isFieldPending(st.penNumber) && (
                              <span className="table-pending-mini-badge pen" title="PEN Number Pending">
                                No PEN
                              </span>
                            )}
                            {!isTransferredStudent(st) && isFieldPending(st.aadhaar) && (
                              <span className="table-pending-mini-badge aadhaar" title="Aadhaar Pending">
                                No Aadhaar
                              </span>
                            )}
                          </div>
                          <span className="m-tap-hint">Tap to view details →</span>
                          {showStudentId && <span className="m-student-id">{st.id || st.studentId}</span>}
                        </div>
                      </div>
                      {renderStatusBadge(st.status)}
                    </div>

                    {/* Middle: Info Grid */}
                    {isClass8 ? (
                      <div className="m-card-info-grid">
                        <div className="m-info-line">
                          <span className="m-info-label">Father:</span>
                          <span className="m-info-val">{st.father || '—'}</span>
                        </div>
                        <div className="m-info-line">
                          <span className="m-info-label">Mother:</span>
                          <span className="m-info-val">{st.mother || '—'}</span>
                        </div>
                        <div className="m-info-line full-width">
                          <span className="m-info-label">Contact:</span>
                          {st.phone ? (
                            <a href={`tel:${st.phone.split('/')[0].trim()}`} className="m-phone-val">
                              <Phone size={12} />
                              <span>{st.phone}</span>
                            </a>
                          ) : (
                            <span className="m-info-val" style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="m-card-info-grid">
                        <div className="m-info-line">
                          <span className="m-info-label">Guardian:</span>
                          <span className="m-info-val">{st.guardian || '—'}</span>
                        </div>
                        <div className="m-info-line">
                          <span className="m-info-label">Contact:</span>
                          {st.phone ? (
                            <a href={`tel:${st.phone.split('/')[0].trim()}`} className="m-phone-val">
                              <Phone size={12} />
                              <span>{st.phone}</span>
                            </a>
                          ) : (
                            <span className="m-info-val" style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bottom: Attendance & Actions */}
                    <div className="m-card-bottom-bar">
                      <div className="m-att-section">
                        <span className="m-att-label">Attendance:</span>
                        <button 
                          type="button"
                          className="attendance-pill-btn"
                          onClick={() => setSelectedAttendanceStudent(st)}
                          title="Click to view & mark monthly attendance"
                        >
                          <CalendarCheck size={13} />
                          <span>{st.attendance}</span>
                        </button>
                      </div>

                      <div className="m-actions-section">
                        <button 
                          type="button"
                          className="m-btn-view-details"
                          onClick={() => setViewingStudent(st)}
                          title={`View Full Details for ${st.name}`}
                        >
                          <User size={13} />
                          <span>Details</span>
                        </button>
                        <button 
                          type="button"
                          className="m-btn-edit-student"
                          onClick={() => setEditingStudent(st)}
                          title={`Edit Student Details for ${st.name}`}
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button 
                          type="button"
                          className="m-btn-mark-att"
                          onClick={() => setSelectedAttendanceStudent(st)}
                          title={`Mark Monthly Attendance for ${st.name}`}
                        >
                          <CalendarCheck size={14} />
                          <span>Mark Days</span>
                        </button>
                        <button 
                          type="button"
                          className="delete-btn-icon" 
                          onClick={() => handleDeleteStudent(st.id || st.studentId)}
                          title="Delete Student Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mobile-empty-state">
                  <Users size={32} />
                  <h4>No Students Found</h4>
                  <p>No student records found in {currentClass.name}.</p>
                </div>
              )}
            </div>

            {/* Bottom Action & Navigation Bar */}
            <div className="class-detail-bottom-bar">
              <button
                type="button"
                className="back-to-classes-btn bottom"
                onClick={handleBackToAllClasses}
                title="Return to Class Selection List"
              >
                <ArrowLeft size={16} />
                <span>Back to All Classes</span>
              </button>

              <div className="bottom-bar-center">
                <span className="bottom-students-summary">
                  Showing {displayedStudents.length} of {students.length} students in <strong>{currentClass.name}</strong>
                </span>
              </div>

              <div className="bottom-bar-actions">
                <div className="quick-class-selector">
                  <span className="selector-label">Switch Class:</span>
                  <select 
                    value={selectedClassId} 
                    onChange={(e) => handleClassClick(e.target.value)}
                    className="class-dropdown-select"
                  >
                    {SCHOOL_CLASSES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="scroll-to-top-btn"
                  onClick={scrollAdminToTop}
                  title="Scroll back to top of class list"
                >
                  <ArrowUp size={16} />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>
          </div>

          {/* Floating Sticky Quick-Return & Top Pill when scrolled down (fades out when near bottom bar) */}
          <div className={`floating-sticky-nav-pill ${showScrollBack ? 'visible' : ''}`}>
            <button
              type="button"
              className="floating-back-btn"
              onClick={handleBackToAllClasses}
              title="Back to All Classes"
            >
              <ArrowLeft size={15} />
              <span>Back to Classes</span>
            </button>
            <div className="floating-divider" />
            <button
              type="button"
              className="floating-top-btn"
              onClick={scrollAdminToTop}
              title="Scroll to Top"
            >
              <ArrowUp size={15} />
              <span>Top</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDENT (No Section) */}
      {showAddModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAddModal(false)}>
          <div className="student-form-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h3>Enroll New Student</h3>
                <p>Register a student for the 2026-27 academic session</p>
              </div>
              <button className="modal-close-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="add-student-form">
              <div className="form-group-item">
                <label>Student Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Subhajit Debbarma"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>

              <div className="form-row-grid-2">
                <div className="form-group-item">
                  <label>Grade / Class *</label>
                  <select 
                    value={newStudent.classId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setNewStudent({ 
                        ...newStudent, 
                        classId: cId,
                        roll: String(getClassCount(cId) + 1).padStart(2, '0'),
                        enrollmentYear: getDefaultEnrollmentYear(cId)
                      });
                    }}
                  >
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream ? `(${cls.stream})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Roll Number *</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder="e.g. 05"
                    value={newStudent.roll}
                    onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                </div>
              </div>

              {['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(newStudent.classId) && (
                <div className="form-row-grid-2">
                  <div className="form-group-item">
                    <label>Enrollment / Reg No. *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 31202508149 or Not found"
                      value={newStudent.enrollmentNo}
                      onChange={(e) => setNewStudent({ ...newStudent, enrollmentNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group-item">
                    <label>Enrollment Year</label>
                    <input 
                      type="text" 
                      readOnly
                      value={newStudent.enrollmentYear || getDefaultEnrollmentYear(newStudent.classId)}
                      className="readonly-input"
                    />
                  </div>
                </div>
              )}

              {['class-6', 'class-7', 'class-8'].includes(newStudent.classId) ? (
                <>
                  <div className="form-row-grid-2">
                    <div className="form-group-item">
                      <label>Father's Name (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pankaj Paul (or t/c)"
                        value={newStudent.father}
                        onChange={(e) => setNewStudent({ ...newStudent, father: e.target.value })}
                      />
                    </div>
                    <div className="form-group-item">
                      <label>Mother's Name (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Shibani Das Paul"
                        value={newStudent.mother}
                        onChange={(e) => setNewStudent({ ...newStudent, mother: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row-grid-2">
                    <div className="form-group-item">
                      <label>Caste / Category (Optional)</label>
                      <select
                        value={newStudent.caste || ''}
                        onChange={(e) => setNewStudent({ ...newStudent, caste: e.target.value })}
                      >
                        <option value="">Select Caste / Category</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="UR">UR</option>
                      </select>
                    </div>
                    <div className="form-group-item">
                      <label>Aadhaar Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 6668 0055 5972"
                        value={newStudent.aadhaar}
                        onChange={(e) => setNewStudent({ ...newStudent, aadhaar: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label htmlFor="add-student-dob">Date of Birth / DOB (Optional)</label>
                    <div 
                      className="dob-input-wrapper"
                      onClick={() => {
                        try {
                          addDobPickerRef.current?.showPicker?.();
                        } catch (err) {
                          addDobPickerRef.current?.focus();
                        }
                      }}
                    >
                      <input 
                        id="add-student-dob"
                        type="text" 
                        placeholder="DD/MM/YYYY e.g. 04/09/2012"
                        value={newStudent.dob}
                        onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                        className="dob-text-input"
                      />
                      <input
                        type="date"
                        ref={addDobPickerRef}
                        value={formatToIsoDate(newStudent.dob)}
                        onChange={(e) => {
                          if (e.target.value) {
                            setNewStudent({ ...newStudent, dob: formatToDisplayDate(e.target.value) });
                          }
                        }}
                        className="dob-native-picker"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        className="dob-picker-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            addDobPickerRef.current?.showPicker?.();
                          } catch (err) {
                            addDobPickerRef.current?.focus();
                          }
                        }}
                        title="Choose Date of Birth from calendar"
                        aria-label="Choose Date of Birth from calendar"
                      >
                        <Calendar size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group-item">
                  <label>Guardian / Parent Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Subir Debbarma (or leave blank)"
                    value={newStudent.guardian}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian: e.target.value })}
                  />
                </div>
              )}

              <div className="form-row-grid-2">
                <div className="form-group-item">
                  <label>Gender (Boy/Girl) *</label>
                  <GenderSelect
                    value={newStudent.gender || 'Boy'}
                    onChange={(val) => setNewStudent({ ...newStudent, gender: val })}
                  />
                </div>
                <div className="form-group-item">
                  <label>Contact Phone (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210 (or leave blank)"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: INDIVIDUAL STUDENT ATTENDANCE SHEET */}
      {selectedAttendanceStudent && (
        <StudentAttendanceModal
          student={selectedAttendanceStudent}
          className={currentClass?.name || 'Class'}
          onClose={() => setSelectedAttendanceStudent(null)}
          onSave={handleSaveStudentAttendance}
        />
      )}

      {/* MODAL 2: CLASS MONTHLY ATTENDANCE REGISTER */}
      {showClassAttendanceModal && currentClass && (
        <ClassAttendanceModal
          currentClass={currentClass}
          students={displayedStudents}
          onClose={() => setShowClassAttendanceModal(false)}
          onSaveClassAttendance={handleSaveClassAttendance}
          onOpenIndividualStudent={(st) => {
            setShowClassAttendanceModal(false);
            setSelectedAttendanceStudent(st);
          }}
        />
      )}

      {/* MODAL 3: EDIT STUDENT DETAILS */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          classes={SCHOOL_CLASSES}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveEditedStudent}
        />
      )}

      {/* MODAL 4: FULL STUDENT DETAILS VIEW */}
      {viewingStudent && (
        <StudentDetailsModal
          student={viewingStudent}
          currentClass={currentClass}
          onClose={() => setViewingStudent(null)}
          onEdit={(st) => {
            setViewingStudent(null);
            setEditingStudent(st);
          }}
          onMarkAttendance={(st) => {
            setViewingStudent(null);
            setSelectedAttendanceStudent(st);
          }}
        />
      )}

      {/* MODAL 5: CLASS-WISE PENDING STATUS MODAL */}
      {pendingModalOpen && (
        <PendingStatusModal
          activeField={pendingModalField}
          setActiveField={setPendingModalField}
          initialClassId={pendingModalClass}
          students={students}
          classes={SCHOOL_CLASSES}
          onClose={() => {
            setPendingModalOpen(false);
            setPendingModalClass('ALL');
          }}
          onSaveStudent={handleSaveEditedStudent}
          onEditStudent={(st) => {
            setEditingStudent(st);
          }}
          onViewStudent={(st, cls) => {
            setViewingStudent(st);
          }}
          onNavigateToClass={handleNavigateFromPendingModal}
        />
      )}
      {/* UNIVERSAL STUDENT SEARCH MODAL */}
      <UniversalStudentSearchModal
        isOpen={universalSearchOpen}
        onClose={() => setUniversalSearchOpen(false)}
        students={students}
        onViewStudent={(st) => {
          setUniversalSearchOpen(false);
          setViewingStudent(st);
        }}
        onEditStudent={(st) => {
          setUniversalSearchOpen(false);
          setEditingStudent(st);
        }}
        onNavigateToClass={(classId) => {
          setUniversalSearchOpen(false);
          handleClassClick(classId);
        }}
      />

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="admin-export-toast" role="status">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{exportNotice}</span>
          <button type="button" onClick={() => setExportNotice(null)} aria-label="Close notification">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
