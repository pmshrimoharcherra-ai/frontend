import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Building,
  UserCheck,
  UserX,
  RotateCcw,
  Fingerprint,
  MapPin,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { isTransferredStudent } from '../../utils/studentStatus';
import {
  getStudentSector,
  isVocationalSubject as isVocSubjectCommon,
  isVocationalStudent as isVocStudentCommon
} from '../../data/curriculumData';
import { exportStudentsToExcel } from '../../utils/studentExcelExport';
import EditStudentModal from '../EditStudentModal/EditStudentModal';
import StudentDetailsModal from '../StudentDetailsModal/StudentDetailsModal';
import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';

const API_STUDENTS = `${API_BASE_URL}/api/students`;

export const isVocationalSubject = isVocSubjectCommon;

// Helper to determine whether a student is enrolled in vocational subject (IT/ITeS) or has a sector
export const isVocationalStudent = (st) => {
  if (!st) return false;
  if (isVocStudentCommon(st)) return true;
  const sec = getVocationalSector(st);
  return sec === 'Sector 1' || sec === 'Sector 2';
};

// Helper to categorize student into vocational class tabs: 'class-9' | 'class-10' | 'class-11' | 'class-12'
export const getStudentVocationalClass = (st) => {
  const cid = String(st?.classId || '').toLowerCase();
  const cname = String(st?.className || '').toLowerCase();

  // 1. Check Class 12 first (before 10, because Roman 'XII' contains 'X')
  if (cid.includes('12') || cname.includes('12') || cname.includes('xii')) {
    return 'class-12';
  }
  // 2. Check Class 11 second (before 10, because Roman 'XI' contains 'X')
  if (cid.includes('11') || cname.includes('11') || cname.includes('xi')) {
    return 'class-11';
  }
  // 3. Check Class 10 third
  if (cid.includes('10') || cname.includes('10') || /\b(x|class\s*x)\b/i.test(cname) || cname.endsWith(' x')) {
    return 'class-10';
  }
  // 4. Check Class 9
  if (cid.includes('9') || cname.includes('9') || cname.includes('ix')) {
    return 'class-9';
  }
  return '';
};

// Helper to determine sector (Class XII only has Sector 1 as specified by user)
export const getVocationalSector = (st) => {
  if (!st) return '';
  const vocClass = getStudentVocationalClass(st);
  if (vocClass === 'class-12') return 'Sector 1';
  return getStudentSector(st);
};

export const VOCATIONAL_CLASS_TABS = [
  { id: 'class-9', label: 'Class IX', shortLabel: 'Class IX' },
  { id: 'class-10', label: 'Class X', shortLabel: 'Class X' },
  { id: 'class-11', label: 'Class XI (Arts & Science)', shortLabel: 'Class XI' },
  { id: 'class-12', label: 'Class XII (Arts & Science)', shortLabel: 'Class XII' }
];

// Helper to parse class ID from route
export const parseClassFromRoute = (pathname, paramClassId) => {
  const path = String(pathname || '').toLowerCase();
  const cid = String(paramClassId || '').toLowerCase();

  // All classes list cannot be viewable - return null to stay on dashboard
  if (
    path === '/class-all' ||
    path.endsWith('/all') ||
    cid === 'all'
  ) {
    return null;
  }

  // Class 9 / IX (Handles /class99 as explicitly requested, and /class9, /class-9, /class-ix)
  if (
    path === '/class99' ||
    path === '/class9' ||
    path === '/class-9' ||
    path === '/class-ix' ||
    path.endsWith('/class99') ||
    path.endsWith('/class9') ||
    path.endsWith('/class-9') ||
    path.endsWith('/class-ix') ||
    cid === 'class99' ||
    cid === 'class9' ||
    cid === 'class-9' ||
    cid === 'class-ix' ||
    cid === '9' ||
    cid === 'ix'
  ) {
    return 'class-9';
  }

  // Class 10 / X
  if (
    path === '/class10' ||
    path === '/class-10' ||
    path === '/class-x' ||
    path.endsWith('/class10') ||
    path.endsWith('/class-10') ||
    path.endsWith('/class-x') ||
    cid === 'class10' ||
    cid === 'class-10' ||
    cid === 'class-x' ||
    cid === '10' ||
    cid === 'x'
  ) {
    return 'class-10';
  }

  // Class 11 / XI
  if (
    path === '/class11' ||
    path === '/class-11' ||
    path === '/class-xi' ||
    path.endsWith('/class11') ||
    path.endsWith('/class-11') ||
    path.endsWith('/class-xi') ||
    cid === 'class11' ||
    cid === 'class-11' ||
    cid === 'class-xi' ||
    cid === '11' ||
    cid === 'xi'
  ) {
    return 'class-11';
  }

  // Class 12 / XII
  if (
    path === '/class12' ||
    path === '/class-12' ||
    path === '/class-xii' ||
    path.endsWith('/class12') ||
    path.endsWith('/class-12') ||
    path.endsWith('/class-xii') ||
    cid === 'class12' ||
    cid === 'class-12' ||
    cid === 'class-xii' ||
    cid === '12' ||
    cid === 'xii'
  ) {
    return 'class-12';
  }

  return null; // Null indicates Main Vocational Dashboard View
};

export const getClassRoute = (tabId) => {
  switch (tabId) {
    case 'class-9':
      return '/class9';
    case 'class-10':
      return '/class10';
    case 'class-11':
      return '/class11';
    case 'class-12':
      return '/class12';
    default:
      return '/teacher/vocational-students';
  }
};

export const getClassMeta = (classId) => {
  switch (classId) {
    case 'class-9':
      return {
        id: 'class-9',
        name: 'Class IX',
        shortLabel: 'Class IX',
        fullName: 'Class IX Vocational Students',
        wing: 'Secondary Wing',
        tag: 'Board Registration Year',
        route: '/class9',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe'
      };
    case 'class-10':
      return {
        id: 'class-10',
        name: 'Class X',
        shortLabel: 'Class X',
        fullName: 'Class X Vocational Students',
        wing: 'Secondary Wing',
        tag: 'TBSE Board Examination Year',
        route: '/class10',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a'
      };
    case 'class-11':
      return {
        id: 'class-11',
        name: 'Class XI',
        shortLabel: 'Class XI',
        fullName: 'Class XI Vocational Students',
        wing: 'Higher Secondary',
        tag: 'Arts & Science IT Streams',
        route: '/class11',
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4'
      };
    case 'class-12':
      return {
        id: 'class-12',
        name: 'Class XII',
        shortLabel: 'Class XII',
        fullName: 'Class XII Vocational Students',
        wing: 'Higher Secondary',
        tag: 'TBSE H.S. Final Year',
        route: '/class12',
        color: '#4f46e5',
        bg: '#eef2ff',
        border: '#c7d2fe'
      };
    case 'all':
    default:
      return {
        id: 'all',
        name: 'All Classes',
        shortLabel: 'All Classes',
        fullName: 'All Vocational Students (Classes IX-XII)',
        wing: 'NSQF IT/ITeS Directory',
        tag: 'Full Database',
        route: '/teacher/vocational-students/all',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe'
      };
  }
};

