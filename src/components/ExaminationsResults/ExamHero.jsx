import React from 'react';
import './ExamHero.css';
import { Home } from 'lucide-react';

const ExamHero = ({ onNavigate = () => {} }) => {
  return (
    <section className="exam-hero-section">
      <div className="exam-hero-container">
        {/* Left Content Area */}
        <div className="exam-hero-content">
          {/* Eyebrow Tag */}
          <div className="exam-eyebrow-wrap">
            <span className="exam-eyebrow">ACADEMICS</span>
            <div className="exam-eyebrow-line"></div>
          </div>

          {/* Main Title */}
          <h1 className="exam-hero-title">
            <span className="title-navy">Examinations &amp; </span>
            <span className="title-orange">Results</span>
          </h1>

          {/* Subtitle */}
          <h2 className="exam-hero-subtitle">
            Assessment for Better Learning
          </h2>

          {/* Description Paragraph */}
          <p className="exam-hero-desc">
            Our examination system is designed to assess learning outcomes, build confidence and support the overall development of every student.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="exam-breadcrumb-nav" aria-label="Breadcrumb">
            <Home size={15} className="breadcrumb-home-icon" />
            <a
              href="#home"
              className="breadcrumb-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
            >
              Home
            </a>
            <span className="breadcrumb-separator">/</span>
            <a
              href="#academics"
              className="breadcrumb-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('academic-calendar');
              }}
            >
              Academics
            </a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Examinations &amp; Results</span>
          </nav>
        </div>

        {/* Right side spacer to keep the school building and exam graphics in full view */}
        <div className="exam-hero-spacer"></div>
      </div>
    </section>
  );
};

export default ExamHero;
