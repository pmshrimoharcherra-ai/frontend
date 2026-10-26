import React, { useState } from 'react';
import './ExamScheduleSection.css';
import {
  quickNavCards,
  examScheduleTable,
  importantNotices,
  examGuidelinesList,
  sampleQuestionPapers,
  sampleResultsMock
} from './examData';
import {
  Calendar,
  FileText,
  BookOpen,
  Download,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Bell,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer
} from 'lucide-react';

const ExamScheduleSection = () => {
  // State for Year dropdown
  const [selectedYear, setSelectedYear] = useState('2026 – 2027');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Modals state
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState(null);
  const [isAllNoticesModalOpen, setIsAllNoticesModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [isPapersModalOpen, setIsPapersModalOpen] = useState(false);

  // Result Search inside modal
  const [rollInput, setRollInput] = useState('');
  const [activeResultCard, setActiveResultCard] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchRoll = (e) => {
    e.preventDefault();
    setSearchError('');
    const query = rollInput.trim();
    if (!query) {
      setSearchError('Please enter a valid Roll Number (e.g., 202601, 202602).');
      return;
    }
    const found = sampleResultsMock.find(
      (r) => r.rollNumber.toLowerCase() === query.toLowerCase() || r.rollNumber.endsWith(query)
    );
    if (found) {
      setActiveResultCard(found);
    } else {
      setActiveResultCard({
        rollNumber: query,
        name: `Student (Roll #${query})`,
        class: 'Class X-A',
        percentage: '88.0%',
        grade: 'A2',
        status: 'Passed with First Division'
      });
    }
  };

  const renderIcon = (type, size = 20) => {
    switch (type) {
      case 'calendar':
        return <Calendar size={size} />;
      case 'document':
        return <FileText size={size} />;
      case 'book':
        return <BookOpen size={size} />;
      case 'download':
        return <Download size={size} />;
      default:
        return <Calendar size={size} />;
    }
  };

  const handleQuickNavClick = (cardId) => {
    switch (cardId) {
      case 'schedule':
        const el = document.getElementById('exam-schedule-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'results':
        setIsResultsModalOpen(true);
        break;
      case 'guidelines':
        setIsGuidelinesModalOpen(true);
        break;
      case 'previous-papers':
        setIsPapersModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="exam-schedule-section-wrapper" id="schedule-section">
      {/* Toast */}
      {toastMessage && (
        <div className="exam-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="exam-main-container">
        {/* ====================================================================
            1. Top Quick Navigation Bar (4 Cards)
            ==================================================================== */}
        <div className="quick-nav-bar-card">
          <div className="quick-nav-grid">
            {quickNavCards.map((card, index) => (
              <div
                key={card.id}
                className="quick-nav-col"
                onClick={() => handleQuickNavClick(card.id)}
              >
                <div className={`quick-icon-circle icon-bg-${card.iconBg}`}>
                  {renderIcon(card.iconType, 20)}
                </div>
                <div className="quick-nav-text">
                  <h4 className="quick-nav-title">{card.title}</h4>
                  <p className="quick-nav-subtitle">{card.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="quick-arrow-btn"
                  aria-label={`Open ${card.title}`}
                >
                  <ArrowRight size={14} className="arrow-icon-orange" />
                </button>
                {index < quickNavCards.length - 1 && <div className="quick-divider-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================================
            2. Main 2-Column Area: Schedule Table (Left) + Important Notices (Right)
            ==================================================================== */}
        <div className="exam-schedule-grid-layout" id="exam-schedule-grid">
          {/* LEFT: Examination Schedule Table Card */}
          <div className="schedule-table-card">
            {/* Background Watermark Calendar Outline */}
            <div className="schedule-watermark-icon" aria-hidden="true">
              <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <line x1="8" y1="14" x2="8.01" y2="14"></line>
                <line x1="12" y1="14" x2="12.01" y2="14"></line>
                <line x1="16" y1="14" x2="16.01" y2="14"></line>
                <line x1="8" y1="18" x2="8.01" y2="18"></line>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                <line x1="16" y1="18" x2="16.01" y2="18"></line>
              </svg>
            </div>

            {/* Header */}
            <div className="card-header-flex">
              <div className="card-title-with-icon">
                <div className="card-header-circle-icon bg-orange">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="card-main-title">
                    <span className="title-navy">Examination </span>
                    <span className="title-orange">Schedule</span>
                  </h3>
                  <p className="card-sub-title">
                    Tentative schedule for the academic session 2026 – 2027.
                  </p>
                </div>
              </div>

              {/* Year Dropdown */}
              <div className="year-dropdown-wrap">
                <button
                  type="button"
                  className="year-select-btn"
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                >
                  <span>{selectedYear}</span>
                  <ChevronDown size={16} className={`chevron-trans ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isYearDropdownOpen && (
                  <div className="year-dropdown-menu">
                    {['2026 – 2027', '2025 – 2026', '2024 – 2025'].map((yr) => (
                      <div
                        key={yr}
                        className={`year-opt ${selectedYear === yr ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedYear(yr);
                          setIsYearDropdownOpen(false);
                          showToast(`Viewing session ${yr}`);
                        }}
                      >
                        {yr}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="schedule-table-responsive">
              <table className="schedule-data-table">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Tentative Date</th>
                    <th>Classes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {examScheduleTable.map((exam) => (
                    <tr key={exam.id}>
                      <td className="exam-name-cell">{exam.name}</td>
                      <td className="exam-date-cell">{exam.tentativeDate}</td>
                      <td className="exam-classes-cell">{exam.classes}</td>
                      <td>
                        <span className="exam-status-pill">{exam.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-view-details-link"
                          onClick={() => setSelectedExamDetails(exam)}
                        >
                          <span>View Details</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Important Notices Card */}
          <div className="notices-card">
            {/* Background Watermark Megaphone */}
            <div className="notices-watermark-icon" aria-hidden="true">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>

            {/* Header */}
            <div className="card-header-flex">
              <div className="card-title-with-icon">
                <div className="card-header-circle-icon bg-orange">
                  <Bell size={22} />
                </div>
                <div>
                  <h3 className="card-main-title">
                    <span className="title-navy">Important </span>
                    <span className="title-orange">Notices</span>
                  </h3>
                  <p className="card-sub-title">
                    Stay updated with the latest examination related announcements.
                  </p>
                </div>
              </div>
            </div>

            {/* Notices Timeline List */}
            <div className="notices-timeline-container">
              <div className="notices-timeline-line"></div>
              {importantNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="notice-timeline-item"
                  onClick={() => setSelectedNoticeModal(notice)}
                >
                  <div className="notice-date-box">
                    <span className="notice-day">{notice.day}</span>
                    <span className="notice-month">{notice.month}</span>
                  </div>

                  <div className="notice-timeline-dot"></div>

                  <div className="notice-content-box">
                    <h4 className="notice-heading">{notice.title}</h4>
                    <p className="notice-desc-text">{notice.desc}</p>
                  </div>

                  <div className="notice-arrow-col">
                    <ChevronRight size={16} className="notice-chevron-icon" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Centered Button */}
            <div className="notices-card-footer">
              <button
                type="button"
                className="btn-view-all-notices"
                onClick={() => setIsAllNoticesModalOpen(true)}
              >
                <span>View All Notices</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. Bottom 3 Feature Cards
            ==================================================================== */}
        <div className="bottom-three-cards-grid">
          {/* Card 1: Latest Results */}
          <div className="feature-action-card card-results-tint">
            {/* Watermark Doodle: Exam A+ Paper */}
            <div className="card-doodle-watermark water-results">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <circle cx="15" cy="11" r="2.5" strokeDasharray="1 1"></circle>
              </svg>
            </div>

            <div className="card-action-icon bg-blue-circle">
              <FileText size={22} />
            </div>
            <h3 className="feature-card-title">Latest Results</h3>
            <p className="feature-card-desc">
              Check the latest examination results for all classes.
            </p>
            <button
              type="button"
              className="btn-feature-pill btn-pill-blue"
              onClick={() => setIsResultsModalOpen(true)}
            >
              <span>View Results</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Examination Guidelines */}
          <div className="feature-action-card card-guidelines-tint">
            {/* Watermark Doodle: Clipboard */}
            <div className="card-doodle-watermark water-guidelines">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <line x1="9" y1="12" x2="15" y2="12"></line>
                <line x1="9" y1="16" x2="15" y2="16"></line>
              </svg>
            </div>

            <div className="card-action-icon bg-orange-circle">
              <BookOpen size={22} />
            </div>
            <h3 className="feature-card-title">Examination Guidelines</h3>
            <p className="feature-card-desc">
              Important instructions, rules and regulations for students.
            </p>
            <button
              type="button"
              className="btn-feature-pill btn-pill-orange"
              onClick={() => setIsGuidelinesModalOpen(true)}
            >
              <span>View Guidelines</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Previous Years' Papers */}
          <div className="feature-action-card card-papers-tint">
            {/* Watermark Doodle: Papers Stack */}
            <div className="card-doodle-watermark water-papers">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>

            <div className="card-action-icon bg-green-circle">
              <Download size={22} />
            </div>
            <h3 className="feature-card-title">Previous Years' Papers</h3>
            <p className="feature-card-desc">
              Download question papers of previous examinations (if available).
            </p>
            <button
              type="button"
              className="btn-feature-pill btn-pill-green"
              onClick={() => setIsPapersModalOpen(true)}
            >
              <span>View Papers</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Bottom Organic Wave Accents (Orange + Navy flow)
          ==================================================================== */}
      <div className="section-bottom-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="waves-svg">
          <path
            fill="#f97316"
            fillOpacity="0.85"
            d="M0,45 C320,95 480,10 820,55 C1100,90 1320,30 1440,48 L1440,100 L0,100 Z"
          ></path>
          <path
            fill="#0b1528"
            d="M0,60 C280,100 520,35 900,75 C1180,105 1360,65 1440,80 L1440,100 L0,100 Z"
          ></path>
        </svg>
      </div>

      {/* ====================================================================
          MODAL 1: Exam Timetable & Details Modal
          ==================================================================== */}
      {selectedExamDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedExamDetails(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setSelectedExamDetails(null)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">{selectedExamDetails.classes}</span>
              <h3 className="modal-title-text">{selectedExamDetails.name}</h3>
              <p className="modal-subtitle-text">
                <Calendar size={15} />
                <span>{selectedExamDetails.tentativeDate} • {selectedExamDetails.status}</span>
              </p>
              <p className="modal-desc-text">{selectedExamDetails.description}</p>
            </div>

            <div className="modal-table-wrap">
              <table className="modal-detail-table">
                <thead>
                  <tr>
                    <th>Date &amp; Day</th>
                    <th>Subject</th>
                    <th>Timing</th>
                    <th>Room / Hall</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamDetails.details.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{item.date}</td>
                      <td className="font-semibold text-navy">{item.subject}</td>
                      <td>
                        <span className="timing-pill">
                          <Clock size={12} />
                          {item.time}
                        </span>
                      </td>
                      <td>{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-flex">
              <button
                type="button"
                className="btn-modal-dark"
                onClick={() => {
                  showToast(`Downloaded timetable for ${selectedExamDetails.name}`);
                  setSelectedExamDetails(null);
                }}
              >
                <Download size={15} />
                <span>Download Routine PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: Notice Details Modal
          ==================================================================== */}
      {selectedNoticeModal && (
        <div className="modal-backdrop" onClick={() => setSelectedNoticeModal(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setSelectedNoticeModal(null)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">{selectedNoticeModal.category}</span>
              <h3 className="modal-title-text">{selectedNoticeModal.title}</h3>
              <p className="modal-subtitle-text">
                <Calendar size={15} />
                <span>Published on: {selectedNoticeModal.day} {selectedNoticeModal.month} 2026</span>
              </p>
            </div>

            <div className="notice-body-text">
              <p>{selectedNoticeModal.fullText}</p>
            </div>

            <div className="modal-footer-flex">
              <button
                type="button"
                className="btn-modal-dark"
                onClick={() => setSelectedNoticeModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: View All Notices Modal
          ==================================================================== */}
      {isAllNoticesModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAllNoticesModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setIsAllNoticesModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">NOTICE BOARD</span>
              <h3 className="modal-title-text">All Examination Notices &amp; Circulars</h3>
              <p className="modal-subtitle-text">Official announcements for Academic Session 2026–27</p>
            </div>

            <div className="all-notices-list">
              {importantNotices.map((n) => (
                <div key={n.id} className="all-notice-card">
                  <div className="all-notice-date-badge">
                    <span className="badge-day">{n.day}</span>
                    <span className="badge-month">{n.month}</span>
                  </div>
                  <div className="all-notice-info">
                    <span className="all-notice-cat">{n.category}</span>
                    <h4 className="all-notice-title">{n.title}</h4>
                    <p className="all-notice-full">{n.fullText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: Results Modal
          ==================================================================== */}
      {isResultsModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsResultsModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setIsResultsModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">ONLINE RESULTS</span>
              <h3 className="modal-title-text">Check Examination Results</h3>
              <p className="modal-subtitle-text">Enter student Roll Number to view published marksheet</p>
            </div>

            <form onSubmit={handleSearchRoll} className="modal-search-form">
              <div className="search-bar-wrap">
                <input
                  type="text"
                  placeholder="Enter Roll Number (e.g. 202601, 202602)..."
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  className="search-input-field"
                />
                <button type="submit" className="search-submit-btn">
                  <Search size={16} />
                  <span>Search</span>
                </button>
              </div>
              {searchError && <p className="error-note">{searchError}</p>}
            </form>

            <div className="sample-rolls-hint">
              <span>Try sample: </span>
              <button type="button" className="hint-pill" onClick={() => setRollInput('202601')}>202601</button>
              <button type="button" className="hint-pill" onClick={() => setRollInput('202602')}>202602</button>
              <button type="button" className="hint-pill" onClick={() => setRollInput('202603')}>202603</button>
            </div>

            {activeResultCard && (
              <div className="result-preview-box">
                <div className="result-preview-header">
                  <div>
                    <h4 className="res-student-name">{activeResultCard.name}</h4>
                    <p className="res-meta">Roll No: {activeResultCard.rollNumber} • {activeResultCard.class}</p>
                  </div>
                  <div className="res-grade-pill">{activeResultCard.grade}</div>
                </div>

                <div className="result-preview-stats">
                  <div className="res-stat-item">
                    <span className="stat-label">Percentage</span>
                    <span className="stat-val">{activeResultCard.percentage}</span>
                  </div>
                  <div className="res-stat-item">
                    <span className="stat-label">Result Status</span>
                    <span className="stat-val text-green">{activeResultCard.status}</span>
                  </div>
                </div>

                <div className="res-actions-row">
                  <button
                    type="button"
                    className="btn-print-scorecard"
                    onClick={() => {
                      showToast(`Scorecard downloaded for ${activeResultCard.name}`);
                    }}
                  >
                    <Printer size={15} />
                    <span>Print Scorecard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: Examination Guidelines Modal
          ==================================================================== */}
      {isGuidelinesModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGuidelinesModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setIsGuidelinesModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">RULES &amp; REGULATIONS</span>
              <h3 className="modal-title-text">Official Examination Guidelines</h3>
              <p className="modal-subtitle-text">Instructions and code of conduct for PM SHRI Moharcherra students</p>
            </div>

            <div className="guidelines-content-list">
              {examGuidelinesList.map((sec, idx) => (
                <div key={idx} className="guideline-sec-card">
                  <h4 className="guideline-cat-heading">{sec.category}</h4>
                  <ul className="guideline-bullet-list">
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="modal-footer-flex">
              <button
                type="button"
                className="btn-modal-dark"
                onClick={() => {
                  showToast('Examination Guidelines PDF downloaded.');
                  setIsGuidelinesModalOpen(false);
                }}
              >
                <Download size={15} />
                <span>Download Guidelines PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 6: Previous Question Papers Modal
          ==================================================================== */}
      {isPapersModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPapersModalOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setIsPapersModalOpen(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-block">
              <span className="modal-badge-orange">RESOURCE ARCHIVE</span>
              <h3 className="modal-title-text">Previous Years' Question Papers</h3>
              <p className="modal-subtitle-text">Download board &amp; internal assessment model question papers</p>
            </div>

            <div className="papers-download-grid">
              {sampleQuestionPapers.map((paper, idx) => (
                <div key={idx} className="paper-download-card">
                  <div className="paper-icon-side">
                    <FileText size={20} />
                  </div>
                  <div className="paper-info-side">
                    <span className="paper-class-tag">{paper.class} • {paper.year}</span>
                    <h5 className="paper-subject-title">{paper.subject}</h5>
                    <span className="paper-size">{paper.format} • {paper.size}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-download-paper-icon"
                    onClick={() => showToast(`Downloaded: ${paper.subject} (${paper.class})`)}
                    title="Download Paper"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleSection;
