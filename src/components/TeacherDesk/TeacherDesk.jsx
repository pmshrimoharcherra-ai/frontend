import React from 'react';
import './TeacherDesk.css';
import { 
  Quote, 
  ArrowRight, 
  Users, 
  Leaf, 
  TrendingUp, 
  GraduationCap 
} from 'lucide-react';

const TeacherDesk = () => {
  return (
    <section className="desk-section" id="teacher-desk">
      <div className="desk-container">
        {/* Main Content Card / Wrapper */}
        <div className="desk-main-content">
          {/* Left Column: Portrait and Slogans */}
          <div className="desk-left-col">
            {/* Left Decorative Script Slogan */}
            <div className="side-slogan">
              <span>Guiding</span>
              <span>Learning</span>
              <span>Inspiring</span>
              <span>Futures</span>
              <div className="side-slogan-line"></div>
            </div>

            {/* Teacher-In-Charge Image Frame */}
            <div className="portrait-wrapper">
              <div className="portrait-bg-shape"></div>
              <img 
                src="/3b88766c-8b40-43f1-aa5e-865c2877b64f.png" 
                alt="Rupa Das, Teacher-In-Charge" 
                className="portrait-img" 
              />
            </div>
          </div>

          {/* Right Column: Message & Details */}
          <div className="desk-right-col">
            {/* Header / Eyebrow */}
            <div className="desk-header">
              <div className="desk-eyebrow-block">
                <span className="desk-eyebrow">FROM THE DESK OF THE</span>
                <h2 className="desk-title">TEACHER-IN-CHARGE</h2>
                <div className="desk-title-underline"></div>
              </div>

              {/* Decorative Floating Plane & Slogan */}
              <div className="top-right-accent">
                <svg className="plane-icon" width="46" height="46" viewBox="0 0 100 100" fill="none">
                  <path d="M10 50 L90 20 L60 85 L45 60 L10 50 Z" stroke="#334155" strokeWidth="3" fill="none" />
                  <path d="M90 20 L45 60" stroke="#334155" strokeWidth="3" />
                  <path d="M30 75 Q40 85 50 78 T70 82" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                </svg>
                <div className="brighter-slogan">
                  <span>A Brighter</span>
                  <span>Tomorrow</span>
                  <span>Together</span>
                  <div className="brighter-line"></div>
                </div>
              </div>
            </div>

            {/* Key Quote */}
            <div className="quote-box">
              <Quote className="quote-icon" size={36} />
              <blockquote className="quote-text">
                Education is not merely the preparation for life, but life itself.
              </blockquote>
            </div>

            {/* Message Paragraph */}
            <p className="desk-paragraph">
              At PM SHRI Moharcherra H.S. School, we strive to create a safe, inclusive and inspiring environment where every learner can explore, learn, grow and contribute to a better society. Through holistic education and value-based learning, we aim to nurture responsible citizens for a brighter tomorrow.
            </p>

            {/* Signature & Designation */}
            <div className="signature-box">
              <div className="sig-dash"></div>
              <div className="sig-details">
                <h4 className="sig-name">Rupa Das</h4>
                <p className="sig-role">Teacher-In-Charge</p>
                <p className="sig-school">PM SHRI Moharcherra H.S. School</p>
              </div>
            </div>

            {/* Read More Action */}
            <div className="desk-action">
              <a href="#about-principal" className="desk-readmore-btn">
                <span>Read More</span>
                <ArrowRight size={17} className="btn-arrow-icon" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Floating 4 Pillars Card */}
        <div className="desk-pillars-card">
          {/* Pillar 1 */}
          <div className="pillar-item">
            <div className="pillar-icon-box pillar-orange">
              <Users size={24} />
            </div>
            <div className="pillar-text">
              <span className="pillar-title">Students First</span>
              <span className="pillar-sub">Every Learner Matters</span>
            </div>
          </div>

          <div className="pillar-divider"></div>

          {/* Pillar 2 */}
          <div className="pillar-item">
            <div className="pillar-icon-box pillar-green">
              <Leaf size={24} />
            </div>
            <div className="pillar-text">
              <span className="pillar-title">Values & Character</span>
              <span className="pillar-sub">Building Responsible Citizens</span>
            </div>
          </div>

          <div className="pillar-divider"></div>

          {/* Pillar 3 */}
          <div className="pillar-item">
            <div className="pillar-icon-box pillar-blue">
              <TrendingUp size={24} />
            </div>
            <div className="pillar-text">
              <span className="pillar-title">Holistic Development</span>
              <span className="pillar-sub">Academic, Life Skills & Beyond</span>
            </div>
          </div>

          <div className="pillar-divider"></div>

          {/* Pillar 4 */}
          <div className="pillar-item">
            <div className="pillar-icon-box pillar-purple">
              <GraduationCap size={24} />
            </div>
            <div className="pillar-text">
              <span className="pillar-title">A Brighter Future</span>
              <span className="pillar-sub">Together We Grow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherDesk;
