import React from 'react';
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
  Atom
} from 'lucide-react';

const Initiatives = () => {
  const initiativesData = [
    {
      id: 1,
      title: 'ICT & Digital Learning',
      description: 'Smart classrooms, computer lab and digital resources for modern learning.',
      image: '/Modern%20ICT%20Lab%20for%20Digital%20Learning.png',
      theme: 'blue',
      icon: <Monitor size={22} />,
      watermarkIcon: <Monitor size={54} />
    },
    {
      id: 2,
      title: 'Innovation & STEM',
      description: 'Science labs, innovation activities, projects and hands-on learning experiences.',
      image: '/Collaborative%20STEM%20Robotics%20Lab.png',
      theme: 'purple',
      icon: <FlaskConical size={22} />,
      watermarkIcon: <Atom size={54} />
    },
    {
      id: 3,
      title: 'Skill & Vocational Education',
      description: 'Skill development, IT/ITeS, vocational training and career readiness.',
      image: '/Hands-On%20Skills%20Lab%20Workshop.png',
      theme: 'orange',
      icon: <Settings size={22} />,
      watermarkIcon: <Wrench size={54} />
    },
    {
      id: 4,
      title: 'Green & Sustainable Campus',
      description: 'Clean, green and healthy campus with environmental awareness and sustainability initiatives.',
      image: '/Students%20Planting%20a%20Sustainable%20Future.png',
      theme: 'green',
      icon: <Leaf size={22} />,
      watermarkIcon: <Leaf size={54} />
    },
    {
      id: 5,
      title: 'Sports & Wellness',
      description: 'Physical education, sports facilities, yoga and overall well-being of students.',
      image: '/School%20Sports%20and%20Wellness%20Festival.png',
      theme: 'red',
      icon: <Activity size={22} />,
      watermarkIcon: <Activity size={54} />
    },
    {
      id: 6,
      title: 'Arts, Culture & Creativity',
      description: 'Nurturing talent in art, music, dance, drama and cultural activities.',
      image: '/Vibrant%20School%20Arts%20and%20Culture%20Classroom.png',
      theme: 'amber',
      icon: <Palette size={22} />,
      watermarkIcon: <Palette size={54} />
    },
    {
      id: 7,
      title: 'Inclusive Education',
      description: 'Equitable learning opportunities for all with focus on diversity, safety and support.',
      image: '/Inclusive%20Education_%20Learning%20Together.png',
      theme: 'teal',
      icon: <UserCheck size={22} />,
      watermarkIcon: <Users size={54} />
    },
    {
      id: 8,
      title: 'Experiential Learning',
      description: 'Learning beyond textbooks through projects, exhibitions, community activities and real-life experiences.',
      image: '/Experimental%20Learning%20STEM%20Lab.png',
      theme: 'pink',
      icon: <BookOpen size={22} />,
      watermarkIcon: <BookOpen size={54} />
    }
  ];

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

          {/* Quick Metrics Strip */}
          <div className="initiatives-stats-row">
            <div className="mini-stat">
              <div className="mini-stat-icon-wrap stat-icon-orange">
                <User size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">800+</span>
                <span className="mini-stat-lbl">Students</span>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-icon-wrap stat-icon-purple">
                <Users size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">35+</span>
                <span className="mini-stat-lbl">Teachers</span>
              </div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-icon-wrap stat-icon-green">
                <BookOpen size={20} />
              </div>
              <div className="mini-stat-text">
                <span className="mini-stat-num">12</span>
                <span className="mini-stat-lbl">Classes (I - XII)</span>
              </div>
            </div>

            <div className="mini-stat">
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
          <div className="initiatives-grid">
            {initiativesData.map((item) => (
              <div key={item.id} className={`initiative-card theme-${item.theme}`}>
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

                  <button className="card-arrow-btn" aria-label={`Learn more about ${item.title}`}>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Initiatives;
