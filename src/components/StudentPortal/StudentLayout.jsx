import React, { useMemo, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSidebar';
import './StudentLayout.css';

const StudentLayout = ({ currentUser, onLogout, children }) => {
  const navigate = useNavigate();

  // Read stored student user from localStorage if props haven't populated
  const storedUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('pmshri_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const activeStudent = currentUser || storedUser;

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!activeStudent) {
      navigate('/login');
    } else if (activeStudent.role && activeStudent.role !== 'student') {
      if (activeStudent.role === 'admin') navigate('/dashboard');
      else if (activeStudent.role === 'teacher') navigate('/teacher/dashboard');
    }
  }, [activeStudent, navigate]);

  if (!activeStudent) return null;

  return (
    <div className="student-portal-wrapper">
      <StudentHeader activeStudent={activeStudent} onLogout={onLogout} />
      <div className="sp-body-container">
        <StudentSidebar activeStudent={activeStudent} onLogout={onLogout} />
        <main className="sp-main-content">
          {children || <Outlet context={{ activeStudent, onLogout }} />}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
