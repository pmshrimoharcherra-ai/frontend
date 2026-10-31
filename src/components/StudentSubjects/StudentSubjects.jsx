import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './StudentSubjects.css';
import { getConsolidatedSubjectsForClass } from '../../data/curriculumData';
import { BookOpen, GraduationCap } from 'lucide-react';

const StudentSubjects = ({ student: propStudent }) => {
  const context = useOutletContext();
  const activeStudent = propStudent || context?.activeStudent || (() => {
    try {
      const s = localStorage.getItem('pmshri_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/teachers`);
        if (res.ok) {
          const data = await res.json();
          if (data.teachers) setTeachers(data.teachers);
        }
      } catch (err) {
        console.warn('Teachers fetch error:', err);
      }
    };

    fetchTeachers();
  }, []);

  const classSubjects = useMemo(() => {
    return getConsolidatedSubjectsForClass(activeStudent?.classId || 'class-10');
  }, [activeStudent?.classId]);

  const subjectTeachers = useMemo(() => {
    const defaultMap = {
      English: { name: 'Banti Debbarma', dept: 'Languages', code: 'ENG-101' },
      Bengali: { name: 'Jusli Debbarma', dept: 'Languages', code: 'BEN-102' },
      Mathematics: { name: 'Debamoy Chakraborty', dept: 'Mathematics & Science', code: 'MTH-103' },
      Science: { name: 'Dipankar Dey', dept: 'Science', code: 'SCI-104' },
      'Social Science': { name: 'Rama Debbarma', dept: 'Social Studies', code: 'SST-105' },
      'IT/ITeS': { name: 'Ranjit Sarkar', dept: 'Vocational & Computer Studies', code: 'IT-106' },
      Sanskrit: { name: 'Ranjit Sarkar', dept: 'Languages', code: 'SAN-107' }
    };

    return classSubjects.map((sub) => {
      const match = teachers.find(
        (t) =>
          t.subject &&
          (t.subject.toLowerCase() === sub.toLowerCase() ||
            sub.toLowerCase().includes(t.subject.toLowerCase()))
      );
      return {
        subject: sub,
        teacherName: match ? match.name : defaultMap[sub]?.name || 'Faculty Member',
        dept: match ? match.department : defaultMap[sub]?.dept || 'Academic Faculty',
        code: defaultMap[sub]?.code || 'SUB-100'
      };
    });
  }, [classSubjects, teachers]);

  if (!activeStudent) return null;

  return (
    <div className="student-subjects-page">
      <div className="sp-page-header">
        <div>
          <h2>Curriculum Subjects & Assigned Faculty Teachers</h2>
          <p>Teachers designated for {activeStudent.className || 'Class VIII'} — PM SHRI School Faculty</p>
        </div>
        <span className="sub-count-pill font-mono">{subjectTeachers.length} Registered Subjects</span>
      </div>

      <div className="sp-subjects-grid">
        {subjectTeachers.map((st) => (
          <div key={st.subject} className="sp-subject-card">
            <div className="sub-card-top">
              <div className="sub-icon-wrap">
                <BookOpen size={20} />
              </div>
              <div className="sub-tags">
                <span className="sub-code font-mono">{st.code}</span>
                <span className="sub-dept-tag">{st.dept}</span>
              </div>
            </div>
            <h3>{st.subject}</h3>
            <div className="sub-teacher-info">
              <span className="lbl">Designated Teacher:</span>
              <span className="val font-bold">{st.teacherName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSubjects;
