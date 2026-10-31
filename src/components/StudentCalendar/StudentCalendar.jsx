import React from 'react';
import './StudentCalendar.css';

const StudentCalendar = () => {
  return (
    <div className="student-calendar-page">
      <div className="sp-page-header">
        <div>
          <h2>Academic Calendar & School Holidays 2026–2027</h2>
          <p>Official schedule of school working days, festive holidays and examination terms</p>
        </div>
      </div>

      <div className="sp-calendar-summary-cards">
        <div className="sp-cal-stat">
          <span className="lbl">Total Working Days</span>
          <h3>240 Days</h3>
          <span className="sub">Session 2026–2027</span>
        </div>
        <div className="sp-cal-stat">
          <span className="lbl">Prescribed Holidays</span>
          <h3>65 Days</h3>
          <span className="sub">State & National Festivals</span>
        </div>
        <div className="sp-cal-stat">
          <span className="lbl">Summer Vacation</span>
          <h3>25 Days</h3>
          <span className="sub">May–June 2026</span>
        </div>
        <div className="sp-cal-stat">
          <span className="lbl">Durga Puja Break</span>
          <h3>12 Days</h3>
          <span className="sub">October 2026</span>
        </div>
      </div>

      <div className="sp-card calendar-info-card">
        <div className="sp-card-header">
          <h4>Key Academic Milestones & Term Schedules</h4>
        </div>
        <div className="sp-timeline-list">
          <div className="timeline-item">
            <span className="date-badge font-mono">April 2026</span>
            <div className="content">
              <strong>New Academic Session Commences</strong>
              <p>Admission confirmation, textbook distribution, orientation, and syllabus commencement.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">May–June 2026</span>
            <div className="content">
              <strong>Summer Vacation & Remedial Study Projects</strong>
              <p>Special project work, creative arts assignments, and summer reading challenges.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">July 2026</span>
            <div className="content">
              <strong>Periodic Test - 1</strong>
              <p>40-mark formative evaluation across all scholastic subjects.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">September 2026</span>
            <div className="content">
              <strong>Half-Yearly Summative Assessment</strong>
              <p>Comprehensive 80-mark evaluation weighted to 30 points in the final report card.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">October 2026</span>
            <div className="content">
              <strong>Durga Puja & Festive Vacation (16 Working Days)</strong>
              <p>Autumn festive break followed by school reopening on October 26, 2026.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">December 2026</span>
            <div className="content">
              <strong>Periodic Test - 2</strong>
              <p>Second cycle formative assessment and practical/internal evaluation.</p>
            </div>
          </div>
          <div className="timeline-item">
            <span className="date-badge font-mono">March 2027</span>
            <div className="content">
              <strong>Annual Final Assessment & Promotion</strong>
              <p>Final exams and release of official Holistic Progress Report Cards with graduation ceremonies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
