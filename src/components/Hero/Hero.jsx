import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import './Hero.css';
import { 
  BookOpen, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Trophy, 
  FlaskConical, 
  Leaf 
} from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(494);
  const [teacherCount, setTeacherCount] = useState(INITIAL_TEACHERS.length || 19);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/students`),
          fetch(`${API_BASE_URL}/api/teachers`)
        ]);

        if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
          const sData = await studentsRes.value.json();
          if (sData.success && (sData.count || Array.isArray(sData.students))) {
            const count = sData.count ?? sData.students.length;
            if (isMounted && count > 0) setStudentCount(count);
          }
        }

        if (teachersRes.status === 'fulfilled' && teachersRes.value.ok) {
          const tData = await teachersRes.value.json();
          if (tData.success && (tData.count || Array.isArray(tData.teachers))) {
            const count = tData.count ?? tData.teachers.length;
            if (isMounted && count > 0) setTeacherCount(count);
          }
        }
      } catch (err) {
        console.warn('Hero live stats fetch error, using defaults:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  const handleStatClick = (type) => {
    switch (type) {
      case 'students':
        navigate('/admissions');
        break;
      case 'teachers':
        const teacherSection = document.getElementById('teacher-desk');
        if (teacherSection) {
          teacherSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/about');
        }
        break;
      case 'classes':
        navigate('/admissions');
        break;
      case 'achievements':
        navigate('/gallery');
        break;
      case 'labs':
        const initSection = document.getElementById('initiatives');
        if (initSection) {
          initSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/about');
        }
        break;
      case 'green':
        const greenSection = document.getElementById('initiatives');
        if (greenSection) {
          greenSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/about');
        }
        break;
      default:
        break;
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>

      {/* Main Hero Content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Eyebrow / Tag */}
          <div className="hero-eyebrow">
            <span className="eyebrow-accent-bar"></span>
            <span className="eyebrow-text">GOVT. OF TRIPURA &nbsp;|&nbsp; ESTD. 1952</span>
          </div>

          {/* Main Headings */}
          <h1 className="hero-title">
            <span className="title-white">PM SHRI</span>
            <span className="title-highlight">Moharcherra H.S. School</span>
            <span className="title-location">Teliamura, Khowai, Tripura</span>
          </h1>

          {/* Tagline Pill Badge */}
          <div className="hero-badge">
            <BookOpen size={17} className="badge-icon" />
            <span>Nurturing Future-Ready, Responsible and Innovative Learners</span>
          </div>

          {/* Descriptive Text */}
          <p className="hero-description">
            A PM SHRI School committed to holistic education, innovation, skill development and inclusive learning in line with the vision of NEP 2020.
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <a href="#explore" className="btn btn-primary">
              <span>Explore Our School</span>
              <ArrowRight size={18} className="btn-arrow" />
            </a>
            <a href="#pm-shri" className="btn btn-secondary">
              Know About PM SHRI
            </a>
          </div>
        </div>
      </div>

      {/* Floating Bottom Highlights / Dynamic Stats Card */}
      <div className="hero-stats-wrapper">
        <div className="stats-card">
          {/* Item 1: Students */}
          <div 
            className="stat-item clickable-stat" 
            onClick={() => handleStatClick('students')}
            title="Click to view Admissions & Student Information"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('students')}
          >
            <div className="stat-icon-box icon-blue">
              <Users size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{studentCount}+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 2: Teachers */}
          <div 
            className="stat-item clickable-stat" 
            onClick={() => handleStatClick('teachers')}
            title="Click to view Teacher-in-Charge & Faculty"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('teachers')}
          >
            <div className="stat-icon-box icon-green">
              <GraduationCap size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{teacherCount}+</span>
              <span className="stat-label">Teachers</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 3: Classes */}
          <div 
            className="stat-item clickable-stat" 
            onClick={() => handleStatClick('classes')}
            title="Click to view Academic Classes (Class I - XII)"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('classes')}
          >
            <div className="stat-icon-box icon-orange">
              <BookOpen size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-label-top">Classes</span>
              <span className="stat-value">I - XII</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 4: Achievements */}
          <div 
            className="stat-item stat-item-wide clickable-stat" 
            onClick={() => handleStatClick('achievements')}
            title="Click to view School Achievements & Activities Gallery"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('achievements')}
          >
            <div className="stat-icon-box icon-red">
              <Trophy size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-title text-red">Achievements</span>
              <span className="stat-subtitle">Academic, Sports, Cultural & More</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 5: Modern Labs */}
          <div 
            className="stat-item stat-item-wide clickable-stat" 
            onClick={() => handleStatClick('labs')}
            title="Click to explore STEM, ICT & Skills Labs"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('labs')}
          >
            <div className="stat-icon-box icon-purple">
              <FlaskConical size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-title text-purple">Modern Labs</span>
              <span className="stat-subtitle">Science, ICT, Skill & Innovation</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 6: Green School */}
          <div 
            className="stat-item stat-item-wide clickable-stat" 
            onClick={() => handleStatClick('green')}
            title="Click to explore PM SHRI Green School Initiatives"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleStatClick('green')}
          >
            <div className="stat-icon-box icon-emerald">
              <Leaf size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-title text-emerald">Green School</span>
              <span className="stat-subtitle">Clean, Green and Sustainable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;