import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import { INITIAL_TEACHERS } from '../../data/teachersData';
import { fetchCalendarHolidays } from '../../utils/calendarAttendance';
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  CheckCircle2,
  History,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import './AdminWorkingReport.css';

const LOCAL_STORAGE_KEY = 'pmshri_working_reports_history';
const DEFAULT_MEMO_PREFIX = 'No. F.28(1)-HM/PM SHRI MHSS/2008 (V-1)/';

const SALUTATION_OPTIONS = ['Smt.', 'Sri', 'Sri/Smt.'];

const DESIGNATION_OPTIONS = [
  'GT',
  'TGT',
  'PGT',
  'UGT',
  'VT',
  'TIC',
  'HM',
  'AHM',
  'Non-Teaching Staff'
];

const LEAVE_TYPE_OPTIONS = [
  { code: 'Nil', label: 'Nil (No Leave)' },
  { code: 'ML', label: 'ML (Medical Leave)' },
  { code: 'CL', label: 'CL (Casual Leave)' },
  { code: 'EL', label: 'EL (Earned Leave)' },
  { code: 'HPL', label: 'HPL (Half Pay Leave)' },
  { code: 'Commuted Leave', label: 'Commuted Leave' },
  { code: 'Maternity Leave', label: 'Maternity Leave' },
  { code: 'Paternity Leave', label: 'Paternity Leave' },
  { code: 'CCL', label: 'CCL (Child Care Leave)' },
  { code: 'EOL', label: 'EOL (Extraordinary Leave)' },
  { code: 'OD', label: 'OD (On Duty)' },
  { code: 'Other', label: 'Other (Custom)' }
];

const FEMALE_FIRST_NAMES = new Set([
  'gita', 'geeta', 'joly', 'jolly', 'rakhi', 'riti', 'soma', 'subarna', 'minakshi',
  'meenakshi', 'rupa', 'mamata', 'rama', 'sangita', 'sangeeta', 'jusli', 'pragati',
  'banti', 'mitan', 'priyanka', 'anita', 'sunita', 'puja', 'pooja', 'moumita',
  'susmita', 'sumita', 'pampa', 'shampa', 'champa', 'keya', 'riya', 'piya',
  'tania', 'taniya', 'ananya', 'barnali', 'ankita', 'ruma', 'tumpa', 'mousumi',
  'kajal', 'poly', 'polly', 'dipa', 'deepa', 'sikha', 'shikha', 'rekha', 'lata',
  'maya', 'jaya', 'shila', 'sheela', 'kalyani', 'sabita', 'kabita', 'namita',
  'binita', 'smita', 'arpita', 'sujata', 'sanchita', 'madhumita', 'paromita',
  'indrani', 'sraboni', 'srabani', 'debjani', 'sukla', 'shukla', 'swapna',
  'kalpana', 'archana', 'alpana', 'manju', 'ranju', 'anju', 'sanju', 'putul',
  'chhabi', 'chhanda', 'chandana', 'mandira', 'indira', 'bharati', 'parvati',
  'laxmi', 'lakshmi', 'saraswati', 'durga', 'uma', 'asha', 'usha', 'nisha',
  'disha', 'trisha', 'simi', 'rimi', 'mimi', 'tina', 'rina', 'mina', 'nina',
  'bina', 'seema', 'sima', 'reema', 'rima', 'neha', 'sneha', 'shreya', 'diya',
  'priya', 'kaveri', 'sonali', 'rupali', 'mitali', 'papri', 'kakali', 'payel',
  'payal', 'tithi', 'aditi', 'smriti', 'kirti', 'jyoti', 'swati', 'arti',
  'aarti', 'preeti', 'priti', 'nidhi', 'vidhi', 'varsha', 'megha', 'anamika',
  'sutapa', 'subhra', 'shrabani', 'tripti', 'dipti', 'deepti', 'chaitali',
  'monalisa', 'aparajita', 'debarati', 'sayantani', 'madhuri', 'sarmistha',
  'sharmistha', 'tanushree', 'tanusree', 'mou', 'jhumur', 'nivedita', 'pibrita'
]);

const getPronounForSalutation = (salutation) => {
  if (salutation === 'Smt.') return 'She';
  if (salutation === 'Sri') return 'He';
  return 'He/She';
};

const guessGenderMetaForTeacher = (teacher) => {
  if (!teacher) return { salutation: 'Sri/Smt.', pronoun: 'He/She' };
  const rawGender = String(teacher.gender || '').trim().toLowerCase();
  if (rawGender === 'female' || rawGender === 'girl' || rawGender === 'f') {
    return { salutation: 'Smt.', pronoun: 'She' };
  }
  if (rawGender === 'male' || rawGender === 'boy' || rawGender === 'm') {
    return { salutation: 'Sri', pronoun: 'He' };
  }

  const name = String(teacher.name || '').trim();
  if (/^(smt\.?|mrs\.?|ms\.?|miss|kumari)\b/i.test(name)) {
    return { salutation: 'Smt.', pronoun: 'She' };
  }
  if (/^(sri|shri|mr\.?)\b/i.test(name)) {
    return { salutation: 'Sri', pronoun: 'He' };
  }

  const first = name.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  if (FEMALE_FIRST_NAMES.has(first)) {
    return { salutation: 'Smt.', pronoun: 'She' };
  }
  return { salutation: 'Sri', pronoun: 'He' };
};

