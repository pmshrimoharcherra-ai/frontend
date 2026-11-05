/**
 * PM SHRI Moharcherra H.S. School
 * Standard Curriculum & Subjects mapped by Academic Class
 */

export const DEFAULT_WEIGHTAGE_SCHEME = {
  science: [
    { id: 'life-science', name: 'Life Science / Biology', label: 'Science (Life Science)', max80: 30, max40: 15 },
    { id: 'physics', name: 'Physics', label: 'Science (Physics)', max80: 25, max40: 12.5 },
    { id: 'chemistry', name: 'Chemistry', label: 'Science (Chemistry)', max80: 25, max40: 12.5 }
  ],
  socialScience: [
    { id: 'history', name: 'History', label: 'Social Science (History)', max80: 28, max40: 14 },
    { id: 'geography', name: 'Geography', label: 'Social Science (Geography)', max80: 26, max40: 13 },
    { id: 'economics', name: 'Economics', label: 'Social Science (Economics)', max80: 26, max40: 13 }
  ]
};

export const SCIENCE_PARTS = DEFAULT_WEIGHTAGE_SCHEME.science;
export const SOCIAL_SCIENCE_PARTS = DEFAULT_WEIGHTAGE_SCHEME.socialScience;

/**
 * Retrieve the active weightage scheme (from localStorage or defaults)
 */
export const getSubjectWeightageScheme = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('pmshri_subject_weightage_scheme') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const parsedScience = Array.isArray(parsed.science) ? parsed.science : [];
        const parsedSocial = Array.isArray(parsed.socialScience) ? parsed.socialScience : [];

        // Always guarantee all 3 Science parts: Life Science, Physics, Chemistry
        const fullScience = DEFAULT_WEIGHTAGE_SCHEME.science.map((defPart) => {
          const match = parsedScience.find(
            (p) =>
              p.id === defPart.id ||
              p.label === defPart.label ||
              (p.name && p.name.toLowerCase().includes(defPart.id))
          );
          return match
            ? {
                ...defPart,
                max80: match.max80 !== undefined ? Number(match.max80) : defPart.max80,
                max40: match.max40 !== undefined ? Number(match.max40) : defPart.max40
              }
            : defPart;
        });

        // Always guarantee all 3 Social Science parts: History, Geography, Economics
        let fullSocial = DEFAULT_WEIGHTAGE_SCHEME.socialScience.map((defPart) => {
          const match = parsedSocial.find(
            (p) =>
              p.id === defPart.id ||
              p.label === defPart.label ||
              (p.name && p.name.toLowerCase().includes(defPart.id))
          );
          return match
            ? {
                ...defPart,
                max80: match.max80 !== undefined ? Number(match.max80) : defPart.max80,
                max40: match.max40 !== undefined ? Number(match.max40) : defPart.max40
              }
            : defPart;
        });

        // If the stored data was missing any of the 3 parts or has the old interim 60M/30M scheme, upgrade and heal localStorage
        let needsSave = parsedScience.length < 3 || parsedSocial.length < 3;
        const socTotal80 = fullSocial.reduce((sum, p) => sum + Number(p.max80 || 0), 0);
        const socTotal40 = fullSocial.reduce((sum, p) => sum + Number(p.max40 || 0), 0);
        if (socTotal80 === 60 && socTotal40 === 30) {
          fullSocial = DEFAULT_WEIGHTAGE_SCHEME.socialScience;
          needsSave = true;
        }

        if (needsSave) {
          localStorage.setItem('pmshri_subject_weightage_scheme', JSON.stringify({
            science: fullScience,
            socialScience: fullSocial
          }));
        }

        return {
          science: fullScience,
          socialScience: fullSocial
        };
      }
    }
  } catch (err) {
    console.warn('Error reading weightage scheme from storage, using defaults:', err);
  }
  return DEFAULT_WEIGHTAGE_SCHEME;
};

/**
 * Save updated weightage scheme
 */
export const saveSubjectWeightageScheme = (newScheme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pmshri_subject_weightage_scheme', JSON.stringify(newScheme));
    window.dispatchEvent(new Event('pmshri_weightage_scheme_updated'));
  }
};

