import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './StudentExaminations.css';
import ReportCardModal from '../ReportCardModal/ReportCardModal';
import { getConsolidatedSubjectsForClass } from '../../data/curriculumData';
import { Printer, Award } from 'lucide-react';

const StudentExaminations = ({ student: propStudent }) => {
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
  const [examRecords, setExamRecords] = useState([]);

  useEffect(() => {
    if (!activeStudent?.classId) return;

    const fetchExams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/examinations?classId=${activeStudent.classId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.records) setExamRecords(data.records);
        }
      } catch (err) {
        console.warn('Examinations fetch error:', err);
      }
    };

    fetchExams();
  }, [activeStudent?.classId]);

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
    <div className="student-examinations-page">
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
              {classSubjects.map((sub) => {
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

      {/* Holistic Progress Report Card Modal */}
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

export default StudentExaminations;
