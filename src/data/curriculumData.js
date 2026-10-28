/**
 * PM SHRI Moharcherra H.S. School
 * Standard Curriculum & Subjects mapped by Academic Class
 */

export const SCIENCE_PARTS = [
  { id: 'life-science', name: 'Life Science', label: 'Science (Life Science)', max80: 30, max40: 15 },
  { id: 'physics', name: 'Physics', label: 'Science (Physics)', max80: 25, max40: 12.5 },
  { id: 'chemistry', name: 'Chemistry', label: 'Science (Chemistry)', max80: 25, max40: 12.5 }
];

export const isSecondarySciencePart = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = subject.toLowerCase();
  return s.includes('physics') || s.includes('chemistry') || s.includes('life science') || s.includes('biology');
};

export const isCombinedScience = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = (subject || '').trim().toLowerCase();
  return s === 'science' || s === 'science (combined)' || s === 'science (combined - total)';
};

export const getConsolidatedSubjectsForClass = (classId) => {
  if (classId === 'class-9' || classId === 'class-10') {
    return [
      'English',
      'Bengali',
      'Mathematics',
      'Science',
      'Social Science',
      'IT/ITeS'
    ];
  }
  const full = CLASS_CURRICULUM[classId] || [
    'English',
    'Bengali',
    'Sanskrit',
    'Science',
    'Social Science',
    'Mathematics'
  ];
  return full.filter(
    (s) => s !== 'Art & Craft' && s !== 'Work Education' && s !== 'Physical Education'
  );
};

export const getSubjectMaxMarks = (classId, subject, examTerm) => {
  const isSecondary = classId === 'class-9' || classId === 'class-10';
  const isPeriodic = examTerm && (examTerm.includes('40') || examTerm.toLowerCase().includes('periodic'));

  if (isSecondary) {
    const s = (subject || '').toLowerCase();
    if (s.includes('life science') || s.includes('biology')) {
      return isPeriodic ? 15 : 30;
    }
    if (s.includes('physics')) {
      return isPeriodic ? 12.5 : 25;
    }
    if (s.includes('chemistry')) {
      return isPeriodic ? 12.5 : 25;
    }
  }

  return isPeriodic ? 40 : 80;
};

export const CLASS_CURRICULUM = {
  // Primary Wing (Class I - V)
  'class-1': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-2': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-3': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-4': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-5': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],

  // Elementary Wing (Class VI - VIII)
  'class-6': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],
  'class-7': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],
  'class-8': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],

  // Secondary Wing (Class IX & X) - Science has 3 individual components: Life Science (30/15), Physics (25/12.5), Chemistry (25/12.5)
  'class-9': [
    'English',
    'Bengali',
    'Mathematics',
    'Science (Physics)',
    'Science (Chemistry)',
    'Science (Life Science)',
    'Social Science',
    'IT/ITeS',
    'Physical Education'
  ],
  'class-10': [
    'English',
    'Bengali',
    'Mathematics',
    'Science (Physics)',
    'Science (Chemistry)',
    'Science (Life Science)',
    'Social Science',
    'IT/ITeS',
    'Physical Education'
  ],

  // Higher Secondary Wing — Arts Stream (Class XI & XII Arts)
  'class-11-arts': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Political Science',
    'Philosophy',
    'History',
    'Education',
    'Physical Education'
  ],
  'class-12-arts': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Political Science',
    'Philosophy',
    'History',
    'Education',
    'Physical Education'
  ],

  // Higher Secondary Wing — Science Stream (Class XI & XII Science)
  'class-11-sci': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Philosophy',
    'Physical Education'
  ],
  'class-12-sci': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Philosophy',
    'Physical Education'
  ]
};

export const getSubjectsForClass = (classId) => {
  if (!classId) return [];
  return CLASS_CURRICULUM[classId] || [
    'English',
    'Bengali',
    'Sanskrit',
    'Mathematics',
    'Science',
    'Social Science',
    'Physical Education'
  ];
};