/**
 * Reset weightage scheme back to default board standards
 */
export const resetSubjectWeightageScheme = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pmshri_subject_weightage_scheme');
    window.dispatchEvent(new Event('pmshri_weightage_scheme_updated'));
  }
  return DEFAULT_WEIGHTAGE_SCHEME;
};

export const isSecondarySciencePart = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = (subject || '').toLowerCase();
  return s.includes('physics') || s.includes('chemistry') || s.includes('life science') || s.includes('biology');
};

export const isSecondarySocialSciencePart = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = (subject || '').toLowerCase();
  return s.includes('history') || s.includes('geography') || s.includes('economics');
};

export const isCombinedScience = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = (subject || '').trim().toLowerCase();
  return s === 'science' || s === 'science (combined)' || s === 'science (combined - total)';
};

export const isCombinedSocialScience = (classId, subject = '') => {
  if (classId !== 'class-9' && classId !== 'class-10') return false;
  const s = (subject || '').trim().toLowerCase();
  return s === 'social science' || s === 'social science (combined)';
};

export const getConsolidatedSubjectsForClass = (classId, examTerm = '') => {
  const isPeriodic = examTerm && (examTerm.includes('40') || examTerm.toLowerCase().includes('periodic'));
  if (classId === 'class-6') {
    return [
      'English',
      'Bengali',
      'Science',
      'Social Science',
      'Mathematics'
    ];
  }
  if (classId === 'class-9' || classId === 'class-10') {
    if (isPeriodic) {
      // IT/ITeS does not have Periodic Tests (evaluated only in Half Yearly & Annual Examination)
      return [
        'English',
        'Bengali',
        'Mathematics',
        'Science',
        'Social Science'
      ];
    }
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
  const s = (subject || '').trim().toLowerCase();

  // IT/ITeS has no periodic test; evaluated only on Half Yearly & Annual Examination with 80 marks
  if (
    s === 'it/ites' ||
    s === 'it' ||
    s.includes('ites') ||
    s.includes('information technology') ||
    s.includes('vocational')
  ) {
    return 80;
  }

  const isSecondary = classId === 'class-9' || classId === 'class-10';
  const isPeriodic = examTerm && (examTerm.includes('40') || examTerm.toLowerCase().includes('periodic'));
  const scheme = getSubjectWeightageScheme();

  if (isSecondary) {
    const s = (subject || '').toLowerCase();

    // Check Science sub-subjects
    if (s.includes('life science') || s.includes('biology')) {
      const part = scheme.science.find((p) => p.id === 'life-science');
      return isPeriodic ? (part?.max40 ?? 15) : (part?.max80 ?? 30);
    }
    if (s.includes('physics')) {
      const part = scheme.science.find((p) => p.id === 'physics');
      return isPeriodic ? (part?.max40 ?? 12.5) : (part?.max80 ?? 25);
    }
    if (s.includes('chemistry')) {
      const part = scheme.science.find((p) => p.id === 'chemistry');
      return isPeriodic ? (part?.max40 ?? 12.5) : (part?.max80 ?? 25);
    }
    if (s === 'science' || s === 'science (combined)') {
      const total = scheme.science.reduce((sum, p) => sum + (isPeriodic ? Number(p.max40) : Number(p.max80)), 0);
      return total || (isPeriodic ? 40 : 80);
    }

    // Check Social Science sub-subjects
    if (s.includes('history')) {
      const part = scheme.socialScience.find((p) => p.id === 'history');
      return isPeriodic ? (part?.max40 ?? 14) : (part?.max80 ?? 28);
    }
    if (s.includes('geography')) {
      const part = scheme.socialScience.find((p) => p.id === 'geography');
      return isPeriodic ? (part?.max40 ?? 13) : (part?.max80 ?? 26);
    }
    if (s.includes('economics')) {
      const part = scheme.socialScience.find((p) => p.id === 'economics');
      return isPeriodic ? (part?.max40 ?? 13) : (part?.max80 ?? 26);
    }
    if (s === 'social science' || s === 'social science (combined)') {
      const total = scheme.socialScience.reduce((sum, p) => sum + (isPeriodic ? Number(p.max40) : Number(p.max80)), 0);
      return total || (isPeriodic ? 40 : 80);
    }
  }

  return isPeriodic ? 40 : 80;
};

export const CLASS_CURRICULUM = {
  // Primary Wing (Class I - V)
  'class-1': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Art & Craft'],
  'class-2': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Art & Craft'],
  'class-3': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Art & Craft'],
  'class-4': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Art & Craft'],
  'class-5': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Art & Craft'],

  // Elementary Wing (Class VI - VIII)
  'class-6': ['English', 'Bengali', 'Science', 'Social Science', 'Mathematics', 'Work Education'],
  'class-7': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Work Education'],
  'class-8': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Work Education'],

  // Secondary Wing (Class IX & X) - 5 Mandatory Core + 1 Optional (IT/ITeS)
  'class-9': [
    'English',
    'Bengali',
    'Science',
    'Social Science',
    'Mathematics',
    'IT/ITeS'
  ],
  'class-10': [
    'English',
    'Bengali',
    'Science',
    'Social Science',
    'Mathematics',
    'IT/ITeS'
  ],

  // Higher Secondary Wing — Arts Stream (Class XI & XII Arts)
  'class-11-arts': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Political Science',
    'Philosophy',
    'History',
    'Education'
  ],
  'class-12-arts': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Political Science',
    'Philosophy',
    'History',
    'Education'
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
    'Philosophy'
  ],
  'class-12-sci': [
    'English',
    'Bengali',
    'IT/ITeS',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Philosophy'
  ],

  // Higher Secondary Wing — Unified Arts & Science (Class XI & XII)
  'class-11': [
    'English',
    'Bengali',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Philosophy',
    'Education',
    'Political Science',
    'IT/ITeS'
  ],
  'class-12': [
    'English',
    'Bengali',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Philosophy',
    'Education',
    'Political Science',
    'IT/ITeS'
  ]
};

