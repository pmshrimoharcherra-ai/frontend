import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ReportCardModal.css';
import {
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Users,
  Zap,
  Sliders
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
  const [targetPrintList, setTargetPrintList] = useState(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [preparingCount, setPreparingCount] = useState(0);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [customStartRoll, setCustomStartRoll] = useState('1');
  const [customEndRoll, setCustomEndRoll] = useState(String(students.length || 81));
  const batchMenuRef = useRef(null);

  // Sync active student if selectedStudentId changes
  useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    } else if (students.length > 0 && !activeStudentId) {
      setActiveStudentId(students[0]?.studentId || students[0]?.id);
    }
  }, [selectedStudentId, students]);

  // Manage body class for clean print isolation
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('prc-modal-active');
      return () => {
        document.body.classList.remove('prc-modal-active');
      };
    }
  }, [isOpen]);

  // Close batch menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (batchMenuRef.current && !batchMenuRef.current.contains(e.target)) {
        setShowBatchDropdown(false);
      }
    };
    if (showBatchDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showBatchDropdown]);

  // Clean up batch print state immediately after print dialog is closed or cancelled
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPreparingPrint(false);
      setTargetPrintList(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

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

  // Build report cards for targeted list for batch printing
  const batchReportCards = useMemo(() => {
    if (!targetPrintList || targetPrintList.length === 0) return [];
    return targetPrintList.map((st) =>
      buildStudentReportCard({
        student: st,
        currentClass,
        subjects,
        examRecordsByTerm,
        academicYear,
        classTeacherName
      })
    );
  }, [targetPrintList, currentClass, subjects, examRecordsByTerm, academicYear, classTeacherName]);

  // Calculate batch chunks (e.g. 25 students per batch for ultra-fast rendering & printer safety)
  const batchChunks = useMemo(() => {
    if (!students || students.length === 0) return [];
    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < students.length; i += chunkSize) {
      const slice = students.slice(i, i + chunkSize);
      const startRoll = slice[0]?.roll || String(i + 1).padStart(2, '0');
      const endRoll = slice[slice.length - 1]?.roll || String(i + slice.length).padStart(2, '0');
      chunks.push({
        id: `chunk-${i}`,
        title: `Roll ${startRoll} – ${endRoll}`,
        count: slice.length,
        students: slice
      });
    }
    return chunks;
  }, [students]);

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

  const triggerPrint = (list = null, count = 1) => {
    setShowBatchDropdown(false);
    if (!list) {
      // Single student print
      setTargetPrintList(null);
      setTimeout(() => {
        window.print();
      }, 150);
      return;
    }

    // Batch / full class printing
    setPreparingCount(count);
    setIsPreparingPrint(true);
    setTargetPrintList(list);

    // Give browser brief time to layout elements before invoking print engine
    setTimeout(() => {
      window.print();
      // Fallback cleanup if afterprint is missed
      setTimeout(() => {
        setIsPreparingPrint(false);
      }, 3000);
    }, 350);
  };

  const handleCustomRangePrint = () => {
    const s = parseInt(customStartRoll, 10) || 1;
    const e = parseInt(customEndRoll, 10) || students.length;
    const slice = students.filter((st, idx) => {
      const r = parseInt(st.roll, 10) || (idx + 1);
      return r >= s && r <= e;
    });
    if (slice.length > 0) {
      triggerPrint(slice, slice.length);
    }
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
          {/* ── Top Header with 3 Logos (Optimized lightweight retina assets) ── */}
          <div className="prc-header-row">
            {/* Left Logo: Tripura State Emblem */}
            <div className="prc-logo-box left">
              <img
                src="/logos/emblem-tripura.png"
                alt="Emblem of Tripura"
                className="prc-crest-img"
                width="72"
                height="72"
                loading="eager"
                decoding="async"
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
                  width="30"
                  height="48"
                  loading="eager"
                  decoding="async"
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
                width="72"
                height="72"
                loading="eager"
                decoding="async"
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
                <tr>
                  <th rowSpan="2" className="col-sl">ক্রমিক নং<br />Sl. No.</th>
                  <th rowSpan="2" className="col-sub">বিষয় / Subject</th>
                  <th colSpan="2" className="col-pt1">পর্যায়ক্রমিক মূল্যায়ন - ১<br />Periodic Test - 1</th>
                  <th colSpan="2" className="col-hy">অর্ধবার্ষিক মূল্যায়ন<br />Half-Yearly Exam</th>
                  <th colSpan="2" className="col-pt2">পর্যায়ক্রমিক মূল্যায়ন - ২<br />Periodic Test - 2</th>
                  <th colSpan="2" className="col-ann">বার্ষিক মূল্যায়ন<br />Annual Exam</th>
                  <th rowSpan="2" className="col-att">উপস্থিতির মূল্যায়ন<br />Attendance<br />(৫ নম্বর)</th>
                  <th rowSpan="2" className="col-ia">অভ্যন্তরীণ মূল্যায়ন<br />Internal<br />(৫ নম্বর)</th>
                  <th rowSpan="2" className="col-tot">সর্বমোট প্রাপ্ত নম্বর<br />Total Marks<br />(১০০ নম্বর)</th>
                  <th rowSpan="2" className="col-grd">প্রাপ্ত গ্রেড<br />Grade</th>
                  <th rowSpan="2" className="col-ovr">সামগ্রিক ফল<br />Grand Total</th>
                </tr>
                <tr className="sub-header-row">
                  <th>লিখিত<br />(৪০)</th>
                  <th>মান<br />(৫)</th>
                  <th>লিখিত<br />(৮০)</th>
                  <th>মান<br />(৩০)</th>
                  <th>লিখিত<br />(৪০)</th>
                  <th>মান<br />(৫)</th>
                  <th>লিখিত<br />(৮০)</th>
                  <th>মান<br />(৫০)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => {
                  return (
                    <tr key={row.subject}>
                      {/* Sl No */}
                      <td className="cell-sl font-mono">{rIdx + 1}</td>

                      {/* Subject Name Bilingual */}
                      <td className="cell-subject cell-subject-name">
                        <div className="subj-title-wrap">
                          <span className="sub-en">{row.subjectEn || row.subject}</span>
                          {(row.subjectBn || row.bilingualBn) && (
                            <span className="sub-bn subj-bn-text">{row.subjectBn || row.bilingualBn}</span>
                          )}
                        </div>
                      </td>

                      {/* PT 1 Raw & Weighted */}
                      <td className="font-mono">{row.pt1Raw ?? row.rawMarks?.pt1 ?? '—'}</td>
                      <td className="font-mono font-bold col-wt">{row.pt1Wt ?? row.weightages?.pt1 ?? '—'}</td>

                      {/* Half-Yearly Raw & Weighted */}
                      <td className="font-mono">{row.hyRaw ?? row.rawMarks?.halfYearly ?? '—'}</td>
                      <td className="font-mono font-bold col-wt">{row.hyWt ?? row.weightages?.halfYearly ?? '—'}</td>

                      {/* PT 2 Raw & Weighted */}
                      <td className="font-mono">{row.pt2Raw ?? row.rawMarks?.pt2 ?? '—'}</td>
                      <td className="font-mono font-bold col-wt">{row.pt2Wt ?? row.weightages?.pt2 ?? '—'}</td>

                      {/* Annual Raw & Weighted */}
                      <td className="font-mono">{row.annRaw ?? row.rawMarks?.annual ?? '—'}</td>
                      <td className="font-mono font-bold col-wt">{row.annWt ?? row.weightages?.annual ?? '—'}</td>

                      {/* Attendance (5 Marks) */}
                      <td className="font-mono font-bold col-wt">{row.attMarks ?? row.weightages?.attendance ?? 4}</td>

                      {/* Internal Assessment (5 Marks) */}
                      <td className="font-mono font-bold col-wt">{row.iaMarks ?? row.weightages?.internal ?? 5}</td>

                      {/* Total Marks (100) */}
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
            {/* Print Single Active Student */}
            <button
              type="button"
              className="prc-btn print-single"
              onClick={() => triggerPrint(null, 1)}
              title="Print only this student's report card"
            >
              <Printer size={15} />
              <span>Print This Card</span>
            </button>

            {/* Print All / Batch Dropdown Container */}
            <div className="batch-dropdown-wrap" ref={batchMenuRef}>
              <button
                type="button"
                className="prc-btn print-batch"
                onClick={() => triggerPrint(students, students.length)}
                title="Print all students in this class consecutively"
              >
                <Layers size={15} />
                <span>Print All Class ({students.length})</span>
              </button>

              <button
                type="button"
                className={`prc-btn print-batch-toggle ${showBatchDropdown ? 'active' : ''}`}
                onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                title="Print in fast batches of 25 to avoid printer lags"
              >
                <ChevronDown size={14} />
              </button>

              {/* Batch Selector Popover */}
              {showBatchDropdown && (
                <div className="batch-menu-popover">
                  <div className="batch-menu-header">
                    <Zap size={14} className="zap-icon" />
                    <strong>Fast Batch Printing</strong>
                  </div>
                  <p className="batch-menu-desc">
                    Printing in batches of 25 renders in ~1-2 seconds and prevents paper jams.
                  </p>

                  <div className="batch-chunks-list">
                    {batchChunks.map((chunk) => (
                      <button
                        key={chunk.id}
                        type="button"
                        className="batch-chunk-btn"
                        onClick={() => triggerPrint(chunk.students, chunk.count)}
                      >
                        <span className="chunk-label">{chunk.title}</span>
                        <span className="chunk-pill">{chunk.count} cards</span>
                      </button>
                    ))}
                  </div>

                  <div className="batch-custom-range">
                    <div className="custom-range-label">
                      <Sliders size={12} />
                      <span>Custom Roll Range:</span>
                    </div>
                    <div className="custom-range-inputs">
                      <input
                        type="number"
                        min="1"
                        max={students.length}
                        value={customStartRoll}
                        onChange={(e) => setCustomStartRoll(e.target.value)}
                        placeholder="1"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="1"
                        max={students.length}
                        value={customEndRoll}
                        onChange={(e) => setCustomEndRoll(e.target.value)}
                        placeholder={String(students.length)}
                      />
                      <button
                        type="button"
                        className="btn-print-custom"
                        onClick={handleCustomRangePrint}
                      >
                        Print
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="batch-full-btn"
                    onClick={() => triggerPrint(students, students.length)}
                  >
                    <Layers size={13} />
                    <span>Print All {students.length} Students Together</span>
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="prc-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Preparing Print Overlay (Friendly user feedback while Chrome renders) ── */}
        {isPreparingPrint && (
          <div className="print-preparing-overlay no-print">
            <div className="print-preparing-card">
              <div className="print-spinner"></div>
              <h4>Preparing {preparingCount} Report Cards...</h4>
              <p>Optimizing layout and opening the browser print preview. Please wait a moment.</p>
            </div>
          </div>
        )}

        {/* ── Report Card Body (Visible & Printable) ── */}
        <div className="report-card-viewport">
          {targetPrintList && targetPrintList.length > 0
            ? batchReportCards.map((c) => renderReportCardSheet(c, true))
            : renderReportCardSheet(activeReportCard, false)}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReportCardModal;
