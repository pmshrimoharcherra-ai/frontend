import React from 'react';
import './AboutOverview.css';
import { 
  Building2, 
  BookOpen, 
  Landmark, 
  Users, 
  ArrowRight 
} from 'lucide-react';

const AboutOverview = () => {
  return (
    <section className="about-overview-section" id="about-overview">
      <div className="about-overview-container">
        {/* Left Spacer so the school courtyard photo in the banner image is fully visible */}
        <div className="about-overview-left-spacer"></div>

        {/* Right Content Area */}
        <div className="about-overview-right-content">
          {/* Eyebrow */}
          <div className="overview-eyebrow-wrap">
            <span className="overview-eyebrow">ABOUT PM SHRI MOHARCHERRA H.S. SCHOOL</span>
            <div className="overview-eyebrow-line"></div>
          </div>

          {/* Heading */}
          <h2 className="overview-main-heading">
            <span className="heading-navy">A Legacy of Learning,</span>
            <span className="heading-orange">Values & Growth</span>
          </h2>

          {/* Paragraphs */}
          <div className="overview-paragraphs">
            <p>
              PM SHRI Moharcherra H.S. School, established in 1952, is a centre of learning, values and community development. Located at Moharchara, Teliamura in Khowai Tripura, the school is dedicated to providing quality and inclusive education for every learner.
            </p>
            <p>
              As a PM SHRI school, we strive to create a future-ready learning environment that nurtures academic excellence, life skills, creativity and responsible citizenship.
            </p>
          </div>

          {/* 4 Feature Cards Row */}
          <div className="overview-cards-row">
            {/* Card 1: 1952 */}
            <div className="overview-feature-card">
              <div className="card-icon-circle icon-navy">
                <Building2 size={20} />
              </div>
              <h4 className="card-title">1952</h4>
              <p className="card-subtitle">Established</p>
              <div className="card-bottom-line"></div>
            </div>

            {/* Card 2: PM SHRI */}
            <div className="overview-feature-card">
              <div className="card-icon-circle icon-orange">
                <BookOpen size={20} />
              </div>
              <h4 className="card-title">PM SHRI</h4>
              <p className="card-subtitle">Future-Ready Education</p>
              <div className="card-bottom-line"></div>
            </div>

            {/* Card 3: Govt. of Tripura */}
            <div className="overview-feature-card">
              <div className="card-icon-circle icon-navy">
                <Landmark size={20} />
              </div>
              <h4 className="card-title">Govt. of Tripura</h4>
              <p className="card-subtitle">Government Institution</p>
              <div className="card-bottom-line"></div>
            </div>

            {/* Card 4: Holistic Learning */}
            <div className="overview-feature-card">
              <div className="card-icon-circle icon-orange">
                <Users size={20} />
              </div>
              <h4 className="card-title">Holistic Learning</h4>
              <p className="card-subtitle">Beyond Academics</p>
              <div className="card-bottom-line"></div>
            </div>
          </div>

          {/* Action Button */}
          <div className="overview-action-wrap">
            <a href="#more-about" className="overview-readmore-btn">
              <span>Read More</span>
              <ArrowRight size={17} className="btn-arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutOverview;
