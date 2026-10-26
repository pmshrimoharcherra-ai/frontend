import React from 'react';
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

      {/* Floating Bottom Highlights / Stats Card */}
      <div className="hero-stats-wrapper">
        <div className="stats-card">
          {/* Item 1: Students */}
          <div className="stat-item">
            <div className="stat-icon-box icon-blue">
              <Users size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-value">800+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 2: Teachers */}
          <div className="stat-item">
            <div className="stat-icon-box icon-green">
              <GraduationCap size={28} />
            </div>
            <div className="stat-info">
              <span className="stat-value">35+</span>
              <span className="stat-label">Teachers</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          {/* Item 3: Classes */}
          <div className="stat-item">
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
          <div className="stat-item stat-item-wide">
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
          <div className="stat-item stat-item-wide">
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
          <div className="stat-item stat-item-wide">
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