export const getSubjectsForClass = (classId) => {
  if (!classId) return [];
  const cid = String(classId).toLowerCase();
  if (cid === 'class-11' || cid === 'class-12') {
    return [
      'English',
      'Bengali',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'History',
      'Philosophy',
      'Education',
      'Political Science',
      'IT/ITeS'
    ];
  }
  return CLASS_CURRICULUM[classId] || [
    'English',
    'Bengali',
    'Mathematics',
    'Science',
    'Social Science'
  ];
};

// Sub-component breakdown used strictly for examination evaluations
export const SECONDARY_EXAM_SUBJECTS = [
  'English',
  'Bengali',
  'Mathematics',
  'Science (Physics)',
  'Science (Chemistry)',
  'Science (Life Science)',
  'Social Science (History)',
  'Social Science (Geography)',
  'Social Science (Economics)',
  'IT/ITeS'
];

export const getExamSubjectsForClass = (classId, examTerm = '') => {
  const isPeriodic = examTerm && (examTerm.includes('40') || examTerm.toLowerCase().includes('periodic'));
  if (classId === 'class-9' || classId === 'class-10') {
    if (isPeriodic) {
      // IT/ITeS does not have Periodic Tests (evaluated only in Half Yearly & Annual Examination)
      return SECONDARY_EXAM_SUBJECTS.filter((s) => !s.toLowerCase().includes('it/ites'));
    }
    return SECONDARY_EXAM_SUBJECTS;
  }
  return getSubjectsForClass(classId).filter(
    (s) => s !== 'Art & Craft' && s !== 'Work Education' && s !== 'Physical Education'
  );
};

// Class X IT/ITeS Vocational Sectors
export const CLASS10_SECTOR_1_ROLLS = [
  1, 2, 3, 5, 8, 10, 13, 15, 17, 20,
  21, 22, 29, 31, 32, 34, 36, 40, 42, 48,
  51, 52, 54, 55, 57, 58, 59, 61, 63, 67,
  68, 70, 71, 73, 75, 77, 78, 80, 81
];

export const CLASS10_SECTOR_2_ROLLS = [
  4, 6, 7, 9, 11, 12, 14, 16, 18, 19,
  23, 24, 25, 26, 27, 28, 30, 33, 35, 37,
  38, 39, 41, 43, 44, 45, 46, 47, 49, 50,
  53, 56, 62, 64, 65, 66, 69, 72, 74, 79
];

