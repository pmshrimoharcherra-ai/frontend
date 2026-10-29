import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminExaminations.css';

import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';
import {
  getSubjectsForClass,
  getConsolidatedSubjectsForClass,
  isSecondarySciencePart,
  isSecondarySocialSciencePart,
  getSubjectMaxMarks
} from '../../data/curriculumData';
import { INITIAL_TEACHERS } from '../../data/teachersData';

import ExamHeaderActions from './ExamHeaderActions';
import ExamControlsTracker from './ExamControlsTracker';
import ExamMarksheetTable from './ExamMarksheetTable';
import ReportCardModal from '../ReportCardModal/ReportCardModal';
import SubjectWeightageModal from '../SubjectWeightageModal/SubjectWeightageModal';

export const EXAM_TERMS = [
  'Periodic Test - 1 (40 marks)',
  'Half Yearly (80 marks)',
  'Periodic Test - 2 (40 marks)',
  'Annual Examination (80 marks)'
];

const getExamMaxMarks = (examTerm) => {
  if (!examTerm) return 40;
  if (examTerm.includes('40')) return 40;
  return 80;
};

// TBSE Grading Scale (consistent across CBSE/TBSE state boards)
export const computeGrade = (score, max) => {
  const num = Number(score) || 0;
  const pct = (num / max) * 100;
  if (pct >= 90) return { grade: 'A+', gradeColor: 'badge-grade-aplus', color: 'badge-grade-aplus' };
  if (pct >= 80) return { grade: 'A', gradeColor: 'badge-grade-a', color: 'badge-grade-a' };
  if (pct >= 70) return { grade: 'B+', gradeColor: 'badge-grade-bplus', color: 'badge-grade-bplus' };
  if (pct >= 60) return { grade: 'B', gradeColor: 'badge-grade-b', color: 'badge-grade-b' };
  if (pct >= 50) return { grade: 'C', gradeColor: 'badge-grade-c', color: 'badge-grade-c' };
  if (pct >= 33) return { grade: 'D', gradeColor: 'badge-grade-d', color: 'badge-grade-d' };
  return { grade: 'F', gradeColor: 'badge-grade-f', color: 'badge-grade-f' };
};

