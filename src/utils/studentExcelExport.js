import * as XLSX from 'xlsx';
import { getStudentSector, getSubjectsForClass, STREAM_RULES } from '../data/curriculumData';
import { isTransferredStudent, isTransferredOrFailed } from './studentStatus';

/**
 * Format a 12-digit number (like Aadhaar or APAAR ID) with standard 4-digit groups (e.g. 9446 8689 0759)
 */
export const formatGroupedId = (val) => {
  if (!val || val === '—' || val === 'Not Recorded' || val === 'Pending') return val || '—';
  const clean = String(val).replace(/\s+/g, '');
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
  }
  return val;
};

/**
 * Normalize student roll number with 2-digit zero-padding
 */
export const formatRollNumber = (roll) => {
  if (roll === undefined || roll === null || roll === '') return '—';
  const num = parseInt(roll, 10);
  if (!isNaN(num)) {
    return String(num).padStart(2, '0');
  }
  return String(roll).trim();
};

/**
 * Get comprehensive list of enrolled subjects for a student
 */
export const getStudentSubjectsList = (student, classId) => {
  if (!student) return '—';

  // If student has explicit subjects array in database
  if (Array.isArray(student.subjects) && student.subjects.length > 0) {
    return student.subjects.join(', ');
  }

  // Fallback to class curriculum
  const targetClassId = student.classId || classId || '';
  const isSecondary = targetClassId === 'class-9' || targetClassId === 'class-10';
  const isSenior = targetClassId.includes('11') || targetClassId.includes('12');
  const streamKey = isSecondary ? 'secondary' : (targetClassId.includes('sci') ? 'science' : (isSenior ? 'arts' : null));
  const streamRule = streamKey ? STREAM_RULES[streamKey] : null;

  const defaultSubjects = getSubjectsForClass(targetClassId).filter(
    (s) => s !== 'Physical Education' && s !== 'Art & Craft' && s !== 'Work Education'
  );

  if (isSecondary) {
    const list = ['English', 'Bengali', 'Science', 'Social Science', 'Mathematics'];
    const sec = getStudentSector(student);
    if (sec || student.optionalSubject?.includes('IT')) {
      list.push('IT/ITeS (Vocational)');
    }
    return list.join(', ');
  }

  return defaultSubjects.length > 0 ? defaultSubjects.join(', ') : '—';
};

/**
 * Export complete students dataset to a beautifully formatted, responsive Microsoft Excel (.xlsx) workbook.
 *
 * @param {Object} options
 * @param {Array} options.students - List of student objects to export
 * @param {Object|string} options.currentClass - Current class metadata { id, name, wing, stream }
 * @param {string} [options.customTitle] - Optional custom title for filename
 * @param {boolean} [options.includeTransferred=true] - Whether to include transferred students
 */