const getTodayIso = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDDMMYYYY = (isoDate) => {
  if (!isoDate) return '........';
  const parts = String(isoDate).split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const computeWorkingDaysInRange = (fromIso, toIso, holidays = []) => {
  if (!fromIso || !toIso) return null;
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return null;

  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

  let totalDays = 0;
  let workingDays = 0;
  let sundayCount = 0;
  let holidayCount = 0;

  const cursor = new Date(start);
  let guard = 0;
  while (cursor <= end && guard < 400) {
    guard += 1;
    totalDays += 1;
    const dayOfWeek = cursor.getDay();
    const curY = cursor.getFullYear();
    const curM = cursor.getMonth();
    const curD = cursor.getDate();

    if (dayOfWeek === 0) {
      sundayCount += 1;
    } else {
      const isClosedHoliday = holidays.some((h) => {
        if (h.isClosed === false) return false;
        const hMonth = Number(h.month);
        const hYear = h.year ? Number(h.year) : hMonth <= 2 ? 2027 : 2026;
        const hStart = Number(h.date);
        const hEnd = h.endDate ? Number(h.endDate) : hStart;
        return curY === hYear && curM === hMonth && curD >= hStart && curD <= hEnd;
      });
      if (isClosedHoliday) {
        holidayCount += 1;
      } else {
        workingDays += 1;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { totalDays, workingDays, sundayCount, holidayCount };
};

const createEmptyLeaveItem = (days = 0, type = 'Nil', custom = '') => ({
  leaveDays: days,
  leaveType: type,
  customLeaveType: custom
});

const createEmptyStaffRow = () => ({
  teacherId: '',
  name: '',
  salutation: 'Sri/Smt.',
  pronoun: 'He/She',
  designation: '',
  customDesignation: '',
  workingDays: '',
  daysPresent: '',
  leaves: [createEmptyLeaveItem(0, 'Nil')]
});

const resolveLeaveTypeLabel = (leaveItem) => {
  if (!leaveItem) return 'Nil';
  if (leaveItem.leaveType === 'Other') {
    return (leaveItem.customLeaveType || '').trim() || 'Leave';
  }
  return leaveItem.leaveType || 'Nil';
};

const getActiveLeaveItems = (entry) => {
  const list = Array.isArray(entry?.leaves) ? entry.leaves : [];
  return list
    .map((item) => ({
      days: Number(item.leaveDays) || 0,
      type: resolveLeaveTypeLabel(item)
    }))
    .filter((item) => item.days > 0 && item.type && item.type !== 'Nil');
};

const getEntryTotalLeaveDays = (entry) => {
  return getActiveLeaveItems(entry).reduce((sum, item) => sum + item.days, 0);
};

const joinWithAmpersand = (parts) => {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`;
};

const formatLeaveCellText = (entry) => {
  const active = getActiveLeaveItems(entry);
  if (active.length === 0) return 'Nil';
  const parts = active.map((item) => `${item.type} ${item.days} ${item.days === 1 ? 'Day' : 'Days'}`);
  return joinWithAmpersand(parts);
};

const buildDefaultNbNote = (entries) => {
  const entriesWithLeave = entries
    .map((e) => ({ entry: e, active: getActiveLeaveItems(e) }))
    .filter((x) => x.entry.name && x.active.length > 0);

  if (entriesWithLeave.length === 0) {
    const firstNamed = entries.find((e) => e.name);
    if (!firstNamed) return '';
    const pronoun = firstNamed.pronoun || getPronounForSalutation(firstNamed.salutation);
    return `N.B: ${pronoun} has not enjoyed any leave during this period.`;
  }

  if (entriesWithLeave.length === 1) {
    const { entry, active } = entriesWithLeave[0];
    const pronoun = entry.pronoun || getPronounForSalutation(entry.salutation);
    const parts = active.map(
      (item) => `${item.days} ${item.days === 1 ? 'day' : 'days'} ${item.type}`
    );
    return `N.B: ${pronoun} has enjoyed ${joinWithAmpersand(parts)} .`;
  }

  const staffParts = entriesWithLeave.map(({ entry, active }) => {
    const parts = active.map(
      (item) => `${item.days} ${item.days === 1 ? 'day' : 'days'} ${item.type}`
    );
    return `${entry.salutation} ${entry.name} (${joinWithAmpersand(parts)})`;
  });
  return `N.B: Leave enjoyed: ${staffParts.join('; ')}.`;
};

const PRINTABLE_WORKING_REPORT_CSS = `
  @page {
    size: A4 portrait;
    margin: 14mm 20mm 18mm 20mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    font-family: 'Times New Roman', Times, serif;
    font-size: 11.5pt;
    line-height: 1.45;
  }
  .wr-sheet {
    width: 100%;
    max-width: 172mm;
    margin: 0 auto;
    padding-top: 18mm;
    color: #000000;
    font-family: 'Times New Roman', Times, serif;
  }
  .wr-doc-header {
    text-align: center;
    font-weight: bold;
    font-size: 13pt;
    line-height: 1.38;
    margin-bottom: 30px;
    letter-spacing: 0.2px;
  }
  .wr-ref-date-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 28px;
    font-size: 11.5pt;
  }
  .wr-to-block {
    margin-bottom: 24px;
    font-size: 11.5pt;
    line-height: 1.45;
  }
  .wr-to-line {
    white-space: pre-wrap;
  }
  .wr-subject-line {
    margin-bottom: 20px;
    font-size: 11.5pt;
    line-height: 1.45;
  }
  .wr-salutation-line {
    margin-bottom: 18px;
    font-size: 11.5pt;
  }
  .wr-body-paragraph {
    margin-bottom: 26px;
    font-size: 11.5pt;
    line-height: 1.58;
    text-align: justify;
  }
  .wr-doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0 24px 0;
    font-size: 11pt;
  }
  .wr-doc-table th,
  .wr-doc-table td {
    border: 1px solid #333333;
    padding: 10px 8px;
    text-align: center;
    vertical-align: middle;
    color: #000000;
    font-weight: normal;
  }
  .wr-doc-table th {
    line-height: 1.3;
  }
  .wr-doc-table tbody tr {
    height: 42px;
  }
  .wr-closing-line {
    text-align: center;
    margin: 24px 0 26px 0;
    font-size: 11.5pt;
  }
  .wr-nb-line {
    text-align: left;
    margin-bottom: 42px;
    font-size: 11.5pt;
    line-height: 1.4;
  }
  .wr-signature-block {
    text-align: right;
    margin-top: 24px;
    font-size: 11.5pt;
  }
  .wr-yours-faithfully {
    margin-bottom: 70px;
  }
  .wr-hm-sig-label {
    display: inline-block;
  }
`;

const AdminWorkingReport = ({ teachers: propTeachers = [] }) => {
  const [fetchedTeachers, setFetchedTeachers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [activeViewTab, setActiveViewTab] = useState('generator'); // 'generator' | 'history'

  // Form states
  const [memoNumber, setMemoNumber] = useState('');
  const [reportDate, setReportDate] = useState(getTodayIso());
  const [recipient, setRecipient] = useState(''); // Blank box as requested
  const [salutationHeader, setSalutationHeader] = useState('Sir,');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [staffEntries, setStaffEntries] = useState([createEmptyStaffRow()]);
  const [customNbNote, setCustomNbNote] = useState('');
  const [isNbManuallyEdited, setIsNbManuallyEdited] = useState(false);

  // Save / History states
  const [savedReports, setSavedReports] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/teachers`);
        const data = await res.json();
        if (data.success && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setFetchedTeachers(data.teachers);
        }
      } catch {
        // Keep prop/bundled INITIAL_TEACHERS fallback
      }

      const calHolidays = await fetchCalendarHolidays();
      if (Array.isArray(calHolidays)) {
        setHolidays(calHolidays);
      }

      // Load saved working reports history (API with localStorage fallback)
      try {
        const repRes = await fetch(`${API_BASE_URL}/api/working-reports`);
        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.success && Array.isArray(repData.reports)) {
            setSavedReports(repData.reports);
            return;
          }
        }
      } catch {
        // Fallback to localStorage below
      }

      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          setSavedReports(JSON.parse(cached));
        }
      } catch {
        // Ignore storage errors
      }
    };

    loadData();
  }, []);

  const teachers = useMemo(() => {
    if (fetchedTeachers.length > 0) return fetchedTeachers;
    if (propTeachers && propTeachers.length > 0) return propTeachers;
    return INITIAL_TEACHERS;
  }, [fetchedTeachers, propTeachers]);

  const sortedTeachers = useMemo(() => {
    return [...(teachers || [])].sort((a, b) => (a.slNo || 999) - (b.slNo || 999));
  }, [teachers]);

  // Calendar calculation for chosen period dates
  const calendarStats = useMemo(() => {
    return computeWorkingDaysInRange(periodFrom, periodTo, holidays);
  }, [periodFrom, periodTo, holidays]);

  const handlePeriodDateChange = (field, nextVal) => {
    const nextFrom = field === 'from' ? nextVal : periodFrom;
    const nextTo = field === 'to' ? nextVal : periodTo;
    if (field === 'from') setPeriodFrom(nextVal);
    else setPeriodTo(nextVal);

    const stats = computeWorkingDaysInRange(nextFrom, nextTo, holidays);
    if (stats && stats.workingDays >= 0) {
      setStaffEntries((prev) =>
        prev.map((entry) => {
          if (entry.workingDays === '' || entry._autoWorking) {
            const wDays = stats.workingDays;
            const pDays = entry.daysPresent === '' ? wDays : Math.min(Number(entry.daysPresent), wDays);
            const lDays = Math.max(0, wDays - pDays);
            const leavesList = Array.isArray(entry.leaves) && entry.leaves.length > 0
              ? entry.leaves
              : [createEmptyLeaveItem(0, 'Nil')];
            const nextLeaves =
              leavesList.length === 1
                ? [
                    {
                      ...leavesList[0],
                      leaveDays: lDays,
                      leaveType: lDays === 0 ? 'Nil' : leavesList[0].leaveType === 'Nil' ? 'CL' : leavesList[0].leaveType
                    }
                  ]
                : leavesList;
            return {
              ...entry,
              workingDays: wDays,
              daysPresent: entry.daysPresent === '' ? wDays : pDays,
              leaves: nextLeaves,
              _autoWorking: true
            };
          }
          return entry;
        })
      );
    }
  };

  // Computed N.B. note
  const autoNbNote = useMemo(() => buildDefaultNbNote(staffEntries), [staffEntries]);
  const effectiveNbNote = isNbManuallyEdited ? customNbNote : autoNbNote;

  const showNotice = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Update a specific staff entry row
  const updateStaffEntry = (index, updater) => {
    setStaffEntries((prev) =>
      prev.map((row, idx) => (idx === index ? updater(row) : row))
    );
  };

  const handleSelectTeacher = (index, teacherId) => {
    const matched = sortedTeachers.find(
      (t) => (t.teacherId || t._id) === teacherId || t.name === teacherId
    );
    updateStaffEntry(index, (row) => {
      if (!matched) {
        return { ...row, teacherId: '', name: '', designation: '', pronoun: 'He/She' };
      }
      const roleClean = (matched.role || 'GT').replace(/\s*Faculty$/i, '').trim() || 'GT';
      const { salutation, pronoun } = guessGenderMetaForTeacher(matched);
      return {
        ...row,
        teacherId: matched.teacherId || matched._id || '',
        name: matched.name,
        salutation,
        pronoun,
        designation: roleClean
      };
    });
    // Ensure N.B. pronoun & details immediately follow the newly selected teacher
    setIsNbManuallyEdited(false);
    setCustomNbNote('');
  };

  const handleSalutationChange = (index, nextSalutation) => {
    updateStaffEntry(index, (row) => ({
      ...row,
      salutation: nextSalutation,
      pronoun: getPronounForSalutation(nextSalutation)
    }));
  };

  const handleWorkingDaysChange = (index, rawVal) => {
    const val = rawVal === '' ? '' : Math.max(0, parseInt(rawVal, 10) || 0);
    updateStaffEntry(index, (row) => {
      if (val === '') {
        return { ...row, workingDays: '', _autoWorking: false };
      }
      const present = row.daysPresent === '' ? val : Math.min(Number(row.daysPresent), val);
      const leave = Math.max(0, val - present);
      const leavesList = Array.isArray(row.leaves) && row.leaves.length > 0
        ? row.leaves
        : [createEmptyLeaveItem(0, 'Nil')];
      const nextLeaves =
        leavesList.length === 1
          ? [
              {
                ...leavesList[0],
                leaveDays: leave,
                leaveType: leave === 0 ? 'Nil' : leavesList[0].leaveType === 'Nil' ? 'CL' : leavesList[0].leaveType
              }
            ]
          : leavesList;
      return {
        ...row,
        workingDays: val,
        daysPresent: present,
        leaves: nextLeaves,
        _autoWorking: false
      };
    });
  };

  const handleDaysPresentChange = (index, rawVal) => {
    const val = rawVal === '' ? '' : Math.max(0, parseInt(rawVal, 10) || 0);
    updateStaffEntry(index, (row) => {
      if (val === '') {
        return { ...row, daysPresent: '' };
      }
      const wDays = row.workingDays === '' ? val : Number(row.workingDays);
      const leave = Math.max(0, wDays - val);
      const leavesList = Array.isArray(row.leaves) && row.leaves.length > 0
        ? row.leaves
        : [createEmptyLeaveItem(0, 'Nil')];
      const nextLeaves =
        leavesList.length === 1
          ? [
              {
                ...leavesList[0],
                leaveDays: leave,
                leaveType: leave === 0 ? 'Nil' : leavesList[0].leaveType === 'Nil' ? 'CL' : leavesList[0].leaveType
              }
            ]
          : leavesList;
      return {
        ...row,
        daysPresent: val,
        leaves: nextLeaves
      };
    });
  };

  const handleLeaveItemDaysChange = (staffIndex, leaveIndex, rawVal) => {
    const val = rawVal === '' ? '' : Math.max(0, parseInt(rawVal, 10) || 0);
    updateStaffEntry(staffIndex, (row) => {
      const nextLeaves = (row.leaves || []).map((item, lIdx) => {
        if (lIdx !== leaveIndex) return item;
        const numericLeave = val === '' ? 0 : val;
        return {
          ...item,
          leaveDays: val,
          leaveType: numericLeave === 0 ? 'Nil' : item.leaveType === 'Nil' ? 'CL' : item.leaveType
        };
      });
      return { ...row, leaves: nextLeaves };
    });
  };

  const handleLeaveItemTypeChange = (staffIndex, leaveIndex, nextType) => {
    updateStaffEntry(staffIndex, (row) => {
      const nextLeaves = (row.leaves || []).map((item, lIdx) => {
        if (lIdx !== leaveIndex) return item;
        if (nextType === 'Nil') {
          return { ...item, leaveType: 'Nil', leaveDays: 0, customLeaveType: '' };
        }
        const currentLeave = Number(item.leaveDays) || 0;
        return {
          ...item,
          leaveType: nextType,
          leaveDays: currentLeave === 0 ? 1 : currentLeave
        };
      });
      return { ...row, leaves: nextLeaves };
    });
  };

  const handleCustomLeaveTypeChange = (staffIndex, leaveIndex, customVal) => {
    updateStaffEntry(staffIndex, (row) => ({
      ...row,
      leaves: (row.leaves || []).map((item, lIdx) =>
        lIdx === leaveIndex ? { ...item, customLeaveType: customVal } : item
      )
    }));
  };

  const handleAddLeaveItem = (staffIndex) => {
    updateStaffEntry(staffIndex, (row) => {
      const leavesList = Array.isArray(row.leaves) ? row.leaves : [];
      const expectedTotal =
        row.workingDays !== '' && row.daysPresent !== ''
          ? Math.max(0, Number(row.workingDays) - Number(row.daysPresent))
          : 0;
      const allocated = getEntryTotalLeaveDays(row);
      const remaining = Math.max(1, expectedTotal - allocated);

      const usedTypes = new Set(leavesList.map((l) => l.leaveType));
      const fallbackOrder = ['ML', 'CL', 'EL', 'HPL', 'OD'];
      const nextType = fallbackOrder.find((t) => !usedTypes.has(t)) || 'CL';

      // If first item was Nil with 0 days, turn it into the first active leave item cleanly
      if (leavesList.length === 1 && leavesList[0].leaveType === 'Nil' && (Number(leavesList[0].leaveDays) || 0) === 0) {
        return {
          ...row,
          leaves: [createEmptyLeaveItem(remaining, nextType)]
        };
      }

      return {
        ...row,
        leaves: [...leavesList, createEmptyLeaveItem(remaining, nextType)]
      };
    });
  };

  const handleRemoveLeaveItem = (staffIndex, leaveIndex) => {
    updateStaffEntry(staffIndex, (row) => {
      const leavesList = Array.isArray(row.leaves) ? row.leaves : [];
      if (leavesList.length <= 1) {
        return { ...row, leaves: [createEmptyLeaveItem(0, 'Nil')] };
      }
      return {
        ...row,
        leaves: leavesList.filter((_, lIdx) => lIdx !== leaveIndex)
      };
    });
  };

  const handleSyncPresentFromLeaves = (staffIndex) => {
    updateStaffEntry(staffIndex, (row) => {
      if (row.workingDays === '') return row;
      const totalLeaves = getEntryTotalLeaveDays(row);
      return {
        ...row,
        daysPresent: Math.max(0, Number(row.workingDays) - totalLeaves)
      };
    });
  };

  const handleAddStaffRow = () => {
    const nextRow = createEmptyStaffRow();
    if (calendarStats) {
      nextRow.workingDays = calendarStats.workingDays;
      nextRow.daysPresent = calendarStats.workingDays;
      nextRow._autoWorking = true;
    }
    setStaffEntries((prev) => [...prev, nextRow]);
  };

  const handleRemoveStaffRow = (index) => {
    if (staffEntries.length <= 1) return;
    setStaffEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleResetForm = () => {
    setMemoNumber('');
    setReportDate(getTodayIso());
    setRecipient('');
    setSalutationHeader('Sir,');
    setPeriodFrom('');
    setPeriodTo('');
    setStaffEntries([createEmptyStaffRow()]);
    setCustomNbNote('');
    setIsNbManuallyEdited(false);
  };

  // Format teacher label helper: e.g. "Smt. Rakhi Rudra Paul (GT)"
  const formatStaffLabel = (entry, useGenericPlaceholder = false) => {
    if (!entry || !entry.name) {
      return useGenericPlaceholder ? 'Sri/Smt. ____________________ (____)' : '';
    }
    const desig = entry.designation ? ` (${entry.designation})` : '';
    const prefix = entry.salutation ? `${entry.salutation} ` : '';
    return `${prefix}${entry.name}${desig}`;
  };

  // Build clean official HTML for both Live Preview and Isolated Print
  const generateOfficialDocumentHtml = (isPreview = false) => {
    const memoFull = `${DEFAULT_MEMO_PREFIX}${memoNumber.trim() ? memoNumber.trim() : '........'}`;
    const datedFormatted = formatDDMMYYYY(reportDate);
    const fromFormatted = formatDDMMYYYY(periodFrom);
    const toFormatted = formatDDMMYYYY(periodTo);

    const recipientLines = recipient
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const namedEntries = staffEntries.filter((e) => e.name);
    let subjectStaffText = 'Sri/Smt. ____________________ (____)';
    let bodyStaffText = 'Sri/Smt ____________________ (____)';

    if (namedEntries.length === 1) {
      const lbl = formatStaffLabel(namedEntries[0]);
      subjectStaffText = lbl;
      bodyStaffText = lbl;
    } else if (namedEntries.length > 1) {
      const labels = namedEntries.map((e) => formatStaffLabel(e));
      subjectStaffText = labels.join(', ');
      bodyStaffText = labels.join(', ');
    }

    // Pad table rows to at least 4 rows matching the physical Word format
    const totalRows = Math.max(4, staffEntries.length);
    const tableRowsHtml = Array.from({ length: totalRows })
      .map((_, idx) => {
        const entry = staffEntries[idx];
        if (!entry || !entry.name) {
          return `
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          `;
        }
        const leaveStr = formatLeaveCellText(entry);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(formatStaffLabel(entry))}</td>
            <td>${entry.workingDays !== '' ? escapeHtml(entry.workingDays) : ''}</td>
            <td>${entry.daysPresent !== '' ? escapeHtml(entry.daysPresent) : ''}</td>
            <td>${escapeHtml(leaveStr)}</td>
          </tr>
        `;
      })
      .join('');

    const recipientHtml =
      recipientLines.length > 0
        ? recipientLines.map((line) => `<div>${escapeHtml(line)}</div>`).join('')
        : isPreview
        ? `<div class="wr-preview-placeholder">[Enter Recipient Department / IS / School Name]</div>`
        : `<div style="height: 36px;"></div>`;

    return `
      <div class="wr-sheet">
        <div class="wr-doc-header">
          <div>Government of Tripura</div>
          <div>Office of the HM</div>
          <div>PM Shri Moharcherra H.S School</div>
          <div>Teliamura, Khowai, Tripura</div>
        </div>

        <div class="wr-ref-date-row">
          <div>${escapeHtml(memoFull)}</div>
          <div>Dated: ${escapeHtml(datedFormatted)}</div>
        </div>

        <div class="wr-to-block">
          <div>To</div>
          ${recipientHtml}
        </div>

        <div class="wr-subject-line">
          <strong>Subject:</strong> Sending working report in favour of ${escapeHtml(subjectStaffText)}
        </div>

        <div class="wr-salutation-line">${escapeHtml(salutationHeader || 'Sir,')}</div>

        <div class="wr-body-paragraph">
          I am sending herewith the working report of ${escapeHtml(bodyStaffText)} of PM Shri Moharcherra H.S School, Teliamura, Khowai, Tripura for the period from the ${escapeHtml(fromFormatted)} to ${escapeHtml(toFormatted)}
        </div>

        <table class="wr-doc-table">
          <thead>
            <tr>
              <th style="width: 58px;">SL<br/>NO</th>
              <th>Name of the Teaching/Non-<br/>teaching staff</th>
              <th style="width: 112px;">Total working<br/>days</th>
              <th style="width: 108px;">Total days<br/>present</th>
              <th style="width: 138px;">Leave</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="wr-closing-line">
          This is favour of your kind information and take necessary action please.
        </div>

        ${
          effectiveNbNote
            ? `<div class="wr-nb-line">${escapeHtml(effectiveNbNote)}</div>`
            : '<div class="wr-nb-line">&nbsp;</div>'
        }

        <div class="wr-signature-block">
          <div class="wr-yours-faithfully">Yours faithfully</div>
          <div class="wr-hm-sig-label">Signature of Principal/TIC/HM/AHM</div>
        </div>
      </div>
    `;
  };

  // Print using isolated iframe (A4 Portrait)
  const handlePrintReport = () => {
    const hasTeacher = staffEntries.some((e) => e.name);
    if (!hasTeacher) {
      showNotice('error', 'Please select a Teacher before printing the Working Report.');
      return;
    }

    const fullHtml = generateOfficialDocumentHtml(false);
    let iframe = document.getElementById('working-report-print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'working-report-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Working Report - PM SHRI Moharcherra H.S. School</title>
          <style>${PRINTABLE_WORKING_REPORT_CSS}</style>
        </head>
        <body>${fullHtml}</body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };

  // Save report to Backend (with localStorage fallback)
  const handleSaveReport = async () => {
    const validEntries = staffEntries
      .filter((e) => e.name)
      .map((e) => {
        const activeLeaves = getActiveLeaveItems(e).map((item) => ({
          leaveDays: item.days,
          leaveType: item.type
        }));
        const totalLeaveDays = activeLeaves.reduce((s, l) => s + l.leaveDays, 0);
        return {
          teacherId: e.teacherId,
          name: e.name,
          salutation: e.salutation,
          pronoun: e.pronoun || getPronounForSalutation(e.salutation),
          designation: e.designation,
          workingDays: Number(e.workingDays) || 0,
          daysPresent: Number(e.daysPresent) || 0,
          leaveDays: totalLeaveDays,
          leaveType: formatLeaveCellText(e),
          leaves: activeLeaves
        };
      });

    if (validEntries.length === 0) {
      showNotice('error', 'Please select at least one Teacher to save the report.');
      return;
    }
    if (!periodFrom || !periodTo) {
      showNotice('error', 'Please choose the working report period dates (From and To).');
      return;
    }

    const payload = {
      memoPrefix: DEFAULT_MEMO_PREFIX,
      memoNumber: memoNumber.trim(),
      reportDate,
      recipient: recipient.trim(),
      salutationHeader,
      periodFrom,
      periodTo,
      staffEntries: validEntries,
      nbNote: effectiveNbNote
    };

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/working-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          setSavedReports((prev) => [data.report, ...prev]);
          showNotice('success', 'Working report saved to database!');
          return;
        }
      }
      throw new Error('Backend save unavailable');
    } catch {
      const localRecord = {
        ...payload,
        _id: `local-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      const updated = [localRecord, ...savedReports];
      setSavedReports(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota errors
      }
      showNotice('success', 'Working report saved to local history!');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedReport = (rep) => {
    setMemoNumber(rep.memoNumber || '');
    setReportDate(rep.reportDate || getTodayIso());
    setRecipient(rep.recipient || '');
    setSalutationHeader(rep.salutationHeader || 'Sir,');
    setPeriodFrom(rep.periodFrom || '');
    setPeriodTo(rep.periodTo || '');
    const loadedEntries = (rep.staffEntries || []).map((e) => {
      const rawLeaves =
        Array.isArray(e.leaves) && e.leaves.length > 0
          ? e.leaves
          : e.leaveDays > 0 && e.leaveType && e.leaveType !== 'Nil'
          ? [{ leaveDays: e.leaveDays, leaveType: e.leaveType }]
          : [{ leaveDays: 0, leaveType: 'Nil' }];

      const mappedLeaves = rawLeaves.map((l) => {
        const isStandard = LEAVE_TYPE_OPTIONS.some((opt) => opt.code === l.leaveType);
        return createEmptyLeaveItem(
          l.leaveDays ?? 0,
          isStandard ? l.leaveType : 'Other',
          isStandard ? '' : l.leaveType || ''
        );
      });

      const sal = e.salutation || 'Smt.';
      return {
        teacherId: e.teacherId || '',
        name: e.name || '',
        salutation: sal,
        pronoun: e.pronoun || getPronounForSalutation(sal),
        designation: e.designation || 'GT',
        workingDays: e.workingDays ?? '',
        daysPresent: e.daysPresent ?? '',
        leaves: mappedLeaves
      };
    });
    setStaffEntries(loadedEntries.length > 0 ? loadedEntries : [createEmptyStaffRow()]);
    if (rep.nbNote) {
      setCustomNbNote(rep.nbNote);
      setIsNbManuallyEdited(true);
    } else {
      setCustomNbNote('');
      setIsNbManuallyEdited(false);
    }
    setActiveViewTab('generator');
    showNotice('success', 'Report loaded into editor.');
  };

  const handleDeleteSavedReport = async (id) => {
    if (!id) return;
    if (!String(id).startsWith('local-')) {
      try {
        await fetch(`${API_BASE_URL}/api/working-reports/${id}`, { method: 'DELETE' });
      } catch {
        // Ignore network errors
      }
    }
    const updated = savedReports.filter((r) => (r._id || r.id) !== id);
    setSavedReports(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    showNotice('success', 'Saved report removed.');
  };

  return (
    <div className="admin-working-report-container">
      {/* Top Banner Header */}
      <div className="wr-banner-header">
        <div className="wr-banner-title-wrap">
          <div className="wr-banner-icon">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2>Working Report</h2>
            <p>
              Generate, customize, save, and print official staff working &amp; leave reports for IS / Department submission
            </p>
          </div>
        </div>

        <div className="wr-banner-actions">
          <div className="wr-view-switcher">
            <button
              type="button"
              className={`wr-tab-btn ${activeViewTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('generator')}
            >
              <FileText size={15} />
              <span>Report Form</span>
            </button>
            <button
              type="button"
              className={`wr-tab-btn ${activeViewTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('history')}
            >
              <History size={15} />
              <span>Saved ({savedReports.length})</span>
            </button>
          </div>

          <button
            type="button"
            className="wr-btn-secondary"
            onClick={handleResetForm}
            title="Clear form and start fresh"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="wr-btn-save"
            onClick={handleSaveReport}
            disabled={saving}
            title="Save this working report"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Report'}</span>
          </button>

          <button
            type="button"
            className="wr-btn-primary"
            onClick={handlePrintReport}
            title="Print or Download Official Working Report PDF"
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div className={`wr-status-toast ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {activeViewTab === 'history' ? (
        <div className="wr-history-card">
          <div className="wr-history-header">
            <h3>Saved Working Reports History</h3>
            <p>Click any saved working report to load it into the editor or print it.</p>
          </div>
          {savedReports.length === 0 ? (
            <div className="wr-history-empty">
              <FileSpreadsheet size={38} />
              <p>No saved working reports yet. Fill the form and click "Save Report" to store a copy.</p>
            </div>
          ) : (
            <div className="wr-history-list">
              {savedReports.map((rep) => {
                const rid = rep._id || rep.id;
                const staffSummary = (rep.staffEntries || [])
                  .map((e) => `${e.salutation} ${e.name} (${e.designation})`)
                  .join(', ');
                return (
                  <div key={rid} className="wr-history-item">
                    <div className="wr-history-info">
                      <div className="wr-history-top">
                        <span className="wr-history-staff">{staffSummary || 'Staff Report'}</span>
                        <span className="wr-history-date">Dated: {formatDDMMYYYY(rep.reportDate)}</span>
                      </div>
                      <div className="wr-history-meta">
                        <span>
                          <strong>To:</strong> {rep.recipient ? rep.recipient.replace(/\n/g, ', ') : 'Not specified'}
                        </span>
                        <span>
                          <strong>Period:</strong> {formatDDMMYYYY(rep.periodFrom)} to {formatDDMMYYYY(rep.periodTo)}
                        </span>
                      </div>
                    </div>
                    <div className="wr-history-actions">
                      <button
                        type="button"
                        className="wr-btn-load"
                        onClick={() => handleLoadSavedReport(rep)}
                      >
                        Load &amp; Edit
                      </button>
                      <button
                        type="button"
                        className="wr-btn-delete"
                        onClick={() => handleDeleteSavedReport(rid)}
                        title="Delete saved report"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Main Split Workspace: Left Form + Right Live Official Preview */
        <div className="wr-workspace-grid">
          {/* LEFT: FORM PANEL */}
          <div className="wr-form-panel">
            {/* Section 1: Recipient ("To") & Memo Details */}
            <div className="wr-form-card">
              <div className="wr-card-title">
                <Building2 size={17} />
                <span>Recipient &amp; Dispatch Details</span>
              </div>

              <div className="wr-field-group">
                <label htmlFor="wr-recipient-input">
                  To (Department / IS / School Name) <span className="wr-required-dot">*</span>
                </label>
                <textarea
                  id="wr-recipient-input"
                  rows={3}
                  className="wr-textarea"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter department or school name (e.g.&#10;Teliamura IS&#10;Teliamura, Khowai, Tripura)"
                />
                <span className="wr-field-hint">
                  Blank box for entering the recipient department, Inspector of Schools (IS), or School Name &amp; Address.
                </span>
              </div>

              <div className="wr-field-row-2">
                <div className="wr-field-group">
                  <label htmlFor="wr-memo-number">Memo / Letter No. (Optional Suffix)</label>
                  <div className="wr-memo-input-wrap">
                    <span className="wr-memo-prefix">.../2008 (V-1)/</span>
                    <input
                      id="wr-memo-number"
                      type="text"
                      value={memoNumber}
                      onChange={(e) => setMemoNumber(e.target.value)}
                      placeholder="........"
                    />
                  </div>
                </div>

                <div className="wr-field-group">
                  <label htmlFor="wr-report-date">Report Date (Dated)</label>
                  <input
                    id="wr-report-date"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Working Report Period Dates */}
            <div className="wr-form-card">
              <div className="wr-card-title">
                <Calendar size={17} />
                <span>Working Report Period Dates</span>
              </div>

              <div className="wr-field-row-2">
                <div className="wr-field-group">
                  <label htmlFor="wr-period-from">From Date</label>
                  <input
                    id="wr-period-from"
                    type="date"
                    value={periodFrom}
                    onChange={(e) => handlePeriodDateChange('from', e.target.value)}
                  />
                </div>

                <div className="wr-field-group">
                  <label htmlFor="wr-period-to">To Date</label>
                  <input
                    id="wr-period-to"
                    type="date"
                    value={periodTo}
                    onChange={(e) => handlePeriodDateChange('to', e.target.value)}
                  />
                </div>
              </div>

              {calendarStats && (
                <div className="wr-calendar-sync-badge">
                  <Sparkles size={14} />
                  <span>
                    Calendar sync: <strong>{calendarStats.workingDays} working days</strong> ({calendarStats.totalDays} total days − {calendarStats.sundayCount} Sundays − {calendarStats.holidayCount} closed holidays)
                  </span>
                </div>
              )}
            </div>

            {/* Section 3: Teacher Selection, Attendance & Leave */}
            <div className="wr-form-card">
              <div className="wr-card-title-row">
                <div className="wr-card-title">
                  <UserCheck size={17} />
                  <span>Teacher / Staff Attendance &amp; Leave</span>
                </div>
                <button
                  type="button"
                  className="wr-add-staff-btn"
                  onClick={handleAddStaffRow}
                  title="Add another staff row to this working report table"
                >
                  <Plus size={14} />
                  <span>Add Staff</span>
                </button>
              </div>

              {staffEntries.map((entry, idx) => (
                <div key={idx} className="wr-staff-entry-box">
                  {staffEntries.length > 1 && (
                    <div className="wr-staff-entry-header">
                      <span>Staff Row #{idx + 1}</span>
                      <button
                        type="button"
                        className="wr-remove-staff-btn"
                        onClick={() => handleRemoveStaffRow(idx)}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}

                  {/* Teacher Dropdown */}
                  <div className="wr-field-group">
                    <label htmlFor={`wr-teacher-select-${idx}`}>Select Teacher</label>
                    <select
                      id={`wr-teacher-select-${idx}`}
                      value={entry.teacherId || entry.name}
                      onChange={(e) => handleSelectTeacher(idx, e.target.value)}
                    >
                      <option value="">-- Select Teacher from Dropdown --</option>
                      {sortedTeachers.map((t) => {
                        const tid = t.teacherId || t._id || t.name;
                        return (
                          <option key={tid} value={tid}>
                            {t.slNo ? `${t.slNo}. ` : ''}
                            {t.name} {t.role ? `(${t.role})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Salutation, Pronoun (He/She) & Designation */}
                  <div className="wr-field-row-3">
                    <div className="wr-field-group">
                      <label htmlFor={`wr-salutation-${idx}`}>Title / Salutation</label>
                      <select
                        id={`wr-salutation-${idx}`}
                        value={entry.salutation}
                        onChange={(e) => handleSalutationChange(idx, e.target.value)}
                      >
                        {SALUTATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="wr-field-group">
                      <label htmlFor={`wr-pronoun-${idx}`}>Pronoun (N.B.)</label>
                      <select
                        id={`wr-pronoun-${idx}`}
                        value={entry.pronoun || getPronounForSalutation(entry.salutation)}
                        onChange={(e) =>
                          updateStaffEntry(idx, (r) => ({ ...r, pronoun: e.target.value }))
                        }
                      >
                        <option value="He">He</option>
                        <option value="She">She</option>
                        <option value="He/She">He/She</option>
                      </select>
                    </div>

                    <div className="wr-field-group">
                      <label htmlFor={`wr-designation-${idx}`}>Designation</label>
                      <input
                        id={`wr-designation-${idx}`}
                        type="text"
                        list={`wr-desig-list-${idx}`}
                        value={entry.designation}
                        onChange={(e) =>
                          updateStaffEntry(idx, (r) => ({ ...r, designation: e.target.value }))
                        }
                        placeholder="e.g. GT, TGT"
                      />
                      <datalist id={`wr-desig-list-${idx}`}>
                        {DESIGNATION_OPTIONS.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Working Days & Days Present */}
                  <div className="wr-field-row-2">
                    <div className="wr-field-group">
                      <label htmlFor={`wr-working-days-${idx}`}>Total Working Days</label>
                      <input
                        id={`wr-working-days-${idx}`}
                        type="number"
                        min="0"
                        max="366"
                        value={entry.workingDays}
                        onChange={(e) => handleWorkingDaysChange(idx, e.target.value)}
                        placeholder="e.g. 23"
                      />
                    </div>

                    <div className="wr-field-group">
                      <label htmlFor={`wr-days-present-${idx}`}>Total Days Present</label>
                      <input
                        id={`wr-days-present-${idx}`}
                        type="number"
                        min="0"
                        max="366"
                        value={entry.daysPresent}
                        onChange={(e) => handleDaysPresentChange(idx, e.target.value)}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>

                  {/* Multi-Type Leave Breakdown (e.g. 1 ML & 2 CL) */}
                  <div className="wr-leaves-section">
                    <div className="wr-leaves-header">
                      <span className="wr-leaves-title">
                        Leave Details
                        <span className="wr-leaves-total-pill">
                          Total: {getEntryTotalLeaveDays(entry)} {getEntryTotalLeaveDays(entry) === 1 ? 'Day' : 'Days'}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="wr-add-leave-btn"
                        onClick={() => handleAddLeaveItem(idx)}
                        title="Add another leave type (e.g. 1 ML & 2 CL)"
                      >
                        <Plus size={13} />
                        <span>Add Leave Type</span>
                      </button>
                    </div>

                    <div className="wr-leaves-list">
                      {(entry.leaves || []).map((leaveItem, lIdx) => (
                        <div key={lIdx} className="wr-leave-item-card">
                          <div className="wr-leave-item-row">
                            <div className="wr-field-group wr-leave-days-col">
                              <label htmlFor={`wr-leave-days-${idx}-${lIdx}`}>Days</label>
                              <input
                                id={`wr-leave-days-${idx}-${lIdx}`}
                                type="number"
                                min="0"
                                max="366"
                                value={leaveItem.leaveDays}
                                onChange={(e) =>
                                  handleLeaveItemDaysChange(idx, lIdx, e.target.value)
                                }
                                placeholder="0"
                              />
                            </div>

                            <div className="wr-field-group wr-leave-type-col">
                              <label htmlFor={`wr-leave-type-${idx}-${lIdx}`}>Leave Type</label>
                              <select
                                id={`wr-leave-type-${idx}-${lIdx}`}
                                value={leaveItem.leaveType}
                                onChange={(e) =>
                                  handleLeaveItemTypeChange(idx, lIdx, e.target.value)
                                }
                              >
                                {LEAVE_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt.code} value={opt.code}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {(entry.leaves.length > 1 ||
                              (Number(leaveItem.leaveDays) || 0) > 0 ||
                              leaveItem.leaveType !== 'Nil') && (
                              <button
                                type="button"
                                className="wr-remove-leave-btn"
                                onClick={() => handleRemoveLeaveItem(idx, lIdx)}
                                title={
                                  entry.leaves.length > 1
                                    ? 'Remove this leave row'
                                    : 'Clear leave to Nil'
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          {leaveItem.leaveType === 'Other' && (
                            <div className="wr-field-group" style={{ marginTop: '6px' }}>
                              <input
                                type="text"
                                value={leaveItem.customLeaveType || ''}
                                onChange={(e) =>
                                  handleCustomLeaveTypeChange(idx, lIdx, e.target.value)
                                }
                                placeholder="Specify custom leave code or name"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {entry.workingDays !== '' &&
                      entry.daysPresent !== '' &&
                      getEntryTotalLeaveDays(entry) !==
                        Math.max(0, Number(entry.workingDays) - Number(entry.daysPresent)) && (
                        <div className="wr-leave-mismatch-hint">
                          <span>
                            Leave sum is <strong>{getEntryTotalLeaveDays(entry)}</strong> days (Working{' '}
                            {entry.workingDays} − Present {entry.daysPresent} ={' '}
                            {Math.max(0, Number(entry.workingDays) - Number(entry.daysPresent))})
                          </span>
                          <button
                            type="button"
                            className="wr-sync-present-btn"
                            onClick={() => handleSyncPresentFromLeaves(idx)}
                          >
                            Set Present ={' '}
                            {Math.max(0, Number(entry.workingDays) - getEntryTotalLeaveDays(entry))}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 4: Salutation & N.B Note */}
            <div className="wr-form-card">
              <div className="wr-card-title">
                <Clock size={17} />
                <span>Letter Salutation &amp; Note (N.B)</span>
              </div>

              <div className="wr-field-row-2">
                <div className="wr-field-group">
                  <label htmlFor="wr-salutation-header">Address Salutation</label>
                  <select
                    id="wr-salutation-header"
                    value={salutationHeader}
                    onChange={(e) => setSalutationHeader(e.target.value)}
                  >
                    <option value="Sir,">Sir,</option>
                    <option value="Madam,">Madam,</option>
                    <option value="Sir/Madam,">Sir/Madam,</option>
                  </select>
                </div>
              </div>

              <div className="wr-field-group">
                <div className="wr-nb-label-row">
                  <label htmlFor="wr-nb-note">N.B Note Line</label>
                  {isNbManuallyEdited && (
                    <button
                      type="button"
                      className="wr-reset-nb-btn"
                      onClick={() => {
                        setIsNbManuallyEdited(false);
                        setCustomNbNote('');
                      }}
                    >
                      Auto-generate
                    </button>
                  )}
                </div>
                <input
                  id="wr-nb-note"
                  type="text"
                  value={effectiveNbNote}
                  onChange={(e) => {
                    setIsNbManuallyEdited(true);
                    setCustomNbNote(e.target.value);
                  }}
                  placeholder="N.B: She has enjoyed 1 day ML ."
                />
              </div>
            </div>
          </div>

          {/* RIGHT: OFFICIAL DOCUMENT LIVE PREVIEW */}
          <div className="wr-preview-panel">
            <div className="wr-preview-toolbar">
              <span className="wr-preview-badge">OFFICIAL A4 LETTER PREVIEW</span>
              <span className="wr-preview-tip">Updates live as you type</span>
            </div>

            <div className="wr-paper-wrapper">
              <div
                className="wr-paper-sheet"
                dangerouslySetInnerHTML={{
                  __html: generateOfficialDocumentHtml(true)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkingReport;
