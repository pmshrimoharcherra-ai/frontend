import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AboutHero from './components/AboutHero/AboutHero';
import AboutOverview from './components/AboutOverview/AboutOverview';
import VisionMission from './components/VisionMission/VisionMission';
import Initiatives from './components/Initiatives/Initiatives';
import TeacherDesk from './components/TeacherDesk/TeacherDesk';
import AboutJourney from './components/AboutJourney/AboutJourney';
import AcademicCalendar from './components/AcademicCalendar/AcademicCalendar';
import ExaminationsResults from './components/ExaminationsResults/ExaminationsResults';
import Admissions from './components/Admissions/Admissions';
import Gallery from './components/Gallery/Gallery';
import LoginModal from './components/LoginModal/LoginModal';
import AdminPanel from './components/AdminPanel/AdminPanel';
import TeacherDashboard from './components/TeacherDashboard/TeacherDashboard';
import NoticePage from './components/NoticePage/NoticePage';
import Footer from './components/Footer/Footer';
import './App.css';

// Public Layout Wrapper with Sticky/Smart Header and Footer
const PublicLayout = ({ children, onNavigate, onLoginClick, currentUser, onLogout, currentPage }) => (
  <div className="app-container">
    <Navbar 
      currentPage={currentPage} 
      onNavigate={onNavigate} 
      onLoginClick={onLoginClick}
      currentUser={currentUser}
      onLogout={onLogout}
    />
    <main>
      {children}
    </main>
    <Footer onNavigate={onNavigate} />
  </div>
);

// Public Home Sections
const HomePage = () => (
  <>
    <Hero />
    <Initiatives />
    <TeacherDesk />
    <AboutJourney />
  </>
);

// Public About Sections
const AboutPage = () => (
  <>
    <AboutHero />
    <AboutOverview />
    <TeacherDesk />
    <VisionMission />
  </>
);

// Public Gallery with optional slug parameter
const GalleryRouteWrapper = ({ onNavigate }) => {
  const { folderSlug } = useParams();
  return <Gallery onNavigate={onNavigate} initialFolderSlug={folderSlug || null} />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pmshri_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleNavigate = (page, folderSlug = null) => {
    if (page === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'admin' || page === 'dashboard') {
      if (currentUser?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else if (page === 'teacher' || page === 'teacher-dashboard') {
      navigate('/teacher/dashboard');
    } else if (page === 'students') {
      navigate('/students');
    } else if (page === 'gallery' && folderSlug) {
      navigate(`/gallery/${folderSlug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'gallery') {
      navigate('/gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'login') {
      setLoginModalOpen(true);
    } else {
      navigate(`/${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pmshri_token');
    localStorage.removeItem('pmshri_user');
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <>
      <Routes>
        {/* =========================================================================
            TEACHER DASHBOARD ROUTES
           ========================================================================= */}
        <Route 
          path="/teacher/dashboard" 
          element={<TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />} 
        />
        <Route 
          path="/teacher/attendance" 
          element={<TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />} 
        />
        <Route 
          path="/teacher/examinations" 
          element={<TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />} 
        />
        <Route 
          path="/teacher" 
          element={<Navigate to="/teacher/dashboard" replace />} 
        />

        {/* =========================================================================
            ADMIN ERP ROUTES (or Teacher Dashboard if logged in as teacher)
           ========================================================================= */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            currentUser?.role === 'teacher' ? (
              <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
            )
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        {/* Students Management & Class Details (Supports /students, /students/:classId, /admin/students, /admin/students/:classId) */}
        <Route 
          path="/students" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/students/:classId" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/students" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/students/:classId" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        {/* Teachers, Staff, Calendar, Gallery, Notices Admin Routes */}
        <Route 
          path="/teachers" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/teachers" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        {/* Examinations & Marks Evaluation Routes */}
        <Route 
          path="/examinations" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/examinations" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/exams" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        <Route 
          path="/calendar" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />
        <Route 
          path="/admin/calendar" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        <Route 
          path="/admin/gallery" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        <Route 
          path="/admin/notices" 
          element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />} 
        />

        {/* =========================================================================
            PUBLIC PORTAL ROUTES
           ========================================================================= */}
        <Route 
          path="/" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="home"
            >
              <HomePage />
            </PublicLayout>
          } 
        />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route 
          path="/about" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="about"
            >
              <AboutPage />
            </PublicLayout>
          } 
        />

        <Route 
          path="/academic-calendar" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="academic-calendar"
            >
              <AcademicCalendar onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />

        <Route 
          path="/examinations-results" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="examinations-results"
            >
              <ExaminationsResults onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />

        <Route 
          path="/admissions" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="admissions"
            >
              <Admissions onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />

        <Route 
          path="/gallery" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="gallery"
            >
              <GalleryRouteWrapper onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />
        <Route 
          path="/gallery/:folderSlug" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="gallery"
            >
              <GalleryRouteWrapper onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />
        <Route 
          path="/notices" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="notices"
            >
              <NoticePage onNavigate={handleNavigate} />
            </PublicLayout>
          } 
        />

        <Route 
          path="/login" 
          element={
            <PublicLayout 
              onNavigate={handleNavigate} 
              onLoginClick={() => setLoginModalOpen(true)} 
              currentUser={currentUser} 
              onLogout={handleLogout} 
              currentPage="home"
            >
              <HomePage />
            </PublicLayout>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* School ERP Portal Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen || location.pathname === '/login'} 
        onClose={() => {
          setLoginModalOpen(false);
          if (location.pathname === '/login') {
            navigate('/');
          }
        }} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setLoginModalOpen(false);
          if (user?.role === 'admin') {
            navigate('/dashboard');
          } else if (user?.role === 'teacher') {
            navigate('/teacher/dashboard');
          } else {
            navigate('/');
          }
        }}
      />
    </>
  );
}

export default App;