export const exportStudentsToExcel = ({
  students = [],
  currentClass = null,
  customTitle = '',
  includeTransferred = true
}) => {
  if (!students || students.length === 0) {
    throw new Error('No student records available to export.');
  }

  const className = typeof currentClass === 'string'
    ? currentClass
    : (currentClass?.name || 'Students Directory');

  const classId = typeof currentClass === 'object' ? currentClass?.id : '';
  const wing = typeof currentClass === 'object' ? currentClass?.wing : '';
  const stream = typeof currentClass === 'object' ? currentClass?.stream : '';

  // Filter or keep all students
  const targetStudents = includeTransferred
    ? students
    : students.filter((s) => !isTransferredOrFailed(s));

  if (targetStudents.length === 0) {
    throw new Error('No matching students found to export.');
  }

  // Sort by roll number ascending
  const sortedStudents = [...targetStudents].sort((a, b) => {
    const rA = parseInt(a.roll || a.rollNumber || 0, 10);
    const rB = parseInt(b.roll || b.rollNumber || 0, 10);
    return rA - rB;
  });

  // Comprehensive column headers
  const headers = [
    'Sl. No.',
    'Roll No.',
    'Student Full Name',
    'Class',
    'Wing / Stream',
    'Gender',
    'Date of Birth (DOB)',
    'Social Category (Caste)',
    "Father's Name",
    "Mother's Name",
    'Primary Guardian',
    'Contact Phone Number',
    'Aadhaar Number',
    'APAAR ID (12-Digit)',
    'PEN Number (UDISE+)',
    'Board Registration / Enrollment No.',
    'Enrollment Year',
    'Registration Year',
    'Admission Number',
    'Admission Date',
    'Permanent Address / Village',
    'Blood Group',
    'Enrolled Subjects',
    'Vocational Sector / Trade',
    'Overall Attendance %',
    'Enrollment Status',
    'Academic Session',
    'School Name'
  ];

  // Map each student to complete row
  const rows = sortedStudents.map((st, index) => {
    const sec = getStudentSector(st);
    const isTransferred = isTransferredStudent(st);
    const effectiveStatus = isTransferred
      ? 'Transferred (TC Issued)'
      : (st.status === 'Failed' ? 'Failed' : (st.status === 'Leave' ? 'On Leave' : (st.status || 'Enrolled')));

    const studentClassDisplay = st.className || className || 'Class XII (Arts)';
    const studentWingStream = stream
      ? `${stream} Stream (${wing || 'Higher Secondary'})`
      : (st.classId?.includes('sci') ? 'Science Stream' : (st.classId?.includes('arts') ? 'Arts Stream' : (wing || 'General')));

    return {
      'Sl. No.': index + 1,
      'Roll No.': formatRollNumber(st.roll || st.rollNumber),
      'Student Full Name': st.name || '—',
      'Class': studentClassDisplay,
      'Wing / Stream': studentWingStream,
      'Gender': st.gender || 'Boy',
      'Date of Birth (DOB)': st.dob || '—',
      'Social Category (Caste)': (st.caste || 'GEN').toUpperCase(),
      "Father's Name": st.father || (isTransferred ? 'Transfer Certificate (T/C)' : '—'),
      "Mother's Name": st.mother || '—',
      'Primary Guardian': st.guardian || st.father || '—',
      'Contact Phone Number': st.phone || '—',
      'Aadhaar Number': formatGroupedId(st.aadhaar),
      'APAAR ID (12-Digit)': formatGroupedId(st.apaarId),
      'PEN Number (UDISE+)': st.penNumber || '—',
      'Board Registration / Enrollment No.': st.enrollmentNo && st.enrollmentNo !== '—' ? st.enrollmentNo : '—',
      'Enrollment Year': st.enrollmentYear || '2026',
      'Registration Year': st.registrationYear || '—',
      'Admission Number': st.admissionNo ? `#${st.admissionNo}` : '—',
      'Admission Date': st.admissionDate || '—',
      'Permanent Address / Village': st.address || '—',
      'Blood Group': st.bloodGroup || '—',
      'Enrolled Subjects': getStudentSubjectsList(st, classId),
      'Vocational Sector / Trade': sec ? `${sec} (IT/ITeS)` : (st.subjects?.some(s => /it/i.test(s)) ? 'IT/ITeS' : 'None'),
      'Overall Attendance %': st.attendance || '0%',
      'Enrollment Status': effectiveStatus,
      'Academic Session': st.academicYear || '2026-2027',
      'School Name': 'PM SHRI MOHARCHERRA H.S. SCHOOL'
    };
  });

  // Create worksheet with explicit headers
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

  // 1. RESPONSIVE COLUMN WIDTHS CALCULATION
  // Automatically measures the length of all values and sets comfortable wch padding
  const colWidths = headers.map((header) => {
    let maxLen = header.length;
    rows.forEach((row) => {
      const val = row[header];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    });

    // Provide comfortable minimum and maximum widths per column type
    if (header === 'Sl. No.') return { wch: 8 };
    if (header === 'Roll No.') return { wch: 10 };
    if (header === 'Gender') return { wch: 10 };
    if (header === 'Social Category (Caste)') return { wch: 14 };
    if (header === 'Student Full Name') return { wch: Math.min(Math.max(maxLen + 4, 22), 35) };
    if (header.includes('Aadhaar') || header.includes('APAAR') || header.includes('PEN')) {
      return { wch: Math.max(maxLen + 3, 18) };
    }
    if (header === 'Enrolled Subjects') {
      return { wch: Math.min(Math.max(maxLen + 3, 25), 55) };
    }
    if (header.includes('Address')) {
      return { wch: Math.min(Math.max(maxLen + 3, 20), 45) };
    }

    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });

  ws['!cols'] = colWidths;

  // 2. ENABLE EXCEL AUTOFILTER
  // Allows user to filter directly inside Excel by Caste, Gender, Status, Sector, etc.
  if (ws['!ref']) {
    ws['!autofilter'] = { ref: ws['!ref'] };
  }

  // 3. FREEZE PANES (STICKY TOP ROW)
  // Keeps row 1 sticky as user scrolls through hundreds of students
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  // 4. ENSURE CRITICAL TEXT COLUMNS ARE STORED AS STRINGS
  // Prevents Excel from converting 12-digit Aadhaar / APAAR / Phone into scientific notation (e.g. 9.44E+11)
  const range = XLSX.utils.decode_range(ws['!ref']);
  const stringColIndices = [
    headers.indexOf('Roll No.'),
    headers.indexOf('Contact Phone Number'),
    headers.indexOf('Aadhaar Number'),
    headers.indexOf('APAAR ID (12-Digit)'),
    headers.indexOf('PEN Number (UDISE+)'),
    headers.indexOf('Board Registration / Enrollment No.'),
    headers.indexOf('Admission Number')
  ].filter(idx => idx >= 0);

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (const C of stringColIndices) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellAddress] && ws[cellAddress].v !== undefined) {
        ws[cellAddress].t = 's'; // Force string type
        ws[cellAddress].z = '@'; // Force text format
      }
    }
  }

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();

  // Excel sheet names are capped at 31 chars and cannot contain: \ / ? * : [ ]
  const safeSheetName = className
    .replace(/[\\/?*:[\]]/g, '')
    .trim()
    .slice(0, 31) || 'Students Data';

  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

  // Clean filename with date stamp
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanTitle = (customTitle || className || 'Students')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_');

  const fileName = `PM_SHRI_Moharcherra_${cleanTitle}_${dateStr}.xlsx`;

  // Trigger download in browser
  XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'binary' });

  return {
    success: true,
    count: rows.length,
    fileName
  };
};
