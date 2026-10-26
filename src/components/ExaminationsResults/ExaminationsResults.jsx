import React from 'react';
import './ExaminationsResults.css';
import ExamHero from './ExamHero';
import ExamScheduleSection from './ExamScheduleSection';

const ExaminationsResults = ({ onNavigate = () => {} }) => {
  return (
    <div className="exam-results-page">
      {/* 1. Hero Section */}
      <ExamHero onNavigate={onNavigate} />

      {/* 2. Schedule, Notices & Action Hub Section */}
      <ExamScheduleSection />
    </div>
  );
};

export default ExaminationsResults;
