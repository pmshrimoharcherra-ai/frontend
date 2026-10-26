export const quickNavCards = [
  {
    id: 'schedule',
    title: 'Examination Schedule',
    subtitle: 'View upcoming exams and important dates',
    iconType: 'calendar',
    iconBg: 'orange',
    target: '#schedule-section'
  },
  {
    id: 'results',
    title: 'Results',
    subtitle: 'Check latest examination results',
    iconType: 'document',
    iconBg: 'navy',
    target: '#results-section'
  },
  {
    id: 'guidelines',
    title: 'Exam Guidelines',
    subtitle: 'Rules and instructions for students',
    iconType: 'book',
    iconBg: 'orange',
    target: '#guidelines-section'
  },
  {
    id: 'previous-papers',
    title: 'Previous Papers',
    subtitle: 'Download question papers (if available)',
    iconType: 'download',
    iconBg: 'navy',
    target: '#papers-section'
  }
];

export const examScheduleTable = [
  {
    id: 'pt1',
    name: 'Periodic Test 1',
    tentativeDate: 'July 2026',
    classes: 'IX – XII',
    status: 'Upcoming',
    description: 'First periodic assessment to test unit comprehension for secondary and higher secondary levels.',
    details: [
      { date: '14 July 2026', subject: 'Languages (Bengali / Kokborok / English Core)', time: '10:00 AM - 11:30 AM', room: 'Rooms 101-108' },
      { date: '16 July 2026', subject: 'Mathematics / Applied Mathematics', time: '10:00 AM - 11:30 AM', room: 'Rooms 101-108' },
      { date: '18 July 2026', subject: 'Science / Physics / Pol. Science / Accountancy', time: '10:00 AM - 11:30 AM', room: 'Rooms 101-108' },
      { date: '21 July 2026', subject: 'Social Science / Chemistry / History / B.St', time: '10:00 AM - 11:30 AM', room: 'Rooms 101-108' },
      { date: '23 July 2026', subject: 'Biology / Economics / Information Tech.', time: '10:00 AM - 11:30 AM', room: 'Rooms 101-108' }
    ]
  },
  {
    id: 'half-yearly',
    name: 'Half-Yearly Examination',
    tentativeDate: 'September 2026',
    classes: 'IX – XII',
    status: 'Upcoming',
    description: 'Mid-term summative assessment covering Term 1 syllabus as per state board guidelines.',
    details: [
      { date: '15 Sep 2026', subject: 'First Language (Bengali / Kokborok / Hindi)', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' },
      { date: '18 Sep 2026', subject: 'English (Language & Literature / Core)', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' },
      { date: '21 Sep 2026', subject: 'Mathematics / Higher Math', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' },
      { date: '24 Sep 2026', subject: 'Science / Physics / Accountancy', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' },
      { date: '26 Sep 2026', subject: 'Social Science / Chemistry / Political Science', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' },
      { date: '29 Sep 2026', subject: 'Biology / Economics / History / IT', time: '09:30 AM - 12:30 PM', room: 'Main Examination Wing' }
    ]
  },
  {
    id: 'pt2',
    name: 'Periodic Test 2',
    tentativeDate: 'November 2026',
    classes: 'IX – XII',
    status: 'Upcoming',
    description: 'Second periodic assessment assessing formative understanding and project evaluations.',
    details: [
      { date: '18 Nov 2026', subject: 'Languages (Bengali / Kokborok / English)', time: '10:00 AM - 11:30 AM', room: 'Respective Classrooms' },
      { date: '20 Nov 2026', subject: 'Mathematics / Applied Maths', time: '10:00 AM - 11:30 AM', room: 'Respective Classrooms' },
      { date: '23 Nov 2026', subject: 'Science / Physics / Pol. Science', time: '10:00 AM - 11:30 AM', room: 'Respective Classrooms' },
      { date: '25 Nov 2026', subject: 'Social Science / Chemistry / History', time: '10:00 AM - 11:30 AM', room: 'Respective Classrooms' },
      { date: '27 Nov 2026', subject: 'Biology / Computer / Voc.', time: '10:00 AM - 11:30 AM', room: 'Respective Classrooms' }
    ]
  },
  {
    id: 'pre-board',
    name: 'Pre-Board Examination',
    tentativeDate: 'January 2027',
    classes: 'X & XII',
    status: 'Upcoming',
    description: 'Full-syllabus mock board examination prepared according to official TBSE board paper pattern.',
    details: [
      { date: '11 Jan 2027', subject: 'First Language / English Core', time: '10:00 AM - 01:15 PM', room: 'Senior Hall' },
      { date: '14 Jan 2027', subject: 'Mathematics / Applied Mathematics', time: '10:00 AM - 01:15 PM', room: 'Senior Hall' },
      { date: '18 Jan 2027', subject: 'Science / Physics / Accountancy', time: '10:00 AM - 01:15 PM', room: 'Senior Hall' },
      { date: '21 Jan 2027', subject: 'Social Science / Chemistry / History', time: '10:00 AM - 01:15 PM', room: 'Senior Hall' },
      { date: '24 Jan 2027', subject: 'Biology / Economics / CS / IP', time: '10:00 AM - 01:15 PM', room: 'Senior Hall' }
    ]
  },
  {
    id: 'annual',
    name: 'Annual Examination',
    tentativeDate: 'February 2027',
    classes: 'IX – XII',
    status: 'Upcoming',
    description: 'Final session-end examination determining promotion and overall academic grading.',
    details: [
      { date: '22 Feb 2027', subject: 'First Language (Bengali / Kokborok / Hindi)', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' },
      { date: '25 Feb 2027', subject: 'English (Language & Literature / Core)', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' },
      { date: '28 Feb 2027', subject: 'Mathematics', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' },
      { date: '03 Mar 2027', subject: 'Science / Physics / Accountancy', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' },
      { date: '06 Mar 2027', subject: 'Social Science / Chemistry / Political Science', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' },
      { date: '09 Mar 2027', subject: 'Vocational / Electives / IT', time: '09:30 AM - 12:30 PM', room: 'All Exam Halls' }
    ]
  }
];

export const importantNotices = [
  {
    id: 1,
    day: '15',
    month: 'OCT',
    title: 'Half-Yearly Examination Schedule',
    desc: 'The detailed schedule for Half-Yearly Examination has been published.',
    category: 'Schedule',
    fullText: 'The official timetable for the Half-Yearly Examinations 2026–27 has been finalized and displayed on the school notice board as well as the digital portal. Students from Class IX to XII are advised to collect their exam syllabus syllabus sheets from their respective class teachers.'
  },
  {
    id: 2,
    day: '28',
    month: 'SEP',
    title: 'Admit Cards for Periodic Test 1',
    desc: 'Admit cards will be issued from 1st October 2026. Students are advised to collect from the school office.',
    category: 'Admit Card',
    fullText: 'All candidates appearing for the upcoming Periodic Test must obtain their official student exam admit card from the administrative counter. Please check that student photograph and subject codes are clearly printed.'
  },
  {
    id: 3,
    day: '10',
    month: 'AUG',
    title: 'Updated Examination Guidelines',
    desc: 'Please read the updated rules and instructions for the academic session 2026 – 2027.',
    category: 'Guidelines',
    fullText: 'The Examination Committee has updated the examination code of conduct. Students must be seated 15 minutes prior to the start time. Strict disciplinary action will be taken against unauthorized electronic devices in the exam hall.'
  },
  {
    id: 4,
    day: '05',
    month: 'JUN',
    title: 'New Academic Session Information',
    desc: 'Examination pattern and assessment scheme has been released.',
    category: 'Curriculum',
    fullText: 'Under the PM SHRI educational framework aligned with NEP 2020, formative assessments will carry 20% weightage while summative examinations will carry 80% weightage for the 2026-27 session.'
  }
];

export const examGuidelinesList = [
  {
    category: 'General Conduct',
    points: [
      'Students must report to the examination hall at least 20 minutes before the commencement of the exam.',
      'Entry into the exam hall will not be permitted after 15 minutes from the start time.',
      'School uniform and valid Student ID / Admit Card are strictly mandatory.',
      'Silence and discipline must be maintained at all times inside the examination center.'
    ]
  },
  {
    category: 'Materials Permitted & Prohibited',
    points: [
      'Permitted: Blue/Black ballpoint pens, geometry tools in transparent pouches, pencils, and eraser.',
      'Strictly Prohibited: Mobile phones, smartwatches, digital calculators, study notes, or any electronic equipment.',
      'Any student caught with unauthorized material will face immediate paper cancellation under unfair means regulations.'
    ]
  },
  {
    category: 'Answer Sheet & Submission',
    points: [
      'Write your Roll Number, Subject Code, and Registration Details clearly on the cover page.',
      'Do not write your name or identifiable marks on internal pages of the answer booklet.',
      'No candidate may leave the examination room before the first hour of the examination has elapsed.'
    ]
  }
];

export const sampleQuestionPapers = [
  { class: 'Class X', subject: 'Mathematics (Standard & Basic)', year: '2025-26', size: '1.8 MB', format: 'PDF' },
  { class: 'Class X', subject: 'Science (Physics, Chemistry, Biology)', year: '2025-26', size: '2.1 MB', format: 'PDF' },
  { class: 'Class X', subject: 'Social Science (Hist, Geo, Pol.Sc, Eco)', year: '2025-26', size: '1.9 MB', format: 'PDF' },
  { class: 'Class X', subject: 'First Language (Bengali / Kokborok)', year: '2025-26', size: '1.4 MB', format: 'PDF' },
  { class: 'Class XII', subject: 'Physics (Theory + Practical Blueprint)', year: '2025-26', size: '2.4 MB', format: 'PDF' },
  { class: 'Class XII', subject: 'Chemistry (Theory + Blueprint)', year: '2025-26', size: '2.2 MB', format: 'PDF' },
  { class: 'Class XII', subject: 'Mathematics / Applied Math', year: '2025-26', size: '1.9 MB', format: 'PDF' },
  { class: 'Class XII', subject: 'Political Science & History', year: '2025-26', size: '2.0 MB', format: 'PDF' }
];

export const sampleResultsMock = [
  {
    rollNumber: '202601',
    name: 'Priyanka Debbarma',
    class: 'Class X-A',
    percentage: '94.2%',
    grade: 'A1',
    status: 'Passed with Distinction'
  },
  {
    rollNumber: '202602',
    name: 'Abhijit Roy',
    class: 'Class XII-Science',
    percentage: '92.8%',
    grade: 'A1',
    status: 'Passed with Distinction'
  },
  {
    rollNumber: '202603',
    name: 'Sneha Jamatia',
    class: 'Class X-B',
    percentage: '88.5%',
    grade: 'A2',
    status: 'Passed with First Division'
  }
];