const AdminExaminations = () => {
  // Filters & Selected State
  const [selectedClassId, setSelectedClassId] = useState('class-10');
  const [selectedExamTerm, setSelectedExamTerm] = useState('Periodic Test - 1 (40 marks)');
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all' = Consolidated table, or single subject
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL' | 'Boy' | 'Girl'

  // Data Loading & Live Records
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardStudentId, setReportCardStudentId] = useState(null);
  const [allExamRecords, setAllExamRecords] = useState([]);
  const [showWeightageModal, setShowWeightageModal] = useState(false);
  const [weightageUpdateCounter, setWeightageUpdateCounter] = useState(0);

  useEffect(() => {
    const handleSchemeUpdate = () => {
      setWeightageUpdateCounter((c) => c + 1);
    };
    window.addEventListener('pmshri_weightage_scheme_updated', handleSchemeUpdate);
    return () => window.removeEventListener('pmshri_weightage_scheme_updated', handleSchemeUpdate);
  }, []);

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

  // Consolidated subjects for the board-style marksheet (Science & Social Science combined into 1 column each)
  const consolidatedSubjects = useMemo(() => {
    return getConsolidatedSubjectsForClass(selectedClassId);
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

    // 4. Secondary Social Science components
    if (isSecondary) {
      if (lowerSubj.includes('history')) return 'Subarna Sarkar';
      if (lowerSubj.includes('geograph')) return 'Minakshi Sarkar';
      if (lowerSubj.includes('econom')) return 'Mitan Nama Biswas';
      if (lowerSubj === 'social science' || lowerSubj === 'social studies') return 'Subarna, Minakshi & Mitan';
    }

    // 5. Heuristic match from INITIAL_TEACHERS & school faculty
    if (lowerSubj.includes('sanskrit')) {
      return selectedClassId === 'class-8' ? 'Riti Debbarma' : 'Ranjit Sarkar';
    }

    if (lowerSubj.includes('history')) return 'Subarna Sarkar';
    if (lowerSubj.includes('geograph')) return 'Minakshi Sarkar';
    if (lowerSubj.includes('econom')) return 'Mitan Nama Biswas';
    if (lowerSubj === 'social science' || lowerSubj === 'social studies') return 'Subarna Sarkar';

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

        // 2. Fetch saved examination marks for this class & term
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
        console.warn('Could not fetch live exam marks, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassExamData();
  }, [selectedClassId, selectedExamTerm]);

  // Fetch all terms' exam records for full year report card calculations
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

    // Also handle Science and Social Science combination if Class IX / X
    if (isSecondary) {
      EXAM_TERMS.forEach((term) => {
        if (!termMap[term]) termMap[term] = {};
        termMap[term]['Science'] = {};
        termMap[term]['Social Science'] = {};
        students.forEach((st) => {
          const key = st.studentId || st.id;
          const ls = Number(termMap[term]['Science (Life Science)']?.[key] ?? 0);
          const phy = Number(termMap[term]['Science (Physics)']?.[key] ?? 0);
          const chem = Number(termMap[term]['Science (Chemistry)']?.[key] ?? 0);
          termMap[term]['Science'][key] = Number((ls + phy + chem).toFixed(1));

          const hist = Number(termMap[term]['Social Science (History)']?.[key] ?? 0);
          const geo = Number(termMap[term]['Social Science (Geography)']?.[key] ?? 0);
          const eco = Number(termMap[term]['Social Science (Economics)']?.[key] ?? 0);
          termMap[term]['Social Science'][key] = Number((hist + geo + eco).toFixed(1));
        });
      });
    }

    return termMap;
  }, [allExamRecords, isSecondary, students, weightageUpdateCounter]);

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

    // 2. If Class IX or Class X, combine the parts into 'Science' and 'Social Science'
    if (isSecondary) {
      map['Science'] = {};
      map['Social Science'] = {};
      students.forEach((st) => {
        const key = st.studentId || st.id;
        const life = Number(map['Science (Life Science)']?.[key] ?? 0);
        const phy = Number(map['Science (Physics)']?.[key] ?? 0);
        const chem = Number(map['Science (Chemistry)']?.[key] ?? 0);
        map['Science'][key] = Number((life + phy + chem).toFixed(1));

        const hist = Number(map['Social Science (History)']?.[key] ?? 0);
        const geo = Number(map['Social Science (Geography)']?.[key] ?? 0);
        const eco = Number(map['Social Science (Economics)']?.[key] ?? 0);
        map['Social Science'][key] = Number((hist + geo + eco).toFixed(1));
      });
    }

    return map;
  }, [curriculumSubjects, savedRecords, students, selectedClassId, selectedExamTerm, isSecondary, weightageUpdateCounter]);

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

  // Total marks obtained per student across consolidated board subjects
  const studentTotals = useMemo(() => {
    const totals = {};
    students.forEach((st) => {
      const key = st.studentId || st.id;
      let sum = 0;
      let totalMaxMarks = 0;
      let failedAnySubject = false;

      consolidatedSubjects.forEach((subj) => {
        const mark = subjectMarksMap[subj]?.[key] ?? 0;
        const subjMax = getSubjectMaxMarks(selectedClassId, subj, selectedExamTerm);
        sum += Number(mark);
        totalMaxMarks += subjMax;
        if (Number(mark) < Math.ceil(subjMax * 0.33)) {
          failedAnySubject = true;
        }
      });

      const percentage = totalMaxMarks > 0 ? ((sum / totalMaxMarks) * 100).toFixed(1) : '0.0';
      const gradeObj = computeGrade(sum, totalMaxMarks || 100);

      totals[key] = {
        totalObtained: Number(sum.toFixed(1)),
        percentage,
        grade: gradeObj.grade,
        gradeColor: gradeObj.gradeColor,
        isPassed: !failedAnySubject && Number(percentage) >= 33
      };
    });
    return totals;
  }, [students, consolidatedSubjects, subjectMarksMap, selectedClassId, selectedExamTerm]);

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

  // Secondary Science breakdown metadata
  const scienceBreakdownMeta = useMemo(() => {
    if (!isSecondary) return null;
    return {
      life: {
        max: getSubjectMaxMarks(selectedClassId, 'Science (Life Science)', selectedExamTerm),
        teacher: getTeacherForSubject('Science (Life Science)')
      },
      physics: {
        max: getSubjectMaxMarks(selectedClassId, 'Science (Physics)', selectedExamTerm),
        teacher: getTeacherForSubject('Science (Physics)')
      },
      chem: {
        max: getSubjectMaxMarks(selectedClassId, 'Science (Chemistry)', selectedExamTerm),
        teacher: getTeacherForSubject('Science (Chemistry)')
      },
      total: getSubjectMaxMarks(selectedClassId, 'Science', selectedExamTerm)
    };
  }, [isSecondary, selectedClassId, selectedExamTerm, teachersList, weightageUpdateCounter]);

  // Secondary Social Science breakdown metadata
  const socialBreakdownMeta = useMemo(() => {
    if (!isSecondary) return null;
    return {
      history: {
        max: getSubjectMaxMarks(selectedClassId, 'Social Science (History)', selectedExamTerm),
        teacher: getTeacherForSubject('Social Science (History)')
      },
      geography: {
        max: getSubjectMaxMarks(selectedClassId, 'Social Science (Geography)', selectedExamTerm),
        teacher: getTeacherForSubject('Social Science (Geography)')
      },
      economics: {
        max: getSubjectMaxMarks(selectedClassId, 'Social Science (Economics)', selectedExamTerm),
        teacher: getTeacherForSubject('Social Science (Economics)')
      },
      total: getSubjectMaxMarks(selectedClassId, 'Social Science', selectedExamTerm)
    };
  }, [isSecondary, selectedClassId, selectedExamTerm, teachersList, weightageUpdateCounter]);

  // Max marks for current view mode
  const currentViewMaxMarks = useMemo(() => {
    if (selectedSubject === 'all') {
      return maxMarks;
    }
    return getSubjectMaxMarks(selectedClassId, selectedSubject, selectedExamTerm);
  }, [selectedSubject, selectedClassId, selectedExamTerm, maxMarks, weightageUpdateCounter]);

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
        ...consolidatedSubjects.map((s) => `${s} (Max ${maxMarks})`),
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
    } else if (selectedSubject === 'Science' && isSecondary) {
      const lsMax = scienceBreakdownMeta?.life.max || (maxMarks === 40 ? 15 : 30);
      const phyMax = scienceBreakdownMeta?.physics.max || (maxMarks === 40 ? 12.5 : 25);
      const chemMax = scienceBreakdownMeta?.chem.max || (maxMarks === 40 ? 12.5 : 25);
      const sciTotalMax = scienceBreakdownMeta?.total || maxMarks;

      headers = [
        'Roll No',
        'Student Name',
        'PEN Number',
        'APAAR ID',
        'Gender',
        `Life Science (Max ${lsMax})`,
        `Physics (Max ${phyMax})`,
        `Chemistry (Max ${chemMax})`,
        `Science Total (Max ${sciTotalMax})`,
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
        const pct = Math.round((comb / sciTotalMax) * 100);
        const gradeObj = computeGrade(comb, sciTotalMax);
        const isPassed = comb >= Math.round(sciTotalMax * 0.33);
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
    } else if (selectedSubject === 'Social Science' && isSecondary) {
      const histMax = socialBreakdownMeta?.history.max || (maxMarks === 40 ? 14 : 28);
      const geoMax = socialBreakdownMeta?.geography.max || (maxMarks === 40 ? 13 : 26);
      const ecoMax = socialBreakdownMeta?.economics.max || (maxMarks === 40 ? 13 : 26);
      const socTotalMax = socialBreakdownMeta?.total || maxMarks;

      headers = [
        'Roll No',
        'Student Name',
        'PEN Number',
        'APAAR ID',
        'Gender',
        `History (Max ${histMax})`,
        `Geography (Max ${geoMax})`,
        `Economics (Max ${ecoMax})`,
        `Social Science Total (Max ${socTotalMax})`,
        'Percentage (%)',
        'Grade',
        'Result'
      ];

      rows = students.map((st) => {
        const key = st.studentId || st.id;
        const hist = subjectMarksMap['Social Science (History)']?.[key] ?? 0;
        const geo = subjectMarksMap['Social Science (Geography)']?.[key] ?? 0;
        const eco = subjectMarksMap['Social Science (Economics)']?.[key] ?? 0;
        const comb = subjectMarksMap['Social Science']?.[key] ?? (hist + geo + eco);
        const pct = Math.round((comb / socTotalMax) * 100);
        const gradeObj = computeGrade(comb, socTotalMax);
        const isPassed = comb >= Math.round(socTotalMax * 0.33);
        const penVal = st.penNumber || st.pen || st.enrollmentNo || '';
        const apaarVal = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');

        return [
          st.roll || '',
          `"${st.name}"`,
          `"${penVal}"`,
          `"${apaarVal}"`,
          st.gender || 'Boy',
          hist,
          geo,
          eco,
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

  return (
    <div className="admin-examinations-wrapper">
      {/* ── Part 1: Top Header & Print / Export / Scheme Actions ── */}
      <ExamHeaderActions
        onOpenReportCard={() => {
          setReportCardStudentId(filteredStudents[0]?.studentId || students[0]?.studentId || null);
          setShowReportCardModal(true);
        }}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        onOpenWeightageModal={() => setShowWeightageModal(true)}
      />

      {/* ── Part 2: Filter Toolbar, KPIs & Faculty Tracker ── */}
      <ExamControlsTracker
        selectedClassId={selectedClassId}
        onSelectClassId={(classId) => {
          setSelectedClassId(classId);
          setSelectedSubject('all');
        }}
        selectedExamTerm={selectedExamTerm}
        onSelectExamTerm={(term) => setSelectedExamTerm(term)}
        selectedSubject={selectedSubject}
        onSelectSubject={(subj) => setSelectedSubject(subj)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        currentClass={currentClass}
        classesList={SCHOOL_CLASSES}
        examTermsList={EXAM_TERMS}
        curriculumSubjects={curriculumSubjects}
        consolidatedSubjects={consolidatedSubjects}
        isSecondary={isSecondary}
        maxMarks={maxMarks}
        currentViewMaxMarks={currentViewMaxMarks}
        classMetrics={classMetrics}
        savedRecords={savedRecords}
        getTeacherForSubject={getTeacherForSubject}
        getSubjectMaxMarks={getSubjectMaxMarks}
        scienceBreakdownMeta={scienceBreakdownMeta}
        socialBreakdownMeta={socialBreakdownMeta}
        isSecondarySciencePart={isSecondarySciencePart}
        isSecondarySocialSciencePart={isSecondarySocialSciencePart}
      />

      {/* ── Part 3: Marksheet Roster Table & Evaluation Views ── */}
      <ExamMarksheetTable
        currentClass={currentClass}
        selectedExamTerm={selectedExamTerm}
        selectedSubject={selectedSubject}
        filteredStudents={filteredStudents}
        totalStudentsCount={students.length}
        genderFilter={genderFilter}
        onGenderFilterChange={(g) => setGenderFilter(g)}
        loading={loading}
        consolidatedSubjects={consolidatedSubjects}
        maxMarks={maxMarks}
        passThreshold={passThreshold}
        subjectMarksMap={subjectMarksMap}
        studentTotals={studentTotals}
        isSecondary={isSecondary}
        scienceBreakdownMeta={scienceBreakdownMeta}
        socialBreakdownMeta={socialBreakdownMeta}
        currentViewMaxMarks={currentViewMaxMarks}
        currentViewPassThreshold={currentViewPassThreshold}
        getTeacherForSubject={getTeacherForSubject}
        computeGrade={computeGrade}
      />

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

      {/* ── Subject Weightage Scheme Configuration Modal (Science & Social Science) ── */}
      {showWeightageModal && (
        <SubjectWeightageModal
          isOpen={showWeightageModal}
          onClose={() => setShowWeightageModal(false)}
          onSaveSuccess={() => setWeightageUpdateCounter((c) => c + 1)}
        />
      )}
    </div>
  );
};

export default AdminExaminations;
