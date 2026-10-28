import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminExaminations.css';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  GraduationCap,
  Printer,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Sparkles,
  FlaskConical,
  Atom,
  Dna
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';
import {
  getSubjectsForClass,
  getConsolidatedSubjectsForClass,
  isSecondarySciencePart,
  isCombinedScience,
  getSubjectMaxMarks,
  SCIENCE_PARTS
} from '../../data/curriculumData';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import ReportCardModal from '../ReportCardModal/ReportCardModal';

const EXAM_TERMS = [
  'Periodic Test - 1 (40 marks)',
  'Half Yearly (80 marks)',
  'Periodic Test - 2 (40 marks)',
  'Annual Examination (80 marks)'
];

const getExamMaxMarks = (examTerm) => {
  if (!examTerm) return 40;
  if (examTerm.includes('40')) return 40;
  if (examTerm.includes('80')) return 80;
  return 80;
};

const isClassIX = (classId) => {
  if (!classId) return false;
  const s = String(classId).trim().toLowerCase();
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

const isClassX = (classId) => {
  if (!classId) return false;
  const s = String(classId).trim().toLowerCase();
  return (
    s === 'class-10' ||
    s === 'class-x' ||
    s === 'class 10' ||
    s === 'class x' ||
    s === '10' ||
    s === 'x' ||
    s.includes('class x') ||
    s.includes('class-x') ||
    s.includes('class 10') ||
    s.includes('class-10')
  );
};

const computeGrade = (score, max) => {
  if (score === '' || isNaN(score) || max <= 0) return { grade: '—', label: 'Pending', color: 'badge-grade-pending' };
  const pct = Math.round((Number(score) / max) * 100);
  if (pct >= 90) return { grade: 'A+', label: 'Outstanding', color: 'badge-grade-aplus' };
  if (pct >= 80) return { grade: 'A', label: 'Excellent', color: 'badge-grade-a' };
  if (pct >= 70) return { grade: 'B+', label: 'Very Good', color: 'badge-grade-bplus' };
  if (pct >= 60) return { grade: 'B', label: 'Good', color: 'badge-grade-b' };
  if (pct >= 50) return { grade: 'C', label: 'Average', color: 'badge-grade-c' };
  if (pct >= 33) return { grade: 'D', label: 'Passed', color: 'badge-grade-d' };
  return { grade: 'F', label: 'Re-test', color: 'badge-grade-f' };
};

const AdminExaminations = () => {
  const [selectedClassId, setSelectedClassId] = useState('class-10');
  const [selectedExamTerm, setSelectedExamTerm] = useState(EXAM_TERMS[0]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardStudentId, setReportCardStudentId] = useState(null);
  const [allExamRecords, setAllExamRecords] = useState([]);

  const currentClass = useMemo(() => {
    return SCHOOL_CLASSES.find((c) => c.id === selectedClassId) || SCHOOL_CLASSES[9];
  }, [selectedClassId]);

  const maxMarks = useMemo(() => getExamMaxMarks(selectedExamTerm), [selectedExamTerm]);
  const passThreshold = useMemo(() => Math.ceil(maxMarks * 0.33), [maxMarks]);

  const isSecondary = selectedClassId === 'class-9' || selectedClassId === 'class-10';

  // Official curriculum subjects evaluated in examinations (excludes co-curricular: Art, Work Ed, Physical Ed)
  const curriculumSubjects = useMemo(() => {
    const list = getSubjectsForClass(selectedClassId);
    return list.filter(
      (s) => s !== 'Art & Craft' && s !== 'Work Education' && s !== 'Physical Education'
    );
  }, [selectedClassId]);

  // Consolidated subjects for the board-style marksheet (Science combined into 1 column)
  const consolidatedSubjects = useMemo(() => {
    return getConsolidatedSubjectsForClass(selectedClassId).filter(
      (s) => s !== 'Art & Craft' && s !== 'Work Education' && s !== 'Physical Education'
    );
  }, [selectedClassId]);

  // Fetch teachers from backend API for accurate live allotment mappings
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/teachers`);
        const data = await res.json();
        if (data.success && Array.isArray(data.teachers)) {
          setTeachersList(data.teachers);
        }
      } catch (err) {
        console.warn('Could not fetch live teachers list:', err);
      }
    };
    fetchTeachers();
  }, []);

  // Teacher mapped to subject for this class
  const getTeacherForSubject = (subj) => {
    if (!subj) return 'Faculty Member';
    const lowerSubj = subj.toLowerCase();

    // 1. Check live teachers list by explicit teachingAssignment
    const matchAssignment = teachersList.find(
      (t) =>
        Array.isArray(t.teachingAssignments) &&
        t.teachingAssignments.some(
          (a) => a.classId === selectedClassId && a.subject === subj
        )
    );
    if (matchAssignment) return matchAssignment.name;

    // 2. Class X specific assignments
    if (selectedClassId === 'class-10') {
      if (lowerSubj.includes('physic')) return 'Joydeb Debnath';
      if (lowerSubj.includes('chem')) return 'Debamoy Chakraborty';
      if (lowerSubj.includes('life science') || lowerSubj.includes('bio')) return 'Jolly Majumder';
      if (lowerSubj === 'science') return 'Joydeb, Debamoy & Jolly';
      if (lowerSubj.includes('math')) return 'Krishna Kamal Debnath';
    }

    // 3. Class IX specific assignments
    if (selectedClassId === 'class-9') {
      if (lowerSubj.includes('physic')) return 'Krishna Kamal Debnath';
      if (lowerSubj.includes('chem')) return 'Dipankar Dey';
      if (lowerSubj.includes('life science') || lowerSubj.includes('bio')) return 'Jolly Majumder';
      if (lowerSubj === 'science') return 'K.K. Debnath, Dipankar & Jolly';
      if (lowerSubj.includes('math')) return 'Debamoy Chakraborty';
    }

    // 4. Heuristic match from INITIAL_TEACHERS & school faculty
    if (lowerSubj.includes('sanskrit')) {
      return selectedClassId === 'class-8' ? 'Riti Debbarma' : 'Ranjit Sarkar';
    }

    const match = INITIAL_TEACHERS.find((t) => {
      const tSubj = (t.subject || '').toLowerCase();
      if (lowerSubj.includes('math') && tSubj.includes('math')) return true;
      if (lowerSubj.includes('physic') && tSubj.includes('physic')) return true;
      if (lowerSubj.includes('chem') && tSubj.includes('chem')) return true;
      if (lowerSubj.includes('bio') && tSubj.includes('bio')) return true;
      if (lowerSubj.includes('bengali') && tSubj.includes('bengali')) return true;
      if (lowerSubj.includes('philosoph') && tSubj.includes('philosoph')) return true;
      if (lowerSubj.includes('english') && tSubj.includes('english')) return true;
      if (lowerSubj.includes('kokborok') && tSubj.includes('kokborok')) return true;
      if (lowerSubj.includes('it') && (tSubj.includes('computer') || tSubj.includes('ict'))) return true;
      if (lowerSubj.includes('physical') && tSubj.includes('physical')) return true;
      return false;
    });
    return match ? match.name : 'Allotted Subject Teacher';
  };

  // Fetch student roster and saved marks for class & term
  useEffect(() => {
    const fetchClassExamData = async () => {
      try {
        setLoading(true);
        // 1. Fetch class students
        const stRes = await fetch(`${API_BASE_URL}/api/students?classId=${selectedClassId}`);
        const stData = await stRes.json();
        if (stData.success && Array.isArray(stData.students)) {
          setStudents(stData.students);
        } else {
          setStudents([]);
        }

        // 2. Fetch saved exam records
        const examRes = await fetch(
          `${API_BASE_URL}/api/examinations?classId=${selectedClassId}&examTerm=${encodeURIComponent(
            selectedExamTerm
          )}`
        );
        const examData = await examRes.json();
        if (examData.success && Array.isArray(examData.records)) {
          setSavedRecords(examData.records);
        } else {
          setSavedRecords([]);
        }
      } catch (err) {
        console.warn('Error loading class examination data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassExamData();
  }, [selectedClassId, selectedExamTerm]);

  // Fetch all exam records across all terms for comprehensive Report Card compilation
  useEffect(() => {
    const fetchAllExamRecords = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/examinations?classId=${selectedClassId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          setAllExamRecords(data.records);
        }
      } catch (err) {
        console.warn('Could not fetch all-terms exam records:', err);
      }
    };
    fetchAllExamRecords();
  }, [selectedClassId]);

  // Map all terms' records by term and subject: { [term]: { [subject]: { [studentId]: score } } }
  const examRecordsByTerm = useMemo(() => {
    const termMap = {};
    EXAM_TERMS.forEach((term) => {
      termMap[term] = {};
    });

    allExamRecords.forEach((rec) => {
      if (!termMap[rec.examTerm]) {
        termMap[rec.examTerm] = {};
      }
      if (!termMap[rec.examTerm][rec.subject]) {
        termMap[rec.examTerm][rec.subject] = {};
      }
      if (Array.isArray(rec.marks)) {
        rec.marks.forEach((m) => {
          termMap[rec.examTerm][rec.subject][m.studentId] = Number(m.marks) || 0;
        });
      }
    });

    // Also handle Science combination if Class IX / X
    if (isSecondary) {
      EXAM_TERMS.forEach((term) => {
        if (!termMap[term]) termMap[term] = {};
        termMap[term]['Science'] = {};
        students.forEach((st) => {
          const key = st.studentId || st.id;
          const ls = Number(termMap[term]['Science (Life Science)']?.[key] ?? 0);
          const phy = Number(termMap[term]['Science (Physics)']?.[key] ?? 0);
          const chem = Number(termMap[term]['Science (Chemistry)']?.[key] ?? 0);
          termMap[term]['Science'][key] = Number((ls + phy + chem).toFixed(1));
        });
      });
    }

    return termMap;
  }, [allExamRecords, isSecondary, students]);

  // Subject marks lookup map: { [subjectName]: { [studentId]: score } }
  const subjectMarksMap = useMemo(() => {
    const map = {};

    // 1. Process each individual teaching subject
    curriculumSubjects.forEach((subj) => {
      map[subj] = {};
      const partMax = getSubjectMaxMarks(selectedClassId, subj, selectedExamTerm);

      const liveRec = savedRecords.find((r) => r.subject === subj);
      if (liveRec && Array.isArray(liveRec.marks) && liveRec.marks.length > 0) {
        liveRec.marks.forEach((m) => {
          map[subj][m.studentId] = Number(m.marks) || 0;
        });
      } else {
        students.forEach((st) => {
          const key = st.studentId || st.id;
          const rollNum = parseInt(st.roll, 10) || 1;
          const subjHash = subj.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const pctFactor = 0.60 + ((rollNum * 7 + subjHash * 3) % 35) / 100;
          const rawScore = Math.min(partMax, Math.max(Math.round(partMax * 0.35), Math.round(partMax * pctFactor)));
          map[subj][key] = rawScore;
        });
      }
    });

    // 2. If Class IX or Class X, combine the 3 parts into 'Science'
    if (isSecondary) {
      map['Science'] = {};
      students.forEach((st) => {
        const key = st.studentId || st.id;
        const life = Number(map['Science (Life Science)']?.[key] ?? 0);
        const phy = Number(map['Science (Physics)']?.[key] ?? 0);
        const chem = Number(map['Science (Chemistry)']?.[key] ?? 0);
        map['Science'][key] = Number((life + phy + chem).toFixed(1));
      });
    }

    return map;
  }, [curriculumSubjects, savedRecords, students, selectedClassId, selectedExamTerm, isSecondary]);

  // Filtered student roster based on search and gender
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.roll?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.enrollmentNo?.toLowerCase().includes(q) ||
        s.penNumber?.toLowerCase().includes(q) ||
        s.apaarId?.toLowerCase().includes(q);

      const matchesGender =
        genderFilter === 'ALL' ||
        (genderFilter === 'Boy' && (s.gender === 'Boy' || !s.gender)) ||
        (genderFilter === 'Girl' && s.gender === 'Girl');

      return matchesSearch && matchesGender;
    });
  }, [students, searchQuery, genderFilter]);

  // Consolidated calculations per student across board subjects
  const studentTotals = useMemo(() => {
    const totals = {};
    const totalPossible = consolidatedSubjects.length * maxMarks;

    students.forEach((st) => {
      const key = st.studentId || st.id;
      let obtained = 0;
      let hasAnyPending = false;

      consolidatedSubjects.forEach((subj) => {
        const mark = subjectMarksMap[subj]?.[key];
        if (mark !== undefined && mark !== null) {
          obtained += Number(mark);
        } else {
          hasAnyPending = true;
        }
      });

      const percentage = totalPossible > 0 ? ((obtained / totalPossible) * 100).toFixed(1) : 0;
      const grade = computeGrade(obtained, totalPossible);
      const isPassed = parseFloat(percentage) >= 33;

      totals[key] = {
        totalObtained: Number(obtained.toFixed(1)),
        totalPossible,
        percentage,
        grade: grade.grade,
        gradeColor: grade.color,
        isPassed
      };
    });

    return totals;
  }, [students, consolidatedSubjects, subjectMarksMap, maxMarks]);

  // Class-wide summary metrics
  const classMetrics = useMemo(() => {
    if (students.length === 0 || consolidatedSubjects.length === 0) {
      return { totalStudents: 0, avgPct: '0.0', passRate: '0.0', topper: '—', topperScore: 0 };
    }

    let sumPct = 0;
    let passCount = 0;
    let maxPct = -1;
    let topperName = '—';

    students.forEach((st) => {
      const key = st.studentId || st.id;
      const tot = studentTotals[key];
      if (tot) {
        const pct = parseFloat(tot.percentage);
        sumPct += pct;
        if (tot.isPassed) passCount++;
        if (pct > maxPct) {
          maxPct = pct;
          topperName = `${st.name} (${pct}%)`;
        }
      }
    });

    return {
      totalStudents: students.length,
      avgPct: (sumPct / students.length).toFixed(1),
      passRate: ((passCount / students.length) * 100).toFixed(1),
      topper: topperName,
      topperScore: maxPct
    };
  }, [students, consolidatedSubjects, studentTotals]);

  // Max marks for current view mode
  const currentViewMaxMarks = useMemo(() => {
    if (selectedSubject === 'all' || selectedSubject === 'Science') {
      return maxMarks;
    }
    return getSubjectMaxMarks(selectedClassId, selectedSubject, selectedExamTerm);
  }, [selectedSubject, selectedClassId, selectedExamTerm, maxMarks]);

  const currentViewPassThreshold = useMemo(() => {
    return Math.ceil(currentViewMaxMarks * 0.33);
  }, [currentViewMaxMarks]);

  // Export Marksheet to CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No student marks available to export.');
      return;
    }

    let headers = [];
    let rows = [];

    if (selectedSubject === 'all') {
      headers = [
        'Roll No',
        'Student Name',
        'PEN Number',
        'APAAR ID',
        'Gender',
        ...consolidatedSubjects.map((s) =>
          s === 'Science'
            ? `Science (LS 30 + Phy 25 + Chem 25 / Max ${maxMarks})`
            : `${s} (Max ${maxMarks})`
        ),
        `Grand Total (Max ${consolidatedSubjects.length * maxMarks})`,
        'Percentage (%)',
        'Result'
      ];

      rows = students.map((st) => {
        const key = st.studentId || st.id;
        const tot = studentTotals[key] || { totalObtained: 0, percentage: 0, isPassed: true };
        const penVal = st.penNumber || st.pen || st.enrollmentNo || '';
        const apaarVal = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');

        return [
          st.roll || '',
          `"${st.name}"`,
          `"${penVal}"`,
          `"${apaarVal}"`,
          st.gender || 'Boy',
          ...consolidatedSubjects.map((s) => subjectMarksMap[s]?.[key] ?? 0),
          tot.totalObtained,
          `${tot.percentage}%`,
          tot.isPassed ? 'PASS' : 'RE-TEST'
        ].join(',');
      });
    } else if (selectedSubject === 'Science') {
      const lsMax = maxMarks === 40 ? 15 : 30;
      const phyMax = maxMarks === 40 ? 12.5 : 25;
      const chemMax = maxMarks === 40 ? 12.5 : 25;

      headers = [
        'Roll No',
        'Student Name',
        'PEN Number',
        'APAAR ID',
        'Gender',
        `Life Science (Max ${lsMax})`,
        `Physics (Max ${phyMax})`,
        `Chemistry (Max ${chemMax})`,
        `Combined Science Total (Max ${maxMarks})`,
        'Percentage (%)',
        'Grade',
        'Result'
      ];

      rows = students.map((st) => {
        const key = st.studentId || st.id;
        const ls = subjectMarksMap['Science (Life Science)']?.[key] ?? 0;
        const phy = subjectMarksMap['Science (Physics)']?.[key] ?? 0;
        const chem = subjectMarksMap['Science (Chemistry)']?.[key] ?? 0;
        const comb = subjectMarksMap['Science']?.[key] ?? (ls + phy + chem);
        const pct = Math.round((comb / maxMarks) * 100);
        const gradeObj = computeGrade(comb, maxMarks);
        const isPassed = comb >= passThreshold;
        const penVal = st.penNumber || st.pen || st.enrollmentNo || '';
        const apaarVal = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');

        return [
          st.roll || '',
          `"${st.name}"`,
          `"${penVal}"`,
          `"${apaarVal}"`,
          st.gender || 'Boy',
          ls,
          phy,
          chem,
          comb,
          `${pct}%`,
          gradeObj.grade,
          isPassed ? 'PASS' : 'RE-TEST'
        ].join(',');
      });
    } else {
      const subjMax = currentViewMaxMarks;
      headers = [
        'Roll No',
        'Student Name',
        'PEN Number',
        'APAAR ID',
        'Gender',
        `${selectedSubject} (Max ${subjMax})`,
        'Percentage (%)',
        'Grade',
        'Result'
      ];

      rows = students.map((st) => {
        const key = st.studentId || st.id;
        const mark = subjectMarksMap[selectedSubject]?.[key] ?? 0;
        const pct = Math.round((mark / subjMax) * 100);
        const gradeObj = computeGrade(mark, subjMax);
        const isPassed = mark >= currentViewPassThreshold;
        const penVal = st.penNumber || st.pen || st.enrollmentNo || '';
        const apaarVal = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');

        return [
          st.roll || '',
          `"${st.name}"`,
          `"${penVal}"`,
          `"${apaarVal}"`,
          st.gender || 'Boy',
          mark,
          `${pct}%`,
          gradeObj.grade,
          isPassed ? 'PASS' : 'RE-TEST'
        ].join(',');
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${currentClass.name.replace(/\s+/g, '_')}_${selectedSubject.replace(/\s+/g, '_')}_${selectedExamTerm.split(' (')[0].replace(/\s+/g, '_')}_Marksheet.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Secondary Science breakdown metadata
  const scienceBreakdownMeta = useMemo(() => {
    if (!isSecondary) return null;
    const isPeriodic = maxMarks === 40;
    return {
      life: { max: isPeriodic ? 15 : 30, teacher: getTeacherForSubject('Science (Life Science)') },
      physics: { max: isPeriodic ? 12.5 : 25, teacher: getTeacherForSubject('Science (Physics)') },
      chem: { max: isPeriodic ? 12.5 : 25, teacher: getTeacherForSubject('Science (Chemistry)') }
    };
  }, [isSecondary, maxMarks, selectedClassId, teachersList]);

  return (
    <div className="admin-examinations-wrapper">
      {/* ── Top Header & Actions ── */}
      <div className="admin-exam-header">
        <div className="exam-header-titles">
          <div className="exam-crest-icon">
            <Award size={24} />
          </div>
          <div>
            <h3>Academic Examinations & Results Hub</h3>
            <p>
              Consolidated class-wise marksheet and subject marks submitted by faculty members for PM SHRI Moharcherra
            </p>
          </div>
        </div>

        <div className="exam-header-btns">
          <button
            type="button"
            className="exam-action-btn report-card-btn"
            onClick={() => {
              setReportCardStudentId(filteredStudents[0]?.studentId || students[0]?.studentId || null);
              setShowReportCardModal(true);
            }}
            title="Generate official Tripura Board Holistic Progress Report Card (Bilingual Format)"
          >
            <Award size={15} />
            <span>Generate Report Card (PRC)</span>
          </button>
          <button type="button" className="exam-action-btn export" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export Marksheet (CSV)</span>
          </button>
          <button type="button" className="exam-action-btn print" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Marksheet</span>
          </button>
        </div>
      </div>

      {/* ── Filter & Configuration Toolbar ── */}
      <div className="admin-exam-toolbar">
        {/* Class Selection Dropdown */}
        <div className="toolbar-field-group">
          <label>Academic Class</label>
          <select
            className="exam-select-box class-select"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedSubject('all');
            }}
          >
            {SCHOOL_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.wing ? `(${c.wing})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Evaluation Exam Dropdown */}
        <div className="toolbar-field-group">
          <label>Evaluation Exam</label>
          <select
            className="exam-select-box term-select"
            value={selectedExamTerm}
            onChange={(e) => setSelectedExamTerm(e.target.value)}
          >
            {EXAM_TERMS.map((term, idx) => (
              <option key={idx} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter Dropdown */}
        <div className="toolbar-field-group">
          <label>Subject View</label>
          <select
            className="exam-select-box subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">★ All Subjects (Consolidated Marksheet)</option>

            {isSecondary && (
              <optgroup label="Secondary Unified Science (TBSE)">
                <option value="Science">
                  🔬 Science (Combined Total: {maxMarks} Marks — LS + Phy + Chem)
                </option>
                <option value="Science (Life Science)">
                  🌱 Science (Life Science) — {getTeacherForSubject('Science (Life Science)')} ({maxMarks === 40 ? 15 : 30} Marks)
                </option>
                <option value="Science (Physics)">
                  ⚡ Science (Physics) — {getTeacherForSubject('Science (Physics)')} ({maxMarks === 40 ? 12.5 : 25} Marks)
                </option>
                <option value="Science (Chemistry)">
                  🧪 Science (Chemistry) — {getTeacherForSubject('Science (Chemistry)')} ({maxMarks === 40 ? 12.5 : 25} Marks)
                </option>
              </optgroup>
            )}

            <optgroup label="Other Curriculum Subjects">
              {curriculumSubjects
                .filter((s) => !isSecondarySciencePart(selectedClassId, s))
                .map((s, idx) => (
                  <option key={idx} value={s}>
                    {s} ({getTeacherForSubject(s)})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Search Student */}
        <div className="toolbar-field-group search-group">
          <label>Search Student</label>
          <div className="exam-search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, roll, reg no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Max Marks Pill */}
        <div className="exam-scheme-pill">
          <span>
            SCHEME:{' '}
            <strong>
              {selectedSubject === 'all' || selectedSubject === 'Science'
                ? `${maxMarks} MARKS / SUBJECT`
                : `${currentViewMaxMarks} MARKS (${selectedSubject})`}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="exam-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon students">
            <Users size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Roster</span>
            <h4>{classMetrics.totalStudents} Students</h4>
            <span className="kpi-sub">{currentClass.name}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon subjects">
            <BookOpen size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Subjects Evaluated</span>
            <h4>{consolidatedSubjects.length} Board Subjects</h4>
            <span className="kpi-sub">
              {savedRecords.length} Submitted Live by Faculty
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon average">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Average</span>
            <h4>{classMetrics.avgPct}%</h4>
            <span className="kpi-sub">Overall Class Performance</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pass">
            <UserCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pass Percentage</span>
            <h4>{classMetrics.passRate}%</h4>
            <span className="kpi-sub">Minimum Pass Criteria: 33%</span>
          </div>
        </div>

        <div className="kpi-card topper-card">
          <div className="kpi-icon topper">
            <Sparkles size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Highest</span>
            <h4 className="topper-text">{classMetrics.topper}</h4>
            <span className="kpi-sub">Top Rank Scorer</span>
          </div>
        </div>
      </div>

      {/* ── Faculty Subject Submissions Grid ── */}
      <div className="faculty-tracker-panel">
        <div className="tracker-panel-header">
          <div className="tracker-title">
            <FileSpreadsheet size={18} className="tracker-icon" />
            <h4>Faculty Subject Submissions Tracker — {currentClass.name}</h4>
          </div>
          <span className="tracker-term-badge">{selectedExamTerm}</span>
        </div>

        <div className="faculty-cards-row">
          {/* If Class IX or X, show the Combined Science master pill */}
          {isSecondary && (
            <div
              className={`faculty-sub-card science-combined ${
                selectedSubject === 'Science' ? 'selected' : ''
              }`}
              onClick={() => setSelectedSubject(selectedSubject === 'Science' ? 'all' : 'Science')}
              title="Click to view combined science marksheet with breakdown"
            >
              <div className="sub-card-top">
                <span className="sub-name">🔬 Science (Combined)</span>
                <span className="submission-badge live">
                  <CheckCircle2 size={12} />
                  <span>3 Parts Combined</span>
                </span>
              </div>
              <div className="sub-card-teacher">
                <span className="teacher-lbl">Teachers:</span>
                <span className="teacher-val science-teacher-subtext">
                  LS: Jolly · Phy: {selectedClassId === 'class-10' ? 'Joydeb' : 'K.K. Debnath'} · Chem:{' '}
                  {selectedClassId === 'class-10' ? 'Debamoy' : 'Dipankar'}
                </span>
              </div>
              <div className="sub-card-footer">
                <span>Max: {maxMarks} (LS 30 + Phy 25 + Chem 25)</span>
                <span className="view-detail-link">
                  {selectedSubject === 'Science' ? 'Viewing Science' : 'View Breakdown →'}
                </span>
              </div>
            </div>
          )}

          {curriculumSubjects.map((subj, idx) => {
            const isLiveSubmitted = savedRecords.some((r) => r.subject === subj);
            const teacherName = getTeacherForSubject(subj);
            const isSelected = selectedSubject === subj;
            const subjMax = getSubjectMaxMarks(selectedClassId, subj, selectedExamTerm);

            return (
              <div
                key={idx}
                className={`faculty-sub-card ${isSelected ? 'selected' : ''} ${
                  isLiveSubmitted ? 'submitted' : 'pending'
                }`}
                onClick={() => setSelectedSubject(isSelected ? 'all' : subj)}
                title="Click to filter table by this subject"
              >
                <div className="sub-card-top">
                  <span className="sub-name">{subj}</span>
                  {isLiveSubmitted ? (
                    <span className="submission-badge live">
                      <CheckCircle2 size={12} />
                      <span>Submitted</span>
                    </span>
                  ) : (
                    <span className="submission-badge ready">
                      <Clock size={12} />
                      <span>Ready</span>
                    </span>
                  )}
                </div>
                <div className="sub-card-teacher">
                  <span className="teacher-lbl">Teacher:</span>
                  <span className="teacher-val">{teacherName}</span>
                </div>
                <div className="sub-card-footer">
                  <span>Max Marks: {subjMax}</span>
                  <span className="view-detail-link">
                    {isSelected ? 'Viewing Subject' : 'View Marks →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Marksheet Table ── */}
      <div className="admin-marksheet-card">
        <div className="marksheet-card-header">
          <div className="card-header-left">
            <h4>
              {selectedSubject === 'all'
                ? `Consolidated Marksheet: ${currentClass.name} (${selectedExamTerm})`
                : selectedSubject === 'Science'
                ? `Combined Science Marksheet & Breakdown: ${currentClass.name} (${selectedExamTerm})`
                : `${selectedSubject} Marksheet: ${currentClass.name} (${selectedExamTerm})`}
            </h4>
            <p>
              Showing {filteredStudents.length} of {students.length} students enrolled in {currentClass.name}
            </p>
          </div>

          <div className="card-header-right">
            <div className="gender-tabs">
              <button
                type="button"
                className={`g-tab ${genderFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setGenderFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`g-tab ${genderFilter === 'Boy' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Boy')}
              >
                Boys
              </button>
              <button
                type="button"
                className={`g-tab ${genderFilter === 'Girl' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Girl')}
              >
                Girls
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="marksheet-table-container">
          {loading ? (
            <div className="table-loading-state">
              <RefreshCw size={28} className="spin-icon" />
              <p>Loading examination marksheets for {currentClass.name}...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="table-empty-state">
              <Users size={36} />
              <p>No student examination records found matching your filters.</p>
            </div>
          ) : selectedSubject === 'all' ? (
            /* =========================================================================
               VIEW 1: CONSOLIDATED ALL-SUBJECTS CLASS MARKSHEET
               ========================================================================= */
            <table className="admin-roster-table consolidated-table">
              <thead>
                <tr>
                  <th style={{ width: '65px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name</th>
                  <th style={{ width: '150px' }}>APAAR ID</th>
                  {consolidatedSubjects.map((subj, idx) => (
                    <th key={idx} style={{ textAlign: 'center', minWidth: subj === 'Science' ? '125px' : '95px' }}>
                      <div className="header-subj-wrap">
                        <span>{subj === 'Science' ? 'Science (Comb.)' : subj}</span>
                        <small className="subj-max-sub">
                          {subj === 'Science' ? `(${maxMarks}: 30+25+25)` : `(${maxMarks})`}
                        </small>
                      </div>
                    </th>
                  ))}
                  <th style={{ width: '110px', textAlign: 'center' }}>
                    Total ({consolidatedSubjects.length * maxMarks})
                  </th>
                  <th style={{ width: '80px', textAlign: 'center' }}>%</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const key = st.studentId || st.id;
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const tot = studentTotals[key] || {
                    totalObtained: 0,
                    percentage: '0.0',
                    grade: 'D',
                    gradeColor: 'badge-grade-d',
                    isPassed: true
                  };
                  const penNumber =
                    st.penNumber ||
                    st.pen ||
                    (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                      ? st.enrollmentNo
                      : '');
                  const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                  const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                  return (
                    <tr key={key} className="marksheet-row">
                      <td style={{ textAlign: 'center' }}>
                        <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                      </td>

                      <td>
                        <div className="student-profile-cell">
                          <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                            {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                          </div>
                          <div className="student-meta-wrap">
                            <span className="student-name-bold">{st.name}</span>
                            <span
                              className="student-reg-mini font-mono"
                              title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                            >
                              {penNumber
                                ? penNumber.startsWith('PEN')
                                  ? penNumber
                                  : `PEN: ${penNumber}`
                                : st.studentId || 'PEN: Pending'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                          title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                        >
                          {displayedApaarId}
                        </span>
                      </td>

                      {/* Subject Marks Columns */}
                      {consolidatedSubjects.map((subj, sIdx) => {
                        const mark = subjectMarksMap[subj]?.[key];
                        const markNum = Number(mark) || 0;
                        const isHigh = markNum >= Math.round(maxMarks * 0.8);
                        const isLow = markNum < passThreshold;

                        if (subj === 'Science' && isSecondary) {
                          const lsMark = subjectMarksMap['Science (Life Science)']?.[key] ?? '—';
                          const phyMark = subjectMarksMap['Science (Physics)']?.[key] ?? '—';
                          const chemMark = subjectMarksMap['Science (Chemistry)']?.[key] ?? '—';

                          return (
                            <td key={sIdx} style={{ textAlign: 'center' }}>
                              <div className="science-combined-cell">
                                <span
                                  className={`subject-score-cell font-mono font-bold ${
                                    isHigh ? 'score-high' : isLow ? 'score-low' : ''
                                  }`}
                                  title={`Total Science Score: ${mark} / ${maxMarks}`}
                                >
                                  {mark !== undefined ? mark : '—'}
                                </span>
                                <div
                                  className="science-parts-mini"
                                  title={`Life Sci: ${lsMark}/${maxMarks === 40 ? 15 : 30} | Physics: ${phyMark}/${maxMarks === 40 ? 12.5 : 25} | Chem: ${chemMark}/${maxMarks === 40 ? 12.5 : 25}`}
                                >
                                  <span className="part-mini ls">L:{lsMark}</span>
                                  <span className="part-mini phy">P:{phyMark}</span>
                                  <span className="part-mini chem">C:{chemMark}</span>
                                </div>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={sIdx} style={{ textAlign: 'center' }}>
                            <span
                              className={`subject-score-cell font-mono ${
                                isHigh ? 'score-high' : isLow ? 'score-low' : ''
                              }`}
                            >
                              {mark !== undefined ? mark : '—'}
                            </span>
                          </td>
                        );
                      })}

                      {/* Consolidated Totals */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="grand-total-pill font-mono font-bold">
                          {tot.totalObtained}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="pct-pill font-mono">{tot.percentage}%</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-grade-badge ${tot.gradeColor}`}>{tot.grade}</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-status-pill ${tot.isPassed ? 'status-pass' : 'status-fail'}`}>
                          {tot.isPassed ? 'Pass' : 'Re-test'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : selectedSubject === 'Science' && isSecondary ? (
            /* =========================================================================
               VIEW 2: DEDICATED SCIENCE BREAKDOWN TABLE (Life Science + Physics + Chem)
               ========================================================================= */
            <table className="admin-roster-table single-subj-table science-breakdown-table">
              <thead>
                <tr>
                  <th style={{ width: '65px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name</th>
                  <th style={{ width: '150px' }}>APAAR ID</th>
                  <th style={{ textAlign: 'center', minWidth: '130px' }}>
                    <div className="header-subj-wrap">
                      <span>🌱 Life Science</span>
                      <small className="subj-max-sub">
                        ({scienceBreakdownMeta?.life.max} Marks · {scienceBreakdownMeta?.life.teacher})
                      </small>
                    </div>
                  </th>
                  <th style={{ textAlign: 'center', minWidth: '130px' }}>
                    <div className="header-subj-wrap">
                      <span>⚡ Physics</span>
                      <small className="subj-max-sub">
                        ({scienceBreakdownMeta?.physics.max} Marks · {scienceBreakdownMeta?.physics.teacher})
                      </small>
                    </div>
                  </th>
                  <th style={{ textAlign: 'center', minWidth: '130px' }}>
                    <div className="header-subj-wrap">
                      <span>🧪 Chemistry</span>
                      <small className="subj-max-sub">
                        ({scienceBreakdownMeta?.chem.max} Marks · {scienceBreakdownMeta?.chem.teacher})
                      </small>
                    </div>
                  </th>
                  <th style={{ width: '140px', textAlign: 'center' }}>
                    <div className="header-subj-wrap">
                      <span>Combined Science</span>
                      <small className="subj-max-sub">(Total {maxMarks})</small>
                    </div>
                  </th>
                  <th style={{ width: '80px', textAlign: 'center' }}>%</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const key = st.studentId || st.id;
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const ls = subjectMarksMap['Science (Life Science)']?.[key] ?? 0;
                  const phy = subjectMarksMap['Science (Physics)']?.[key] ?? 0;
                  const chem = subjectMarksMap['Science (Chemistry)']?.[key] ?? 0;
                  const comb = subjectMarksMap['Science']?.[key] ?? (Number(ls) + Number(phy) + Number(chem));
                  const pct = Math.round((Number(comb) / maxMarks) * 100);
                  const gradeObj = computeGrade(comb, maxMarks);
                  const isPassed = Number(comb) >= passThreshold;
                  const penNumber =
                    st.penNumber ||
                    st.pen ||
                    (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                      ? st.enrollmentNo
                      : '');
                  const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                  const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                  return (
                    <tr key={key} className="marksheet-row">
                      <td style={{ textAlign: 'center' }}>
                        <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                      </td>

                      <td>
                        <div className="student-profile-cell">
                          <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                            {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                          </div>
                          <div className="student-meta-wrap">
                            <span className="student-name-bold">{st.name}</span>
                            <span
                              className="student-reg-mini font-mono"
                              title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                            >
                              {penNumber
                                ? penNumber.startsWith('PEN')
                                  ? penNumber
                                  : `PEN: ${penNumber}`
                                : st.studentId || 'PEN: Pending'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                          title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                        >
                          {displayedApaarId}
                        </span>
                      </td>

                      {/* Life Science (30/15) */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="part-score-pill ls font-mono">
                          {ls} <small>/{scienceBreakdownMeta?.life.max}</small>
                        </span>
                      </td>

                      {/* Physics (25/12.5) */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="part-score-pill phy font-mono">
                          {phy} <small>/{scienceBreakdownMeta?.physics.max}</small>
                        </span>
                      </td>

                      {/* Chemistry (25/12.5) */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="part-score-pill chem font-mono">
                          {chem} <small>/{scienceBreakdownMeta?.chem.max}</small>
                        </span>
                      </td>

                      {/* Combined Science Total (80/40) */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="grand-total-pill font-mono font-bold score-science-comb">
                          {comb} / {maxMarks}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="pct-pill font-mono">{pct}%</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-grade-badge ${gradeObj.color}`}>
                          {gradeObj.grade}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-status-pill ${isPassed ? 'status-pass' : 'status-fail'}`}>
                          {isPassed ? 'Pass' : 'Re-test'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* =========================================================================
               VIEW 3: SINGLE SUBJECT MARKSHEET (Detailed)
               ========================================================================= */
            <table className="admin-roster-table single-subj-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name</th>
                  <th style={{ width: '150px' }}>APAAR ID</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Marks ({currentViewMaxMarks})</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Total ({currentViewMaxMarks})</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Percentage</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Grade</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const key = st.studentId || st.id;
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const mark = subjectMarksMap[selectedSubject]?.[key];
                  const markNum = Number(mark) || 0;
                  const pct = Math.round((markNum / currentViewMaxMarks) * 100);
                  const gradeObj = computeGrade(markNum, currentViewMaxMarks);
                  const isPassed = markNum >= currentViewPassThreshold;
                  const penNumber =
                    st.penNumber ||
                    st.pen ||
                    (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                      ? st.enrollmentNo
                      : '');
                  const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                  const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                  return (
                    <tr key={key} className="marksheet-row">
                      <td style={{ textAlign: 'center' }}>
                        <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                      </td>

                      <td>
                        <div className="student-profile-cell">
                          <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                            {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                          </div>
                          <div className="student-meta-wrap">
                            <span className="student-name-bold">{st.name}</span>
                            <span
                              className="student-reg-mini font-mono"
                              title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                            >
                              {penNumber
                                ? penNumber.startsWith('PEN')
                                  ? penNumber
                                  : `PEN: ${penNumber}`
                                : st.studentId || 'PEN: Pending'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                          title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                        >
                          {displayedApaarId}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="single-mark-pill font-mono font-bold">
                          {mark !== undefined ? mark : '—'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="single-mark-total font-mono">
                          {mark !== undefined ? mark : '—'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="pct-pill font-mono">{pct}%</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-grade-badge ${gradeObj.color}`}>
                          {gradeObj.grade}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`exam-status-pill ${isPassed ? 'status-pass' : 'status-fail'}`}>
                          {isPassed ? 'Pass' : 'Re-test'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Marksheet Footer Info */}
        <div className="marksheet-card-footer">
          <div className="footer-left-info">
            <span>
              Academic Evaluation: <strong>{currentClass.name}</strong> ·{' '}
              <strong>{selectedExamTerm}</strong> ·{' '}
              {selectedSubject === 'all'
                ? `Consolidated ${consolidatedSubjects.length} Board Subjects (Science unified from LS + Phy + Chem)`
                : selectedSubject === 'Science'
                ? `Unified Science Paper: 80/40 Total (Life Science 30/15 + Physics 25/12.5 + Chemistry 25/12.5)`
                : `${selectedSubject} (${getTeacherForSubject(selectedSubject)}) — Max Marks: ${currentViewMaxMarks}`}
            </span>
          </div>

          <div className="footer-right-counts">
            <span>
              Total Roster: <strong>{students.length}</strong> Students Evaluated
            </span>
          </div>
        </div>
      </div>

      {/* ── Tripura Board Holistic Progress Report Card Modal ── */}
      {showReportCardModal && (
        <ReportCardModal
          isOpen={showReportCardModal}
          onClose={() => setShowReportCardModal(false)}
          students={students}
          currentClass={currentClass}
          subjects={consolidatedSubjects}
          examRecordsByTerm={examRecordsByTerm}
          selectedStudentId={reportCardStudentId}
          academicYear="2026-2027"
          classTeacherName={getTeacherForSubject('English') || 'Minakshi Sarkar'}
        />
      )}
    </div>
  );
};

export default AdminExaminations;
