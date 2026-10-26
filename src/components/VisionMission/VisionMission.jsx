import React from 'react';
import './VisionMission.css';
import { 
  Eye, 
  Target, 
  Users, 
  CheckCircle2, 
  Handshake, 
  UserCheck, 
  Lightbulb, 
  HeartHandshake, 
  Leaf, 
  Star 
} from 'lucide-react';

const VisionMission = () => {
  const missionPoints = [
    'Provide quality and inclusive education for all learners.',
    'Encourage experiential and activity-based learning.',
    'Develop 21st-century skills and digital literacy.',
    'Promote innovation, creativity and critical thinking.',
    'Build environmental responsibility and social values.',
    'Ensure holistic development through academics, skills, culture and sports.'
  ];

  const coreValues = [
    {
      id: 1,
      label: 'Integrity',
      icon: <Handshake size={20} />,
      colorClass: 'val-orange'
    },
    {
      id: 2,
      label: 'Respect',
      icon: <UserCheck size={20} />,
      colorClass: 'val-blue'
    },
    {
      id: 3,
      label: 'Innovation',
      icon: <Lightbulb size={20} />,
      colorClass: 'val-green'
    },
    {
      id: 4,
      label: 'Inclusivity',
      icon: <HeartHandshake size={20} />,
      colorClass: 'val-pink'
    },
    {
      id: 5,
      label: 'Responsibility',
      icon: <Leaf size={20} />,
      colorClass: 'val-emerald'
    },
    {
      id: 6,
      label: 'Excellence',
      icon: <Star size={20} />,
      colorClass: 'val-sky'
    }
  ];

  return (
    <section className="vision-mission-section" id="vision-mission">
      <div className="vision-mission-container">
        {/* Centered Header */}
        <div className="vm-header">
          <div className="vm-eyebrow-wrap">
            <span className="vm-eyebrow">OUR VISION & MISSION</span>
            <div className="vm-eyebrow-line"></div>
          </div>

          <h2 className="vm-main-title">
            Vision & <span className="highlight-orange">Mission</span>
          </h2>

          <p className="vm-subtitle">
            Guiding our journey towards a brighter, more inclusive and future-ready education for every learner at PM SHRI Moharcherra H.S. School.
          </p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="vm-cards-grid">
          {/* Card 1: Vision */}
          <div className="vm-card vision-card">
            <div className="card-top-bar">
              <div className="vm-badge-icon badge-navy">
                <Eye size={22} />
              </div>
              <span className="card-watermark-num">01</span>
            </div>

            <h3 className="vm-card-title">Our Vision</h3>
            <div className="vm-title-line"></div>

            <p className="vision-text">
              To nurture responsible, confident, creative and compassionate learners prepared to contribute meaningfully to society.
            </p>

            {/* Subtle Plant/Sprout Graphic */}
            <div className="vision-plant-art">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" opacity="0.35">
                <path d="M50 90 V45 Q50 30 75 35 Q70 60 50 65" stroke="#3b82f6" strokeWidth="4" fill="#93c5fd" />
                <path d="M50 55 Q50 35 25 40 Q30 65 50 70" stroke="#3b82f6" strokeWidth="4" fill="#bfdbfe" />
                <path d="M50 90 L50 30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 2: Mission */}
          <div className="vm-card mission-card">
            <div className="card-top-bar">
              <div className="vm-badge-icon badge-orange">
                <Target size={22} />
              </div>
              <span className="card-watermark-num num-orange">02</span>
            </div>

            <h3 className="vm-card-title">Our Mission</h3>
            <div className="vm-title-line"></div>

            <ul className="mission-list">
              {missionPoints.map((point, index) => (
                <li key={index} className="mission-item">
                  <CheckCircle2 size={16} className="check-icon" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Core Values */}
          <div className="vm-card values-card">
            <div className="card-top-bar">
              <div className="vm-badge-icon badge-navy">
                <Users size={22} />
              </div>
              <span className="card-watermark-num">03</span>
            </div>

            <h3 className="vm-card-title">Our Core Values</h3>
            <div className="vm-title-line"></div>

            <div className="values-grid">
              {coreValues.map((val) => (
                <div key={val.id} className="value-item">
                  <div className={`value-icon-circle ${val.colorClass}`}>
                    {val.icon}
                  </div>
                  <span className="value-label">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