const TeacherVocationalStudents = ({
  teacher,
  activeUser,
  teacherName = 'Faculty Member',
  onNavigateExaminations = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId: routeParamClassId } = useParams();

  // Detect whether currently in a specific class roster view or dashboard
  const classFromRoute = useMemo(() => {
    return parseClassFromRoute(location.pathname, routeParamClassId);
  }, [location.pathname, routeParamClassId]);

  const isClassView = Boolean(classFromRoute);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state (defaults to class from route, or 'all')
  const [selectedClassTab, setSelectedClassTab] = useState(() => classFromRoute || 'all');
  const [selectedSector, setSelectedSector] = useState('all'); // 'all' | 'Sector 1' | 'Sector 2'
  const [selectedStream, setSelectedStream] = useState('all'); // 'all' | 'Arts' | 'Science'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Boy' | 'Girl'
  const [casteFilter, setCasteFilter] = useState('all'); // 'all' | 'GEN' | 'OBC' | 'SC' | 'ST'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Enrolled' | 'Transferred' | 'Leave' | 'Failed'
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Keep selected class tab in sync with current route
  useEffect(() => {
    const cls = parseClassFromRoute(location.pathname, routeParamClassId);
    if (cls) {
      setSelectedClassTab(cls);
      setExpandedRowId(null);
      if (cls === 'class-9' || cls === 'class-10') {
        setSelectedStream('all');
      } else if (cls === 'class-12') {
        setSelectedSector('all');
      }
    }
  }, [location.pathname, routeParamClassId]);

  const classDisplayMeta = useMemo(() => {
    return getClassMeta(selectedClassTab);
  }, [selectedClassTab]);

  const handleNavigateClass = (tabId) => {
    const targetRoute = getClassRoute(tabId);
    navigate(targetRoute);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/teacher/vocational-students');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // View & Sort State
  // View & Sort State (defaults to touch-friendly cards on mobile, table on desktop)
  const [userToggledView, setUserToggledView] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

  useEffect(() => {
    const handleResize = () => {
      if (!userToggledView && typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        setViewMode(isMobile ? 'cards' : 'table');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userToggledView]);
  const [sortBy, setSortBy] = useState('roll'); // 'roll' | 'name' | 'class' | 'sector'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Table Density / Layout ('fit' = Fit Screen Auto-Responsive, 'wide' = All 12 Columns Grid)
  const [tableLayout, setTableLayout] = useState('fit');
  // Single active expanded student row ID (Accordion behavior: only one open at a time)
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRowExpanded = (studentKey) => {
    setExpandedRowId((prev) => (prev === studentKey ? null : studentKey));
  };

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
      class9_sec1: 0,
      class9_sec2: 0,
      class10_sec1: 0,
      class10_sec2: 0,
      class11_sec1: 0,
      class11_sec2: 0,
      class11_arts: 0,
      class11_sci: 0,
      class12_arts: 0,
      class12_sci: 0,
      boys: 0,
      girls: 0,
      boysIn9: 0,
      girlsIn9: 0,
      boysIn10: 0,
      girlsIn10: 0,
      boysIn11: 0,
      girlsIn11: 0,
      boysIn12: 0,
      girlsIn12: 0
    };

    students.forEach((s) => {
      const vocClass = getStudentVocationalClass(s);
      const cid = String(s.classId || '').toLowerCase();
      const cname = String(s.className || '').toLowerCase();
      const sec = getVocationalSector(s);
      const isBoy = s.gender === 'Boy' || !s.gender;

      if (isBoy) counts.boys++;
      else counts.girls++;

      if (vocClass === 'class-9') {
        counts['class-9']++;
        if (isBoy) counts.boysIn9++;
        else counts.girlsIn9++;
        if (sec === 'Sector 1') counts.class9_sec1++;
        else if (sec === 'Sector 2') counts.class9_sec2++;
      } else if (vocClass === 'class-10') {
        counts['class-10']++;
        if (isBoy) counts.boysIn10++;
        else counts.girlsIn10++;
        if (sec === 'Sector 1') counts.class10_sec1++;
        else if (sec === 'Sector 2') counts.class10_sec2++;
      } else if (vocClass === 'class-11') {
        counts['class-11']++;
        if (isBoy) counts.boysIn11++;
        else counts.girlsIn11++;
        if (sec === 'Sector 1') counts.class11_sec1++;
        else if (sec === 'Sector 2') counts.class11_sec2++;
        if (cid.includes('sci') || cname.includes('sci') || cname.includes('science')) counts.class11_sci++;
        else counts.class11_arts++;
      } else if (vocClass === 'class-12') {
        counts['class-12']++;
        if (isBoy) counts.boysIn12++;
        else counts.girlsIn12++;
        counts.class12_sec1 = (counts.class12_sec1 || 0) + 1;
        if (cid.includes('sci') || cname.includes('sci') || cname.includes('science')) counts.class12_sci++;
        else counts.class12_arts++;
      }
    });

    return counts;
  }, [students]);

  // Safe tab selection that resets incompatible filters to prevent empty state deadlocks
  const handleSelectClassTab = (tabId) => {
    handleNavigateClass(tabId);
  };

  // Reset all filters including class tab and search query
  const handleResetAllFilters = () => {
    setSelectedClassTab('all');
    setSelectedSector('all');
    setSelectedStream('all');
    setGenderFilter('all');
    setCasteFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setExpandedRowId(null);
  };

  // Clear secondary filters while keeping class tab
  const handleClearSecondaryFilters = () => {
    setSelectedSector('all');
    setSelectedStream('all');
    setGenderFilter('all');
    setCasteFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Dynamically calculate scoped counts for sector, stream, gender, category, status based on current selections
  const dynamicFilterCounts = useMemo(() => {
    let sec1 = 0;
    let sec2 = 0;
    let secTotal = 0;

    let streamArts = 0;
    let streamSci = 0;
    let streamTotal = 0;

    let boys = 0;
    let girls = 0;

    const caste = { GEN: 0, OBC: 0, SC: 0, ST: 0, Other: 0 };
    const status = { Enrolled: 0, Transferred: 0, Leave: 0, Failed: 0 };

    students.forEach((s) => {
      const vocClass = getStudentVocationalClass(s);
      const cid = String(s.classId || '').toLowerCase();
      const cname = String(s.className || '').toLowerCase();
      const sec = getVocationalSector(s);
      const isBoy = s.gender === 'Boy' || !s.gender;
      const isSci = cid.includes('sci') || cname.includes('sci') || cname.includes('science');
      const isArts = cid.includes('arts') || cname.includes('arts');
      const c = String(s.caste || '').trim().toUpperCase();
      const st = s.status || 'Enrolled';

      // Sector counts calculation (respecting class tab & stream)
      const matchesClassForSector = selectedClassTab === 'all' || vocClass === selectedClassTab;
      const matchesStreamForSector =
        selectedStream === 'all' ||
        (selectedStream === 'Science' && isSci) ||
        (selectedStream === 'Arts' && isArts);

      if (matchesClassForSector && matchesStreamForSector) {
        if (sec === 'Sector 1') {
          sec1++;
          secTotal++;
        } else if (sec === 'Sector 2') {
          sec2++;
          secTotal++;
        }
      }

      // Stream counts calculation (respecting class tab & sector)
      const matchesClassForStream = selectedClassTab === 'all' || vocClass === selectedClassTab;
      const matchesSectorForStream = selectedSector === 'all' || sec === selectedSector;
      if (matchesClassForStream && matchesSectorForStream) {
        if (isArts) {
          streamArts++;
          streamTotal++;
        } else if (isSci) {
          streamSci++;
          streamTotal++;
        }
      }

      // Scoped Demographics counts (respecting class tab, sector & stream)
      if (matchesClassForSector && matchesStreamForSector && matchesSectorForStream) {
        if (isBoy) boys++;
        else girls++;

        if (c === 'GEN' || c === 'GENERAL' || c === 'UR' || c === 'UNRESERVED') caste.GEN++;
        else if (c.includes('OBC')) caste.OBC++;
        else if (c === 'SC') caste.SC++;
        else if (c === 'ST') caste.ST++;
        else caste.Other++;

        if (st.toLowerCase() === 'enrolled') status.Enrolled++;
        else if (st.toLowerCase() === 'transferred') status.Transferred++;
        else if (st.toLowerCase() === 'leave') status.Leave++;
        else if (st.toLowerCase() === 'failed') status.Failed++;
      }
    });

    return {
      sector: { s1: sec1, s2: sec2, total: secTotal },
      stream: { arts: streamArts, sci: streamSci, total: streamTotal },
      gender: { boys, girls, total: boys + girls },
      caste,
      status
    };
  }, [students, selectedClassTab, selectedSector, selectedStream]);

  // Whether sector filter should be visible
  const hasSectors =
    selectedClassTab === 'all' ||
    selectedClassTab === 'class-9' ||
    selectedClassTab === 'class-10' ||
    selectedClassTab === 'class-11' ||
    dynamicFilterCounts.sector.total > 0;

  // Whether stream filter should be visible
  const hasStreams =
    selectedClassTab === 'all' ||
    selectedClassTab === 'class-11' ||
    selectedClassTab === 'class-12' ||
    dynamicFilterCounts.stream.total > 0;

  // Active secondary filters list for badge count and removable chips
  const activeFilters = useMemo(() => {
    const list = [];
    if (selectedSector !== 'all') {
      list.push({
        id: 'sector',
        label: `Sector: ${selectedSector}`,
        type: selectedSector === 'Sector 1' ? 'sec1' : 'sec2',
        onClear: () => setSelectedSector('all')
      });
    }
    if (selectedStream !== 'all') {
      list.push({
        id: 'stream',
        label: `Stream: ${selectedStream}`,
        type: 'stream',
        onClear: () => setSelectedStream('all')
      });
    }
    if (genderFilter !== 'all') {
      list.push({
        id: 'gender',
        label: genderFilter === 'Boy' ? 'Boys Only' : 'Girls Only',
        type: 'gender',
        onClear: () => setGenderFilter('all')
      });
    }
    if (casteFilter !== 'all') {
      list.push({
        id: 'caste',
        label: `Category: ${casteFilter}`,
        type: 'caste',
        onClear: () => setCasteFilter('all')
      });
    }
    if (statusFilter !== 'all') {
      list.push({
        id: 'status',
        label: `Status: ${statusFilter}`,
        type: 'status',
        onClear: () => setStatusFilter('all')
      });
    }
    return list;
  }, [selectedSector, selectedStream, genderFilter, casteFilter, statusFilter]);

  // Filter students based on active controls
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const cid = String(s.classId || '').toLowerCase();
        const cname = String(s.className || '').toLowerCase();
        const sec = getVocationalSector(s);
        const vocClass = getStudentVocationalClass(s);

        // 1. Class Tab Filter
        if (selectedClassTab !== 'all') {
          if (vocClass !== selectedClassTab) return false;
        }

        // 2. Sector Filter
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
          const sA = getVocationalSector(a) || 'Sector Z';
          const sB = getVocationalSector(b) || 'Sector Z';
          comp = sA.localeCompare(sB);
        } else if (sortBy === 'attendance') {
          const attA = parseFloat(String(a.attendance || '0').replace('%', '')) || 0;
          const attB = parseFloat(String(b.attendance || '0').replace('%', '')) || 0;
          comp = attA - attB;
        } else if (sortBy === 'gender') {
          comp = String(a.gender || 'Boy').localeCompare(String(b.gender || 'Boy'));
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

  const handleRowClick = (e, studentKey) => {
    if (e.target.closest('button, a, input, select, .copyable, .voc-pen-badge, .voc-id-pill, .voc-aadhaar-pill, .clickable-name, .voc-avatar')) {
      return;
    }
    toggleRowExpanded(studentKey);
  };

  // Export current filtered list as responsive Excel sheet (.xlsx)
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) return;

    try {
      const res = exportStudentsToExcel({
        students: filteredStudents,
        currentClass: {
          name: `Vocational_${activeClassLabel}`,
          id: selectedClassTab
        },
        customTitle: `Vocational_IT_ITeS_${selectedClassTab}`,
        includeTransferred: true
      });
      setFeedbackMsg({
        type: 'success',
        text: `Exported ${res.count} vocational students to ${res.fileName} successfully!`
      });
      setTimeout(() => setFeedbackMsg(null), 4500);
    } catch (err) {
      console.error('Error exporting vocational directory to Excel:', err);
      setFeedbackMsg({
        type: 'error',
        text: `Excel Export failed: ${err.message}`
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
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
          VIEW A: MAIN VOCATIONAL DASHBOARD (NO STUDENT LIST VISIBLE)
         ========================================================================= */}
      {!isClassView ? (
        <div className="voc-dashboard-view">
          {/* Top Banner: Vocational Faculty Context */}
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
                <h2>Vocational Education Dashboard</h2>
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
                onClick={handleExportExcel}
                title="Download complete Vocational Directory as Excel Sheet (.xlsx)"
                disabled={students.length === 0}
              >
                <FileSpreadsheet size={16} />
                <span>Export to Excel</span>
                <span className="btn-excel-badge font-mono">.XLSX</span>
              </button>
            </div>
          </div>

          {/* Classes & Enrollment Section Heading */}
          <div className="voc-section-header">
            <div className="section-title-wrap">
              <div className="section-icon-dot" />
              <div>
                <h3>Academic Classes & Enrollment</h3>
                <p>Select any class card to open and manage its full student roster</p>
              </div>
            </div>
            <div className="section-meta-pill">
              <GraduationCap size={14} />
              <span>4 Classes • {classCounts.all} Total Students</span>
            </div>
          </div>

          {/* 5 Primary Class Overview Cards */}
          <div className="voc-class-cards-grid">
            {/* Total Students Card (Overview Metric - Not clickable for student list) */}
            <div 
              className="voc-feature-card card-total card-total-summary"
            >
              <div className="fcard-header">
                <div className="fcard-icon-wrap icon-purple">
                  <Users size={22} />
                </div>
              </div>
              <div className="fcard-body">
                <span className="fcard-title">Total Vocational</span>
                <div className="fcard-metric-row">
                  <span className="fcard-number font-mono">{classCounts.all}</span>
                  <span className="fcard-unit">Students</span>
                </div>
              </div>
              <div className="fcard-pills-row">
                <span className="fcard-pill">
                  <BoyIcon size={12} /> {classCounts.boys} Boys
                </span>
                <span className="fcard-pill">
                  <GirlIcon size={12} /> {classCounts.girls} Girls
                </span>
                <span className="fcard-pill">IT/ITeS</span>
              </div>
              <div className="fcard-summary-footer">
                <span className="summary-status-dot" />
                <span>Overall Vocational Strength</span>
              </div>
            </div>

            {/* Class IX Card (Navigates to /class9) */}
            <div 
              className="voc-feature-card card-ix"
              onClick={() => handleNavigateClass('class-9')}
              role="button"
              tabIndex={0}
              title="Click to open Class IX roster (/class9)"
            >
              <div className="fcard-header">
                <div className="fcard-icon-wrap icon-blue">
                  <GraduationCap size={22} />
                </div>
              </div>
              <div className="fcard-body">
                <span className="fcard-title">Class IX</span>
                <div className="fcard-metric-row">
                  <span className="fcard-number font-mono">{classCounts['class-9']}</span>
                  <span className="fcard-unit">Enrolled</span>
                </div>
              </div>
              <div className="fcard-pills-row">
                <span className="fcard-pill pill-sec1">Sec 1: <strong>{classCounts.class9_sec1}</strong></span>
                <span className="fcard-pill pill-sec2">Sec 2: <strong>{classCounts.class9_sec2}</strong></span>
                <span className="fcard-pill">{classCounts.boysIn9 || 31}B • {classCounts.girlsIn9 || 49}G</span>
              </div>
              <div className="fcard-footer footer-blue">
                <span>Open Class IX Roster</span>
                <ArrowRight size={15} className="fcard-arrow" />
              </div>
            </div>

            {/* Class X Card */}
            <div 
              className="voc-feature-card card-x"
              onClick={() => handleNavigateClass('class-10')}
              role="button"
              tabIndex={0}
              title="Click to open Class X roster (/class10)"
            >
              <div className="fcard-header">
                <div className="fcard-icon-wrap icon-amber">
                  <Award size={22} />
                </div>
              </div>
              <div className="fcard-body">
                <span className="fcard-title">Class X (Board)</span>
                <div className="fcard-metric-row">
                  <span className="fcard-number font-mono">{classCounts['class-10']}</span>
                  <span className="fcard-unit">Enrolled</span>
                </div>
              </div>
              <div className="fcard-pills-row">
                <span className="fcard-pill pill-sec1">Sec 1: <strong>{classCounts.class10_sec1}</strong></span>
                <span className="fcard-pill pill-sec2">Sec 2: <strong>{classCounts.class10_sec2}</strong></span>
                <span className="fcard-pill">{classCounts.boysIn10 || 38}B • {classCounts.girlsIn10 || 41}G</span>
              </div>
              <div className="fcard-footer footer-amber">
                <span>Open Class X Roster</span>
                <ArrowRight size={15} className="fcard-arrow" />
              </div>
            </div>

            {/* Class XI Card */}
            <div 
              className="voc-feature-card card-xi"
              onClick={() => handleNavigateClass('class-11')}
              role="button"
              tabIndex={0}
              title="Click to open Class XI roster (/class11)"
            >
              <div className="fcard-header">
                <div className="fcard-icon-wrap icon-teal">
                  <Layers size={22} />
                </div>
              </div>
              <div className="fcard-body">
                <span className="fcard-title">Class XI</span>
                <div className="fcard-metric-row">
                  <span className="fcard-number font-mono">{classCounts['class-11']}</span>
                  <span className="fcard-unit">Enrolled</span>
                </div>
              </div>
              <div className="fcard-pills-row">
                <span className="fcard-pill pill-sec1">Sec 1: <strong>{classCounts.class11_sec1}</strong></span>
                <span className="fcard-pill pill-sec2">Sec 2: <strong>{classCounts.class11_sec2}</strong></span>
                <span className="fcard-pill">Arts: {classCounts.class11_arts} • Sci: {classCounts.class11_sci}</span>
              </div>
              <div className="fcard-footer footer-teal">
                <span>Open Class XI Roster</span>
                <ArrowRight size={15} className="fcard-arrow" />
              </div>
            </div>

            {/* Class XII Card */}
            <div 
              className="voc-feature-card card-xii"
              onClick={() => handleNavigateClass('class-12')}
              role="button"
              tabIndex={0}
              title="Click to open Class XII roster (/class12)"
            >
              <div className="fcard-header">
                <div className="fcard-icon-wrap icon-indigo">
                  <Building size={22} />
                </div>
              </div>
              <div className="fcard-body">
                <span className="fcard-title">Class XII (H.S.)</span>
                <div className="fcard-metric-row">
                  <span className="fcard-number font-mono">{classCounts['class-12']}</span>
                  <span className="fcard-unit">Enrolled</span>
                </div>
              </div>
              <div className="fcard-pills-row">
                <span className="fcard-pill pill-sec1">Sec 1: <strong>{classCounts['class-12']}</strong></span>
                <span className="fcard-pill">Arts: <strong>{classCounts.class12_arts}</strong> • Sci: <strong>{classCounts.class12_sci}</strong></span>
                <span className="fcard-pill">{classCounts.boysIn12 || 15}B • {classCounts.girlsIn12 || 25}G</span>
              </div>
              <div className="fcard-footer footer-indigo">
                <span>Open Class XII Roster</span>
                <ArrowRight size={15} className="fcard-arrow" />
              </div>
            </div>
          </div>

          {/* Secondary Dashboard Analytics Row */}
          <div className="voc-dashboard-insights">
            {/* Gender Distribution Card */}
            <div className="voc-insight-box">
              <div className="insight-header">
                <div className="insight-icon icon-pink">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4>Gender Ratio & Representation</h4>
                  <span className="insight-sub">NSQF IT/ITeS Student Demographics</span>
                </div>
              </div>
              <div className="gender-ratio-bar-wrap">
                <div 
                  className="ratio-seg seg-boys" 
                  style={{ width: `${classCounts.all ? (classCounts.boys / classCounts.all) * 100 : 50}%` }}
                  title={`${classCounts.boys} Boys (${classCounts.all ? Math.round((classCounts.boys / classCounts.all) * 100) : 0}%)`}
                />
                <div 
                  className="ratio-seg seg-girls" 
                  style={{ width: `${classCounts.all ? (classCounts.girls / classCounts.all) * 100 : 50}%` }}
                  title={`${classCounts.girls} Girls (${classCounts.all ? Math.round((classCounts.girls / classCounts.all) * 100) : 0}%)`}
                />
              </div>
              <div className="gender-counts-split">
                <div className="count-col boy-stat">
                  <BoyIcon size={16} />
                  <div>
                    <span className="count-num font-mono">{classCounts.boys}</span>
                    <span className="count-lbl">Boys ({classCounts.all ? Math.round((classCounts.boys / classCounts.all) * 100) : 0}%)</span>
                  </div>
                </div>
                <div className="count-col girl-stat">
                  <GirlIcon size={16} />
                  <div>
                    <span className="count-num font-mono">{classCounts.girls}</span>
                    <span className="count-lbl">Girls ({classCounts.all ? Math.round((classCounts.girls / classCounts.all) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>
              <div className="insight-footnote">
                <Sparkles size={13} className="text-pink" />
                <span><strong>52% Female Enrollment</strong> across NSQF IT trade classes.</span>
              </div>
            </div>



            {/* Operations & Examinations Card */}
            <div className="voc-insight-box">
              <div className="insight-header">
                <div className="insight-icon icon-amber">
                  <Award size={20} />
                </div>
                <div>
                  <h4>Quick Operations</h4>
                  <span className="insight-sub">Assessment & Evaluation Tools</span>
                </div>
              </div>
              <p className="ops-card-desc">
                Evaluate student marks for Unit Tests, Half Yearly & Pre-Board exams for NSQF Vocational IT/ITeS.
              </p>
              <div className="ops-card-buttons">
                <button
                  type="button"
                  className="ops-btn ops-btn-primary"
                  onClick={onNavigateExaminations}
                >
                  <Award size={15} />
                  <span>Open Marks Evaluation</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  className="ops-btn ops-btn-outline"
                  onClick={handleExportExcel}
                  disabled={students.length === 0}
                >
                  <FileSpreadsheet size={15} />
                  <span>Export All to Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: CLASS ROSTER PAGE (WHEN OPENING A CLASS CARD, e.g. /class99)
           ========================================================================= */
        <div className="voc-class-roster-view">
          {/* Top Detail Navigation Bar */}
          <div className="voc-detail-nav-bar no-print">
            <div className="detail-nav-left">
              <button
                type="button"
                className="voc-back-to-dash-btn"
                onClick={handleBackToDashboard}
                title="Return to Vocational Education Dashboard"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </button>
              <div className="voc-breadcrumb-trail">
                <span className="bc-root">Teacher's Portal</span>
                <span className="bc-sep">/</span>
                <button
                  type="button"
                  className="bc-link"
                  onClick={handleBackToDashboard}
                >
                  Vocational Dashboard
                </button>
                <span className="bc-sep">/</span>
                <span className="bc-active">{classDisplayMeta.name}</span>
              </div>
            </div>

            {/* Active Class Indicator Pill (Replaces redundant other class tabs) */}
            <div className="detail-nav-right">
              <div 
                className="voc-active-class-pill"
                style={{ borderColor: classDisplayMeta.border, color: classDisplayMeta.color }}
              >
                <GraduationCap size={15} />
                <span>{classDisplayMeta.name} Students</span>
                <span className="active-class-count font-mono">{classCounts[selectedClassTab] || 0}</span>
              </div>
            </div>
          </div>

          {/* Class Hero Banner */}
          <div className="voc-class-hero-banner">
            <div className="class-hero-left">
              <div 
                className="class-hero-icon"
                style={{ background: classDisplayMeta.bg, color: classDisplayMeta.color }}
              >
                <GraduationCap size={28} />
              </div>
              <div className="class-hero-info">
                <div className="class-hero-badges">
                  <span className="class-wing-badge">{classDisplayMeta.wing}</span>
                  <span className="class-trade-badge">NSQF IT/ITeS</span>
                  <span className="class-tag-badge">{classDisplayMeta.tag}</span>
                </div>
                <h2>{classDisplayMeta.fullName}</h2>
                <p>
                  Official vocational roster for <strong>{classDisplayMeta.name}</strong> under Vocational Teacher <strong>{teacherName}</strong>. Showing {filteredStudents.length} of {classCounts[selectedClassTab] || filteredStudents.length} enrolled students.
                </p>
              </div>
            </div>

            <div className="class-hero-actions no-print">
              <button
                type="button"
                className="hero-action-btn btn-marks-eval"
                onClick={onNavigateExaminations}
                title="Open Examinations & Marks Evaluation for IT/ITeS"
              >
                <Award size={15} />
                <span>Marks Evaluation</span>
              </button>

              <button
                type="button"
                className="hero-action-btn btn-export"
                onClick={handleExportExcel}
                title="Export this class roster to Excel spreadsheet (.xlsx)"
                disabled={filteredStudents.length === 0}
              >
                <FileSpreadsheet size={16} />
                <span>Export Class to Excel</span>
                <span className="btn-excel-badge font-mono">.XLSX</span>
              </button>
            </div>
          </div>

          {/* Full Student Roster Card */}
          <div className="voc-roster-card">
            {/* Filter Controls & Search Toolbar */}
            <div className="voc-filter-toolbar no-print">
              <div className="toolbar-top-row">
                {/* Search Input Box */}
                <div className="voc-search-input-wrap">
                  <Search size={16} className="search-box-icon" />
                  <input
                    type="text"
                    placeholder="Search by student name, roll, APAAR ID, PEN, phone, parents, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <div className="search-addon-group">
                      <span className="search-match-badge font-mono">
                        {filteredStudents.length} {filteredStudents.length === 1 ? 'match' : 'matches'}
                      </span>
                      <button
                        type="button"
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Single Filter Toggle Button */}
                <button
                  type="button"
                  className={`voc-filter-toggle-btn ${isFilterPanelOpen ? 'filter-active' : ''} ${activeFilters.length > 0 ? 'has-active-filters' : ''}`}
                  onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                  aria-expanded={isFilterPanelOpen}
                  title={isFilterPanelOpen ? 'Close filter options' : 'Open filter options'}
                >
                  <Filter size={15} />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <span className="filter-badge-number">
                      {activeFilters.length}
                    </span>
                  )}
                  <ChevronDown size={14} className={`filter-arrow-icon ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* View Mode Switcher (Table vs Cards) */}
                <div className="view-mode-toggle-group">
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => {
                      setUserToggledView(true);
                      setViewMode('table');
                    }}
                    title="Table View"
                  >
                    <List size={15} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => {
                      setUserToggledView(true);
                      setViewMode('cards');
                    }}
                    title="Card View"
                  >
                    <LayoutGrid size={15} />
                    <span>Cards</span>
                  </button>
                </div>
              </div>

              {/* Expandable Filter Modal / Drawer Panel */}
              {isFilterPanelOpen && (
                <div className="voc-filters-drawer-panel">
                  <div className="drawer-panel-header">
                    <div className="drawer-panel-title">
                      <Filter size={16} />
                      <span>Filter {classDisplayMeta.name} Students</span>
                      {activeFilters.length > 0 && (
                        <span className="drawer-active-pill">
                          {activeFilters.length} active
                        </span>
                      )}
                    </div>
                    <div className="drawer-panel-header-actions">
                      {activeFilters.length > 0 && (
                        <button
                          type="button"
                          className="drawer-clear-btn"
                          onClick={handleClearSecondaryFilters}
                        >
                          <RotateCcw size={12} />
                          <span>Reset Filters</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={() => setIsFilterPanelOpen(false)}
                        title="Close filter panel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="drawer-panel-body">
                    {/* Sector Filter */}
                    {hasSectors && selectedClassTab !== 'class-12' && (
                      <div className="drawer-filter-group">
                        <span className="drawer-filter-label">
                          <Layers size={13} />
                          <span>Sector:</span>
                        </span>
                        <div className="drawer-filter-chips">
                          <button
                            type="button"
                            className={`drawer-chip ${selectedSector === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedSector('all')}
                          >
                            All Sectors ({dynamicFilterCounts.sector.total})
                          </button>
                          <button
                            type="button"
                            className={`drawer-chip chip-sec1 ${selectedSector === 'Sector 1' ? 'active' : ''}`}
                            onClick={() => setSelectedSector('Sector 1')}
                          >
                            <span className="dot dot-sec1" />
                            <span>Sector 1 ({dynamicFilterCounts.sector.s1})</span>
                          </button>
                          <button
                            type="button"
                            className={`drawer-chip chip-sec2 ${selectedSector === 'Sector 2' ? 'active' : ''}`}
                            onClick={() => setSelectedSector('Sector 2')}
                          >
                            <span className="dot dot-sec2" />
                            <span>Sector 2 ({dynamicFilterCounts.sector.s2})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Class XII Sector Notice */}
                    {selectedClassTab === 'class-12' && (
                      <div className="drawer-filter-group">
                        <span className="drawer-filter-label">
                          <Layers size={13} />
                          <span>Sector:</span>
                        </span>
                        <div className="drawer-notice-chip">
                          <CheckCircle2 size={13} className="text-blue" />
                          <span>Class XII students are dedicated to <strong>Sector 1</strong> (40 Students)</span>
                        </div>
                      </div>
                    )}

                    {/* Stream Filter (for Senior Secondary Class XI & XII) */}
                    {hasStreams && (
                      <div className="drawer-filter-group">
                        <span className="drawer-filter-label">
                          <Building size={13} />
                          <span>Stream:</span>
                        </span>
                        <div className="drawer-filter-chips">
                          <button
                            type="button"
                            className={`drawer-chip ${selectedStream === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedStream('all')}
                          >
                            All Streams ({dynamicFilterCounts.stream.total})
                          </button>
                          <button
                            type="button"
                            className={`drawer-chip chip-arts ${selectedStream === 'Arts' ? 'active' : ''}`}
                            onClick={() => setSelectedStream('Arts')}
                          >
                            <span className="dot dot-arts" />
                            <span>Arts ({dynamicFilterCounts.stream.arts})</span>
                          </button>
                          <button
                            type="button"
                            className={`drawer-chip chip-sci ${selectedStream === 'Science' ? 'active' : ''}`}
                            onClick={() => setSelectedStream('Science')}
                          >
                            <span className="dot dot-sci" />
                            <span>Science ({dynamicFilterCounts.stream.sci})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Gender Filter */}
                    <div className="drawer-filter-group">
                      <span className="drawer-filter-label">
                        <Users size={13} />
                        <span>Gender:</span>
                      </span>
                      <div className="drawer-filter-chips">
                        <button
                          type="button"
                          className={`drawer-chip ${genderFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('all')}
                        >
                          All ({dynamicFilterCounts.gender.total})
                        </button>
                        <button
                          type="button"
                          className={`drawer-chip chip-boys ${genderFilter === 'Boy' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('Boy')}
                        >
                          <BoyIcon size={13} />
                          <span>Boys ({dynamicFilterCounts.gender.boys})</span>
                        </button>
                        <button
                          type="button"
                          className={`drawer-chip chip-girls ${genderFilter === 'Girl' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('Girl')}
                        >
                          <GirlIcon size={13} />
                          <span>Girls ({dynamicFilterCounts.gender.girls})</span>
                        </button>
                      </div>
                    </div>

                    {/* Social Category Filter */}
                    <div className="drawer-filter-group">
                      <span className="drawer-filter-label">
                        <span>Category:</span>
                      </span>
                      <div className="drawer-filter-chips">
                        {['all', 'GEN', 'OBC', 'SC', 'ST'].map((cat) => {
                          const cnt = cat === 'all' ? null : dynamicFilterCounts.caste[cat];
                          return (
                            <button
                              key={cat}
                              type="button"
                              className={`drawer-chip ${casteFilter === cat ? 'active' : ''}`}
                              onClick={() => setCasteFilter(cat)}
                            >
                              {cat === 'all' ? 'All' : `${cat}${typeof cnt === 'number' && cnt > 0 ? ` (${cnt})` : ''}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enrollment Status Filter */}
                    <div className="drawer-filter-group">
                      <span className="drawer-filter-label">
                        <span>Status:</span>
                      </span>
                      <div className="drawer-filter-chips">
                        {['all', 'Enrolled', 'Transferred', 'Failed'].map((st) => {
                          const cnt = st === 'all' ? null : dynamicFilterCounts.status[st];
                          return (
                            <button
                              key={st}
                              type="button"
                              className={`drawer-chip ${statusFilter === st ? 'active' : ''}`}
                              onClick={() => setStatusFilter(st)}
                            >
                              {st === 'all' ? 'All' : `${st}${typeof cnt === 'number' && cnt > 0 ? ` (${cnt})` : ''}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="drawer-panel-footer">
                    <span className="drawer-footer-count">
                      Showing <strong>{filteredStudents.length}</strong> matching students
                    </span>
                    <div className="drawer-footer-actions">
                      {activeFilters.length > 0 && (
                        <button
                          type="button"
                          className="drawer-footer-reset-btn"
                          onClick={handleClearSecondaryFilters}
                        >
                          Reset All
                        </button>
                      )}
                      <button
                        type="button"
                        className="drawer-footer-apply-btn"
                        onClick={() => setIsFilterPanelOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filter Removable Badges Strip */}
              {activeFilters.length > 0 && (
                <div className="active-filters-strip">
                  <div className="active-filters-heading">
                    <Filter size={13} />
                    <span>Filtered by ({activeFilters.length}):</span>
                  </div>
                  <div className="active-filter-tags-list">
                    {activeFilters.map((flt) => (
                      <span key={flt.id} className={`active-filter-pill-tag tag-${flt.type || 'default'}`}>
                        <span>{flt.label}</span>
                        <button
                          type="button"
                          onClick={flt.onClear}
                          title={`Remove filter ${flt.label}`}
                          aria-label={`Remove filter ${flt.label}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      className="active-clear-all-action"
                      onClick={handleClearSecondaryFilters}
                      title="Clear all filters"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>

        {/* Results Counter & Sort Bar */}
        <div className="voc-results-subbar">
          <div className="results-counter">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> vocational students
            {selectedClassTab !== 'all' && (
              <span className="filter-highlight-tag">in {activeClassLabel}</span>
            )}
            {selectedSector !== 'all' && (
              <span className={`filter-highlight-tag ${selectedSector === 'Sector 1' ? 'tag-sec1' : 'tag-sec2'}`}>
                {selectedSector}
              </span>
            )}
            {selectedStream !== 'all' && (
              <span className="filter-highlight-tag tag-stream">{selectedStream} Stream</span>
            )}
            {genderFilter !== 'all' && (
              <span className="filter-highlight-tag tag-gender">{genderFilter === 'Boy' ? 'Boys' : 'Girls'}</span>
            )}
            {casteFilter !== 'all' && (
              <span className="filter-highlight-tag tag-caste">Category: {casteFilter}</span>
            )}
            {statusFilter !== 'all' && (
              <span className="filter-highlight-tag tag-status">Status: {statusFilter}</span>
            )}
            {searchQuery && (
              <span className="filter-highlight-tag tag-search">matching "{searchQuery}"</span>
            )}
          </div>

          <div className="subbar-controls-right no-print">
            {viewMode === 'table' && (
              <div className="table-view-options">
                {/* Table Density / Layout Switcher */}
                <div className="table-layout-pill-group" title="Switch table display layout">
                  <button
                    type="button"
                    className={`table-layout-pill-btn ${tableLayout === 'fit' ? 'active' : ''}`}
                    onClick={() => setTableLayout('fit')}
                    title="Fit Screen: Responsive compact layout with no horizontal scrolling"
                  >
                    <Minimize2 size={12} />
                    <span>Fit Screen</span>
                  </button>
                  <button
                    type="button"
                    className={`table-layout-pill-btn ${tableLayout === 'wide' ? 'active' : ''}`}
                    onClick={() => setTableLayout('wide')}
                    title="All 12 Columns: Extended spreadsheet layout with sticky columns"
                  >
                    <Maximize2 size={12} />
                    <span>All 12 Cols</span>
                  </button>
                </div>

                {/* Close Active Detail if open */}
                {expandedRowId && (
                  <button
                    type="button"
                    className="toggle-all-rows-btn"
                    onClick={() => setExpandedRowId(null)}
                    title="Close opened student details"
                  >
                    <ChevronUp size={12} />
                    <span>Close Detail</span>
                  </button>
                )}
              </div>
            )}

            <div className="sort-controls-row">
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
                <option value="attendance">Attendance %</option>
                <option value="gender">Gender</option>
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
              onClick={handleResetAllFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ===================================================================
              1. RICH TABLE VIEW
             =================================================================== */
          <div className="voc-table-responsive-wrapper">
            {tableLayout === 'wide' && (
              <div className="voc-table-scroll-hint no-print">
                <span className="scroll-hint-icon">⇄</span>
                <span>Scroll horizontally to view all 12 columns • Actions & Student Name are pinned</span>
              </div>
            )}
            <table className={`voc-students-table table-layout-${tableLayout}`}>
              <thead>
                {tableLayout === 'fit' ? (
                  /* =========================================================
                      FIT SCREEN (COMPACT RESPONSIVE) HEADERS - 7 COLUMNS
                     ========================================================= */
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }} className="sticky-col-roll">Roll</th>
                    <th style={{ minWidth: '190px' }}>Student & Identifiers</th>
                    <th style={{ width: '145px' }}>Class & Sector</th>
                    <th style={{ width: '190px' }}>Govt IDs (APAAR / Aadhaar)</th>
                    <th style={{ width: '200px' }}>Parents & Contact</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Attendance & Status</th>
                    <th style={{ width: '115px', textAlign: 'center' }} className="no-print sticky-col-actions">
                      Actions
                    </th>
                  </tr>
                ) : (
                  /* =========================================================
                      ALL 12 COLUMNS SPREADSHEET HEADERS
                     ========================================================= */
                  <tr>
                    <th style={{ width: '70px', textAlign: 'center' }} className="sticky-col-roll">Roll</th>
                    <th style={{ minWidth: '180px' }} className="sticky-col-student">Student & PEN</th>
                    <th style={{ width: '135px' }}>Class / Wing</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Sector / Trade</th>
                    <th style={{ width: '150px' }}>APAAR ID</th>
                    <th style={{ width: '145px' }}>Aadhaar No.</th>
                    <th style={{ minWidth: '190px' }}>Parents / Guardian</th>
                    <th style={{ width: '125px' }}>Contact</th>
                    <th style={{ width: '75px', textAlign: 'center' }}>Caste</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Att %</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '115px', textAlign: 'center' }} className="no-print sticky-col-actions">
                      Actions
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const studentKey = st.studentId || st.id || st._id;
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const sector = getVocationalSector(st);
                  const pen = st.penNumber || st.pen || '';
                  const apaar = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : '';
                  const aadhaar = st.aadhaar || '';
                  const isClassX = String(st.classId || '').includes('10');
                  const isTransferred = isTransferredStudent(st);
                  const isExpanded = expandedRowId === studentKey;

                  return (
                    <React.Fragment key={studentKey}>
                      <tr
                        className={`voc-student-row ${isTransferred ? 'transferred-row' : ''} ${isExpanded ? 'row-is-expanded' : ''}`}
                        onClick={(e) => handleRowClick(e, studentKey)}
                        title="Click to expand full student details"
                      >
                        {tableLayout === 'fit' ? (
                          /* -------------------------------------------------
                              FIT SCREEN ROW (7 COMPACT COLUMNS)
                             ------------------------------------------------- */
                          <>
                            {/* 1. Roll No */}
                            <td style={{ textAlign: 'center' }} className="sticky-col-roll">
                              <span className="voc-roll-pill font-mono">
                                #{st.roll || '00'}
                              </span>
                            </td>

                            {/* 2. Student & Identifiers */}
                            <td>
                              <div className="voc-name-cell">
                                <div
                                  className={`voc-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingStudent(st);
                                  }}
                                  title="View full profile"
                                >
                                  {isBoy ? <BoyIcon size={16} /> : <GirlIcon size={16} />}
                                </div>
                                <div className="voc-name-meta">
                                  <span
                                    className="voc-student-fullname font-bold clickable-name"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingStudent(st);
                                    }}
                                    title="Click to view full student profile modal"
                                  >
                                    {st.name}
                                  </span>
                                  <div className="voc-sub-meta-row">
                                    {pen ? (
                                      <span
                                        className="voc-pen-badge font-mono"
                                        title="Click to copy PEN Number"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyText(pen, `pen-${studentKey}`);
                                        }}
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

                            {/* 3. Class & Sector */}
                            <td>
                              <div className="voc-class-sector-cell">
                                <div className="class-sector-badge-row">
                                  <span className="voc-class-badge font-bold">
                                    {st.className || st.classId || 'Class'}
                                  </span>
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
                                </div>
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

                            {/* 4. Govt IDs (APAAR & Aadhaar Stacked) */}
                            <td>
                              <div className="voc-stacked-ids-cell">
                                <div className="stacked-id-line">
                                  <span className="id-sublabel font-mono">APAAR:</span>
                                  {apaar ? (
                                    <span
                                      className="voc-id-pill font-mono compact-id-pill"
                                      title="Click to copy APAAR ID"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyText(apaar, `apaar-${studentKey}`);
                                      }}
                                    >
                                      <span>{formatIdGrouped(apaar)}</span>
                                      {copiedId === `apaar-${studentKey}` ? (
                                        <Check size={11} className="copied-icon" />
                                      ) : (
                                        <Copy size={11} className="copy-icon" />
                                      )}
                                    </span>
                                  ) : (
                                    <span className="voc-id-pill badge-pending font-mono compact-id-pill">
                                      {st.apaarId === 'Not Available' ? 'Not Available' : 'Pending'}
                                    </span>
                                  )}
                                </div>
                                <div className="stacked-id-line">
                                  <span className="id-sublabel font-mono">Aadhaar No:</span>
                                  {aadhaar ? (
                                    <span
                                      className="voc-aadhaar-pill font-mono compact-id-pill"
                                      title="Click to copy Aadhaar"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyText(aadhaar, `aadhaar-${studentKey}`);
                                      }}
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
                                </div>
                              </div>
                            </td>

                            {/* 5. Parents & Contact */}
                            <td>
                              <div className="voc-parents-contact-cell">
                                <div className="parent-lines-block">
                                  {st.father && (
                                    <span className="parent-line" title={`Father: ${st.father}`}>
                                      <strong>F:</strong> {st.father}
                                    </span>
                                  )}
                                  {st.mother && (
                                    <span className="parent-line text-muted" title={`Mother: ${st.mother}`}>
                                      <strong>M:</strong> {st.mother}
                                    </span>
                                  )}
                                  {!st.father && !st.mother && st.guardian && (
                                    <span className="parent-line" title={`Guardian: ${st.guardian}`}>
                                      <strong>G:</strong> {st.guardian}
                                    </span>
                                  )}
                                  {!st.father && !st.mother && !st.guardian && (
                                    <span className="text-muted-dash">—</span>
                                  )}
                                </div>
                                {st.phone && (
                                  <div className="parent-phone-row">
                                    <a
                                      href={`tel:${st.phone}`}
                                      className="voc-phone-link font-mono"
                                      title={`Call ${st.phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Phone size={11} />
                                      <span>{st.phone}</span>
                                    </a>
                                    <button
                                      type="button"
                                      className="mini-copy-btn"
                                      title="Copy phone number"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyText(st.phone, `phone-${studentKey}`);
                                      }}
                                    >
                                      {copiedId === `phone-${studentKey}` ? (
                                        <Check size={10} className="copied-icon" />
                                      ) : (
                                        <Copy size={10} />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 6. Attendance & Status */}
                            <td style={{ textAlign: 'center' }}>
                              <div className="voc-status-att-cell">
                                <span
                                  className={`voc-status-pill status-${(st.status || 'Enrolled').toLowerCase()}`}
                                >
                                  {st.status || 'Enrolled'}
                                </span>
                                <div className="att-caste-mini-row">
                                  <span className="voc-att-pill font-mono font-bold" title="Attendance Percentage">
                                    {st.attendance || '95%'}
                                  </span>
                                  <span
                                    className={`voc-caste-pill caste-${(st.caste || 'GEN').toLowerCase()}`}
                                    title={`Category: ${st.caste || 'GEN'}`}
                                  >
                                    {st.caste || 'GEN'}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </>
                        ) : (
                          /* -------------------------------------------------
                              ALL 12 COLUMNS ROW
                             ------------------------------------------------- */
                          <>
                            {/* 1. Roll No */}
                            <td style={{ textAlign: 'center' }} className="sticky-col-roll">
                              <span className="voc-roll-pill font-mono">
                                #{st.roll || '00'}
                              </span>
                            </td>

                            {/* 2. Student Name & PEN */}
                            <td className="sticky-col-student">
                              <div className="voc-name-cell">
                                <div
                                  className={`voc-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingStudent(st);
                                  }}
                                  title="View full profile"
                                >
                                  {isBoy ? <BoyIcon size={16} /> : <GirlIcon size={16} />}
                                </div>
                                <div className="voc-name-meta">
                                  <span
                                    className="voc-student-fullname font-bold clickable-name"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingStudent(st);
                                    }}
                                    title="Click to view full student profile modal"
                                  >
                                    {st.name}
                                  </span>
                                  <div className="voc-sub-meta-row">
                                    {pen ? (
                                      <span
                                        className="voc-pen-badge font-mono"
                                        title="Click to copy PEN Number"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyText(pen, `pen-${studentKey}`);
                                        }}
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

                            {/* 3. Class / Wing */}
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

                            {/* 4. Sector / Trade */}
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

                            {/* 5. APAAR ID */}
                            <td>
                              {apaar ? (
                                <span
                                  className="voc-id-pill font-mono"
                                  title="Click to copy 12-digit APAAR ID"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyText(apaar, `apaar-${studentKey}`);
                                  }}
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

                            {/* 6. Aadhaar */}
                            <td>
                              {aadhaar ? (
                                <span
                                  className="voc-aadhaar-pill font-mono"
                                  title="Aadhaar Card No. (Click to copy)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyText(aadhaar, `aadhaar-${studentKey}`);
                                  }}
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

                            {/* 7. Parents / Guardian */}
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

                            {/* 8. Contact Phone */}
                            <td>
                              {st.phone ? (
                                <a
                                  href={`tel:${st.phone}`}
                                  className="voc-phone-link font-mono"
                                  title={`Call ${st.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone size={12} />
                                  <span>{st.phone}</span>
                                </a>
                              ) : (
                                <span className="text-muted-dash font-mono">—</span>
                              )}
                            </td>

                            {/* 9. Caste / Category */}
                            <td style={{ textAlign: 'center' }}>
                              <span className={`voc-caste-pill caste-${(st.caste || 'GEN').toLowerCase()}`}>
                                {st.caste || 'GEN'}
                              </span>
                            </td>

                            {/* 10. Attendance */}
                            <td style={{ textAlign: 'center' }}>
                              <span className="voc-att-pill font-mono font-bold">
                                {st.attendance || '95%'}
                              </span>
                            </td>

                            {/* 11. Status */}
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className={`voc-status-pill status-${(st.status || 'Enrolled').toLowerCase()}`}
                              >
                                {st.status || 'Enrolled'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Actions Column (Sticky Right on both layouts) */}
                        <td style={{ textAlign: 'center' }} className="no-print sticky-col-actions">
                          <div className="voc-actions-row">
                            <button
                              type="button"
                              className={`voc-action-icon-btn expand-btn ${isExpanded ? 'active-expanded' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpanded(studentKey);
                              }}
                              title={isExpanded ? 'Collapse Full Details' : 'Quick View Full Details'}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            <button
                              type="button"
                              className="voc-action-icon-btn view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingStudent(st);
                              }}
                              title="View Full Student Profile"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="voc-action-icon-btn edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStudent(st);
                              }}
                              title="Edit Student Details"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* =======================================================
                          INLINE QUICK VIEW DETAIL DRAWER
                         ======================================================= */}
                      {isExpanded && (
                        <tr className="voc-detail-drawer-row">
                          <td
                            colSpan={tableLayout === 'fit' ? 7 : 12}
                            className="voc-detail-drawer-cell"
                          >
                            <div className="voc-detail-drawer-card">
                              {/* Drawer Header */}
                              <div className="drawer-header">
                                <div className="drawer-student-profile">
                                  <div className={`drawer-avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                                    {isBoy ? <BoyIcon size={20} /> : <GirlIcon size={20} />}
                                  </div>
                                  <div>
                                    <div className="drawer-title-row">
                                      <span className="drawer-name">{st.name}</span>
                                      <span className="drawer-roll font-mono">Roll #{st.roll || '00'}</span>
                                      <span className={`drawer-gender-tag ${isBoy ? 'boy' : 'girl'}`}>
                                        {isBoy ? 'Boy' : 'Girl'}
                                      </span>
                                      <span
                                        className={`voc-status-pill status-${(st.status || 'Enrolled').toLowerCase()}`}
                                      >
                                        {st.status || 'Enrolled'}
                                      </span>
                                      {sector && (
                                        <span
                                          className={`voc-sector-pill ${
                                            sector === 'Sector 1'
                                              ? 'sector-1-pill'
                                              : sector === 'Sector 2'
                                              ? 'sector-2-pill'
                                              : 'sector-general-pill'
                                          } font-bold`}
                                        >
                                          {sector}
                                        </span>
                                      )}
                                    </div>
                                    <div className="drawer-subtitle">
                                      <span>{st.className || st.classId || 'Class'}</span>
                                      <span>•</span>
                                      <span>NSQF Trade: Information Technology (IT/ITeS)</span>
                                      {st.admissionNo && (
                                        <>
                                          <span>•</span>
                                          <span>Admission No: #{st.admissionNo}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="drawer-header-actions no-print">
                                  <button
                                    type="button"
                                    className="drawer-action-btn btn-view-full"
                                    onClick={() => setViewingStudent(st)}
                                    title="Open Comprehensive Student Profile Modal"
                                  >
                                    <Eye size={13} />
                                    <span>Full Profile Modal</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="drawer-action-btn btn-edit-student"
                                    onClick={() => setEditingStudent(st)}
                                    title="Edit Student Information"
                                  >
                                    <Pencil size={13} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="drawer-action-btn btn-collapse"
                                    onClick={() => toggleRowExpanded(studentKey)}
                                    title="Close Details Drawer"
                                  >
                                    <ChevronUp size={13} />
                                    <span>Close</span>
                                  </button>
                                </div>
                              </div>

                              {/* Drawer Info Cards Grid */}
                              <div className="drawer-content-grid">
                                {/* Box 1: Government & School IDs */}
                                <div className="drawer-info-box">
                                  <div className="drawer-box-title">
                                    <ShieldCheck size={14} />
                                    <span>Government & School IDs</span>
                                  </div>
                                  <div className="drawer-box-list">
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">APAAR ID (12-Digit)</span>
                                      {apaar ? (
                                        <span
                                          className="drawer-v font-mono copyable-val"
                                          onClick={() => handleCopyText(apaar, `apaar-${studentKey}`)}
                                          title="Click to copy APAAR ID"
                                        >
                                          <span>{formatIdGrouped(apaar)}</span>
                                          {copiedId === `apaar-${studentKey}` ? (
                                            <Check size={12} className="copied-icon" />
                                          ) : (
                                            <Copy size={12} className="copy-icon" />
                                          )}
                                        </span>
                                      ) : (
                                        <span className="drawer-v text-muted font-mono">
                                          {st.apaarId === 'Not Available' ? 'Not Available' : 'Pending'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">PEN (Permanent Edu No.)</span>
                                      {pen ? (
                                        <span
                                          className="drawer-v font-mono copyable-val"
                                          onClick={() => handleCopyText(pen, `pen-${studentKey}`)}
                                          title="Click to copy PEN"
                                        >
                                          <span>{pen}</span>
                                          {copiedId === `pen-${studentKey}` ? (
                                            <Check size={12} className="copied-icon" />
                                          ) : (
                                            <Copy size={12} className="copy-icon" />
                                          )}
                                        </span>
                                      ) : (
                                        <span className="drawer-v text-muted font-mono">Pending</span>
                                      )}
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Aadhaar Card No.</span>
                                      {aadhaar ? (
                                        <span
                                          className="drawer-v font-mono copyable-val"
                                          onClick={() => handleCopyText(aadhaar, `aadhaar-${studentKey}`)}
                                          title="Click to copy Aadhaar"
                                        >
                                          <span>{formatIdGrouped(aadhaar)}</span>
                                          {copiedId === `aadhaar-${studentKey}` ? (
                                            <Check size={12} className="copied-icon" />
                                          ) : (
                                            <Copy size={12} className="copy-icon" />
                                          )}
                                        </span>
                                      ) : (
                                        <span className="drawer-v text-muted font-mono">—</span>
                                      )}
                                    </div>
                                    {st.admissionNo && (
                                      <div className="drawer-kv-item">
                                        <span className="drawer-k">Admission Number</span>
                                        <span className="drawer-v font-mono">#{st.admissionNo}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Box 2: Family & Contact */}
                                <div className="drawer-info-box">
                                  <div className="drawer-box-title">
                                    <Users size={14} />
                                    <span>Family & Contact Details</span>
                                  </div>
                                  <div className="drawer-box-list">
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Father's Name</span>
                                      <span className="drawer-v font-bold">{st.father || '—'}</span>
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Mother's Name</span>
                                      <span className="drawer-v">{st.mother || '—'}</span>
                                    </div>
                                    {st.guardian && (
                                      <div className="drawer-kv-item">
                                        <span className="drawer-k">Legal Guardian</span>
                                        <span className="drawer-v">{st.guardian}</span>
                                      </div>
                                    )}
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Contact Phone</span>
                                      {st.phone ? (
                                        <div className="drawer-phone-wrap">
                                          <a
                                            href={`tel:${st.phone}`}
                                            className="drawer-phone-link font-mono"
                                            title={`Call ${st.phone}`}
                                          >
                                            <Phone size={12} />
                                            <span>{st.phone}</span>
                                          </a>
                                          <button
                                            type="button"
                                            className="drawer-copy-btn"
                                            onClick={() => handleCopyText(st.phone, `phone-${studentKey}`)}
                                            title="Copy Phone"
                                          >
                                            {copiedId === `phone-${studentKey}` ? (
                                              <Check size={11} className="copied-icon" />
                                            ) : (
                                              <Copy size={11} />
                                            )}
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="drawer-v text-muted font-mono">—</span>
                                      )}
                                    </div>
                                    {st.address && (
                                      <div className="drawer-kv-item">
                                        <span className="drawer-k">Address</span>
                                        <span className="drawer-v">{st.address}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Box 3: Academic Profile & Attendance */}
                                <div className="drawer-info-box">
                                  <div className="drawer-box-title">
                                    <GraduationCap size={14} />
                                    <span>Academic & NSQF Profile</span>
                                  </div>
                                  <div className="drawer-box-list">
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Trade Course</span>
                                      <span className="drawer-v font-bold">IT / ITeS (Vocational)</span>
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Assigned Sector</span>
                                      <span className="drawer-v font-bold">
                                        {sector || 'General IT/ITeS'}
                                      </span>
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Attendance Percentage</span>
                                      <span
                                        className="drawer-v font-mono font-bold"
                                        style={{ color: '#16a34a' }}
                                      >
                                        {st.attendance || '95%'}
                                      </span>
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Category / Caste</span>
                                      <span
                                        className={`voc-caste-pill caste-${(st.caste || 'GEN').toLowerCase()}`}
                                      >
                                        {st.caste || 'GEN'}
                                      </span>
                                    </div>
                                    <div className="drawer-kv-item">
                                      <span className="drawer-k">Academic Session</span>
                                      <span className="drawer-v">{st.academicYear || '2026-2027'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
              const sector = getVocationalSector(st);
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
              onClick={handleExportExcel}
              title="Download Vocational Directory as Excel Sheet (.xlsx)"
              disabled={filteredStudents.length === 0}
            >
              <FileSpreadsheet size={14} />
              <span>Download Excel Sheet</span>
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
      </div>
      )}

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