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

export const getConsolidatedSubjectsForClass = (classId) => {
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
  'class-1': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-2': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-3': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-4': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],
  'class-5': ['English', 'Bengali', 'Mathematics', 'Environmental Studies (EVS)', 'Physical Education', 'Art & Craft'],

  // Elementary Wing (Class VI - VIII)
  'class-6': ['English', 'Bengali', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],
  'class-7': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],
  'class-8': ['English', 'Bengali', 'Sanskrit', 'Science', 'Social Science', 'Mathematics', 'Physical Education', 'Work Education'],

  // Secondary Wing (Class IX & X) - Science & Social Science with component sub-subjects
  'class-9': [
    'English',
    'Bengali',
    'Mathematics',
    'Science (Physics)',
    'Science (Chemistry)',
    'Science (Life Science)',
    'Social Science (History)',
    'Social Science (Geography)',
    'Social Science (Economics)',
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
    'Social Science (History)',
    'Social Science (Geography)',
    'Social Science (Economics)',
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
