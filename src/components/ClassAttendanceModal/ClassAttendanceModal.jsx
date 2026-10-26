import React, { useState, useEffect, useMemo } from 'react';
import './ClassAttendanceModal.css';
import {
  CalendarCheck,
  Calendar,
  X,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  getAcademicMonthsWithWorkingDays,
  fetchCalendarHolidays,
  ACADEMIC_MONTHS_BASE
} from '../../utils/calendarAttendance';

const ClassAttendanceModal = ({
  currentClass,
  students,
  onClose,
  onSaveClassAttendance,
  onOpenIndividualStudent
}) => {
  const isEnrollmentClass = ['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(currentClass?.id);
  const isClass1to8 = ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'].includes(currentClass?.id);
  const showStudentId = false;

  const renderEnrollmentBadge = (enr) => {
    if (!enr || enr === '—') return <span style={{ color: '#94a3b8' }}>—</span>;
    if (enr === 'Not found') {
      return <span className="not-found-badge mini">Not found</span>;
    }
    if (enr.toLowerCase().includes('duplicate')) {
      return <span className="verify-duplicate-badge mini">Verify duplicate</span>;
    }
    if (enr.toLowerCase().includes('spelling')) {
      return <span className="verify-spelling-badge mini">Verify spelling</span>;
    }
    const hasAsterisk = enr.endsWith('*');
    const cleanNumber = hasAsterisk ? enr.slice(0, -1) : enr;
    return (
      <code>
        {cleanNumber}
        {hasAsterisk && <span style={{ color: '#ea580c', fontWeight: 900 }}>*</span>}
      </code>
    );
  };

  const [selectedMonthId, setSelectedMonthId] = useState('2026-10');
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

  const monthConfig = academicMonths.find(m => m.id === selectedMonthId) || academicMonths[6];
  const [workingDays, setWorkingDays] = useState(monthConfig.workingDays);

  // Keep workingDays in sync when calendar holidays or active month changes
  useEffect(() => {
    if (monthConfig) {
      setWorkingDays(monthConfig.workingDays);
    }
  }, [monthConfig]);

  // Local state mapping studentId -> presentDays
  const [attendanceMap, setAttendanceMap] = useState(() => {
    const map = {};
    students.forEach(st => {
      const existing = st.monthlyAttendance?.[selectedMonthId]?.presentDays;
      if (existing !== undefined) {
        map[st.id] = Math.min(monthConfig.workingDays, existing);
      } else {
        const pct = parseInt(st.attendance, 10) || 95;
        map[st.id] = Math.round((monthConfig.workingDays * pct) / 100);
      }
    });
    return map;
  });

  const [savedBanner, setSavedBanner] = useState(false);

  // Month change
  const handleMonthChange = (newMonthId) => {
    setSelectedMonthId(newMonthId);
    const m = academicMonths.find(item => item.id === newMonthId) || monthConfig;
    setWorkingDays(m.workingDays);
    // Reload mapped values
    const newMap = {};
    students.forEach(st => {
      const existing = st.monthlyAttendance?.[newMonthId]?.presentDays;
      if (existing !== undefined) {
        newMap[st.id] = Math.min(m.workingDays, existing);
      } else {
        const pct = parseInt(st.attendance, 10) || 95;
        newMap[st.id] = Math.round((m.workingDays * pct) / 100);
      }
    });
    setAttendanceMap(newMap);
  };

  const handleUpdateStudentDays = (studentId, val) => {
    const num = Math.max(0, Math.min(workingDays, Number(val) || 0));
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: num
    }));
  };

  const handleMarkAllFull = () => {
    const updated = {};
    students.forEach(st => {
      updated[st.id] = workingDays;
    });
    setAttendanceMap(updated);
  };

  const handleSave = () => {
    // Generate updated students array
    const updatedStudents = students.map(st => {
      const present = attendanceMap[st.id] ?? workingDays;
      const pct = workingDays > 0 ? ((present / workingDays) * 100).toFixed(0) : 100;
      const existingMonthly = st.monthlyAttendance || {};

      return {
        ...st,
        attendance: `${pct}%`,
        monthlyAttendance: {
          ...existingMonthly,
          [selectedMonthId]: {
            workingDays,
            presentDays: present
          }
        }
      };
    });

    onSaveClassAttendance(updatedStudents);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 900);
  };

  return (
    <div className="class-att-backdrop" onClick={onClose}>
      <div className="class-att-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="class-att-header">
          <div>
            <div className="class-att-badge-row">
              <h3>{currentClass.name} — Monthly Attendance Register</h3>
              <span className="class-wing-pill">{currentClass.wing}</span>
            </div>
            <p className="class-att-sub">
              Total Students: <strong>{students.length}</strong> · Academic Year: 2026-2027
            </p>
          </div>
          <button className="att-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Controls Bar */}
        <div className="class-att-controls">
          <div className="control-field">
            <label>Academic Month:</label>
            <select
              value={selectedMonthId}
              onChange={e => handleMonthChange(e.target.value)}
              className="month-sel"
            >
              {academicMonths.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.workingDays} Working Days) {m.isCurrent ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="control-field">
            <label>School Working Days in Month:</label>
            <div className="working-input-row">
              <input
                type="number"
                min="1"
                max="31"
                value={workingDays}
                onChange={e => setWorkingDays(Math.max(1, Number(e.target.value)))}
                className="working-input"
              />
              <span>Days</span>
              <span className="sync-calendar-badge" title="Automatically calculated from Academic Calendar holidays">
                <Sparkles size={11} /> Linked to Calendar ({monthConfig.closedHolidayCount || 0} holidays)
              </span>
            </div>
          </div>

          <button type="button" className="mark-all-btn" onClick={handleMarkAllFull}>
            <CheckCircle2 size={16} />
            <span>Mark All Present ({workingDays}/{workingDays})</span>
          </button>
        </div>

        {/* Students Table */}
        <div className="class-att-table-wrap">
          <table className="class-att-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Roll</th>
                <th>Student Name</th>
                {isEnrollmentClass && <th style={{ width: '160px' }}>Enrollment / Reg No.</th>}
                {showStudentId && <th style={{ width: '130px' }}>Student ID</th>}
                <th style={{ width: '180px' }}>Days Present</th>
                <th style={{ width: '110px' }}>Days Absent</th>
                <th style={{ width: '120px' }}>Monthly Rate</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Detail Sheet</th>
              </tr>
            </thead>
            <tbody>
              {students.map(st => {
                const present = attendanceMap[st.id] ?? workingDays;
                const absent = Math.max(0, workingDays - present);
                const pct = workingDays > 0 ? ((present / workingDays) * 100).toFixed(1) : 0;
                const isHigh = parseFloat(pct) >= 85;
                const isLow = parseFloat(pct) < 75;

                return (
                  <tr key={st.id}>
                    <td><span className="roll-pill">{st.roll}</span></td>
                    <td>
                      <div className="name-cell-wrap">
                        <span className="name-initial">{st.name.charAt(0)}</span>
                        <strong>{st.name}</strong>
                      </div>
                    </td>
                    {isEnrollmentClass && (
                      <td>
                        {renderEnrollmentBadge(st.enrollmentNo)}
                      </td>
                    )}
                    {showStudentId && <td><code>{st.id}</code></td>}
                    <td>
                      <div className="days-input-row">
                        <button
                          type="button"
                          className="day-step-btn"
                          onClick={() => handleUpdateStudentDays(st.id, present - 1)}
                          disabled={present <= 0}
                        >-</button>
                        <input
                          type="number"
                          min="0"
                          max={workingDays}
                          value={present}
                          onChange={e => handleUpdateStudentDays(st.id, e.target.value)}
                          className="days-present-input"
                        />
                        <button
                          type="button"
                          className="day-step-btn"
                          onClick={() => handleUpdateStudentDays(st.id, present + 1)}
                          disabled={present >= workingDays}
                        >+</button>
                        <span className="days-max-tag">/ {workingDays}</span>
                      </div>
                    </td>
                    <td><span className="absent-count">{absent} Days</span></td>
                    <td>
                      <span className={`pct-tag ${isHigh ? 'green' : isLow ? 'red' : 'amber'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-open-student-sheet"
                        onClick={() => onOpenIndividualStudent(st)}
                        title="Open individual student monthly calendar"
                      >
                        <span>Calendar</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="class-att-footer">
          {savedBanner && (
            <div className="success-banner-pill">
              <CheckCircle2 size={16} />
              <span>{currentClass.name} attendance successfully saved for {monthConfig.name}!</span>
            </div>
          )}

          <div className="footer-actions">
            <button type="button" className="btn-cancel-modal" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-save-class-att" onClick={handleSave}>
              <CheckCircle2 size={17} />
              <span>Save {currentClass.name} Attendance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAttendanceModal;
