import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './AdminStudents.css';
import StudentAttendanceModal from '../StudentAttendanceModal/StudentAttendanceModal';
import ClassAttendanceModal from '../ClassAttendanceModal/ClassAttendanceModal';
import EditStudentModal, { formatToIsoDate, formatToDisplayDate } from '../EditStudentModal/EditStudentModal';
import StudentDetailsModal from '../StudentDetailsModal/StudentDetailsModal';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import GenderSelect from '../GenderSelect/GenderSelect';
import {
  GraduationCap,
  Users,
  User,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Filter,
  Phone,
  BookOpen,
  Sparkles,
  Download,
  X,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye
} from 'lucide-react';

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

const AdminStudents = ({ initialOpenAdd = false, initialSelectedClassId = null }) => {
  const { classId: routeClassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClassId, setSelectedClassId] = useState(routeClassId || initialSelectedClassId || null);

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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(initialOpenAdd);

  useEffect(() => {
    if (initialOpenAdd) {
      setShowAddModal(true);
    }
  }, [initialOpenAdd]);
  const [selectedAttendanceStudent, setSelectedAttendanceStudent] = useState(null);
  const [showClassAttendanceModal, setShowClassAttendanceModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const addDobPickerRef = useRef(null);

  // New Student Form State (No section)
  const [newStudent, setNewStudent] = useState({
    name: '',
    classId: 'class-6',
    roll: '',
    gender: 'Boy',
    enrollmentNo: '',
    enrollmentYear: '2026',
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
      setError('Unable to load students from database. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
    return <span className="enrolled-status-pill status-enrolled">{status || 'Enrolled'}</span>;
  };

  const getDefaultEnrollmentYear = (classId) => {
    if (classId === 'class-11-arts' || classId === 'class-11-sci') return '2024';
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

  // Filter students based on class selection and search query, strictly in roll no wise order
  const displayedStudents = students
    .filter(s => {
      const matchesClass = selectedClassId ? s.classId === selectedClassId : true;
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
                            (s.phone || '').includes(searchQuery);
      return matchesClass && matchesSearch;
    })
    .sort((a, b) => {
      const rollA = parseInt(a.roll, 10) || 0;
      const rollB = parseInt(b.roll, 10) || 0;
      return rollA - rollB;
    });

  // Count helper
  const getClassCount = (classId) => {
    return students.filter(s => s.classId === classId).length;
  };

  // Class stats helper (Total, Boys, Girls)
  const getClassStats = (classId) => {
    const classStudents = students.filter(s => s.classId === classId);
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

  const totalBoys = students.filter(s => (s.gender || '').trim().toLowerCase() !== 'girl').length;
  const totalGirls = students.filter(s => (s.gender || '').trim().toLowerCase() === 'girl').length;

  const renderCardMiddle = (classId) => {
    const stats = getClassStats(classId);
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
      </div>
    );
  };

  const handleClassClick = (classId) => {
    setSelectedClassId(classId);
    setSearchQuery('');
    const basePath = location.pathname.startsWith('/admin') ? '/admin/students' : '/students';
    navigate(`${basePath}/${classId}`);
  };

  const handleBackToAllClasses = () => {
    setSelectedClassId(null);
    setSearchQuery('');
    const basePath = location.pathname.startsWith('/admin') ? '/admin/students' : '/students';
    navigate(basePath);
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
                className="attendance-sheet-btn-secondary" 
                onClick={fetchStudents}
                disabled={loading}
                title="Refresh student records"
              >
                <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                <span>{loading ? 'Syncing...' : 'Sync DB'}</span>
              </button>
              <button className="add-student-btn-primary" onClick={() => handleOpenAddModal('class-6')}>
                <Plus size={16} />
                <span>Enroll New Student</span>
              </button>
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
              <span className="summary-val">{students.length} Students</span>
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
              <span className="summary-label">Academic Session</span>
              <span className="summary-val">2026 - 2027</span>
            </div>
          </div>

          {/* WING 1: PRIMARY WING (Classes 1 - 5) */}
          <div className="wing-section">
            <div className="wing-title-row">
              <div className="wing-badge primary">Primary Wing</div>
              <h3>Classes 1 to 5 (Foundational & Preparatory Stage)</h3>
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
              <h3>Classes 9 & 10 (TBSE Madhyamik Board Foundation)</h3>
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
              <h3>Classes 11 & 12 (Specialized Science & Arts Streams)</h3>
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
                Total Students: <strong>{displayedStudents.length}</strong>
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
                  </>
                )}
                {' · '}Academic Year: 2026-2027
              </p>
            </div>
            <div className="banner-actions">
              <button 
                type="button"
                className="attendance-sheet-btn-secondary" 
                onClick={fetchStudents}
                disabled={loading}
                title="Refresh student records from database"
              >
                <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                <span>{loading ? 'Syncing...' : 'Sync DB'}</span>
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

          {/* Quick Search */}
          <div className="table-controls-bar">
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
          </div>

          {/* Students Roster Container (Desktop Table + Mobile Cards) */}
          <div className="student-table-container">
            {/* 1. DESKTOP / TABLET TABLE VIEW (min-width: 769px) */}
            <div className="desktop-table-view">
              <table className="roster-table">
                <thead>
                  <tr>
                    <th style={{ width: '70px', textAlign: 'center' }}>Roll No</th>
                    {showStudentId && <th style={{ width: '140px' }}>Student ID</th>}
                    <th>Student Full Name</th>
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
                    required
                    placeholder="e.g. 05"
                    value={newStudent.roll}
                    onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
                  />
                </div>
              </div>

              {['class-9', 'class-11-arts', 'class-11-sci'].includes(newStudent.classId) && (
                <div className="form-row-grid-2">
                  <div className="form-group-item">
                    <label>Enrollment / Reg No. *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 321202805425 or Not found"
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
    </div>
  );
};

export default AdminStudents;
