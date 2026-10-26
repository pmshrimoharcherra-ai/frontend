import React from 'react';
import './AboutHero.css';
import { Home } from 'lucide-react';

const AboutHero = () => {
  return (
    <section className="about-hero-section">
      <div className="about-hero-container">
        <div className="about-hero-content">
          {/* Top Tag */}
          <div className="about-eyebrow-wrap">
            <span className="about-eyebrow">PM SHRI</span>
            <div className="about-eyebrow-line"></div>
          </div>

          {/* Main Page Title */}
          <h1 className="about-hero-title">
            <span className="title-dark">ABOUT OUR </span>
            <span className="title-orange">SCHOOL</span>
          </h1>

          {/* Subtitle */}
          <h2 className="about-hero-subtitle">
            A Legacy of Learning, Values and Growth
          </h2>

          {/* Description Paragraph */}
          <p className="about-hero-desc">
            PM SHRI Moharcherra H.S. School is committed to holistic education and the development of every learner for a brighter future.
          </p>

          {/* Breadcrumbs Capsule */}
          <div className="about-breadcrumb-pill">
            <Home size={16} className="breadcrumb-home-icon" />
            <a href="/" className="breadcrumb-link">Home</a>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">About</span>
          </div>
        </div>

        {/* Right side spacer to keep the school building visible */}
        <div className="about-hero-spacer"></div>
      </div>
    </section>
  );
};

export default AboutHero;
