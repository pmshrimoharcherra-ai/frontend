import { API_BASE_URL } from '../config/api';

// Utility for synchronizing Attendance with the Academic Calendar Holidays

export const ACADEMIC_MONTHS_BASE = [
  { id: '2026-04', monthKey: 3, year: 2026, name: 'April 2026', shortName: 'Apr', defaultWorking: 22 },
  { id: '2026-05', monthKey: 4, year: 2026, name: 'May 2026', shortName: 'May', defaultWorking: 18 },
  { id: '2026-06', monthKey: 5, year: 2026, name: 'June 2026', shortName: 'Jun', defaultWorking: 24 },
  { id: '2026-07', monthKey: 6, year: 2026, name: 'July 2026', shortName: 'Jul', defaultWorking: 25 },
  { id: '2026-08', monthKey: 7, year: 2026, name: 'August 2026', shortName: 'Aug', defaultWorking: 23 },
  { id: '2026-09', monthKey: 8, year: 2026, name: 'September 2026', shortName: 'Sep', defaultWorking: 24 },
  { id: '2026-10', monthKey: 9, year: 2026, name: 'October 2026 (Current)', shortName: 'Oct', defaultWorking: 24, isCurrent: true },
  { id: '2026-11', monthKey: 10, year: 2026, name: 'November 2026', shortName: 'Nov', defaultWorking: 22 },
  { id: '2026-12', monthKey: 11, year: 2026, name: 'December 2026', shortName: 'Dec', defaultWorking: 20 },
  { id: '2027-01', monthKey: 0, year: 2027, name: 'January 2027', shortName: 'Jan', defaultWorking: 23 },
  { id: '2027-02', monthKey: 1, year: 2027, name: 'February 2027', shortName: 'Feb', defaultWorking: 22 },
  { id: '2027-03', monthKey: 2, year: 2027, name: 'March 2027', shortName: 'Mar', defaultWorking: 24 }
];

/**
 * Calculates the exact working days for a given month and year by subtracting
 * all Sundays and all declared closed school holidays/vacations.
 */
export const computeMonthWorkingDays = (monthKey, year, holidays = []) => {
  const totalDays = new Date(year, Number(monthKey) + 1, 0).getDate();
  const nonWorkingSet = new Set();
  const closedHolidays = [];

  // 1. Add all Sundays to non-working dates
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, Number(monthKey), day);
    if (d.getDay() === 0) {
      nonWorkingSet.add(day);
    }
  }

  // 2. Add all dates falling within declared closed holidays
  holidays.forEach((h) => {
    const hMonth = Number(h.month);
    const hYear = h.year ? Number(h.year) : (hMonth <= 2 ? 2027 : 2026);

    if (hMonth === Number(monthKey) && hYear === Number(year)) {
      if (h.isClosed !== false) {
        closedHolidays.push(h);
        const start = Number(h.date);
        const end = h.endDate ? Number(h.endDate) : start;
        for (let d = start; d <= end; d++) {
          if (d >= 1 && d <= totalDays) {
            nonWorkingSet.add(d);
          }
        }
      }
    }
  });

  const workingDays = Math.max(0, totalDays - nonWorkingSet.size);

  return {
    totalDays,
    workingDays,
    closedHolidayCount: closedHolidays.length,
    closedHolidays,
    nonWorkingDaysCount: nonWorkingSet.size
  };
};

/**
 * Returns the academic months list with live working days computed from holidays.
 */
export const getAcademicMonthsWithWorkingDays = (holidays = []) => {
  return ACADEMIC_MONTHS_BASE.map((m) => {
    const computed = computeMonthWorkingDays(m.monthKey, m.year, holidays);
    return {
      ...m,
      workingDays: holidays.length > 0 ? computed.workingDays : m.defaultWorking,
      totalDays: computed.totalDays,
      closedHolidayCount: computed.closedHolidayCount,
      closedHolidays: computed.closedHolidays
    };
  });
};

/**
 * Fetches the latest holidays from the backend API.
 */
export const fetchCalendarHolidays = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/holidays`);
    if (!res.ok) throw new Error('Failed to retrieve holidays');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching calendar holidays for attendance sync:', err);
    return [];
  }
};
