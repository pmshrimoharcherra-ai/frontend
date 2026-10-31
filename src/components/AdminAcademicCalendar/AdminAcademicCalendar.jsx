import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminAcademicCalendar.css';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  Sun,
  Flag,
  Palmtree,
  BookOpen,
  Filter,
  Check,
  Building2,
  CalendarCheck2,
  Info
} from 'lucide-react';

const ACADEMIC_MONTHS = [
  { key: 3, label: 'Apr', name: 'April', year: 2026, daysInMonth: 30, startDayOfWeek: 3 },
  { key: 4, label: 'May', name: 'May', year: 2026, daysInMonth: 31, startDayOfWeek: 5 },
  { key: 5, label: 'Jun', name: 'June', year: 2026, daysInMonth: 30, startDayOfWeek: 1 },
  { key: 6, label: 'Jul', name: 'July', year: 2026, daysInMonth: 31, startDayOfWeek: 3 },
  { key: 7, label: 'Aug', name: 'August', year: 2026, daysInMonth: 31, startDayOfWeek: 6 },
  { key: 8, label: 'Sep', name: 'September', year: 2026, daysInMonth: 30, startDayOfWeek: 2 },
  { key: 9, label: 'Oct', name: 'October', year: 2026, daysInMonth: 31, startDayOfWeek: 4 },
  { key: 10, label: 'Nov', name: 'November', year: 2026, daysInMonth: 30, startDayOfWeek: 7 },
  { key: 11, label: 'Dec', name: 'December', year: 2026, daysInMonth: 31, startDayOfWeek: 2 },
  { key: 0, label: 'Jan', name: 'January', year: 2027, daysInMonth: 31, startDayOfWeek: 5 },
  { key: 1, label: 'Feb', name: 'February', year: 2027, daysInMonth: 28, startDayOfWeek: 1 },
  { key: 2, label: 'Mar', name: 'March', year: 2027, daysInMonth: 31, startDayOfWeek: 1 }
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminAcademicCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(9); // Default to October (key 9)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [confirmDeleteInModal, setConfirmDeleteInModal] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    isDateRange: false,
    date: 1,
    endDate: '',
    month: 9,
    year: 2026,
    type: 'school',
    category: 'School Holiday',
    isClosed: true,
    description: ''
  });

  const activeMonth = useMemo(() => {
    return ACADEMIC_MONTHS.find((m) => m.key === selectedMonthKey) || ACADEMIC_MONTHS[6];
  }, [selectedMonthKey]);

  // Fetch holidays from API
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/holidays`);
      if (!res.ok) throw new Error('Failed to retrieve academic holidays');
      const data = await res.json();
      setHolidays(data);
    } catch (err) {
      console.error('Error loading holidays:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Month navigation
  const handlePrevMonth = () => {
    const currentIndex = ACADEMIC_MONTHS.findIndex((m) => m.key === selectedMonthKey);
    const prevIndex = (currentIndex - 1 + ACADEMIC_MONTHS.length) % ACADEMIC_MONTHS.length;
    setSelectedMonthKey(ACADEMIC_MONTHS[prevIndex].key);
  };

  const handleNextMonth = () => {
    const currentIndex = ACADEMIC_MONTHS.findIndex((m) => m.key === selectedMonthKey);
    const nextIndex = (currentIndex + 1) % ACADEMIC_MONTHS.length;
    setSelectedMonthKey(ACADEMIC_MONTHS[nextIndex].key);
  };

  // Filter holidays for current active month
  const monthHolidays = useMemo(() => {
    return holidays.filter((h) => Number(h.month) === Number(selectedMonthKey));
  }, [holidays, selectedMonthKey]);

  // Existing holidays for the selected day in Add Modal
  const existingHolidaysOnDate = useMemo(() => {
    if (!formData.date || editingHoliday) return [];
    const d = Number(formData.date);
    return monthHolidays.filter((h) => {
      if (h.endDate) {
        return d >= h.date && d <= h.endDate;
      }
      return h.date === d;
    });
  }, [formData.date, monthHolidays, editingHoliday]);

  // Count holidays per month for badges
  const holidayCountsByMonth = useMemo(() => {
    const map = {};
    ACADEMIC_MONTHS.forEach((m) => {
      map[m.key] = holidays.filter((h) => Number(h.month) === m.key).length;
    });
    return map;
  }, [holidays]);

  // Filtered holidays based on category filter
  const displayedMonthHolidays = useMemo(() => {
    if (categoryFilter === 'all') return monthHolidays;
    return monthHolidays.filter((h) => h.type === categoryFilter);
  }, [monthHolidays, categoryFilter]);

  // Metrics for active month
  const monthlyMetrics = useMemo(() => {
    const totalDays = activeMonth.daysInMonth;
    let sundayCount = 0;
    const closedDateSet = new Set();
    let specialCount = 0;

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(activeMonth.year, activeMonth.key, day);
      if (d.getDay() === 0) {
        sundayCount++;
      }
    }

    monthHolidays.forEach((h) => {
      if (h.isClosed) {
        const start = Number(h.date);
        const end = h.endDate ? Number(h.endDate) : start;
        for (let d = start; d <= end; d++) {
          if (d >= 1 && d <= totalDays) {
            closedDateSet.add(d);
          }
        }
      } else {
        specialCount++;
      }
    });

    const closedHolidaysCount = closedDateSet.size;
    // Working days estimation (total days - unique non-working days)
    const nonWorkingDays = new Set();
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(activeMonth.year, activeMonth.key, day);
      if (d.getDay() === 0 || closedDateSet.has(day)) {
        nonWorkingDays.add(day);
      }
    }
    const workingDays = Math.max(0, totalDays - nonWorkingDays.size);

    return {
      totalDays,
      closedHolidaysCount,
      workingDays,
      specialCount
    };
  }, [activeMonth, monthHolidays]);

  // Open Add Modal
  const handleOpenAddModal = (presetDate = null) => {
    setEditingHoliday(null);
    setConfirmDeleteInModal(false);
    setFormData({
      name: '',
      isDateRange: false,
      date: presetDate || 1,
      endDate: '',
      month: activeMonth.key,
      year: activeMonth.year,
      type: 'school',
      category: 'School Holiday',
      isClosed: true,
      description: ''
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setConfirmDeleteInModal(false);
    setFormData({
      name: holiday.name,
      isDateRange: Boolean(holiday.endDate),
      date: holiday.date,
      endDate: holiday.endDate || '',
      month: holiday.month,
      year: holiday.year,
      type: holiday.type || 'school',
      category: holiday.category || 'School Holiday',
      isClosed: holiday.isClosed !== undefined ? holiday.isClosed : true,
      description: holiday.description || ''
    });
    setShowModal(true);
  };

  // Submit Add or Edit
  const handleSubmitHoliday = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setFormSubmitting(true);
    try {
      const targetMonthObj = ACADEMIC_MONTHS.find((m) => m.key === Number(formData.month)) || activeMonth;
      const year = targetMonthObj.year;
      const dateNum = Number(formData.date);
      const endDateNum = formData.isDateRange && formData.endDate ? Number(formData.endDate) : null;

      // Auto-compute day of week if single day
      let dayOfWeek = '';
      if (!endDateNum) {
        const d = new Date(year, targetMonthObj.key, dateNum);
        dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
      } else {
        const daysDiff = endDateNum - dateNum + 1;
        dayOfWeek = `Multi-day (${daysDiff} Days)`;
      }

      // Auto compute date display
      let dateDisplay = '';
      if (endDateNum) {
        dateDisplay = `${dateNum} – ${endDateNum}`;
      } else {
        dateDisplay = dateNum < 10 ? `0${dateNum}` : `${dateNum}`;
      }

      const payload = {
        name: formData.name.trim(),
        date: dateNum,
        endDate: endDateNum,
        dateDisplay,
        month: targetMonthObj.key,
        monthName: targetMonthObj.name,
        year,
        dayOfWeek,
        type: formData.type,
        category: formData.category,
        isClosed: formData.isClosed,
        description: formData.description.trim(),
        academicYear: '2026-2027'
      };

      if (editingHoliday) {
        const res = await fetch(`${API_BASE_URL}/api/holidays/${editingHoliday.id || editingHoliday._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update holiday');
        const updated = await res.json();
        setHolidays((prev) =>
          prev.map((h) => (h.id === updated.id || h._id === updated._id ? updated : h))
        );
        showToast(`Updated "${payload.name}" successfully!`);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/holidays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to add holiday');
        const created = await res.json();
        setHolidays((prev) => [...prev, created]);
        showToast(`Added "${payload.name}" to ${targetMonthObj.name} calendar!`);
      }

      setShowModal(false);
      setEditingHoliday(null);
    } catch (err) {
      console.error('Error saving holiday:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete holiday
  const handleDeleteHoliday = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete holiday');
      setHolidays((prev) => prev.filter((h) => (h.id || h._id) !== id));
      setDeleteConfirmId(null);
      setConfirmDeleteInModal(false);
      if (editingHoliday && ((editingHoliday.id || editingHoliday._id) === id)) {
        setShowModal(false);
        setEditingHoliday(null);
      }
      showToast(`Holiday "${name}" removed from calendar.`);
    } catch (err) {
      showToast(`Failed to remove holiday: ${err.message}`);
    }
  };

  // Reset defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all academic calendar holidays to Tripura standard defaults for 2026-2027? Any custom adjustments will be restored.')) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/holidays/reset`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reset default calendar');
      await fetchHolidays();
      showToast('Academic calendar reset to standard school session defaults.');
    } catch (err) {
      showToast(`Reset error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Type color & badge helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'national':
        return { label: 'National Holiday', className: 'type-badge national', icon: Flag };
      case 'state':
        return { label: 'State Holiday', className: 'type-badge state', icon: Building2 };
      case 'school':
        return { label: 'School Vacation / Recess', className: 'type-badge school', icon: Palmtree };
      case 'special':
        return { label: 'Special Observance', className: 'type-badge special', icon: Sparkles };
      default:
        return { label: 'School Holiday', className: 'type-badge school', icon: CalendarDays };
    }
  };

  // Build calendar matrix for current month
  const calendarDaysMatrix = useMemo(() => {
    const matrix = [];
    const firstDayIndex = new Date(activeMonth.year, activeMonth.key, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDays = activeMonth.daysInMonth;

    // Pad blank days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      matrix.push({ day: null, isCurrentMonth: false });
    }

    // Month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(activeMonth.year, activeMonth.key, day);
      const isSunday = d.getDay() === 0;

      // Find holidays affecting this day
      const dayHolidays = monthHolidays.filter((h) => {
        const start = Number(h.date);
        const end = h.endDate ? Number(h.endDate) : start;
        return day >= start && day <= end;
      });

      matrix.push({
        day,
        isCurrentMonth: true,
        isSunday,
        holidays: dayHolidays
      });
    }

    return matrix;
  }, [activeMonth, monthHolidays]);

  return (
    <div className="admin-calendar-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="calendar-toast">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Overview */}
      <div className="admin-calendar-header">
        <div className="header-left">
          <div className="calendar-title-row">
            <span className="badge-tag">Academic Session 2026 – 2027</span>
            <h2>Academic Calendar & Holidays Manager</h2>
          </div>
          <p className="calendar-subtitle">
            Configure official school holidays, term breaks, state celebrations, and observational events for each month.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="action-btn-outline"
            onClick={handleResetDefaults}
            title="Restore standard school calendar defaults"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            className="action-btn-primary"
            onClick={() => handleOpenAddModal()}
          >
            <Plus size={17} />
            <span>Add Holiday / Recess</span>
          </button>
        </div>
      </div>

      {/* Academic Year Month Pills Selector */}
      <div className="academic-months-bar">
        <div className="months-scroll-container">
          {ACADEMIC_MONTHS.map((m) => {
            const count = holidayCountsByMonth[m.key] || 0;
            const isActive = m.key === selectedMonthKey;
            return (
              <button
                key={m.key}
                type="button"
                className={`month-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedMonthKey(m.key)}
              >
                <span className="month-label">{m.label}</span>
                <span className="month-year">{m.year}</span>
                {count > 0 && (
                  <span className={`month-badge ${isActive ? 'active' : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Banner with Controls & Quick Metrics */}
      <div className="month-banner-card">
        <div className="month-banner-top">
          <div className="month-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="month-stepper-title">
              <h3>
                {activeMonth.name} {activeMonth.year}
              </h3>
              <span>{monthHolidays.length} Holidays & Observances Scheduled</span>
            </div>
            <button
              type="button"
              className="stepper-btn"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-group">
            <span className="filter-label">
              <Filter size={14} /> Filter:
            </span>
            <button
              type="button"
              className={`filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All ({monthHolidays.length})
            </button>
            <button
              type="button"
              className={`filter-pill national ${categoryFilter === 'national' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('national')}
            >
              National
            </button>
            <button
              type="button"
              className={`filter-pill state ${categoryFilter === 'state' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('state')}
            >
              State / Gazetted
            </button>
            <button
              type="button"
              className={`filter-pill school ${categoryFilter === 'school' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('school')}
            >
              School Vacation
            </button>
            <button
              type="button"
              className={`filter-pill special ${categoryFilter === 'special' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('special')}
            >
              Special Observance
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="month-metrics-row">
          <div className="metric-box">
            <span className="metric-num">{monthlyMetrics.totalDays}</span>
            <span className="metric-name">Days in {activeMonth.name}</span>
          </div>
          <div className="metric-box holiday-box">
            <span className="metric-num closed">{monthlyMetrics.closedHolidaysCount}</span>
            <span className="metric-name">School Closed Days</span>
          </div>
          <div className="metric-box working-box">
            <span className="metric-num working">{monthlyMetrics.workingDays}</span>
            <span className="metric-name">Working Days (Synced to Attendance)</span>
          </div>
          <div className="metric-box special-box">
            <span className="metric-num special">{monthlyMetrics.specialCount}</span>
            <span className="metric-name">Observances & Activities</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Visual Grid on Left, Adjustments List on Right */}
      <div className="calendar-grid-content-split">
        {/* Left Column: Interactive Month Calendar Grid */}
        <div className="calendar-view-pane">
          <div className="pane-header">
            <div className="pane-title">
              <CalendarDays size={18} className="pane-icon" />
              <h4>{activeMonth.name} {activeMonth.year} Calendar Grid</h4>
            </div>
            <span className="pane-hint">Click any date to add or inspect a holiday</span>
          </div>

          <div className="month-calendar-grid">
            {/* Weekday headers */}
            <div className="calendar-weekdays-row">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={day} className={`weekday-col-label ${idx === 0 ? 'sunday-col' : ''}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Matrix of Days */}
            <div className="calendar-cells-grid">
              {calendarDaysMatrix.map((cell, index) => {
                if (!cell.isCurrentMonth) {
                  return <div key={`blank-${index}`} className="calendar-day-cell blank" />;
                }

                const hasHolidays = cell.holidays && cell.holidays.length > 0;
                const hasClosed = hasHolidays && cell.holidays.some((h) => h.isClosed);
                const primaryHoliday = hasHolidays ? cell.holidays[0] : null;

                return (
                  <div
                    key={`day-${cell.day}`}
                    className={`calendar-day-cell current-month ${
                      cell.isSunday ? 'sunday-cell' : ''
                    } ${hasHolidays ? 'has-holiday' : ''} ${
                      primaryHoliday ? `type-${primaryHoliday.type}` : ''
                    }`}
                    onClick={() => {
                      if (hasHolidays && cell.holidays.length === 1) {
                        handleOpenEditModal(cell.holidays[0]);
                      } else {
                        handleOpenAddModal(cell.day);
                      }
                    }}
                    title={
                      hasHolidays
                        ? `${cell.holidays.map((h) => `${h.name} (${h.category})`).join('\n')}\nClick to view/edit or remove holiday`
                        : `Click to schedule holiday for ${cell.day} ${activeMonth.name}`
                    }
                  >
                    <div className="cell-top-row">
                      <span className={`cell-day-num ${cell.isSunday ? 'sunday-num' : ''}`}>
                        {cell.day}
                      </span>
                      {cell.isSunday && !hasHolidays && (
                        <span className="sunday-tag">Sun</span>
                      )}
                      <button
                        type="button"
                        className="cell-quick-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(cell.day);
                        }}
                        title={`Add holiday on ${cell.day} ${activeMonth.name}`}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Holiday Pills Inside Date Cell */}
                    <div className="cell-events-list">
                      {cell.holidays.map((h) => (
                        <div
                          key={h.id || h._id}
                          className={`cell-holiday-chip ${h.type || 'school'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(h);
                          }}
                          title={`Click to edit "${h.name}"`}
                        >
                          <span className="chip-bullet">•</span>
                          <span className="chip-name">{h.name}</span>
                          <button
                            type="button"
                            className="cell-chip-del-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Remove holiday "${h.name}" from calendar?`)) {
                                handleDeleteHoliday(h.id || h._id, h.name);
                              }
                            }}
                            title={`Remove "${h.name}"`}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Legend */}
          <div className="calendar-legend-bar">
            <div className="legend-item">
              <span className="legend-color national" />
              <span>National Holiday</span>
            </div>
            <div className="legend-item">
              <span className="legend-color state" />
              <span>State / Gazetted</span>
            </div>
            <div className="legend-item">
              <span className="legend-color school" />
              <span>School Vacation</span>
            </div>
            <div className="legend-item">
              <span className="legend-color special" />
              <span>Observance</span>
            </div>
            <div className="legend-item">
              <span className="legend-color sunday" />
              <span>Sunday (Weekly Off)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Month's Holiday Adjustment List */}
        <div className="holidays-adjust-pane">
          <div className="pane-header">
            <div>
              <div className="pane-title">
                <Palmtree size={18} className="pane-icon" />
                <h4>Holidays in {activeMonth.name}</h4>
              </div>
              <span className="pane-hint">
                {displayedMonthHolidays.length} configured holiday / break entry
              </span>
            </div>

            <button
              type="button"
              className="add-holiday-quick-btn"
              onClick={() => handleOpenAddModal()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          <div className="holidays-scroll-list">
            {loading ? (
              <div className="calendar-loading-state">
                <div className="spinner-border" />
                <p>Loading {activeMonth.name} holidays from database...</p>
              </div>
            ) : displayedMonthHolidays.length === 0 ? (
              <div className="empty-holidays-state">
                <CalendarCheck2 size={44} className="empty-icon" />
                <h5>No Holidays for {activeMonth.name}</h5>
                <p>
                  No holiday or recess has been scheduled for this month yet. You can add one anytime.
                </p>
                <button
                  type="button"
                  className="action-btn-primary mini"
                  onClick={() => handleOpenAddModal()}
                >
                  <Plus size={15} />
                  <span>Add First Holiday</span>
                </button>
              </div>
            ) : (
              displayedMonthHolidays.map((holiday) => {
                const badgeInfo = getTypeBadge(holiday.type);
                const BadgeIcon = badgeInfo.icon;
                const hId = holiday.id || holiday._id;

                return (
                  <div key={hId} className={`holiday-manage-card ${holiday.type || 'school'}`}>
                    <div className="card-side-badge">
                      <span className="badge-day">{holiday.dateDisplay || holiday.date}</span>
                      <span className="badge-month">{activeMonth.label.toUpperCase()}</span>
                    </div>

                    <div className="card-body-content">
                      <div className="card-meta-row">
                        <span className={badgeInfo.className}>
                          <BadgeIcon size={12} />
                          {holiday.category || badgeInfo.label}
                        </span>

                        <span className={`closure-pill ${holiday.isClosed ? 'closed' : 'open'}`}>
                          {holiday.isClosed ? 'School Closed' : 'Observance Day'}
                        </span>

                        {holiday.dayOfWeek && (
                          <span className="weekday-pill">{holiday.dayOfWeek}</span>
                        )}
                      </div>

                      <h4 className="holiday-title">{holiday.name}</h4>

                      {holiday.description && (
                        <p className="holiday-desc">{holiday.description}</p>
                      )}
                    </div>

                    <div className="card-actions-col">
                      <button
                        type="button"
                        className="holiday-edit-btn"
                        onClick={() => handleOpenEditModal(holiday)}
                        title="Edit Holiday"
                      >
                        <Pencil size={15} />
                      </button>

                      {deleteConfirmId === hId ? (
                        <div className="delete-confirm-box">
                          <button
                            type="button"
                            className="confirm-yes-btn"
                            onClick={() => handleDeleteHoliday(hId, holiday.name)}
                            title="Confirm Delete"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="confirm-no-btn"
                            onClick={() => setDeleteConfirmId(null)}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="holiday-delete-btn"
                          onClick={() => setDeleteConfirmId(hId)}
                          title="Delete Holiday"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT HOLIDAY */}
      {showModal && (
        <div className="calendar-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="calendar-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h4>{editingHoliday ? 'Adjust / Edit Holiday' : 'Add School Holiday or Recess'}</h4>
                <p>Academic Year 2026 – 2027 • PM SHRI Moharcherra H.S. School</p>
              </div>
              <div className="dialog-header-actions">
                {editingHoliday && (
                  <button
                    type="button"
                    className="header-delete-holiday-btn"
                    onClick={() => setConfirmDeleteInModal(true)}
                    title="Remove this holiday from calendar"
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                )}
                <button
                  type="button"
                  className="close-dialog-btn"
                  onClick={() => setShowModal(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitHoliday} className="dialog-form">
              {/* Existing Holiday Prompt when in Add mode on a date that already has a holiday */}
              {!editingHoliday && existingHolidaysOnDate.length > 0 && (
                <div className="existing-holidays-card">
                  <div className="existing-holidays-header">
                    <Info size={16} className="existing-info-icon" />
                    <span>Existing Holiday{existingHolidaysOnDate.length > 1 ? 's' : ''} on {activeMonth.name} {formData.date}:</span>
                  </div>
                  <div className="existing-holidays-list">
                    {existingHolidaysOnDate.map((eh) => (
                      <div key={eh.id || eh._id} className="existing-holiday-item">
                        <div className="existing-item-info">
                          <span className="existing-item-name">{eh.name}</span>
                          <span className="existing-item-category">({eh.category || 'Holiday'})</span>
                        </div>
                        <div className="existing-item-actions">
                          <button
                            type="button"
                            className="existing-edit-btn"
                            onClick={() => handleOpenEditModal(eh)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="existing-remove-btn"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove "${eh.name}" from the academic calendar?`)) {
                                handleDeleteHoliday(eh.id || eh._id, eh.name);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Holiday Name */}
              <div className="form-group">
                <label className="form-label">
                  Holiday / Occasion Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Durga Puja Holidays, Gandhi Jayanti, Local Recess..."
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Month & Single vs Date Range toggle */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Month & Year</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) => {
                      const mKey = Number(e.target.value);
                      const mObj = ACADEMIC_MONTHS.find((m) => m.key === mKey);
                      setFormData({
                        ...formData,
                        month: mKey,
                        year: mObj ? mObj.year : 2026
                      });
                    }}
                  >
                    {ACADEMIC_MONTHS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.name} {m.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration Type</label>
                  <div className="range-toggle-group">
                    <button
                      type="button"
                      className={`range-pill ${!formData.isDateRange ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, isDateRange: false, endDate: '' })}
                    >
                      Single Day
                    </button>
                    <button
                      type="button"
                      className={`range-pill ${formData.isDateRange ? 'active' : ''}`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isDateRange: true,
                          endDate: formData.endDate || formData.date
                        })
                      }
                    >
                      Multi-day Vacation
                    </button>
                  </div>
                </div>
              </div>

              {/* Date pickers */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    {formData.isDateRange ? 'Start Day of Month' : 'Day of Month'}{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: Number(e.target.value) })}
                  />
                </div>

                {formData.isDateRange && (
                  <div className="form-group">
                    <label className="form-label">
                      End Day of Month <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      min={formData.date || 1}
                      max="31"
                      required={formData.isDateRange}
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              {/* Holiday Classification & Category */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Holiday Category</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newCat = 'School Holiday';
                      if (newType === 'national') newCat = 'National Holiday';
                      if (newType === 'state') newCat = 'State Holiday';
                      if (newType === 'school') newCat = 'School Vacation';
                      if (newType === 'special') newCat = 'Special Observance';
                      setFormData({
                        ...formData,
                        type: newType,
                        category: newCat,
                        isClosed: newType !== 'special'
                      });
                    }}
                  >
                    <option value="school">School Holiday / Vacation</option>
                    <option value="state">State / Gazetted Holiday (Tripura)</option>
                    <option value="national">National Holiday (India)</option>
                    <option value="special">Special Observance / Celebration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">School Closure Status</label>
                  <div className="closure-radio-group">
                    <label className="closure-radio-label">
                      <input
                        type="radio"
                        name="isClosed"
                        checked={formData.isClosed === true}
                        onChange={() => setFormData({ ...formData, isClosed: true })}
                      />
                      <span>School Closed (No Classes)</span>
                    </label>
                    <label className="closure-radio-label">
                      <input
                        type="radio"
                        name="isClosed"
                        checked={formData.isClosed === false}
                        onChange={() => setFormData({ ...formData, isClosed: false })}
                      />
                      <span>Observance (Special Assembly / Programs)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description / Notes */}
              <div className="form-group">
                <label className="form-label">Description / Circular Guidelines</label>
                <textarea
                  rows="3"
                  placeholder="e.g. In observance of birth anniversary, school remains closed for all classes. Flag hoisting at 08:30 AM."
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Dialog Footer Actions */}
              <div className="dialog-footer">
                {editingHoliday ? (
                  <div className="dialog-delete-wrapper">
                    {confirmDeleteInModal ? (
                      <div className="modal-delete-confirm-box">
                        <span className="confirm-text">Confirm removal?</span>
                        <button
                          type="button"
                          className="confirm-yes-btn-danger"
                          onClick={() => handleDeleteHoliday(editingHoliday.id || editingHoliday._id, editingHoliday.name)}
                        >
                          Yes, Remove
                        </button>
                        <button
                          type="button"
                          className="confirm-no-btn-subtle"
                          onClick={() => setConfirmDeleteInModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="modal-delete-trigger-btn"
                        onClick={() => setConfirmDeleteInModal(true)}
                        title="Remove this holiday from calendar"
                      >
                        <Trash2 size={15} />
                        <span>Remove Holiday</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="dialog-footer-spacer" />
                )}

                <div className="dialog-footer-right">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="submit-btn"
                  >
                    {formSubmitting ? (
                      'Saving...'
                    ) : editingHoliday ? (
                      'Update Holiday'
                    ) : (
                      'Save to Calendar'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicCalendar;
