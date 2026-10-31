import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import './StudentAttendance.css';

const StudentAttendance = ({ student: propStudent }) => {
  const context = useOutletContext();
  const activeStudent = propStudent || context?.activeStudent || (() => {
    try {
      const s = localStorage.getItem('pmshri_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  // Standard 2026-2027 Academic Year Monthly Attendance Records
  const monthlyAttendanceData = useMemo(() => {
    const months = [
      { month: 'April 2026', working: 22, present: 21 },
      { month: 'May 2026', working: 18, present: 17 },
      { month: 'June 2026', working: 12, present: 12 },
      { month: 'July 2026', working: 24, present: 23 },
      { month: 'August 2026', working: 22, present: 21 },
      { month: 'September 2026', working: 24, present: 23 },
      { month: 'October 2026 (Current)', working: 16, present: 15 },
      { month: 'November 2026', working: 21, present: 20 },
      { month: 'December 2026', working: 23, present: 22 },
      { month: 'January 2027', working: 20, present: 19 },
      { month: 'February 2027', working: 22, present: 21 },
      { month: 'March 2027', working: 16, present: 15 }
    ];

    if (activeStudent?.monthlyAttendance) {
      const custom = activeStudent.monthlyAttendance;
      return months.map((m) => {
        const key = m.month.split(' ')[0].toLowerCase();
        if (custom[key] && custom[key].workingDays) {
          return {
            ...m,
            working: custom[key].workingDays,
            present: custom[key].presentDays
          };
        }
        return m;
      });
    }

    return months;
  }, [activeStudent?.monthlyAttendance]);

  if (!activeStudent) return null;

  return (
    <div className="student-attendance-page">
      <div className="sp-page-header">
        <div>
          <h2>Class Attendance Register — Academic Session 2026–2027</h2>
          <p>Continuous daily & monthly presence records maintained by Class Teacher</p>
        </div>
        <div className="sp-overall-att-badge">
          <span className="lbl">Overall Record</span>
          <span className="val font-bold">{activeStudent.attendance || '95%'}</span>
        </div>
      </div>

      {/* Monthly Records Table */}
      <div className="sp-card table-card">
        <div className="sp-card-header">
          <h4>Monthly Working Days & Attendance Summary</h4>
        </div>

        <div className="sp-table-scroll">
          <table className="sp-attendance-table">
            <thead>
              <tr>
                <th>Month / Academic Period</th>
                <th>Total Working Days</th>
                <th>Days Present</th>
                <th>Days Absent</th>
                <th>Monthly Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAttendanceData.map((m) => {
                const pct = m.working > 0 ? Math.round((m.present / m.working) * 100) : 100;
                const isCurrent = m.month.includes('Current');
                return (
                  <tr key={m.month} className={isCurrent ? 'current-month-row' : ''}>
                    <td className="font-bold">
                      {m.month}
                      {isCurrent && <span className="current-pill">Active Month</span>}
                    </td>
                    <td className="font-mono font-bold">{m.working} Days</td>
                    <td className="font-mono font-bold text-success">{m.present} Days</td>
                    <td className="font-mono text-danger">{m.working - m.present} Days</td>
                    <td className="font-mono font-bold">{pct}%</td>
                    <td>
                      <span className={`att-badge ${pct >= 90 ? 'high' : 'medium'}`}>
                        {pct >= 90 ? 'Outstanding' : 'Satisfactory'}
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
  );
};

export default StudentAttendance;
