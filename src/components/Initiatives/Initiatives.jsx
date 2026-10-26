import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import './Initiatives.css';
import { 
  Monitor, 
  FlaskConical, 
  Settings, 
  Leaf, 
  Activity, 
  Palette, 
  UserCheck, 
  BookOpen, 
  ArrowRight, 
  User, 
  Users, 
  Trophy, 
  Wrench, 
  Atom,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const Initiatives = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(494);
  const [teacherCount, setTeacherCount] = useState(INITIAL_TEACHERS.length || 19);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

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
        console.warn('Initiatives stats fetch error:', err);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  // Keyboard accessibility for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedInitiative(null);
      }
    };
    if (selectedInitiative) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedInitiative]);

  const handleStatClick = (type) => {
    switch (type) {
      case 'students':
      case 'classes':
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
      case 'achievements':
        navigate('/gallery');
        break;
      default:
        break;
    }
  };

  const initiativesData = [
    {
      id: 1,
      title: 'ICT & Digital Learning',
      category: 'stem',
      description: 'Smart classrooms, computer lab and digital resources for modern learning.',
      image: '/Modern%20ICT%20Lab%20for%20Digital%20Learning.png',
      theme: 'blue',
      icon: <Monitor size={22} />,
      watermarkIcon: <Monitor size={54} />,
      highlights: [
        'Smart Classrooms equipped with interactive flat panel displays',
        'Dedicated ICT Computer Center with high-speed internet access',
        'Digital educational content repository mapped to TBSE curriculum',
        'Teachers trained under ICT in education pedagogy'
      ]
    },
    {
      id: 2,
      title: 'Innovation & STEM',
      category: 'stem',
      description: 'Science labs, innovation activities, projects and hands-on learning experiences.',
      image: '/Collaborative%20STEM%20Robotics%20Lab.png',
      theme: 'purple',
      icon: <FlaskConical size={22} />,
      watermarkIcon: <Atom size={54} />,
      highlights: [
        'Well-equipped Physics, Chemistry & Biology laboratories',
        'Hands-on DIY STEM kits and robotics curiosity corner',
        'Annual school Science Exhibition & Project Showcase',
        'Promotion of scientific inquiry and critical problem-solving'
      ]
    },
    {
      id: 3,
      title: 'Skill & Vocational Education',
      category: 'skills',
      description: 'Skill development, IT/ITeS, vocational training and career readiness.',
      image: '/Hands-On%20Skills%20Lab%20Workshop.png',
      theme: 'orange',
      icon: <Settings size={22} />,
      watermarkIcon: <Wrench size={54} />,
      highlights: [
        'Vocational training aligned with National Skill Qualification Framework (NSQF)',
        'IT / ITeS computer proficiency certifications',
        'Practical workshop sessions building real-world life skills',
        'Career counseling guidance sessions for senior secondary students'
      ]
    },
    {
      id: 4,
      title: 'Green & Sustainable Campus',
      category: 'skills',
      description: 'Clean, green and healthy campus with environmental awareness and sustainability initiatives.',
      image: '/Students%20Planting%20a%20Sustainable%20Future.png',
      theme: 'green',
      icon: <Leaf size={22} />,
      watermarkIcon: <Leaf size={54} />,
      highlights: [
        'Active Eco Club student volunteers maintaining school botanical garden',
        'Campus-wide tree plantation drives and green canopy development',
        'Plastic-free school zone and segregated waste management',
        'Rainwater harvesting and solar lighting sustainability projects'
      ]
    },
    {
      id: 5,
      title: 'Sports & Wellness',
      category: 'arts',
      description: 'Physical education, sports facilities, yoga and overall well-being of students.',
      image: '/School%20Sports%20and%20Wellness%20Festival.png',
      theme: 'red',
      icon: <Activity size={22} />,
      watermarkIcon: <Activity size={54} />,
      highlights: [
        'Spacious outdoor playground for football, volleyball and athletics',
        'Daily morning physical education drills and yoga meditation',
        'Annual School Sports Day with inter-house track & field competitions',
        'Periodic student health, vision, and wellness checkup camps'
      ]
    },
    {
      id: 6,
      title: 'Arts, Culture & Creativity',
      category: 'arts',
      description: 'Nurturing talent in art, music, dance, drama and cultural activities.',
      image: '/Vibrant%20School%20Arts%20and%20Culture%20Classroom.png',
      theme: 'amber',
      icon: <Palette size={22} />,
      watermarkIcon: <Palette size={54} />,
      highlights: [
        'Dedicated Art & Craft workspace celebrating local Tripura culture',
        'Traditional dance, music, and dramatic performances on national days',
        'Creative student wall murals and hand-painted art galleries',
        'Encouraging expression, aesthetic appreciation, and heritage'
      ]
    },
    {
      id: 7,
      title: 'Inclusive Education',
      category: 'skills',
      description: 'Equitable learning opportunities for all with focus on diversity, safety and support.',
      image: '/Inclusive%20Education_%20Learning%20Together.png',
      theme: 'teal',
      icon: <UserCheck size={22} />,
      watermarkIcon: <Users size={54} />,
      highlights: [
        'Barrier-free campus with wheelchair ramps and accessible corridors',
        'Tailored individualized learning support for diverse student needs',
        'Strong focus on gender parity and girl child empowerment',
        'Supportive and nurturing peer learning community'
      ]
    },
    {
      id: 8,
      title: 'Experiential Learning',
      category: 'stem',
      description: 'Learning beyond textbooks through projects, exhibitions, community activities and real-life experiences.',
      image: '/Experimental%20Learning%20STEM%20Lab.png',
      theme: 'pink',
      icon: <BookOpen size={22} />,
      watermarkIcon: <BookOpen size={54} />,
      highlights: [
        'Bagless days with joyful hands-on activities as envisioned in NEP 2020',
        'Field visits to local farms, civic institutions, and ecological reserves',
        'Interactive learning modules connecting textbook theory with life',
        'Community engagement and social awareness projects'
      ]
    }
  ];

  const filteredInitiatives = activeCategory === 'all' 
    ? initiativesData 
    : initiativesData.filter(i => i.category === activeCategory);

  return (
    <section className="initiatives-section" id="initiatives">
      <div className="initiatives-container">
        {/* Left Intro / Overview Column */}
        <div className="initiatives-left">
          <div className="initiatives-eyebrow">
            <span className="eyebrow-dash"></span>
            <span className="eyebrow-label">OUR INITIATIVES</span>
          </div>

          <h2 className="initiatives-main-title">
            PM SHRI <br />
            AT OUR <span className="highlight-orange">SCHOOL</span>
          </h2>

          <h3 className="initiatives-subheading">
            Building a Future-Ready School through NEP 2020
          </h3>

          <p className="initiatives-paragraph">
            PM SHRI Moharcherra H.S. School is committed to providing holistic, inclusive and quality education with a focus on innovation, skill development, sustainability and experiential learning, in line with the vision of NEP 2020.
          </p>

          <a href="#pm-shri" className="initiatives-cta-btn">
            <span>Explore PM SHRI</span>
            <ArrowRight size={18} className="cta-arrow" />
          </a>

          {/* Quick Interactive Metrics Strip */}
          <div className="initiatives-stats-row">
            <div 
              className="mini-stat clickable-mini-stat"
              onClick={() => handleStatClick('students')}
              title="Click to view Admissions & Enrolled Students"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('students')}
            >
              <div className="mini-stat-icon-wrap stat-icon-orange">
                <User size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">{studentCount}+</span>
                <span className="mini-stat-lbl">Students</span>
              </div>
            </div>

            <div 
              className="mini-stat clickable-mini-stat"
              onClick={() => handleStatClick('teachers')}
              title="Click to view Teacher-in-Charge Desk & Faculty Roster"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('teachers')}
            >
              <div className="mini-stat-icon-wrap stat-icon-purple">
                <Users size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">{teacherCount}+</span>
                <span className="mini-stat-lbl">Teachers</span>
              </div>
            </div>

            <div 
              className="mini-stat clickable-mini-stat"
              onClick={() => handleStatClick('classes')}
              title="Click to view Academic Classes I - XII"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('classes')}
            >
              <div className="mini-stat-icon-wrap stat-icon-green">
                <BookOpen size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">12</span>
                <span className="mini-stat-lbl">Classes (I - XII)</span>
              </div>
            </div>

            <div 
              className="mini-stat clickable-mini-stat"
              onClick={() => handleStatClick('achievements')}
              title="Click to explore School Achievements in Gallery"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStatClick('achievements')}
            >
              <div className="mini-stat-icon-wrap stat-icon-red">
                <Trophy size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">50+</span>
                <span className="mini-stat-lbl">Achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cards 4x2 Grid */}
        <div className="initiatives-right">
          {/* Category Filter Pills */}
          <div className="initiatives-filter-bar">
            <button 
              className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Initiatives ({initiativesData.length})
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'stem' ? 'active' : ''}`}
              onClick={() => setActiveCategory('stem')}
            >
              STEM & Digital
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'arts' ? 'active' : ''}`}
              onClick={() => setActiveCategory('arts')}
            >
              Arts & Sports
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveCategory('skills')}
            >
              Skills & Green Campus
            </button>
          </div>

          <div className="initiatives-grid">
            {filteredInitiatives.map((item) => (
              <div 
                key={item.id} 
                className={`initiative-card theme-${item.theme} interactive-card`}
                onClick={() => setSelectedInitiative(item)}
                title={`Click to explore ${item.title}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedInitiative(item)}
              >
                {/* Upper Content Area */}
                <div className="card-top-content">
                  <div className="card-header-icons">
                    <div className="card-badge-icon">
                      {item.icon}
                    </div>
                    <div className="card-watermark-icon">
                      {item.watermarkIcon}
                    </div>
                  </div>

                  <h4 className="card-title">{item.title}</h4>
                  <p className="card-desc">{item.description}</p>

                  <button 
                    className="card-arrow-btn" 
                    aria-label={`Learn more about ${item.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInitiative(item);
                    }}
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Lower Photo Area */}
                <div className="card-image-wrap">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="card-photo" 
                    loading="lazy" 
                  />
                  <div className="card-photo-hover-tag">
                    <span>Explore Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Initiative Detail Modal */}
      {selectedInitiative && (
        <div 
          className="initiative-modal-backdrop"
          onClick={() => setSelectedInitiative(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="initiative-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close-icon-btn" 
              onClick={() => setSelectedInitiative(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="modal-hero-image-wrap">
              <img 
                src={selectedInitiative.image} 
                alt={selectedInitiative.title} 
                className="modal-hero-img" 
              />
              <div className="modal-image-overlay">
                <div className="modal-theme-badge">
                  {selectedInitiative.icon}
                  <span>PM SHRI INITIATIVE</span>
                </div>
              </div>
            </div>

            <div className="modal-body-content">
              <div className="modal-header-text">
                <div className="modal-badge-row">
                  <span className="modal-domain-tag">NEP 2020 Pillar</span>
                  <span className="modal-school-tag">PM SHRI Moharcherra</span>
                </div>
                <h3 className="modal-title">{selectedInitiative.title}</h3>
                <p className="modal-desc">{selectedInitiative.description}</p>
              </div>

              <div className="modal-highlights-box">
                <h5 className="highlights-title">Key Facilities & Implementations:</h5>
                <ul className="highlights-list">
                  {(selectedInitiative.highlights || []).map((h, idx) => (
                    <li key={idx} className="highlight-item">
                      <CheckCircle2 size={16} className="highlight-check" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-footer-actions">
                <button 
                  className="modal-action-btn primary"
                  onClick={() => {
                    setSelectedInitiative(null);
                    navigate('/gallery');
                  }}
                >
                  <Sparkles size={16} />
                  <span>View Photos in Gallery</span>
                  <ExternalLink size={14} />
                </button>
                <button 
                  className="modal-action-btn secondary"
                  onClick={() => setSelectedInitiative(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Initiatives;