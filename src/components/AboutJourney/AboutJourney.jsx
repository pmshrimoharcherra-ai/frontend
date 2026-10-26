import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import './AboutJourney.css';
import { 
  Building2, 
  TrendingUp, 
  Users2, 
  BookOpen, 
  Star, 
  GraduationCap, 
  Users, 
  Award, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const AboutJourney = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(494);
  const [teacherCount, setTeacherCount] = useState(INITIAL_TEACHERS.length || 19);

  // Dynamic calculation of school legacy years (established 1952)
  const establishmentYear = 1952;
  const currentYear = new Date().getFullYear();
  const legacyYears = currentYear - establishmentYear;

  useEffect(() => {
    let isMounted = true;
    const fetchJourneyMetrics = async () => {
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
        console.warn('Error loading journey metrics:', err);
      }
    };

    fetchJourneyMetrics();
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
      case 'legacy':
        navigate('/about');
        break;
      case 'achievements':
        navigate('/gallery');
        break;
      default:
        break;
    }
  };

  const milestones = [
    {
      id: 1,
      year: '1952',
      tag: 'Establishment',
      desc: 'A journey begins to bring education to the community',
      icon: <Building2 size={20} />,
      colorClass: 'step-blue'
    },
    {
      id: 2,
      year: 'Growth',
      tag: 'Expansion',
      desc: 'Strengthening infrastructure and opportunities',
      icon: <TrendingUp size={20} />,
      colorClass: 'step-orange'
    },
    {
      id: 3,
      year: 'Academic Excellence',
      tag: 'Achievements',
      desc: 'Nurturing talent and achievements',
      icon: <Users2 size={20} />,
      colorClass: 'step-green'
    },
    {
      id: 4,
      year: 'Modern Learning',
      tag: 'Innovation',
      desc: 'ICT, Skill Education and holistic development',
      icon: <BookOpen size={20} />,
      colorClass: 'step-purple'
    },
    {
      id: 5,
      year: '2022',
      tag: 'PM SHRI Selection',
      desc: 'Transforming for a brighter and inclusive future',
      icon: <Star size={20} />,
      colorClass: 'step-amber'
    }
  ];

  return (
    <section className="journey-section" id="about-journey">
      <div className="journey-container">
        {/* Left Side spacer to accommodate the school photo embedded in the banner */}
        <div className="journey-left-spacer"></div>

        {/* Right Side Journey Content */}
        <div className="journey-right-content">
          {/* Eyebrow & Main Title */}
          <div className="journey-header">
            <div className="journey-title-block">
              <span className="journey-eyebrow">ABOUT OUR SCHOOL</span>
              <h2 className="journey-main-title">
                OUR <span className="highlight-orange">JOURNEY</span>
              </h2>
            </div>

            {/* Paper Airplane Vector Doodle */}
            <div className="journey-plane-wrap">
              <svg className="journey-plane" width="48" height="48" viewBox="0 0 100 100" fill="none">
                <path d="M10 50 L90 20 L60 85 L45 60 L10 50 Z" stroke="#ea580c" strokeWidth="3.5" fill="none" />
                <path d="M90 20 L45 60" stroke="#ea580c" strokeWidth="3.5" />
                <path d="M25 75 Q40 90 55 80 T75 85" stroke="#f97316" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
              </svg>
            </div>
          </div>

          {/* Subtitle Tagline */}
          <h3 className="journey-tagline">
            Growing <span className="dot">•</span> Learning <span className="dot">•</span> Transforming
          </h3>

          {/* Descriptive Paragraph */}
          <p className="journey-paragraph">
            PM SHRI Moharcherra H.S. School, established in 1952 under the Government of Tripura, has been a centre of learning, values and community development for generations. We continue to evolve with a vision of holistic education, empowering every learner to become a responsible, confident and compassionate citizen.
          </p>

          {/* Milestone Stepper / Timeline */}
          <div className="timeline-stepper">
            <div className="timeline-track-line"></div>
            <div className="timeline-steps">
              {milestones.map((step) => (
                <div key={step.id} className={`timeline-step ${step.colorClass} interactive-step`}>
                  <div className="step-icon-circle">
                    {step.icon}
                  </div>
                  <div className="step-content">
                    <h4 className="step-title">{step.year}</h4>
                    {step.tag && <span className="step-tag">{step.tag}</span>}
                    <p className="step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Stats Bar Cards */}
          <div className="journey-stats-row">
            {/* Stat 1: Students */}
            <div 
              className="journey-stat-card stat-blue clickable-journey-stat"
              onClick={() => handleStatClick('students')}
              title="Click to view Admissions & Enrolled Students"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('students')}
            >
              <div className="stat-card-icon">
                <GraduationCap size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-number">{studentCount}+</span>
                <span className="stat-text">Students</span>
              </div>
            </div>

            {/* Stat 2: Dedicated Teachers */}
            <div 
              className="journey-stat-card stat-orange clickable-journey-stat"
              onClick={() => handleStatClick('teachers')}
              title="Click to view Faculty & Staff"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('teachers')}
            >
              <div className="stat-card-icon">
                <Users size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-number">{teacherCount}+</span>
                <span className="stat-text">Dedicated Teachers</span>
              </div>
            </div>

            {/* Stat 3: Years of Legacy */}
            <div 
              className="journey-stat-card stat-green clickable-journey-stat"
              onClick={() => handleStatClick('legacy')}
              title="Click to read School History & Heritage"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('legacy')}
            >
              <div className="stat-card-icon">
                <BookOpen size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-number">{legacyYears}+</span>
                <span className="stat-text">Years of Legacy</span>
              </div>
            </div>

            {/* Stat 4: Achievements */}
            <div 
              className="journey-stat-card stat-purple clickable-journey-stat"
              onClick={() => handleStatClick('achievements')}
              title="Click to view School Gallery & Achievements"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('achievements')}
            >
              <div className="stat-card-icon">
                <Award size={22} />
              </div>
              <div className="stat-card-info">
                <span className="stat-number">50+</span>
                <span className="stat-text">Achievements</span>
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="journey-cta-wrap">
            <button 
              type="button" 
              className="journey-cta-btn"
              onClick={() => navigate('/about')}
            >
              <span>Explore Our School</span>
              <ArrowRight size={17} className="journey-arrow" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutJourney;