import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AcademicCalendar.css';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Home,
  School,
  BookOpen,
  ClipboardCheck,
  Users,
  FileSpreadsheet,
  Trophy,
  FileText,
  Umbrella,
  Clock,
  MapPin,
  X,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award
} from 'lucide-react';

import {
  academicYears,
  monthsData,
  monthlyEvents,
  timelineMilestones,
  examinationSchedule,
  holidaysData
} from './academicCalendarData';

const AcademicCalendar = ({ onNavigate = () => {} }) => {
  // State
  const [selectedYearIndex, setSelectedYearIndex] = useState(0); // 0 = 2026 – 2027
  const [selectedMonthKey, setSelectedMonthKey] = useState(9); // Default to October (key 9)
  const [activeHolidayTab, setActiveHolidayTab] = useState('national'); // 'national', 'state', 'school', 'special'
  
  // Modals & Popovers
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);
  const [selectedDayEvent, setSelectedDayEvent] = useState(null);
  const [downloadToast, setDownloadToast] = useState(false);

  // Live data from API
  const [allApiHolidays, setAllApiHolidays] = useState([]); // raw array from /api/holidays
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    setApiLoading(true);
    fetch(`${API_BASE_URL}/api/holidays`)
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAllApiHolidays(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to static data
      })
      .finally(() => setApiLoading(false));
  }, []);

  // ── Derived: categorized holidays for the "Holidays & Observances" card ──
  const currentHolidaysData = (() => {
    if (allApiHolidays.length === 0) return holidaysData; // static fallback
    const categorized = { national: [], state: [], school: [], special: [] };
    allApiHolidays.forEach((item) => {
      const cat = item.type || 'school';
      const monthObj = monthsData.find((m) => m.key === Number(item.month));
      const monthShort = monthObj?.label?.toUpperCase() || 'OCT';
      if (categorized[cat]) {
        categorized[cat].push({
          id: item.id || item._id,
          date: item.dateDisplay || (item.date < 10 ? `0${item.date}` : String(item.date)),
          month: monthShort,
          name: item.name,
          type: item.category || 'School Holiday',
          day: item.dayOfWeek,
          description: item.description
        });
      }
    });
    return categorized;
  })();

  // ── Derived: events for the selected month (Important Dates + Calendar grid) ──
  const typeColorMap = {
    national: '#dc2626',
    state:    '#2563eb',
    school:   '#ea580c',
    special:  '#7c3aed',
  };

  const activeEvents = (() => {
    if (allApiHolidays.length === 0) return monthlyEvents[selectedMonthKey] || [];
    return allApiHolidays
      .filter((h) => Number(h.month) === selectedMonthKey)
      .map((h) => ({
        id: h.id || h._id,
        date: Number(h.date),
        month: (monthsData.find((m) => m.key === Number(h.month))?.label || '').toUpperCase(),
        title: h.name,
        description: h.description || h.category || 'Holiday',
        category: h.category || h.type || 'Holiday',
        color: typeColorMap[h.type] || '#ea580c',
        isClosed: h.isClosed,
        endDate: h.endDate ? Number(h.endDate) : null,
      }));
  })();

  const selectedYear = academicYears[selectedYearIndex];
  const activeMonthObj = monthsData.find((m) => m.key === selectedMonthKey) || monthsData[9];

  // Refs for horizontal month tabs scrolling
  const monthsTrackRef = useRef(null);
  const activeMonthPillRef = useRef(null);

  const scrollMonths = (direction) => {
    if (monthsTrackRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      monthsTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeMonthPillRef.current) {
      activeMonthPillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [selectedMonthKey]);

  // Switch to Previous/Next Year
  const handlePrevYear = () => {
    if (selectedYearIndex < academicYears.length - 1) {
      setSelectedYearIndex(selectedYearIndex + 1);
    } else {
      setSelectedYearIndex(0);
    }
  };

  // Switch month navigation for calendar grid
  const handlePrevMonth = () => {
    setSelectedMonthKey((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthKey((prev) => (prev === 11 ? 0 : prev + 1));
  };

  // Download PDF Handler
  const handleDownloadPDF = () => {
    setDownloadToast(true);
    setTimeout(() => {
      setDownloadToast(false);
    }, 4000);

    // Create a synthesized download link for parents/students
    const calendarText = `PM SHRI MOHARCHERRA H.S. SCHOOL\nACADEMIC CALENDAR (${selectedYear})\n\nOfficial Academic Session Calendar & Schedule\nTeliamura, Khowai, Tripura\n\nGenerated on: ${new Date().toLocaleDateString()}\nWebsite: https://www.moharcherrahs.in`;
    const blob = new Blob([calendarText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PM_SHRI_Academic_Calendar_${selectedYear.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Milestone icon selector
  const renderMilestoneIcon = (iconName) => {
    switch (iconName) {
      case 'School':
        return <School size={22} />;
      case 'BookOpen':
        return <BookOpen size={22} />;
      case 'ClipboardCheck':
        return <ClipboardCheck size={22} />;
      case 'Users':
        return <Users size={22} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet size={22} />;
      case 'Trophy':
        return <Trophy size={22} />;
      default:
        return <Award size={22} />;
    }
  };

  // Render Calendar Grid Cells
  const renderCalendarCells = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth(); // 0 = Jan ... 9 = Oct, 10 = Nov
    const todayDate = today.getDate();

    const daysInMonth = activeMonthObj.daysInMonth;
    const startDayOfWeek = activeMonthObj.startDayOfWeek; // 1 = Mon, 7 = Sun
    const cells = [];

    // Prior month trailing days
    const prevMonthDays = 31;
    const prevMonthKey = activeMonthObj.key === 0 ? 11 : activeMonthObj.key - 1;
    const prevMonthYear = activeMonthObj.key === 0 ? activeMonthObj.year - 1 : activeMonthObj.year;

    for (let i = startDayOfWeek - 1; i > 0; i--) {
      const dayNum = prevMonthDays - i + 1;
      const isToday =
        todayYear === prevMonthYear &&
        todayMonth === prevMonthKey &&
        dayNum === todayDate;

      cells.push(
        <div
          key={`prev-${i}`}
          className={`cal-grid-cell other-month ${isToday ? 'is-today' : ''}`}
          title={isToday ? `Today (${dayNum} ${monthsData.find((m) => m.key === prevMonthKey)?.name || ''} ${prevMonthYear})` : undefined}
          onClick={() => {
            if (isToday) setSelectedMonthKey(prevMonthKey);
          }}
        >
          <span className="cal-cell-number">{dayNum}</span>
          {isToday && <span className="cal-today-tag">TODAY</span>}
        </div>
      );
    }

    // Current month active days
    for (let day = 1; day <= daysInMonth; day++) {
      // Match event on this day (including multi-day spans)
      const dayEvent = activeEvents.find((e) => {
        const start = Number(e.date);
        const end = e.endDate ? Number(e.endDate) : start;
        return day >= start && day <= end;
      });
      const isSelected = selectedDayEvent && selectedDayEvent.date === day;
      const isToday =
        todayYear === activeMonthObj.year &&
        todayMonth === activeMonthObj.key &&
        day === todayDate;

      cells.push(
        <div
          key={`day-${day}`}
          className={`cal-grid-cell ${dayEvent ? 'has-event' : ''} ${isSelected ? 'selected-day' : ''} ${isToday ? 'is-today' : ''}`}
          onClick={() => {
            if (dayEvent) {
              setSelectedDayEvent({ ...dayEvent, date: day });
            }
          }}
          title={
            isToday
              ? `Today (${day} ${activeMonthObj.name} ${activeMonthObj.year})${dayEvent ? ` • ${dayEvent.title}` : ''}`
              : dayEvent
              ? `${dayEvent.title} (${dayEvent.category})`
              : `Day ${day}`
          }
        >
          <span className="cal-cell-number">{day}</span>
          {isToday && <span className="cal-today-tag">TODAY</span>}
          {dayEvent && (
            <span
              className="cal-cell-dot"
              style={{ backgroundColor: dayEvent.color || '#ea580c' }}
            />
          )}
        </div>
      );
    }

    // Trailing days of next month to fill complete grid rows
    const totalFilled = cells.length;
    const remaining = (7 - (totalFilled % 7)) % 7;
    const nextMonthKey = activeMonthObj.key === 11 ? 0 : activeMonthObj.key + 1;
    const nextMonthYear = activeMonthObj.key === 11 ? activeMonthObj.year + 1 : activeMonthObj.year;

    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const isToday =
        todayYear === nextMonthYear &&
        todayMonth === nextMonthKey &&
        nextDay === todayDate;

      cells.push(
        <div
          key={`next-${nextDay}`}
          className={`cal-grid-cell other-month ${isToday ? 'is-today' : ''}`}
          title={isToday ? `Today (${nextDay} ${monthsData.find((m) => m.key === nextMonthKey)?.name || ''} ${nextMonthYear})` : undefined}
          onClick={() => {
            if (isToday) setSelectedMonthKey(nextMonthKey);
          }}
        >
          <span className="cal-cell-number">{nextDay}</span>
          {isToday && <span className="cal-today-tag">TODAY</span>}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="academic-calendar-page">
      {/* Toast Notification */}
      {downloadToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#0b1528',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          borderLeft: '4px solid #ea580c',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <Sparkles size={18} color="#ea580c" />
          <span>Academic Calendar for {selectedYear} downloaded successfully!</span>
        </div>
      )}

      {/* ====================================================================
          01 — Academic Calendar Hero Section
          ==================================================================== */}
      <section className="cal-hero-section">
        <div className="cal-hero-overlay"></div>
        <div className="cal-hero-container">
          <div className="cal-hero-content">
            {/* Top Tag */}
            <div className="cal-eyebrow-wrap">
              <span className="cal-eyebrow">ACADEMICS</span>
              <div className="cal-eyebrow-line"></div>
            </div>

            {/* Main Title */}
            <h1 className="cal-hero-title">
              <span className="cal-title-navy">Academic </span>
              <span className="cal-title-orange">Calendar</span>
            </h1>

            {/* Subtitle with bullet dots */}
            <h2 className="cal-hero-subtitle">
              Plan <span className="cal-subtitle-dot">•</span> Learn <span className="cal-subtitle-dot">•</span> Achieve
            </h2>

            {/* Description */}
            <p className="cal-hero-desc">
              Stay updated with important academic events, examinations, holidays and activities for the academic session.
            </p>

            {/* Breadcrumbs */}
            <div className="cal-breadcrumb-nav">
              <Home size={15} className="cal-breadcrumb-home-icon" />
              <a
                href="#"
                className="cal-breadcrumb-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                }}
              >
                Home
              </a>
              <span className="cal-breadcrumb-sep">/</span>
              <a
                href="#"
                className="cal-breadcrumb-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                }}
              >
                Academics
              </a>
              <span className="cal-breadcrumb-sep">/</span>
              <span className="cal-breadcrumb-current">Academic Calendar</span>
            </div>
          </div>

          {/* Right Spacer / Building Frame */}
          <div className="cal-hero-spacer"></div>
        </div>
      </section>

      {/* ====================================================================
          Main Content Wrapper
          ==================================================================== */}
      <div className="cal-main-content">
        
        {/* ==================================================================
            02 — Select Academic Year
            ================================================================== */}
        <section className="cal-card cal-year-selector-card">
          <div className="cal-year-left">
            <div className="cal-icon-badge">
              <CalendarDays size={22} />
            </div>
            <div className="cal-card-header-text">
              <h3>Select Academic Year</h3>
              <p>View academic calendar, examinations, holidays and all important dates for the selected academic session.</p>
            </div>
          </div>

          <div className="cal-year-right">
            <div className="cal-year-dropdown-wrap">
              <select
                className="cal-year-select"
                value={selectedYear}
                onChange={(e) => {
                  const idx = academicYears.indexOf(e.target.value);
                  if (idx !== -1) setSelectedYearIndex(idx);
                }}
              >
                {academicYears.map((yr, idx) => (
                  <option key={idx} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="cal-select-chevron" />
            </div>

            <button className="cal-btn-prev-year" onClick={handlePrevYear}>
              <ChevronLeft size={16} />
              <span>Previous Year</span>
            </button>

            <button className="cal-btn-download-pdf" onClick={handleDownloadPDF}>
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </section>

        {/* ==================================================================
            03 & 04 — Two Column Grid: Important Dates & Monthly Calendar
            ================================================================== */}
        <div className="cal-two-col-grid">
          
          {/* Card 1: Important Dates */}
          <section className="cal-card">
            <div className="cal-card-header">
              <div className="cal-icon-badge">
                <Calendar size={22} />
              </div>
              <div className="cal-card-header-text">
                <h3>Important Dates</h3>
                <p>Select a month to view important academic events.</p>
              </div>
            </div>

            {/* Horizontal Month Navigation Bar with Smooth Scroll & Arrow Controls */}
            <div className="cal-month-nav-container">
              <button
                type="button"
                className="cal-month-nav-btn left"
                onClick={() => scrollMonths('left')}
                aria-label="Scroll months left"
                title="Scroll months left"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="cal-month-tabs-wrap" ref={monthsTrackRef}>
                {monthsData.map((m) => {
                  const eventCount = allApiHolidays.length > 0
                    ? allApiHolidays.filter((h) => Number(h.month) === m.key).length
                    : (monthlyEvents[m.key]?.length || 0);
                  const isActive = selectedMonthKey === m.key;

                  return (
                    <button
                      key={m.key}
                      ref={isActive ? activeMonthPillRef : null}
                      type="button"
                      className={`cal-month-pill ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedMonthKey(m.key)}
                      title={`${m.name || m.label} ${m.year}${eventCount > 0 ? ` (${eventCount} scheduled event${eventCount > 1 ? 's' : ''})` : ''}`}
                    >
                      <span>{m.label}</span>
                      {eventCount > 0 && (
                        <span className="cal-month-pill-dot" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="cal-month-nav-btn right"
                onClick={() => scrollMonths('right')}
                aria-label="Scroll months right"
                title="Scroll months right"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Active Month Header */}
            <h4 className="cal-active-month-heading">
              {activeMonthObj.name || activeMonthObj.nameFull || activeMonthObj.label} {activeMonthObj.year}
            </h4>

            {/* Event Items List */}
            <div className="cal-events-list">
              {activeEvents.length > 0 ? (
                activeEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="cal-event-item"
                    onClick={() => setSelectedDayEvent(evt)}
                  >
                    <div className="cal-event-date-box">
                      <span className="cal-date-num">
                        {evt.date < 10 ? `0${evt.date}` : evt.date}
                      </span>
                      <span className="cal-date-mon">{evt.month}</span>
                    </div>

                    <div
                      className="cal-event-indicator-dot"
                      style={{ backgroundColor: evt.color || '#ea580c' }}
                    ></div>

                    <div className="cal-event-details">
                      <h5 className="cal-event-title">{evt.title}</h5>
                      <p className="cal-event-desc">{evt.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cal-empty-events">
                  No scheduled public events for this month. Check examination and holiday schedules below.
                </div>
              )}
            </div>

            <button
              className="cal-card-btn-action"
              onClick={() => setIsEventsModalOpen(true)}
            >
              <span>View All Events</span>
              <ArrowRight size={14} />
            </button>
          </section>

          {/* Card 2: Monthly Calendar */}
          <section className="cal-card">
            <div className="cal-card-header">
              <div className="cal-icon-badge">
                <CalendarDays size={22} />
              </div>
              <div className="cal-card-header-text">
                <h3>Monthly Calendar</h3>
                <p>Event dates are marked with different colors.</p>
              </div>
            </div>

            {/* Calendar Month Navigation Header */}
            <div className="cal-grid-nav">
              <button
                className="cal-grid-nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="cal-grid-month-title-wrap">
                <span className="cal-grid-month-title">
                  {activeMonthObj.name || activeMonthObj.nameFull || activeMonthObj.label} {activeMonthObj.year}
                </span>
                <button
                  type="button"
                  className="cal-today-jump-btn"
                  onClick={() => setSelectedMonthKey(new Date().getMonth())}
                  title="Jump to today's date"
                >
                  Today
                </button>
              </div>
              <button
                className="cal-grid-nav-btn"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 7-Day Grid */}
            <div className="cal-grid-table">
              <div className="cal-grid-weekdays">
                <span className="cal-grid-weekday">Mon</span>
                <span className="cal-grid-weekday">Tue</span>
                <span className="cal-grid-weekday">Wed</span>
                <span className="cal-grid-weekday">Thu</span>
                <span className="cal-grid-weekday">Fri</span>
                <span className="cal-grid-weekday">Sat</span>
                <span className="cal-grid-weekday">Sun</span>
              </div>

              <div className="cal-grid-days">{renderCalendarCells()}</div>
            </div>

            {/* Legend Bar */}
            <div className="cal-legend-bar">
              <div className="cal-legend-item">
                <span className="cal-legend-today-indicator"></span>
                <span>Today</span>
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot dot-academic"></span>
                <span>Academic Event</span>
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot dot-exam"></span>
                <span>Examination</span>
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot dot-activity"></span>
                <span>Activity</span>
              </div>
              <div className="cal-legend-item">
                <span className="cal-legend-dot dot-holiday"></span>
                <span>Holiday</span>
              </div>
            </div>
          </section>
        </div>

        {/* ==================================================================
            06 & 07 — Two Column Grid: Examinations & Assessments & Holidays
            ================================================================== */}
        <div className="cal-two-col-grid">
          
          {/* Card 1: Examinations & Assessments */}
          <section className="cal-card">
            <div className="cal-card-header">
              <div className="cal-icon-badge">
                <FileText size={22} />
              </div>
              <div className="cal-card-header-text">
                <h3>Examinations & Assessments</h3>
                <p>Tentative schedule of examinations for the academic session {selectedYear}.</p>
              </div>
            </div>

            <div className="cal-exam-table-wrap">
              <table className="cal-exam-table">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Tentative Month</th>
                    <th>Classes Applicable</th>
                  </tr>
                </thead>
                <tbody>
                  {examinationSchedule.map((exam, idx) => (
                    <tr key={idx}>
                      <td className="cal-exam-name">{exam.name}</td>
                      <td>{exam.tentativeMonth}</td>
                      <td>
                        <span className="cal-exam-badge">{exam.classesApplicable}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Card 2: Holidays & Observances */}
          <section className="cal-card">
            <div className="cal-card-header">
              <div className="cal-icon-badge">
                <Umbrella size={22} />
              </div>
              <div className="cal-card-header-text">
                <h3>Holidays & Observances</h3>
                <p>List of important holidays and observances.</p>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="cal-holiday-tabs">
              <button
                className={`cal-holiday-tab ${activeHolidayTab === 'national' ? 'active' : ''}`}
                onClick={() => setActiveHolidayTab('national')}
              >
                National Holidays
              </button>
              <button
                className={`cal-holiday-tab ${activeHolidayTab === 'state' ? 'active' : ''}`}
                onClick={() => setActiveHolidayTab('state')}
              >
                State Holidays
              </button>
              <button
                className={`cal-holiday-tab ${activeHolidayTab === 'school' ? 'active' : ''}`}
                onClick={() => setActiveHolidayTab('school')}
              >
                School Holidays
              </button>
              <button
                className={`cal-holiday-tab ${activeHolidayTab === 'special' ? 'active' : ''}`}
                onClick={() => setActiveHolidayTab('special')}
              >
                Special Days
              </button>
            </div>

            {/* Holiday Items */}
            <div className="cal-holidays-list">
              {(currentHolidaysData[activeHolidayTab] || []).map((h) => (
                <div key={h.id} className="cal-holiday-item">
                  <div className="cal-holiday-date-box">
                    <span className="cal-date-num">{h.date}</span>
                    <span className="cal-date-mon">{h.month}</span>
                  </div>
                  <div className="cal-holiday-details">
                    <h5 className="cal-holiday-name">{h.name}</h5>
                    <p className="cal-holiday-type">
                      {h.type} {h.day && `• ${h.day}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="cal-card-btn-action"
              onClick={() => setIsHolidaysModalOpen(true)}
            >
              <span>View All Holidays</span>
              <ArrowRight size={14} />
            </button>
          </section>
        </div>

        {/* ==================================================================
            08 — Download Complete Academic Calendar (Banner CTA)
            ================================================================== */}
        <section className="cal-download-banner">
          {/* Left Decorative Illustration */}
          <div className="cal-download-decor-left">
            <svg
              className="cal-download-illustration"
              viewBox="0 0 160 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stack of books */}
              <rect x="25" y="80" width="90" height="16" rx="4" fill="#ea580c" />
              <rect x="22" y="76" width="96" height="6" rx="2" fill="#fed7aa" />
              <rect x="18" y="94" width="105" height="18" rx="4" fill="#0b1528" />
              <rect x="15" y="90" width="111" height="6" rx="2" fill="#94a3b8" />
              <rect x="10" y="110" width="120" height="20" rx="5" fill="#f59e0b" />
              <rect x="8" y="106" width="124" height="6" rx="2" fill="#fef3c7" />

              {/* Standup Desk Calendar */}
              <path d="M75 25 L145 25 L155 85 L65 85 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M75 25 L145 25 L145 42 L75 42 Z" fill="#ea580c" />
              <circle cx="95" cy="20" r="3" fill="#cbd5e1" />
              <circle cx="125" cy="20" r="3" fill="#cbd5e1" />
              {/* Calendar Grid Lines */}
              <circle cx="90" cy="55" r="2.5" fill="#0b1528" />
              <circle cx="110" cy="55" r="2.5" fill="#0b1528" />
              <circle cx="130" cy="55" r="2.5" fill="#ea580c" />
              <circle cx="90" cy="70" r="2.5" fill="#0b1528" />
              <circle cx="110" cy="70" r="2.5" fill="#0284c7" />
              <circle cx="130" cy="70" r="2.5" fill="#16a34a" />

              {/* Plants/Leaf decorative */}
              <path d="M30 45 C20 30 15 15 35 20 C35 30 32 40 30 45 Z" fill="#16a34a" opacity="0.8" />
              <path d="M40 50 C48 35 58 25 50 20 C42 25 38 40 40 50 Z" fill="#22c55e" opacity="0.8" />
            </svg>
          </div>

          {/* Center Content */}
          <div className="cal-download-center">
            <h3 className="cal-download-title">Download Complete Academic Calendar</h3>
            <p className="cal-download-desc">
              Get the full academic calendar for the academic session {selectedYear} with all events, examinations and holidays.
            </p>
            <button className="cal-btn-download-banner" onClick={handleDownloadPDF}>
              <Download size={18} />
              <span>Download PDF ({selectedYear})</span>
            </button>
          </div>

          {/* Right Decorative Watermark */}
          <div className="cal-download-decor-right">
            <FileText size={90} />
          </div>
        </section>

      </div>

      {/* ====================================================================
          Modal: View All Events
          ==================================================================== */}
      {isEventsModalOpen && (
        <div className="cal-modal-backdrop" onClick={() => setIsEventsModalOpen(false)}>
          <div className="cal-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h3>Academic Events ({selectedYear})</h3>
              <button
                className="cal-modal-close-btn"
                onClick={() => setIsEventsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="cal-modal-body">
              {(() => {
                // Group all API holidays by month, sorted chronologically
                const source = allApiHolidays.length > 0 ? allApiHolidays : null;
                if (!source) {
                  // fallback: show static
                  return Object.keys(monthlyEvents).map((mKey) => {
                    const mObj = monthsData.find((m) => m.key === parseInt(mKey));
                    const evts = monthlyEvents[mKey];
                    return (
                      <div key={mKey} style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', marginBottom: '8px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '4px' }}>
                          {mObj?.name || mObj?.label} {mObj?.year}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {evts.map((evt) => (
                            <div key={evt.id} className="cal-modal-item">
                              <div className="cal-event-date-box" style={{ minWidth: '40px' }}>
                                <span className="cal-date-num" style={{ fontSize: '18px' }}>{evt.date < 10 ? `0${evt.date}` : evt.date}</span>
                                <span className="cal-date-mon">{evt.month}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#0b1528', margin: 0 }}>{evt.title}</h5>
                                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>{evt.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                }

                // Sort and group live API holidays by month
                const grouped = {};
                [...source]
                  .sort((a, b) => Number(a.month) - Number(b.month) || Number(a.date) - Number(b.date))
                  .forEach((h) => {
                    const mKey = Number(h.month);
                    if (!grouped[mKey]) grouped[mKey] = [];
                    grouped[mKey].push(h);
                  });

                return Object.keys(grouped).map((mKey) => {
                  const mObj = monthsData.find((m) => m.key === parseInt(mKey));
                  return (
                    <div key={mKey} style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', marginBottom: '8px', borderBottom: '1.5px solid #fed7aa', paddingBottom: '4px' }}>
                        {mObj?.name || mObj?.label} {mObj?.year}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {grouped[mKey].map((h) => {
                          const color = typeColorMap[h.type] || '#ea580c';
                          const dateStr = h.endDate
                            ? `${h.date}–${h.endDate}`
                            : (h.date < 10 ? `0${h.date}` : String(h.date));
                          return (
                            <div key={h.id || h._id} className="cal-modal-item">
                              <div className="cal-event-date-box" style={{ minWidth: '40px' }}>
                                <span className="cal-date-num" style={{ fontSize: '16px' }}>{dateStr}</span>
                                <span className="cal-date-mon">{mObj?.label?.toUpperCase()}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                                  <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#0b1528', margin: 0 }}>{h.name}</h5>
                                </div>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 8px' }}>
                                  {h.category || h.type} {h.dayOfWeek ? `• ${h.dayOfWeek}` : ''} {!h.isClosed ? '• Observance' : '• School Closed'}
                                </p>
                                {h.description && (
                                  <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 8px', fontStyle: 'italic' }}>{h.description}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="cal-modal-footer">
              <button className="cal-modal-btn-close" onClick={() => setIsEventsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          Modal: View All Holidays
          ==================================================================== */}
      {isHolidaysModalOpen && (
        <div className="cal-modal-backdrop" onClick={() => setIsHolidaysModalOpen(false)}>
          <div className="cal-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h3>All Holidays & Observances ({selectedYear})</h3>
              <button
                className="cal-modal-close-btn"
                onClick={() => setIsHolidaysModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="cal-modal-body">
              {['national', 'state', 'school', 'special'].map((catKey) => {
                const list = currentHolidaysData[catKey] || [];
                const catTitle = {
                  national: 'National Holidays',
                  state: 'State Holidays (Tripura)',
                  school: 'School Vacations & Breaks',
                  special: 'Special Observances'
                }[catKey];

                return (
                  <div key={catKey} style={{ marginBottom: '16px' }}>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      color: '#0b1528',
                      marginBottom: '8px',
                      borderBottom: '1.5px solid #e2e8f0',
                      paddingBottom: '4px'
                    }}>
                      {catTitle}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {list.map((h) => (
                        <div key={h.id} className="cal-modal-item">
                          <div className="cal-holiday-date-box" style={{ minWidth: '40px' }}>
                            <span className="cal-date-num" style={{ fontSize: '18px' }}>{h.date}</span>
                            <span className="cal-date-mon">{h.month}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#0b1528', margin: 0 }}>
                              {h.name}
                            </h5>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                              {h.type} {h.day ? `• ${h.day}` : ''} {h.description ? `• ${h.description}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cal-modal-footer">
              <button className="cal-modal-btn-close" onClick={() => setIsHolidaysModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          Modal: Specific Date Event Details
          ==================================================================== */}
      {selectedDayEvent && (
        <div className="cal-modal-backdrop" onClick={() => setSelectedDayEvent(null)}>
          <div className="cal-popover-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span
                className="cal-popover-tag"
                style={{
                  backgroundColor: `${selectedDayEvent.color}15`,
                  color: selectedDayEvent.color || '#ea580c'
                }}
              >
                {selectedDayEvent.category || 'Event'}
              </span>
              <button
                className="cal-modal-close-btn"
                onClick={() => setSelectedDayEvent(null)}
              >
                <X size={18} />
              </button>
            </div>

            <h4 className="cal-popover-title">{selectedDayEvent.title}</h4>

            <div className="cal-popover-meta">
              <div className="cal-popover-meta-row">
                <Calendar size={15} color="#ea580c" />
                <span>
                  {selectedDayEvent.date} {selectedDayEvent.month} {selectedDayEvent.year}
                </span>
              </div>
              {selectedDayEvent.time && (
                <div className="cal-popover-meta-row">
                  <Clock size={15} color="#ea580c" />
                  <span>{selectedDayEvent.time}</span>
                </div>
              )}
              {selectedDayEvent.venue && (
                <div className="cal-popover-meta-row">
                  <MapPin size={15} color="#ea580c" />
                  <span>{selectedDayEvent.venue}</span>
                </div>
              )}
            </div>

            <p className="cal-popover-desc">{selectedDayEvent.description}</p>

            <button
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13.5px'
              }}
              onClick={() => setSelectedDayEvent(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
