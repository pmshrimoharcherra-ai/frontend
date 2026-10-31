import React, { useState, useEffect, useMemo } from 'react';
import './TeacherMonthlyAttendance.css';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  Save,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Info,
  X,
  ChevronDown
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import {
  getAcademicMonthsWithWorkingDays,
  fetchCalendarHolidays,
  ACADEMIC_MONTHS_BASE
} from '../../utils/calendarAttendance';

/**
 * TeacherMonthlyAttendance
 * Allows Class Teachers to mark and review monthly attendance for the whole class at once.
 * Synchronized with the Academic Calendar to enforce exact monthly working days (e.g. 16 for October 2026).
 */
const TeacherMonthlyAttendance = ({
  assignedClassId,
  assignedClassName,
  students = [],
  loading = false,
  error = null,
  onRefresh = () => {},
  onSaveMonthlyAttendance = async () => {}
}) => {
  // Selected Academic Month (defaults to October 2026 - Current)
  const [selectedMonthId, setSelectedMonthId] = useState('2026-10');
  const [holidays, setHolidays] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL' | 'Boy' | 'Girl'
  const [streamFilter, setStreamFilter] = useState('ALL'); // 'ALL' | 'ARTS' | 'SCI'

  // Senior Secondary detection (Class XI and Class XII have unified class teacher for Arts & Science)
  const isSeniorSecondary = useMemo(() => {
    const cid = (assignedClassId || '').toLowerCase();
    const cname = (assignedClassName || '').toLowerCase();
    return cid.includes('11') || cid.includes('12') || cname.includes('xi') || cname.includes('xii');
  }, [assignedClassId, assignedClassName]);

  const { artsCount, sciCount } = useMemo(() => {
    let arts = 0;
    let sci = 0;
    students.forEach((s) => {
      const cid = (s.classId || '').toLowerCase();
      const cname = (s.className || '').toLowerCase();
      if (cid.includes('arts') || cname.includes('arts')) arts++;
      else if (cid.includes('sci') || cname.includes('sci') || cname.includes('science')) sci++;
    });
    return { artsCount: arts, sciCount: sci };
  }, [students]);

  // Map of studentId/id -> presentDays
  const [attendanceMap, setAttendanceMap] = useState({});

  // Saving states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch live calendar holidays from API on mount
  useEffect(() => {
    fetchCalendarHolidays().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setHolidays(data);
      }
    });
  }, []);

  // Compute live academic months list linked to official calendar holidays
  const academicMonths = useMemo(() => {
    return getAcademicMonthsWithWorkingDays(holidays);
  }, [holidays]);

  // Current active month config
  const currentMonthConfig = useMemo(() => {
    return (
      academicMonths.find((m) => m.id === selectedMonthId) ||
      academicMonths.find((m) => m.isCurrent) ||
      academicMonths[6]
    );
  }, [academicMonths, selectedMonthId]);

  // Total working days for this month (e.g. 16 for Oct 2026)
  const workingDays = currentMonthConfig?.workingDays || 16;

  // Initialize or re-populate attendance map when month or students change
  useEffect(() => {
    if (!students || students.length === 0) return;

    setAttendanceMap((prevMap) => {
      const nextMap = { ...prevMap };
      students.forEach((st) => {
        const key = st.studentId || st.id || st._id;
        const existingRec = st.monthlyAttendance?.[selectedMonthId]?.presentDays;

        if (existingRec !== undefined) {
          nextMap[key] = Math.min(workingDays, Math.max(0, Number(existingRec)));
        } else if (nextMap[key] === undefined) {
          // Default to reasonable previous rate or full attendance
          if (st.attendance && st.attendance.includes('%')) {
            const pct = parseInt(st.attendance, 10);
            if (!isNaN(pct)) {
              nextMap[key] = Math.min(workingDays, Math.round((workingDays * pct) / 100));
            } else {
              nextMap[key] = workingDays;
            }
          } else {
            nextMap[key] = workingDays;
          }
        } else {
          // Clamp existing state to new month's max working days
          nextMap[key] = Math.min(workingDays, nextMap[key]);
        }
      });
      return nextMap;
    });
  }, [students, selectedMonthId, workingDays]);

  // Handle single student day update
  const handleUpdateStudentDays = (studentKey, val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    const clamped = Math.max(0, Math.min(workingDays, num));

    setAttendanceMap((prev) => ({
      ...prev,
      [studentKey]: clamped
    }));
    setSaveSuccess(false);
  };

  // Quick Action: Mark all students full present for this month
  const handleMarkAllFull = () => {
    const fullMap = {};
    students.forEach((st) => {
      const key = st.studentId || st.id || st._id;
      fullMap[key] = workingDays;
    });
    setAttendanceMap(fullMap);
    setSaveSuccess(false);
  };

  // Quick Action: Reset / Mark zero
  const handleResetMonth = () => {
    const zeroMap = {};
    students.forEach((st) => {
      const key = st.studentId || st.id || st._id;
      zeroMap[key] = 0;
    });
    setAttendanceMap(zeroMap);
    setSaveSuccess(false);
  };

  // Save monthly attendance to backend
  const handleSaveMonthly = async () => {
    if (students.length === 0) return;
    try {
      setSaving(true);
      setSaveSuccess(false);

      const updatedStudentsPayload = students.map((st) => {
        const key = st.studentId || st.id || st._id;
        const present = attendanceMap[key] !== undefined ? attendanceMap[key] : workingDays;
        const pct = workingDays > 0 ? Math.round((present / workingDays) * 100) : 100;
        const existingMonthly = st.monthlyAttendance || {};

        return {
          ...st,
          studentId: st.studentId || st.id,
          id: st.id || st.studentId,
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

      await onSaveMonthlyAttendance(updatedStudentsPayload);

      setSaveSuccess(true);
      setSaveMessage(
        `Monthly attendance for ${currentMonthConfig.name} (${workingDays} working days) recorded successfully for ${students.length} students!`
      );

      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to save monthly attendance:', err);
      alert(`Error saving monthly attendance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Filtered students by search & gender (strictly roll number ordered)
  const filteredStudents = useMemo(() => {
    return students
      .filter((st) => {
        // Gender filter
        if (genderFilter !== 'ALL') {
          const g = (st.gender || '').trim().toLowerCase();
          if (genderFilter === 'Boy' && g === 'girl') return false;
          if (genderFilter === 'Girl' && g !== 'girl') return false;
        }

        // Stream filter for Senior Secondary
        if (isSeniorSecondary && streamFilter !== 'ALL') {
          const cid = (st.classId || '').toLowerCase();
          const cname = (st.className || '').toLowerCase();
          if (streamFilter === 'ARTS' && !cid.includes('arts') && !cname.includes('arts')) return false;
          if (streamFilter === 'SCI' && !cid.includes('sci') && !cname.includes('sci') && !cname.includes('science')) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (st.name || '').toLowerCase().includes(q);
          const matchRoll = String(st.roll || '').includes(q);
          const matchPen = (st.penNumber || '').toLowerCase().includes(q);
          const matchApaar = (st.apaarId || '').toLowerCase().includes(q);
          const matchId = (st.id || st.studentId || '').toLowerCase().includes(q);

          if (!matchName && !matchRoll && !matchPen && !matchApaar && !matchId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const rollA = parseInt(a.roll, 10) || 0;
        const rollB = parseInt(b.roll, 10) || 0;
        return rollA - rollB;
      });
  }, [students, genderFilter, searchQuery, isSeniorSecondary, streamFilter]);

  // Overall class metrics for current month
  const monthMetrics = useMemo(() => {
    const total = students.length;
    if (total === 0 || workingDays === 0) {
      return { total: 0, fullAttendanceCount: 0, shortageCount: 0, avgPct: 0 };
    }

    let sumPresent = 0;
    let fullAttendanceCount = 0;
    let shortageCount = 0;

    students.forEach((st) => {
      const key = st.studentId || st.id || st._id;
      const present = attendanceMap[key] !== undefined ? attendanceMap[key] : workingDays;
      sumPresent += present;
      if (present === workingDays) fullAttendanceCount++;
      const pct = (present / workingDays) * 100;
      if (pct < 75) shortageCount++;
    });

    const totalPossibleDays = total * workingDays;
    const avgPct =
      totalPossibleDays > 0 ? ((sumPresent / totalPossibleDays) * 100).toFixed(1) : 0;

    return {
      total,
      fullAttendanceCount,
      shortageCount,
      avgPct
    };
  }, [students, workingDays, attendanceMap]);

  return (
    <div className="tma-container">
      {/* ── Top Header Bar ── */}
      <div className="tma-header">
        <div className="tma-header-info">
          <div className="tma-icon-box">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h3>Monthly Attendance Register — {assignedClassName}</h3>
            <p>
              Consolidated month-wise attendance • Enter present days based on Academic Calendar working days
            </p>
          </div>
        </div>

        {/* Primary Save Action */}
        <div className="tma-header-actions">
          <button
            type="button"
            className="tma-save-btn"
            onClick={handleSaveMonthly}
            disabled={saving || loading || students.length === 0}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Saving Monthly Records...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Monthly Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="tma-success-banner" role="alert">
          <CheckCircle2 size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="tma-kpi-grid">
        {/* Working Days Card */}
        <div className="tma-kpi-card highlight">
          <div className="kpi-icon-wrap cal-icon">
            <Calendar size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Monthly Working Days</span>
            <div className="kpi-num-row">
              <span className="kpi-num">{workingDays}</span>
              <span className="kpi-unit">Days</span>
            </div>
            <span className="kpi-detail">
              {currentMonthConfig.totalDays} Total Days • {currentMonthConfig.totalDays - workingDays} Closed Days
            </span>
          </div>
        </div>

        {/* Class Strength Card */}
        <div className="tma-kpi-card">
          <div className="kpi-icon-wrap strength-icon">
            <Users size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Class Strength</span>
            <div className="kpi-num-row">
              <span className="kpi-num">{students.length}</span>
              <span className="kpi-unit">Students</span>
            </div>
            <span className="kpi-detail">{assignedClassName} Registered</span>
          </div>
        </div>

        {/* Full Attendance Card */}
        <div className="tma-kpi-card">
          <div className="kpi-icon-wrap full-icon">
            <UserCheck size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Full Attendance</span>
            <div className="kpi-num-row">
              <span className="kpi-num">{monthMetrics.fullAttendanceCount}</span>
              <span className="kpi-unit">Students</span>
            </div>
            <span className="kpi-detail">
              {students.length > 0
                ? Math.round((monthMetrics.fullAttendanceCount / students.length) * 100)
                : 0}
              % with 100% attendance
            </span>
          </div>
        </div>

        {/* Average Monthly Attendance */}
        <div className="tma-kpi-card">
          <div className="kpi-icon-wrap avg-icon">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Class Monthly Average</span>
            <div className="kpi-num-row">
              <span className="kpi-num">{monthMetrics.avgPct}%</span>
            </div>
            <span className="kpi-detail">
              {monthMetrics.shortageCount} student{monthMetrics.shortageCount === 1 ? '' : 's'} below 75%
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Month Selector, Quick Mark & Filters ── */}
      <div className="tma-toolbar">
        <div className="tma-toolbar-left">
          {/* Month Selector Dropdown */}
          <div className="tma-month-select-group">
            <label htmlFor="tma-month-select">
              <Calendar size={14} className="month-icon" />
              <span>Academic Month:</span>
            </label>
            <div className="select-with-arrow">
              <select
                id="tma-month-select"
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="tma-month-dropdown"
              >
                {academicMonths.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.workingDays} working days)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-caret" />
            </div>
          </div>

          {/* Quick Action: Mark All Full Present */}
          <button
            type="button"
            className="tma-quick-btn full-btn"
            onClick={handleMarkAllFull}
            title={`Set all students to ${workingDays}/${workingDays} days`}
          >
            <CheckCircle2 size={14} />
            <span>Mark All Full Present ({workingDays}/{workingDays})</span>
          </button>

          {/* Quick Action: Reset to 0 */}
          <button
            type="button"
            className="tma-quick-btn reset-btn"
            onClick={handleResetMonth}
            title="Reset all students to 0"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div className="tma-toolbar-right">
          {/* Search Box */}
          <div className="tma-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-icon"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>

          {/* Gender Filter Pills */}
          <div className="tma-gender-pills">
            <button
              type="button"
              className={`tma-pill ${genderFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setGenderFilter('ALL')}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              className={`tma-pill boy ${genderFilter === 'Boy' ? 'active' : ''}`}
              onClick={() => setGenderFilter('Boy')}
            >
              <BoyIcon size={13} />
              <span>Boys</span>
            </button>
            <button
              type="button"
              className={`tma-pill girl ${genderFilter === 'Girl' ? 'active' : ''}`}
              onClick={() => setGenderFilter('Girl')}
            >
              <GirlIcon size={13} />
              <span>Girls</span>
            </button>
          </div>

          {/* Stream Filter Pills for Senior Secondary (XI / XII) */}
          {isSeniorSecondary && (artsCount > 0 || sciCount > 0) && (
            <div className="tma-gender-pills tma-stream-pills">
              <button
                type="button"
                className={`tma-pill ${streamFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStreamFilter('ALL')}
              >
                All Streams
              </button>
              {artsCount > 0 && (
                <button
                  type="button"
                  className={`tma-pill ${streamFilter === 'ARTS' ? 'active' : ''}`}
                  onClick={() => setStreamFilter('ARTS')}
                >
                  Arts ({artsCount})
                </button>
              )}
              {sciCount > 0 && (
                <button
                  type="button"
                  className={`tma-pill ${streamFilter === 'SCI' ? 'active' : ''}`}
                  onClick={() => setStreamFilter('SCI')}
                >
                  Science ({sciCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Monthly Register Table ── */}
      <div className="tma-table-container">
        {loading ? (
          <div className="tma-loading-box">
            <RefreshCw size={28} className="spinning" />
            <p>Loading {assignedClassName} student records...</p>
          </div>
        ) : error ? (
          <div className="tma-error-box">
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="tma-empty-box">
            <Users size={36} className="empty-icon" />
            <h4>No students found</h4>
            <p>No student records matched your search query in {assignedClassName}.</p>
            {searchQuery && (
              <button
                type="button"
                className="tma-reset-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <table className="tma-table">
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                <th>Student Name</th>
                <th>APAAR / PEN ID</th>
                <th>Gender</th>
                <th style={{ width: '220px', textAlign: 'center' }}>
                  Days Present (out of {workingDays})
                </th>
                <th style={{ width: '120px', textAlign: 'center' }}>Absent</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Monthly Rate</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const key = st.studentId || st.id || st._id;
                const isGirl = (st.gender || '').trim().toLowerCase() === 'girl';
                const presentDays =
                  attendanceMap[key] !== undefined ? attendanceMap[key] : workingDays;
                const absentDays = Math.max(0, workingDays - presentDays);
                const pct =
                  workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 100;

                const isHigh = pct >= 85;
                const isLow = pct < 75;
                const isFull = presentDays === workingDays;

                const idCode =
                  st.penNumber ||
                  st.pen ||
                  (st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : null) ||
                  st.studentId ||
                  st.id;

                return (
                  <tr key={key} className="tma-row">
                    {/* Roll */}
                    <td className="tma-cell-roll font-mono">
                      <span className="tma-roll-badge">#{st.roll || '—'}</span>
                    </td>

                    {/* Student Name */}
                    <td className="tma-cell-name">
                      <div className="tma-name-flex">
                        <div className={`tma-avatar ${isGirl ? 'girl' : 'boy'}`}>
                          {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="tma-name-text">
                          <span className="st-name">{st.name}</span>
                          {st.father && (
                            <span className="st-guardian">C/o {st.father}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* APAAR / PEN ID */}
                    <td className="tma-cell-id font-mono">
                      {idCode ? (
                        <span className="id-badge">{idCode}</span>
                      ) : (
                        <span className="id-pending">Pending</span>
                      )}
                    </td>

                    {/* Gender */}
                    <td className="tma-cell-gender">
                      <span className={`gender-tag ${isGirl ? 'girl' : 'boy'}`}>
                        {isGirl ? 'Girl' : 'Boy'}
                      </span>
                    </td>

                    {/* Days Present Stepper Input */}
                    <td className="tma-cell-input">
                      <div className="days-stepper-wrap">
                        <button
                          type="button"
                          className="step-btn minus"
                          onClick={() => handleUpdateStudentDays(key, presentDays - 1)}
                          disabled={presentDays <= 0}
                          title="Decrease present days (-1)"
                        >
                          –
                        </button>

                        <input
                          type="number"
                          min="0"
                          max={workingDays}
                          value={presentDays}
                          onChange={(e) => handleUpdateStudentDays(key, e.target.value)}
                          className="days-number-input font-mono"
                          aria-label={`Present days for ${st.name}`}
                        />

                        <button
                          type="button"
                          className="step-btn plus"
                          onClick={() => handleUpdateStudentDays(key, presentDays + 1)}
                          disabled={presentDays >= workingDays}
                          title="Increase present days (+1)"
                        >
                          +
                        </button>

                        <span className="working-max-label">/ {workingDays}</span>
                      </div>
                    </td>

                    {/* Absent Days */}
                    <td className="tma-cell-absent font-mono">
                      <span className={`absent-tag ${absentDays > 0 ? 'has-absent' : 'zero'}`}>
                        {absentDays} {absentDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>

                    {/* Monthly Rate % */}
                    <td className="tma-cell-rate font-mono">
                      <span
                        className={`rate-pill ${
                          isHigh ? 'green' : isLow ? 'red' : 'amber'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="tma-cell-status">
                      {isFull ? (
                        <span className="status-badge full">Full</span>
                      ) : isHigh ? (
                        <span className="status-badge good">Good</span>
                      ) : isLow ? (
                        <span className="status-badge shortage">Shortage</span>
                      ) : (
                        <span className="status-badge normal">Regular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Bottom Footer Info & Save Bar */}
        <div className="tma-bottom-bar">
          <div className="tma-bottom-info">
            <Info size={14} className="info-icon" />
            <span>
              Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students in <strong>{assignedClassName}</strong> for <strong>{currentMonthConfig.name}</strong> ({workingDays} working days)
            </span>
          </div>

          <button
            type="button"
            className="tma-save-btn bottom-save"
            onClick={handleSaveMonthly}
            disabled={saving || loading || students.length === 0}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Monthly Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherMonthlyAttendance;
