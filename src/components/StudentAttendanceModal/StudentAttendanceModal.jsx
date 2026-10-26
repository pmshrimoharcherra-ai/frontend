import React, { useState, useMemo, useEffect } from 'react';
import './StudentAttendanceModal.css';
import {
  CalendarCheck,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  User,
  Plus,
  Minus,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getAcademicMonthsWithWorkingDays,
  fetchCalendarHolidays,
  ACADEMIC_MONTHS_BASE
} from '../../utils/calendarAttendance';

const StudentAttendanceModal = ({ student, className, onClose, onSave }) => {
  if (!student) return null;

  // Selected month state
  const [selectedMonthId, setSelectedMonthId] = useState('2026-10');
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'calendar'
  const [holidays, setHolidays] = useState([]);

  // Fetch live holidays from Academic Calendar
  useEffect(() => {
    fetchCalendarHolidays().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setHolidays(data);
      }
    });
  }, []);

  // Compute live academic months list with working days linked to holidays
  const academicMonths = useMemo(() => {
    return getAcademicMonthsWithWorkingDays(holidays);
  }, [holidays]);

  // Extract or initialize monthly records
  const initialMonthlyData = useMemo(() => {
    const existing = student.monthlyAttendance || {};
    const defaultData = {};

    academicMonths.forEach(m => {
      if (existing[m.id]) {
        defaultData[m.id] = {
          ...existing[m.id],
          workingDays: m.workingDays,
          presentDays: Math.min(m.workingDays, existing[m.id].presentDays ?? m.workingDays)
        };
      } else {
        // Derive reasonable default from student.attendance
        const overallPct = parseInt(student.attendance, 10) || 95;
        const present = Math.round((m.workingDays * overallPct) / 100);
        defaultData[m.id] = {
          workingDays: m.workingDays,
          presentDays: Math.min(m.workingDays, Math.max(0, present)),
          notes: ''
        };
      }
    });
    return defaultData;
  }, [student, academicMonths]);

  const [monthlyRecords, setMonthlyRecords] = useState(initialMonthlyData);

  // Sync monthlyRecords when academicMonths working days change
  useEffect(() => {
    setMonthlyRecords(prev => {
      const updated = { ...prev };
      academicMonths.forEach(m => {
        const currentRec = prev[m.id];
        const studentExisting = student.monthlyAttendance?.[m.id];
        if (currentRec) {
          updated[m.id] = {
            ...currentRec,
            workingDays: m.workingDays,
            presentDays: Math.min(m.workingDays, currentRec.presentDays)
          };
        } else if (studentExisting) {
          updated[m.id] = {
            ...studentExisting,
            workingDays: m.workingDays,
            presentDays: Math.min(m.workingDays, studentExisting.presentDays)
          };
        } else {
          const overallPct = parseInt(student.attendance, 10) || 95;
          const present = Math.round((m.workingDays * overallPct) / 100);
          updated[m.id] = {
            workingDays: m.workingDays,
            presentDays: Math.min(m.workingDays, Math.max(0, present)),
            notes: ''
          };
        }
      });
      return updated;
    });
  }, [academicMonths, student]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const currentMonthConfig = academicMonths.find(m => m.id === selectedMonthId) || academicMonths[6];
  const currentMonthRecord = monthlyRecords[selectedMonthId] || {
    workingDays: currentMonthConfig.workingDays,
    presentDays: Math.max(0, currentMonthConfig.workingDays - 1),
    notes: ''
  };

  const workingDays = currentMonthRecord.workingDays;
  const presentDays = currentMonthRecord.presentDays;
  const absentDays = Math.max(0, workingDays - presentDays);
  const monthlyPercentage = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : 0;

  // Handle Days Present update
  const handleUpdatePresent = (newPresent) => {
    const safePresent = Math.max(0, Math.min(workingDays, Number(newPresent)));
    setMonthlyRecords(prev => ({
      ...prev,
      [selectedMonthId]: {
        ...prev[selectedMonthId],
        presentDays: safePresent
      }
    }));
  };

  // Handle Working Days update
  const handleUpdateWorking = (newWorking) => {
    const safeWorking = Math.max(1, Math.min(31, Number(newWorking)));
    setMonthlyRecords(prev => ({
      ...prev,
      [selectedMonthId]: {
        ...prev[selectedMonthId],
        workingDays: safeWorking,
        presentDays: Math.min(prev[selectedMonthId].presentDays, safeWorking)
      }
    }));
  };

  // Step +/- handlers
  const stepPresent = (delta) => {
    handleUpdatePresent(presentDays + delta);
  };

  // Calculate annual cumulative attendance
  const annualStats = useMemo(() => {
    let totalWorking = 0;
    let totalPresent = 0;
    Object.values(monthlyRecords).forEach(rec => {
      totalWorking += (rec.workingDays || 0);
      totalPresent += (rec.presentDays || 0);
    });
    const pct = totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(1) : 0;
    return {
      totalWorking,
      totalPresent,
      totalAbsent: totalWorking - totalPresent,
      percentage: pct
    };
  }, [monthlyRecords]);

  // Save handler
  const handleSave = () => {
    const updatedStudent = {
      ...student,
      attendance: `${monthlyPercentage}%`,
      monthlyAttendance: monthlyRecords
    };
    onSave(updatedStudent);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      onClose();
    }, 900);
  };

  // Helper for status badge
  const getAttendanceStatus = (pct) => {
    const num = parseFloat(pct);
    if (num >= 90) return { label: 'Excellent Regularity', color: 'green' };
    if (num >= 75) return { label: 'Satisfactory', color: 'amber' };
    return { label: 'Defaulter Alert (<75%)', color: 'red' };
  };

  const statusInfo = getAttendanceStatus(monthlyPercentage);

  return (
    <div className="attendance-modal-backdrop" onClick={onClose}>
      <div className="attendance-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="attendance-modal-header">
          <div className="header-student-profile">
            <div className="student-modal-avatar">
              {student.name.charAt(0)}
            </div>
            <div className="student-profile-info">
              <div className="student-title-row">
                <h3>{student.name}</h3>
                <span className="roll-chip">Roll: #{student.roll}</span>
                <span className="class-chip">{className || student.class}</span>
              </div>
              <p className="student-meta-sub">
                {['class-9', 'class-11-arts', 'class-11-sci'].includes(student.classId) ? (
                  <>
                    Enrollment No: <code>{student.enrollmentNo || '—'}</code> · Year: <code>{student.enrollmentYear || (student.classId?.includes('11') ? '2024' : '2026')}</code> ·{' '}
                  </>
                ) : (
                  !['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'].includes(student.classId) && (
                    <>Student ID: <code>{student.id}</code> · </>
                  )
                )}
                Guardian: {student.guardian || '—'} · Phone: {student.phone || '—'}
              </p>
            </div>
          </div>

          <button className="modal-close-cross" onClick={onClose} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="attendance-modal-body">
          {/* Month Selector Bar */}
          <div className="month-selector-bar">
            <div className="selector-title">
              <Calendar size={18} className="cal-icon" />
              <span>Select Academic Month:</span>
            </div>
            <div className="month-select-wrapper">
              <select
                value={selectedMonthId}
                onChange={e => setSelectedMonthId(e.target.value)}
                className="month-dropdown"
              >
                {academicMonths.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.workingDays} Working Days) {m.isCurrent ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Tab Switcher */}
            <div className="attendance-view-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
                onClick={() => setActiveTab('quick')}
              >
                Quick Counter
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                Daily Sheet
              </button>
            </div>
          </div>

          {/* MAIN ATTENDANCE CARD FOR SELECTED MONTH */}
          <div className="monthly-marking-panel">
            <div className="panel-header-row">
              <div className="panel-month-name">
                <h4>{currentMonthConfig.name}</h4>
                <span className="academic-session-tag">Academic Session: 2026-27</span>
              </div>
              <div className={`status-pill ${statusInfo.color}`}>
                <Award size={14} />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            {activeTab === 'quick' ? (
              /* TAB 1: QUICK DAYS COUNTER & STEPPERS */
              <div className="quick-marking-grid">
                {/* 1. Working Days */}
                <div className="metric-adjust-card">
                  <div className="metric-card-label-row">
                    <span className="metric-card-label">Total School Working Days</span>
                    <span className="sync-calendar-badge" title="Automatically calculated from declared school holidays in Academic Calendar">
                      <Sparkles size={11} /> Linked to Calendar
                    </span>
                  </div>
                  <div className="metric-input-row">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={workingDays}
                      onChange={e => handleUpdateWorking(e.target.value)}
                      className="metric-number-input"
                    />
                    <span className="unit-label">Days</span>
                  </div>
                  <span className="metric-hint">
                    Official days school was open in {currentMonthConfig.name.split(' ')[0]} ({currentMonthConfig.closedHolidayCount || 0} holidays in month)
                  </span>
                </div>

                {/* 2. Days Present (CORE FIELD) */}
                <div className="metric-adjust-card highlight-card">
                  <span className="metric-card-label">Days Present (Attendance)</span>
                  <div className="stepper-control-row">
                    <button
                      type="button"
                      className="stepper-btn minus"
                      onClick={() => stepPresent(-1)}
                      disabled={presentDays <= 0}
                      title="Decrease by 1 day"
                    >
                      <Minus size={18} />
                    </button>

                    <div className="metric-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max={workingDays}
                        value={presentDays}
                        onChange={e => handleUpdatePresent(e.target.value)}
                        className="metric-number-input large"
                      />
                      <span className="present-ratio">/ {workingDays} days</span>
                    </div>

                    <button
                      type="button"
                      className="stepper-btn plus"
                      onClick={() => stepPresent(1)}
                      disabled={presentDays >= workingDays}
                      title="Increase by 1 day"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="quick-presets-row">
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => handleUpdatePresent(workingDays)}
                    >
                      Full (100%)
                    </button>
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => handleUpdatePresent(Math.max(0, workingDays - 1))}
                    >
                      -1 Day
                    </button>
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => handleUpdatePresent(Math.max(0, workingDays - 2))}
                    >
                      -2 Days
                    </button>
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() => handleUpdatePresent(Math.round(workingDays * 0.75))}
                    >
                      75% Min
                    </button>
                  </div>
                </div>

                {/* 3. Days Absent */}
                <div className="metric-adjust-card absent-card">
                  <span className="metric-card-label">Days Absent / On Leave</span>
                  <div className="metric-stat-display">
                    <h3 className="absent-number">{absentDays}</h3>
                    <span className="unit-label">Days</span>
                  </div>
                  <span className="metric-hint">Auto-calculated ({workingDays} - {presentDays})</span>
                </div>

                {/* 4. Calculated Monthly Percentage */}
                <div className="metric-adjust-card percentage-card">
                  <span className="metric-card-label">Monthly Attendance Rate</span>
                  <div className="percentage-display-row">
                    <h2 className={`percentage-value ${statusInfo.color}`}>
                      {monthlyPercentage}%
                    </h2>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className={`progress-fill ${statusInfo.color}`}
                      style={{ width: `${Math.min(100, Math.max(0, monthlyPercentage))}%` }}
                    />
                  </div>
                  <span className="metric-hint">Requirement for TBSE: 75% minimum</span>
                </div>
              </div>
            ) : (
              /* TAB 2: INTERACTIVE DAY-BY-DAY SHEET */
              <div className="calendar-sheet-view">
                <div className="sheet-instructions">
                  <Clock size={15} />
                  <span>
                    Click any day number to toggle <strong>Present (Green)</strong> or <strong>Absent (Red)</strong>. Sundays are highlighted as off-days.
                  </span>
                </div>

                <div className="days-chip-grid">
                  {Array.from({ length: workingDays }, (_, i) => i + 1).map(day => {
                    const isPresent = day <= presentDays;
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`day-chip ${isPresent ? 'present' : 'absent'}`}
                        onClick={() => {
                          // Toggle day
                          if (isPresent) {
                            handleUpdatePresent(day - 1);
                          } else {
                            handleUpdatePresent(day);
                          }
                        }}
                      >
                        <span className="day-num">Day {day}</span>
                        <span className="day-status">{isPresent ? 'P' : 'A'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="sheet-summary-line">
                  <span>Marked: <strong>{presentDays} Present</strong> · <strong>{absentDays} Absent</strong> ({monthlyPercentage}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* ANNUAL SESSION BREAKDOWN TABLE */}
          <div className="annual-history-section">
            <div className="section-title-row">
              <h4>Academic Session 2026-27 Monthly Breakdown</h4>
              <div className="cumulative-badge">
                <span>Cumulative Annual Attendance:</span>
                <strong>{annualStats.percentage}%</strong>
                <span className="cum-days">({annualStats.totalPresent} / {annualStats.totalWorking} days)</span>
              </div>
            </div>

            <div className="annual-table-wrapper">
              <table className="mini-annual-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Working Days</th>
                    <th>Present Days</th>
                    <th>Absent Days</th>
                    <th>Rate %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {academicMonths.map(m => {
                    const rec = monthlyRecords[m.id] || { workingDays: m.workingDays, presentDays: m.workingDays };
                    const rate = rec.workingDays > 0 ? ((rec.presentDays / rec.workingDays) * 100).toFixed(1) : 0;
                    const isSelected = m.id === selectedMonthId;

                    return (
                      <tr
                        key={m.id}
                        className={`${isSelected ? 'selected-month-row' : ''}`}
                        onClick={() => setSelectedMonthId(m.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to switch to this month"
                      >
                        <td className="month-cell">
                          <strong>{m.name}</strong>
                          {m.isCurrent && <span className="now-pill">Current</span>}
                        </td>
                        <td>{rec.workingDays}</td>
                        <td className="present-cell">{rec.presentDays}</td>
                        <td className="absent-cell">{rec.workingDays - rec.presentDays}</td>
                        <td>
                          <span className={`rate-pill-mini ${parseFloat(rate) >= 85 ? 'green' : parseFloat(rate) >= 75 ? 'amber' : 'red'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td>
                          <span className="status-note">
                            {parseFloat(rate) >= 75 ? 'Eligible' : 'Low Attendance'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="attendance-modal-footer">
          {saveSuccessMsg && (
            <div className="save-toast-banner">
              <CheckCircle2 size={16} />
              <span>Attendance record successfully updated for {student.name}!</span>
            </div>
          )}

          <div className="action-buttons-group">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-modal-save" onClick={handleSave}>
              <CheckCircle2 size={17} />
              <span>Save & Update {currentMonthConfig.name.split(' ')[0]} Attendance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceModal;
