import React, { useState, useEffect, useRef, useMemo } from 'react';
import './AcademicDatePicker.css';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { fetchCalendarHolidays, computeMonthWorkingDays } from '../../utils/calendarAttendance';

// Academic session months (April 2026 to March 2027)
const ACADEMIC_SESSION_MONTHS = [
  { key: '2026-04', monthIndex: 3, year: 2026, name: 'April 2026' },
  { key: '2026-05', monthIndex: 4, year: 2026, name: 'May 2026' },
  { key: '2026-06', monthIndex: 5, year: 2026, name: 'June 2026' },
  { key: '2026-07', monthIndex: 6, year: 2026, name: 'July 2026' },
  { key: '2026-08', monthIndex: 7, year: 2026, name: 'August 2026' },
  { key: '2026-09', monthIndex: 8, year: 2026, name: 'September 2026' },
  { key: '2026-10', monthIndex: 9, year: 2026, name: 'October 2026', isCurrent: true },
  { key: '2026-11', monthIndex: 10, year: 2026, name: 'November 2026' },
  { key: '2026-12', monthIndex: 11, year: 2026, name: 'December 2026' },
  { key: '2027-01', monthIndex: 0, year: 2027, name: 'January 2027' },
  { key: '2027-02', monthIndex: 1, year: 2027, name: 'February 2027' },
  { key: '2027-03', monthIndex: 2, year: 2027, name: 'March 2027' }
];

/**
 * AcademicDatePicker
 * Interactive attendance date picker adhering strictly to the school's official 2026–2027 Academic Calendar.
 * Fully scoped with 'adp-' prefix to eliminate any CSS collisions.
 */
