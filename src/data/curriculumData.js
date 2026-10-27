/**
 * PM SHRI Moharcherra H.S. School
 * Standard Curriculum & Subjects mapped by Academic Class
 */

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

  // Secondary Wing (Class IX & X)
  'class-9': [
    'English',
    'Bengali',
    'Mathematics',
    'Science (Physics, Biology, Chemistry)',
    'Social Science',
    'IT/ITeS',
    'Physical Education'
  ],
  'class-10': [
    'English',
    'Bengali',
    'Mathematics',
    'Science (Physics, Biology, Chemistry)',
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