export const getStudentSector = (st) => {
  if (!st) return '';
  if (st.sector) return st.sector;
  if (st.vocationalSector) return st.vocationalSector;
  const rollNum = parseInt(st.roll || st.rollNumber, 10);
  const isC10 = String(st.classId || '').includes('10');
  if (isC10 && rollNum) {
    if (CLASS10_SECTOR_1_ROLLS.includes(rollNum)) return 'Sector 1';
    if (CLASS10_SECTOR_2_ROLLS.includes(rollNum)) return 'Sector 2';
  }
  return '';
};

export const STREAM_RULES = {
  secondary: {
    title: 'Secondary Curriculum (Classes IX & X)',
    mandatory: ['English', 'Bengali', 'Science', 'Social Science', 'Mathematics'],
    optionalElectives: ['IT/ITeS'],
    maxSubjects: 6,
    minSubjects: 5
  },
  arts: {
    title: 'Higher Secondary — Arts Stream',
    mandatory: ['English', 'Bengali', 'History', 'Education', 'Political Science'],
    optionalElectives: ['Philosophy', 'IT/ITeS'],
    maxSubjects: 6,
    minSubjects: 5
  },
  science: {
    title: 'Higher Secondary — Science Stream',
    mandatory: ['English', 'Bengali', 'Biology', 'Chemistry', 'Physics'],
    optionalElectives: ['Mathematics', 'Philosophy', 'IT/ITeS'],
    maxSubjects: 6,
    minSubjects: 5
  }
};

export const SECONDARY_STREAM_SUBJECTS = [
  'English',
  'Bengali',
  'Science',
  'Social Science',
  'Mathematics',
  'IT/ITeS'
];

export const SENIOR_STREAM_SUBJECTS = {
  arts: [
    'English',
    'Bengali',
    'History',
    'Education',
    'Political Science',
    'Philosophy',
    'IT/ITeS'
  ],
  science: [
    'English',
    'Bengali',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Philosophy',
    'IT/ITeS'
  ]
};

export const SUBJECT_COLOR_MAP = {
  'Bengali':           { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  'English':           { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  'Mathematics':       { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' },
  'Science':           { bg: '#ecfdf5', border: '#10b981', text: '#065f46', dot: '#10b981' },
  'Social Science':    { bg: '#fff7ed', border: '#f97316', text: '#9a3412', dot: '#f97316' },
  'Political Science': { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', dot: '#8b5cf6' },
  'History':           { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', dot: '#ec4899' },
  'Education':         { bg: '#e0f2fe', border: '#0ea5e9', text: '#075985', dot: '#0ea5e9' },
  'Geography':         { bg: '#d1fae5', border: '#10b981', text: '#065f46', dot: '#10b981' },
  'Philosophy':        { bg: '#fef9c3', border: '#eab308', text: '#713f12', dot: '#eab308' },
  'Physics':           { bg: '#e0f2fe', border: '#0ea5e9', text: '#075985', dot: '#0ea5e9' },
  'Chemistry':         { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  'Biology':           { bg: '#dcfce7', border: '#16a34a', text: '#14532d', dot: '#16a34a' },
  'IT/ITeS':           { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
};

export const getSelectableSubjectsForClass = (classId = '') => {
  const cid = (classId || '').toLowerCase();
  if (cid === 'class-11' || cid === 'class-12') {
    return [
      'English',
      'Bengali',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'History',
      'Philosophy',
      'Education',
      'Political Science',
      'IT/ITeS'
    ];
  }
  if (cid.includes('sci')) {
    return SENIOR_STREAM_SUBJECTS.science;
  }
  if (cid.includes('arts')) {
    return SENIOR_STREAM_SUBJECTS.arts;
  }
  if (cid === 'class-9' || cid === 'class-10') {
    return SECONDARY_STREAM_SUBJECTS;
  }
  return (CLASS_CURRICULUM[classId] || [
    'English',
    'Bengali',
    'Mathematics',
    'Science',
    'Social Science'
  ]).filter(s => s !== 'Physical Education' && s !== 'Art & Craft' && s !== 'Work Education');
};
