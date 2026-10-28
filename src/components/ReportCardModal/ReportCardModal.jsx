import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './ReportCardModal.css';
import {
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';
import { buildStudentReportCard } from '../../utils/reportCardCalculator';

const ReportCardModal = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  subjects = [],
  examRecordsByTerm = {},
  selectedStudentId = null,
  academicYear = '2026-2027',
  classTeacherName = 'Minakshi Sarkar'
}) => {
  const [activeStudentId, setActiveStudentId] = useState(
    selectedStudentId || students[0]?.studentId || students[0]?.id
  );
  const [printAllBatch, setPrintAllBatch] = useState(false);

  // Sync active student if selectedStudentId changes
  React.useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    } else if (students.length > 0 && !activeStudentId) {
      setActiveStudentId(students[0]?.studentId || students[0]?.id);
    }
  }, [selectedStudentId, students]);

  // Manage body class for clean print isolation
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('prc-modal-active');
      return () => {
        document.body.classList.remove('prc-modal-active');
      };
    }
  }, [isOpen]);

  const activeStudentIndex = useMemo(() => {
    return students.findIndex(
      (s) => (s.studentId || s.id) === activeStudentId
    );
  }, [students, activeStudentId]);

  const activeStudent = useMemo(() => {
    return students[activeStudentIndex] || students[0];
  }, [students, activeStudentIndex]);

  // Build report card for single active student
  const activeReportCard = useMemo(() => {
    if (!activeStudent) return null;
    return buildStudentReportCard({
      student: activeStudent,
      currentClass,
      subjects,
      examRecordsByTerm,
      academicYear,
      classTeacherName
    });
  }, [activeStudent, currentClass, subjects, examRecordsByTerm, academicYear, classTeacherName]);

  // Build report cards for ALL students in class for batch printing
  const allReportCards = useMemo(() => {
    if (!printAllBatch) return [];
    return students.map((st) =>
      buildStudentReportCard({
        student: st,
        currentClass,
        subjects,
        examRecordsByTerm,
        academicYear,
        classTeacherName
      })
    );
  }, [printAllBatch, students, currentClass, subjects, examRecordsByTerm, academicYear, classTeacherName]);

  if (!isOpen || !activeReportCard) return null;

  const handleNextStudent = () => {
    if (activeStudentIndex < students.length - 1) {
      const nextSt = students[activeStudentIndex + 1];
      setActiveStudentId(nextSt.studentId || nextSt.id);
    }
  };

  const handlePrevStudent = () => {
    if (activeStudentIndex > 0) {
      const prevSt = students[activeStudentIndex - 1];
      setActiveStudentId(prevSt.studentId || prevSt.id);
    }
  };

  const handlePrint = (allBatch = false) => {
    setPrintAllBatch(allBatch);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Render a single authentic Tripura Progress Report Card sheet
  const renderReportCardSheet = (cardData, isBatch = false) => {
    const { student, rows, grandTotal, overallPercentage, overallGrade, prcNumber } = cardData;

    const penNumber =
      student.penNumber ||
      student.pen ||
      (student.enrollmentNo && student.enrollmentNo !== '-' && student.enrollmentNo !== '—'
        ? student.enrollmentNo
        : '');
    const apaarId =
      student.apaarId && student.apaarId !== 'Not Available'
        ? student.apaarId
        : student.apaar || '';
    const admissionNo =
      student.admissionNo ||
      student.admissionNumber ||
      student.enrollmentNo ||
      student.roll ||
      '';

    return (
      <div key={student.studentId || student.id} className={`prc-sheet-container ${isBatch ? 'batch-page' : ''}`}>
        {/* ── Official Document Outer Border ── */}
        <div className="prc-document-border">
          {/* ── Top Header with 3 Logos ── */}
          <div className="prc-header-row">
            {/* Left Logo: Tripura State Emblem */}
            <div className="prc-logo-box left">
              <img
                src="/logos/emblem-tripura.webp"
                alt="Emblem of Tripura"
                className="prc-crest-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Center: Government & Directorate Title with National Emblem */}
            <div className="prc-center-title-box">
              <div className="prc-ashoka-emblem-wrap">
                <img
                  src="/logos/emblem-india.png"
                  alt="Emblem of India"
                  className="prc-ashoka-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h2 className="prc-gov-bengali">ত্রিপুরা সরকার</h2>
              <h3 className="prc-dept-bengali">বিদ্যালয় শিক্ষা দপ্তর</h3>
              <h1 className="prc-main-title">
                Holistic Progress Report Card / শিক্ষার্থীর সার্বিক প্রগতি পত্র – {academicYear}
              </h1>
            </div>

            {/* Right Logo: Tripura Education Department Emblem */}
            <div className="prc-logo-box right">
              <img
                src="/logos/tripura-education-emblem.png"
                alt="Tripura Education Department"
                className="prc-crest-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* ── Identifiers Bar ── */}
          <div className="prc-meta-table-box">
            <div className="prc-meta-line prc-line-ids">
              <div className="prc-meta-field">
                <span className="prc-lbl">UDISE :</span>
                <span className="prc-val font-mono font-bold">16061200303</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">PRC No:</span>
                <span className="prc-val font-mono">{prcNumber}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">PEN NO :</span>
                <span className="prc-val font-mono">{penNumber || '22263540850'}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">Class / শ্রেণি -</span>
                <span className="prc-val font-bold">{currentClass?.name || 'Class VII'}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">Section/শাখা -</span>
                <span className="prc-val">A</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">APAAR ID :</span>
                <span className="prc-val font-mono">{apaarId || 'Not Available'}</span>
              </div>
            </div>

            {/* Student & School Info Lines */}
            <div className="prc-meta-line">
              <div className="prc-meta-field flex-2">
                <span className="prc-lbl">School / বিদ্যালয় :</span>
                <span className="prc-val font-bold">PM Shri Moharcherra HS School</span>
              </div>
              <div className="prc-meta-field flex-2">
                <span className="prc-lbl">Student's Name / শিক্ষার্থীর নাম :</span>
                <span className="prc-val font-bold student-target-name">{student.name}</span>
              </div>
            </div>

            <div className="prc-meta-line">
              <div className="prc-meta-field flex-1">
                <span className="prc-lbl">Mother's Name / মাতার নাম :</span>
                <span className="prc-val">{student.mother || student.guardian || '—'}</span>
              </div>
              <div className="prc-meta-field flex-1">
                <span className="prc-lbl">Father's Name / পিতার নাম :</span>
                <span className="prc-val">{student.father || student.guardian || '—'}</span>
              </div>
            </div>

            <div className="prc-meta-line">
              <div className="prc-meta-field">
                <span className="prc-lbl">Date of Birth / জন্মের তারিখ :</span>
                <span className="prc-val font-mono">{student.dob || '20/12/2012'}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">Roll No. / ক্রমিক নং :</span>
                <span className="prc-val font-mono font-bold">#{student.roll || '01'}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">Admission No. / ভর্তির ক্রমাঙ্ক :</span>
                <span className="prc-val font-mono">{admissionNo || '49'}</span>
              </div>
              <div className="prc-meta-field">
                <span className="prc-lbl">Whether CWSN :</span>
                <span className="prc-val">Yes / <strong>No</strong></span>
              </div>
            </div>
          </div>

          {/* ── Scholastic Areas Table ── */}
          <div className="prc-scholastic-section">
            <table className="prc-official-table">
              <thead>
                {/* Header Row 1 */}
                <tr className="prc-th-row-1">
                  <th rowSpan="2" className="col-subject-name">
                    <div className="prc-th-inner">
                      <span>A. Scholastic Areas</span>
                      <span className="bn-sub">মেধাভিত্তিক ক্ষেত্র</span>
                      <div className="divider-line"></div>
                      <span className="bold-sub">Subject Name</span>
                      <span className="bn-sub">বিষয়</span>
                    </div>
                  </th>
                  <th colSpan="4" className="col-marks-obtained">
                    <span>Marks Obtained (প্রাপ্ত নম্বর)</span>
                  </th>
                  <th colSpan="6" className="col-overall-assessment">
                    <span>Overall Assessment (সর্বমোট মূল্যায়ন)</span>
                  </th>
                  <th rowSpan="2" className="col-total-marks">
                    <div className="prc-th-inner">
                      <span>Total</span>
                      <span>Marks</span>
                      <span className="bn-sub">মোট নম্বর</span>
                      <small>(100)</small>
                    </div>
                  </th>
                  <th rowSpan="2" className="col-final-grade">
                    <div className="prc-th-inner">
                      <span>Final</span>
                      <span>Grade</span>
                      <span className="bn-sub">চূড়ান্ত গ্রেড</span>
                    </div>
                  </th>
                  <th rowSpan="2" className="col-grand-total">
                    <div className="prc-th-inner">
                      <span>Grand</span>
                      <span>Total</span>
                      <span className="bn-sub">সর্বমোট নম্বর</span>
                    </div>
                  </th>
                </tr>

                {/* Header Row 2 */}
                <tr className="prc-th-row-2">
                  {/* Marks Obtained Columns */}
                  <th>
                    <span>Periodic Test 1</span>
                    <span className="bn-sub">প্রথম সাময়িক</span>
                    <small>(40)</small>
                  </th>
                  <th>
                    <span>Half Yearly</span>
                    <span className="bn-sub">ষাণ্মাসিক</span>
                    <small>(80)</small>
                  </th>
                  <th>
                    <span>Periodic Test 2</span>
                    <span className="bn-sub">দ্বিতীয় সাময়িক</span>
                    <small>(40)</small>
                  </th>
                  <th>
                    <span>Annual Exam</span>
                    <span className="bn-sub">বার্ষিক</span>
                    <small>(80)</small>
                  </th>

                  {/* Weightage Columns */}
                  <th>
                    <span>Periodic Test 1</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(05)</small>
                  </th>
                  <th>
                    <span>Periodic Test 2</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(05)</small>
                  </th>
                  <th>
                    <span>Half Yearly</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(30)</small>
                  </th>
                  <th>
                    <span>Annual Exam</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(50)</small>
                  </th>
                  <th>
                    <span>Atten-dance</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(05)</small>
                  </th>
                  <th>
                    <span>Internal Assess.</span>
                    <span className="wt-lbl">(weightage)</span>
                    <small>(05)</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => {
                  return (
                    <tr key={rIdx} className="prc-data-row">
                      {/* Subject Name Cell */}
                      <td className="cell-subject-name font-bold">
                        <div className="subj-title-wrap">
                          <span>{row.subject}</span>
                          <span className="subj-bn-text">
                            {row.subject === 'Bengali'
                              ? 'বাংলা / ককবরক / অন্যান্য ভাষা **'
                              : row.subject === 'English'
                              ? 'ইংরেজি'
                              : row.subject === 'Mathematics'
                              ? 'গণিত'
                              : row.subject === 'Science'
                              ? 'বিজ্ঞান'
                              : row.subject === 'Social Science'
                              ? 'সমাজ বিজ্ঞান'
                              : row.subject === 'Sanskrit'
                              ? 'সংস্কৃত / হিন্দি'
                              : ''}
                          </span>
                        </div>
                      </td>

                      {/* Raw Exam Marks */}
                      <td className="cell-num font-mono">{row.rawMarks.pt1}</td>
                      <td className="cell-num font-mono">{row.rawMarks.halfYearly}</td>
                      <td className="cell-num font-mono">{row.rawMarks.pt2}</td>
                      <td className="cell-num font-mono">{row.rawMarks.annual}</td>

                      {/* Weightages */}
                      <td className="cell-wt font-mono">{row.weightages.pt1}</td>
                      <td className="cell-wt font-mono">{row.weightages.pt2}</td>
                      <td className="cell-wt font-mono">{row.weightages.halfYearly}</td>
                      <td className="cell-wt font-mono">{row.weightages.annual}</td>
                      <td className="cell-wt font-mono">0{row.weightages.attendance}</td>
                      <td className="cell-wt font-mono">0{row.weightages.internal}</td>

                      {/* Subject Total out of 100 */}
                      <td className="cell-total font-mono font-bold">{row.totalMarks}</td>

                      {/* Subject Grade */}
                      <td className="cell-grade font-bold">{row.grade}</td>

                      {/* Grand Total Sidebar cell (Spans all subject rows) */}
                      {rIdx === 0 && (
                        <td rowSpan={rows.length} className="cell-grand-sidebar">
                          <div className="grand-sidebar-inner">
                            <span className="grand-score font-bold font-mono">{grandTotal}</span>
                            <span className="grand-pct font-bold font-mono">{overallPercentage}%</span>
                            <span className="grand-grade-badge">{overallGrade}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Grand Total Summary Row */}
                <tr className="prc-grand-total-row">
                  <td colSpan="11" className="prc-grand-label">
                    <span>Grand Total / সর্বমোট নম্বর</span>
                  </td>
                  <td className="prc-grand-score font-mono font-bold">
                    {grandTotal}
                  </td>
                  <td className="prc-grand-grade font-bold">
                    {overallGrade}
                  </td>
                  <td className="prc-grand-pct-box font-mono font-bold">
                    {overallPercentage}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Footnote & Legend ── */}
          <div className="prc-footnote-row">
            <p>
              ** Other Language / অন্যান্য ভাষা : Mog (মগ) / Kuki-Mizo (কুকি-মিজো) / Manipuri (মণিপুরী) / B. Manipuri (বি. মণিপুরী) / Hindi (হিন্দি), '✓' Which subject is applicable / সঠিক বিষয়ে '✓' দিন।
            </p>
          </div>

          {/* ── Signatures Section ── */}
          <div className="prc-signatures-row">
            <div className="prc-sig-box teacher">
              <div className="sig-handwritten font-mono">{classTeacherName}</div>
              <div className="sig-line"></div>
              <span className="sig-title">Signature of Class Teacher</span>
              <span className="sig-title-bn">শ্রেণি শিক্ষকের স্বাক্ষর</span>
            </div>

            <div className="prc-sig-box date-box">
              <span className="sig-date-stamp font-mono">Date: 31/03/{academicYear.split('-')[1] || '2027'}</span>
              <span className="sig-date-bn">স্থান: মোহরছড়া, তেলিয়ামুড়া</span>
            </div>

            <div className="prc-sig-box hm">
              <div className="sig-seal-wrap">
                <span className="seal-text">PM SHRI MOHARCHERRA H.S. SCHOOL</span>
                <span className="seal-sub">SEAL & SIGNATURE</span>
              </div>
              <div className="sig-line"></div>
              <span className="sig-title">Signature of HM / Principal</span>
              <span className="sig-title-bn">প্রধান শিক্ষক / শিক্ষিকার স্বাক্ষর</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div className="report-card-modal-overlay">
      <div className="report-card-modal-box">
        {/* ── Modal Controls Bar (Hidden during Print) ── */}
        <div className="modal-toolbar-bar no-print">
          <div className="toolbar-left">
            <div className="toolbar-icon-wrap">
              <Award size={20} />
            </div>
            <div>
              <h3>Holistic Progress Report Card Generator</h3>
              <p>
                {currentClass?.name} · Session {academicYear} · Tripura Board 100-Point Weighted Grading
              </p>
            </div>
          </div>

          <div className="toolbar-center-nav">
            <button
              type="button"
              className="prc-nav-btn prev"
              onClick={handlePrevStudent}
              disabled={activeStudentIndex <= 0}
              title="Previous Student"
            >
              <ChevronLeft size={16} />
            </button>

            <select
              className="student-quick-picker font-mono"
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
            >
              {students.map((st, idx) => (
                <option key={st.studentId || st.id} value={st.studentId || st.id}>
                  #{st.roll || idx + 1} - {st.name} ({st.penNumber || st.studentId})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="prc-nav-btn next"
              onClick={handleNextStudent}
              disabled={activeStudentIndex >= students.length - 1}
              title="Next Student"
            >
              <ChevronRight size={16} />
            </button>
            <span className="nav-counter">
              {activeStudentIndex + 1} of {students.length}
            </span>
          </div>

          <div className="toolbar-right-actions">
            <button
              type="button"
              className="prc-btn print-single"
              onClick={() => handlePrint(false)}
            >
              <Printer size={15} />
              <span>Print This Card</span>
            </button>

            <button
              type="button"
              className="prc-btn print-batch"
              onClick={() => handlePrint(true)}
              title="Print all students in this class consecutively"
            >
              <Layers size={15} />
              <span>Print All Class ({students.length})</span>
            </button>

            <button type="button" className="prc-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Report Card Body (Visible & Printable) ── */}
        <div className="report-card-viewport">
          {printAllBatch
            ? allReportCards.map((c) => renderReportCardSheet(c, true))
            : renderReportCardSheet(activeReportCard, false)}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReportCardModal;