const AcademicDatePicker = ({
  value = '2026-10-30',
  onChange = () => {},
  holidays: propHolidays = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [holidays, setHolidays] = useState(propHolidays || []);
  const pickerRef = useRef(null);

  // Fetch live holidays from API if not supplied in props
  useEffect(() => {
    if (propHolidays && propHolidays.length > 0) {
      setHolidays(propHolidays);
    } else {
      fetchCalendarHolidays().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHolidays(data);
        }
      });
    }
  }, [propHolidays]);

  // Current view month & year (starts matching selected value or default October 2026)
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split('-');
      return parseInt(parts[0], 10) || 2026;
    }
    return 2026;
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const parts = value.split('-');
      return (parseInt(parts[1], 10) - 1) || 9;
    }
    return 9;
  });

  // When value changes from outside, sync view if not open
  useEffect(() => {
    if (value && !isOpen) {
      const parts = value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y)) setViewYear(y);
      if (!isNaN(m)) setViewMonth(m);
    }
  }, [value, isOpen]);

  // Hovered day for live preview
  const [hoveredDayInfo, setHoveredDayInfo] = useState(null);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Helper to determine day status against Academic Calendar
  const getDayStatus = (year, month, day) => {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay(); // 0 = Sunday

    if (dayOfWeek === 0) {
      return {
        isSunday: true,
        isWorking: false,
        isHoliday: false,
        name: 'Sunday (Weekly Off)',
        type: 'sunday'
      };
    }

    // Check holidays
    for (const h of holidays) {
      const hMonth = Number(h.month);
      const hYear = h.year ? Number(h.year) : (hMonth <= 2 ? 2027 : 2026);

      if (hMonth === month && hYear === year) {
        const start = Number(h.date);
        const end = h.endDate ? Number(h.endDate) : start;

        if (day >= start && day <= end) {
          if (h.isClosed !== false) {
            return {
              isSunday: false,
              isWorking: false,
              isHoliday: true,
              name: h.name,
              category: h.category || 'School Holiday',
              type: h.type || 'holiday'
            };
          }
        }
      }
    }

    return {
      isSunday: false,
      isWorking: true,
      isHoliday: false,
      name: 'Regular Working Day',
      type: 'working'
    };
  };

  // Selected date info
  const selectedDateInfo = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return {
      iso: value,
      year: y,
      month: m - 1,
      day: d,
      displayDate: `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`,
      status: getDayStatus(y, m - 1, d)
    };
  }, [value, holidays]);

  // Days in currently viewed month
  const monthDaysCount = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // Start day of week for currently viewed month (0 = Sunday, 1 = Monday, ...)
  const startDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  // Month stats (working vs non-working)
  const currentMonthStats = useMemo(() => {
    return computeMonthWorkingDays(viewMonth, viewYear, holidays);
  }, [viewMonth, viewYear, holidays]);

  // Active month selector helper
  const currentMonthObj = useMemo(() => {
    return (
      ACADEMIC_SESSION_MONTHS.find(
        (m) => m.monthIndex === viewMonth && m.year === viewYear
      ) || ACADEMIC_SESSION_MONTHS[6]
    );
  }, [viewMonth, viewYear]);

  // Navigate between months (constrained to 2026-04 to 2027-03)
  const handlePrevMonth = () => {
    const currentIndex = ACADEMIC_SESSION_MONTHS.findIndex(
      (m) => m.monthIndex === viewMonth && m.year === viewYear
    );
    if (currentIndex > 0) {
      const prev = ACADEMIC_SESSION_MONTHS[currentIndex - 1];
      setViewMonth(prev.monthIndex);
      setViewYear(prev.year);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = ACADEMIC_SESSION_MONTHS.findIndex(
      (m) => m.monthIndex === viewMonth && m.year === viewYear
    );
    if (currentIndex < ACADEMIC_SESSION_MONTHS.length - 1) {
      const next = ACADEMIC_SESSION_MONTHS[currentIndex + 1];
      setViewMonth(next.monthIndex);
      setViewYear(next.year);
    }
  };

  const handleSelectMonth = (e) => {
    const selectedKey = e.target.value;
    const target = ACADEMIC_SESSION_MONTHS.find((m) => m.key === selectedKey);
    if (target) {
      setViewMonth(target.monthIndex);
      setViewYear(target.year);
    }
  };

  const handleSelectDay = (day) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mStr}-${dStr}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    onChange('2026-10-30');
    setViewMonth(9);
    setViewYear(2026);
    setIsOpen(false);
  };

  const activeIndex = ACADEMIC_SESSION_MONTHS.findIndex(
    (m) => m.monthIndex === viewMonth && m.year === viewYear
  );

  return (
    <div className="adp-wrapper" ref={pickerRef}>
      {/* Trigger Button: Formatted Date & Working Day Status Indicator */}
      <button
        type="button"
        className={`adp-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Click to select attendance date from Academic Calendar"
      >
        <div className="adp-trigger-content">
          <Calendar size={15} className="adp-calendar-icon" />
          <span className="adp-trigger-label">Date:</span>
          <span className="adp-trigger-date-text">{selectedDateInfo?.displayDate || value}</span>
        </div>

        {/* Live Status Badge on Trigger */}
        {selectedDateInfo && (
          <span
            className={`adp-status-pill ${
              selectedDateInfo.status.isWorking
                ? 'working'
                : selectedDateInfo.status.isHoliday
                ? 'holiday'
                : 'sunday'
            }`}
          >
            {selectedDateInfo.status.isWorking ? (
              <>
                <CheckCircle2 size={11} />
                <span>Working Day</span>
              </>
            ) : selectedDateInfo.status.isHoliday ? (
              <>
                <AlertCircle size={11} />
                <span>{selectedDateInfo.status.name}</span>
              </>
            ) : (
              <>
                <Clock size={11} />
                <span>Sunday (Closed)</span>
              </>
            )}
          </span>
        )}
      </button>

      {/* Backdrop for Mobile Devices */}
      {isOpen && (
        <div
          className="adp-mobile-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Interactive Academic Calendar Dropdown Popover ── */}
      {isOpen && (
        <div className="adp-popover-card" role="dialog" aria-label="Academic Calendar Date Picker">
          {/* Header Controls: Academic Session & Month Nav */}
          <div className="adp-popover-header">
            <div className="adp-month-nav-row">
              <button
                type="button"
                className="adp-nav-btn"
                onClick={handlePrevMonth}
                disabled={activeIndex <= 0}
                title="Previous Academic Month"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="adp-select-container">
                <select
                  value={`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`}
                  onChange={handleSelectMonth}
                  className="adp-month-dropdown"
                >
                  {ACADEMIC_SESSION_MONTHS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.name} {m.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="adp-nav-btn"
                onClick={handleNextMonth}
                disabled={activeIndex >= ACADEMIC_SESSION_MONTHS.length - 1}
                title="Next Academic Month"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Academic Session & Live Month Metrics */}
            <div className="adp-meta-strip">
              <span className="adp-session-badge">Academic Year 2026–2027</span>
              <span className="adp-working-tag">
                <strong>{currentMonthStats.workingDays}</strong> Working • {currentMonthStats.nonWorkingDaysCount} Closed
              </span>
            </div>
          </div>

          {/* Weekday Column Headers */}
          <div className="adp-weekdays-row">
            <span className="adp-weekday-hdr sunday" title="Sunday (Weekly Off)">Su</span>
            <span className="adp-weekday-hdr">Mo</span>
            <span className="adp-weekday-hdr">Tu</span>
            <span className="adp-weekday-hdr">We</span>
            <span className="adp-weekday-hdr">Th</span>
            <span className="adp-weekday-hdr">Fr</span>
            <span className="adp-weekday-hdr">Sa</span>
          </div>

          {/* Days Grid */}
          <div className="adp-days-grid">
            {/* Blank leading slots for start of month */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="adp-day-cell empty" />
            ))}

            {/* Actual Days of the Month */}
            {Array.from({ length: monthDaysCount }, (_, i) => i + 1).map((day) => {
              const status = getDayStatus(viewYear, viewMonth, day);
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const cellIso = `${viewYear}-${mStr}-${dStr}`;

              const isSelected = value === cellIso;
              const isToday = cellIso === '2026-10-30';

              let cellStatusClass = 'working';
              if (status.isSunday) cellStatusClass = 'sunday';
              else if (status.isHoliday) cellStatusClass = 'holiday';

              return (
                <button
                  key={day}
                  type="button"
                  className={`adp-day-cell ${cellStatusClass} ${isSelected ? 'selected' : ''} ${
                    isToday ? 'today' : ''
                  }`}
                  onClick={() => handleSelectDay(day)}
                  onMouseEnter={() =>
                    setHoveredDayInfo({
                      day,
                      monthName: currentMonthObj.name,
                      status
                    })
                  }
                  onMouseLeave={() => setHoveredDayInfo(null)}
                  title={
                    status.isHoliday
                      ? `${day} ${currentMonthObj.name}: Holiday — ${status.name}`
                      : status.isSunday
                      ? `${day} ${currentMonthObj.name}: Sunday (Weekly Off)`
                      : `${day} ${currentMonthObj.name}: Official School Working Day`
                  }
                >
                  <span className="adp-day-num">{day}</span>
                  {status.isHoliday && <span className="adp-holiday-dot" />}
                  {isToday && !isSelected && <span className="adp-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Legend / Info Strip */}
          <div className="adp-legend-row">
            <div className="adp-legend-item">
              <span className="adp-legend-dot working" />
              <span>Working</span>
            </div>
            <div className="adp-legend-item">
              <span className="adp-legend-dot holiday" />
              <span>Holiday</span>
            </div>
            <div className="adp-legend-item">
              <span className="adp-legend-dot sunday" />
              <span>Sunday</span>
            </div>
          </div>

          {/* Hovered / Selected Day Detail Banner */}
          <div className="adp-detail-banner">
            {hoveredDayInfo ? (
              <div className="adp-status-line">
                <Info size={13} className="adp-info-icon" />
                <span className="adp-status-text">
                  <strong>{hoveredDayInfo.day} {hoveredDayInfo.monthName}:</strong>{' '}
                  {hoveredDayInfo.status.name}
                </span>
              </div>
            ) : selectedDateInfo ? (
              <div className={`adp-status-line ${selectedDateInfo.status.isWorking ? 'ok' : 'warn'}`}>
                {selectedDateInfo.status.isWorking ? (
                  <CheckCircle2 size={13} className="adp-info-icon ok" />
                ) : (
                  <AlertCircle size={13} className="adp-info-icon warn" />
                )}
                <span className="adp-status-text">
                  <strong>{selectedDateInfo.displayDate}:</strong>{' '}
                  {selectedDateInfo.status.isWorking
                    ? 'Official School Working Day'
                    : `${selectedDateInfo.status.name} (Closed)`}
                </span>
              </div>
            ) : null}
          </div>

          {/* Footer Shortcuts */}
          <div className="adp-footer-row">
            <button
              type="button"
              className="adp-today-shortcut-btn"
              onClick={handleSetToday}
            >
              <Sparkles size={12} />
              <span>Today (30-10-2026)</span>
            </button>

            <button
              type="button"
              className="adp-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicDatePicker;
