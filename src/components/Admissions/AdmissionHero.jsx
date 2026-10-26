import React from 'react';
import './AdmissionHero.css';
import { Home } from 'lucide-react';

const AdmissionHero = ({ onNavigate = () => {} }) => {
  return (
    <section className="admission-hero-section">
      <div className="admission-hero-container">
        {/* Left Content Block */}
        <div className="admission-hero-content">
          {/* Eyebrow Tag */}
          <div className="admission-eyebrow-wrap">
            <span className="admission-eyebrow">ADMISSIONS 2026–27</span>
            <div className="admission-eyebrow-line"></div>
          </div>

          {/* Main Title */}
          <h1 className="admission-hero-title">
            <span className="title-navy">ADMISSIONS &amp; </span>
            <span className="title-orange">ENROLLMENT</span>
          </h1>

          {/* Subtitle */}
          <h2 className="admission-hero-subtitle">
            Empowering Minds • Inspiring Excellence • Shaping Futures
          </h2>

          {/* Description */}
          <p className="admission-hero-desc">
            Welcome to PM SHRI Moharcherra H.S. School. We provide inclusive, forward-thinking, and free quality government education equipped with smart classrooms, advanced STEM laboratories, and dedicated teacher mentorship.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="admission-breadcrumb-nav" aria-label="Breadcrumb">
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
            <span className="breadcrumb-current">Admissions</span>
          </nav>
        </div>

        {/* Right Spacer for Banner Visuals */}
        <div className="admission-hero-spacer"></div>
      </div>
    </section>
  );
};

export default AdmissionHero;
