// Academic Calendar Data for PM SHRI Moharcherra H.S. School

export const academicYears = [
  '2026 – 2027',
  '2025 – 2026',
  '2024 – 2025',
  '2023 – 2024'
];

export const monthsData = [
  { key: 0, label: 'Jan', name: 'January', year: 2027, daysInMonth: 31, startDayOfWeek: 5 }, // 2027 Jan starts on Fri
  { key: 1, label: 'Feb', name: 'February', year: 2027, daysInMonth: 28, startDayOfWeek: 1 },
  { key: 2, label: 'Mar', name: 'Mar', nameFull: 'March', year: 2027, daysInMonth: 31, startDayOfWeek: 1 },
  { key: 3, label: 'Apr', name: 'April', year: 2026, daysInMonth: 30, startDayOfWeek: 3 },
  { key: 4, label: 'May', name: 'May', year: 2026, daysInMonth: 31, startDayOfWeek: 5 },
  { key: 5, label: 'Jun', name: 'June', year: 2026, daysInMonth: 30, startDayOfWeek: 1 },
  { key: 6, label: 'Jul', name: 'July', year: 2026, daysInMonth: 31, startDayOfWeek: 3 },
  { key: 7, label: 'Aug', name: 'August', year: 2026, daysInMonth: 31, startDayOfWeek: 6 },
  { key: 8, label: 'Sep', name: 'September', year: 2026, daysInMonth: 30, startDayOfWeek: 2 },
  { key: 9, label: 'Oct', name: 'October', year: 2026, daysInMonth: 31, startDayOfWeek: 4 }, // 2026 Oct starts on Thu (Thu = index 4 if Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7)
  { key: 10, label: 'Nov', name: 'November', year: 2026, daysInMonth: 30, startDayOfWeek: 7 },
  { key: 11, label: 'Dec', name: 'December', year: 2026, daysInMonth: 31, startDayOfWeek: 2 }
];

// Events organized by month key (0-11)
export const monthlyEvents = {
  9: [ // October 2026
    {
      id: 'oct-1',
      date: 5,
      month: 'OCT',
      year: 2026,
      title: 'School Reopens',
      type: 'academic',
      color: '#ea580c',
      description: 'Beginning of regular classes after vacation',
      time: '09:00 AM – 03:30 PM',
      venue: 'School Campus',
      category: 'Academic'
    },
    {
      id: 'oct-2',
      date: 12,
      month: 'OCT',
      year: 2026,
      title: 'Unit Test – 1',
      type: 'exam',
      color: '#0284c7',
      description: 'For Classes IX – XII',
      time: '10:00 AM – 01:00 PM',
      venue: 'Classrooms & Exam Hall',
      category: 'Examination'
    },
    {
      id: 'oct-3',
      date: 21,
      month: 'OCT',
      year: 2026,
      title: 'Parent–Teacher Meeting',
      type: 'activity',
      color: '#16a34a',
      description: 'Interaction with parents and class teachers',
      time: '10:00 AM – 02:00 PM',
      venue: 'School Auditorium & Classrooms',
      category: 'Meeting & Activity'
    },
    {
      id: 'oct-4',
      date: 28,
      month: 'OCT',
      year: 2026,
      title: 'Cultural Activity',
      type: 'cultural',
      color: '#9333ea',
      description: 'Inter-house cultural competition',
      time: '11:00 AM – 03:00 PM',
      venue: 'Main School Auditorium',
      category: 'Activity'
    },
    {
      id: 'oct-5',
      date: 2,
      month: 'OCT',
      year: 2026,
      title: 'Gandhi Jayanti',
      type: 'holiday',
      color: '#dc2626',
      description: 'National Holiday – Birthday of Mahatma Gandhi',
      time: 'Full Day',
      venue: 'Observance Ceremony (08:30 AM)',
      category: 'National Holiday'
    }
  ],
  5: [ // June 2026
    {
      id: 'jun-1',
      date: 1,
      month: 'JUN',
      year: 2026,
      title: 'New Academic Session Begins',
      type: 'academic',
      color: '#ea580c',
      description: 'Classes commence, student orientation and teacher planning',
      time: '09:00 AM – 03:30 PM',
      venue: 'School Campus',
      category: 'Academic'
    },
    {
      id: 'jun-2',
      date: 5,
      month: 'JUN',
      year: 2026,
      title: 'World Environment Day',
      type: 'activity',
      color: '#16a34a',
      description: 'Tree plantation drive and Eco-Club initiatives',
      time: '10:30 AM – 01:00 PM',
      venue: 'School Garden & Grounds',
      category: 'Activity'
    },
    {
      id: 'jun-3',
      date: 21,
      month: 'JUN',
      year: 2026,
      title: 'International Yoga Day',
      type: 'activity',
      color: '#16a34a',
      description: 'Mass yoga session and wellness workshop for students',
      time: '07:30 AM – 09:30 AM',
      venue: 'School Playground',
      category: 'Activity'
    }
  ],
  6: [ // July 2026
    {
      id: 'jul-1',
      date: 6,
      month: 'JUL',
      year: 2026,
      title: 'Periodic Test 1 Starts',
      type: 'exam',
      color: '#0284c7',
      description: 'First periodic assessment for Classes IX – XII',
      time: '10:00 AM – 01:00 PM',
      venue: 'Exam Halls',
      category: 'Examination'
    },
    {
      id: 'jul-2',
      date: 15,
      month: 'JUL',
      year: 2026,
      title: 'STEM & Robotics Exhibition',
      type: 'activity',
      color: '#16a34a',
      description: 'Student project demonstration in Atal Tinkering Lab',
      time: '11:00 AM – 03:00 PM',
      venue: 'PM SHRI STEM Lab',
      category: 'Activity'
    },
    {
      id: 'jul-3',
      date: 25,
      month: 'JUL',
      year: 2026,
      title: 'Kharchi Puja',
      type: 'holiday',
      color: '#dc2626',
      description: 'State Festival of Tripura',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'State Holiday'
    }
  ],
  7: [ // August 2026
    {
      id: 'aug-1',
      date: 15,
      month: 'AUG',
      year: 2026,
      title: 'Independence Day',
      type: 'holiday',
      color: '#dc2626',
      description: 'National Flag hoisting, parade and patriotic cultural events',
      time: '08:00 AM – 11:30 AM',
      venue: 'School Grounds',
      category: 'National Holiday'
    },
    {
      id: 'aug-2',
      date: 20,
      month: 'AUG',
      year: 2026,
      title: 'Inter-House Sports Meet',
      type: 'activity',
      color: '#16a34a',
      description: 'Athletics, football, and indoor sports competitions',
      time: '09:00 AM – 04:00 PM',
      venue: 'School Sports Complex',
      category: 'Activity'
    },
    {
      id: 'aug-3',
      date: 28,
      month: 'AUG',
      year: 2026,
      title: 'Raksha Bandhan Observance',
      type: 'activity',
      color: '#9333ea',
      description: 'Special school assembly and bonding activities',
      time: '09:30 AM – 11:00 AM',
      venue: 'School Auditorium',
      category: 'Activity'
    }
  ],
  8: [ // September 2026
    {
      id: 'sep-1',
      date: 5,
      month: 'SEP',
      year: 2026,
      title: "Teachers' Day Celebration",
      type: 'activity',
      color: '#9333ea',
      description: 'Student-led celebration honoring teaching faculty',
      time: '10:00 AM – 02:30 PM',
      venue: 'Main Auditorium',
      category: 'Special Observance'
    },
    {
      id: 'sep-2',
      date: 14,
      month: 'SEP',
      year: 2026,
      title: 'Half-Yearly Examination Commences',
      type: 'exam',
      color: '#0284c7',
      description: 'Comprehensive mid-year examinations for Classes VI – XII',
      time: '09:30 AM – 12:30 PM',
      venue: 'Designated Examination Halls',
      category: 'Examination'
    },
    {
      id: 'sep-3',
      date: 29,
      month: 'SEP',
      year: 2026,
      title: 'Half-Yearly Examination Concludes',
      type: 'exam',
      color: '#0284c7',
      description: 'End of mid-term evaluation session',
      time: '09:30 AM – 12:30 PM',
      venue: 'Exam Halls',
      category: 'Examination'
    }
  ],
  10: [ // November 2026
    {
      id: 'nov-1',
      date: 8,
      month: 'NOV',
      year: 2026,
      title: 'Diwali Celebration',
      type: 'holiday',
      color: '#dc2626',
      description: 'Festival of Lights Holiday',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'National Holiday'
    },
    {
      id: 'nov-2',
      date: 14,
      month: 'NOV',
      year: 2026,
      title: "Children's Day & Science Fair",
      type: 'activity',
      color: '#16a34a',
      description: 'Fun fair, science demonstrations, and games',
      time: '09:30 AM – 03:30 PM',
      venue: 'School Courtyard & Labs',
      category: 'Activity'
    },
    {
      id: 'nov-3',
      date: 23,
      month: 'NOV',
      year: 2026,
      title: 'Periodic Test 2',
      type: 'exam',
      color: '#0284c7',
      description: 'Second periodic assessment for Classes IX – XII',
      time: '10:00 AM – 01:00 PM',
      venue: 'Exam Halls',
      category: 'Examination'
    }
  ],
  11: [ // December 2026
    {
      id: 'dec-1',
      date: 10,
      month: 'DEC',
      year: 2026,
      title: 'Annual Sports & Athletic Meet',
      type: 'activity',
      color: '#16a34a',
      description: 'Multi-day athletic competitions and prize distribution',
      time: '09:00 AM – 04:30 PM',
      venue: 'School Sports Ground',
      category: 'Activity'
    },
    {
      id: 'dec-2',
      date: 22,
      month: 'DEC',
      year: 2026,
      title: 'National Mathematics Day',
      type: 'academic',
      color: '#ea580c',
      description: 'Math quiz and Srinivasa Ramanujan commemoration',
      time: '10:30 AM – 01:30 PM',
      venue: 'Math Lab',
      category: 'Academic'
    },
    {
      id: 'dec-3',
      date: 25,
      month: 'DEC',
      year: 2026,
      title: 'Christmas Day',
      type: 'holiday',
      color: '#dc2626',
      description: 'Winter Vacation Commences',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'National Holiday'
    }
  ],
  0: [ // January 2027
    {
      id: 'jan-1',
      date: 2,
      month: 'JAN',
      year: 2027,
      title: 'School Reopens after Winter Break',
      type: 'academic',
      color: '#ea580c',
      description: 'Resumption of classes for all grades',
      time: '09:00 AM – 03:30 PM',
      venue: 'School Campus',
      category: 'Academic'
    },
    {
      id: 'jan-2',
      date: 11,
      month: 'JAN',
      year: 2027,
      title: 'Pre-Board Examination (X & XII)',
      type: 'exam',
      color: '#0284c7',
      description: 'Model board examinations for Class X and Class XII',
      time: '09:30 AM – 12:30 PM',
      venue: 'Senior Wing Exam Hall',
      category: 'Examination'
    },
    {
      id: 'jan-3',
      date: 26,
      month: 'JAN',
      year: 2027,
      title: 'Republic Day',
      type: 'holiday',
      color: '#dc2626',
      description: '78th Republic Day flag hoisting and parade',
      time: '08:00 AM – 11:30 AM',
      venue: 'School Parade Ground',
      category: 'National Holiday'
    }
  ],
  1: [ // February 2027
    {
      id: 'feb-1',
      date: 5,
      month: 'FEB',
      year: 2027,
      title: 'Saraswati Puja',
      type: 'activity',
      color: '#9333ea',
      description: 'Traditional celebration of the goddess of learning & arts',
      time: '08:30 AM – 02:00 PM',
      venue: 'School Campus',
      category: 'Activity'
    },
    {
      id: 'feb-2',
      date: 15,
      month: 'FEB',
      year: 2027,
      title: 'Annual Examinations (Classes VI – IX & XI)',
      type: 'exam',
      color: '#0284c7',
      description: 'Year-end summative assessments',
      time: '09:30 AM – 12:30 PM',
      venue: 'All Exam Halls',
      category: 'Examination'
    },
    {
      id: 'feb-3',
      date: 28,
      month: 'FEB',
      year: 2027,
      title: 'National Science Day',
      type: 'academic',
      color: '#ea580c',
      description: 'C.V. Raman tribute and Science Club exhibitions',
      time: '10:00 AM – 02:00 PM',
      venue: 'Science Wing',
      category: 'Academic'
    }
  ],
  2: [ // March 2027
    {
      id: 'mar-1',
      date: 10,
      month: 'MAR',
      year: 2027,
      title: 'Annual Result Declaration',
      type: 'academic',
      color: '#ea580c',
      description: 'Distribution of progress reports and parent counselling',
      time: '09:30 AM – 02:30 PM',
      venue: 'Respective Classrooms',
      category: 'Academic'
    },
    {
      id: 'mar-2',
      date: 22,
      month: 'MAR',
      year: 2027,
      title: 'New Session Books & Uniform Distribution',
      type: 'academic',
      color: '#ea580c',
      description: 'Curriculum material handout for academic year 2027–28',
      time: '10:00 AM – 03:00 PM',
      venue: 'Administrative Wing',
      category: 'Academic'
    },
    {
      id: 'mar-3',
      date: 27,
      month: 'MAR',
      year: 2027,
      title: 'Holi Festival Holiday',
      type: 'holiday',
      color: '#dc2626',
      description: 'Festival of Colours',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'National Holiday'
    }
  ],
  3: [ // April 2026
    {
      id: 'apr-1',
      date: 14,
      month: 'APR',
      year: 2026,
      title: 'Bengali New Year / Ambedkar Jayanti',
      type: 'holiday',
      color: '#dc2626',
      description: 'Poila Baisakh & Dr. B.R. Ambedkar Jayanti',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'State Holiday'
    },
    {
      id: 'apr-2',
      date: 21,
      month: 'APR',
      year: 2026,
      title: 'Garia Puja',
      type: 'holiday',
      color: '#dc2626',
      description: 'Traditional Tripura Folk Festival',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'State Holiday'
    }
  ],
  4: [ // May 2026
    {
      id: 'may-1',
      date: 1,
      month: 'MAY',
      year: 2026,
      title: 'May Day / International Workers Day',
      type: 'holiday',
      color: '#dc2626',
      description: 'Public Holiday',
      time: 'Full Day',
      venue: 'Holiday',
      category: 'National Holiday'
    },
    {
      id: 'may-2',
      date: 9,
      month: 'MAY',
      year: 2026,
      title: 'Rabindra Jayanti',
      type: 'cultural',
      color: '#9333ea',
      description: 'Celebration of Rabindranath Tagore birth anniversary',
      time: '10:00 AM – 01:00 PM',
      venue: 'School Auditorium',
      category: 'Activity'
    },
    {
      id: 'may-3',
      date: 18,
      month: 'MAY',
      year: 2026,
      title: 'Summer Vacation Begins',
      type: 'holiday',
      color: '#dc2626',
      description: 'Annual summer break for students and faculty',
      time: 'Till June 14, 2026',
      venue: 'Holiday',
      category: 'School Holiday'
    }
  ]
};

// Milestones for Section 05: Academic Year at a Glance
export const timelineMilestones = [
  {
    id: 1,
    month: 'JUNE 2026',
    title: 'New Academic Session Begins',
    description: 'Classes commence, orientation and planning',
    iconName: 'School',
    color: '#ea580c'
  },
  {
    id: 2,
    month: 'AUGUST 2026',
    title: 'Co-Curricular Activities',
    description: 'Clubs, competitions and skill development',
    iconName: 'BookOpen',
    color: '#ea580c'
  },
  {
    id: 3,
    month: 'OCTOBER 2026',
    title: 'Mid-Term Assessment',
    description: 'Unit tests and academic review',
    iconName: 'ClipboardCheck',
    color: '#ea580c'
  },
  {
    id: 4,
    month: 'DECEMBER 2026',
    title: 'Projects & Activities',
    description: 'Subject projects and winter activities',
    iconName: 'Users',
    color: '#ea580c'
  },
  {
    id: 5,
    month: 'FEBRUARY 2027',
    title: 'Annual Examinations',
    description: 'Year-end assessment for all classes',
    iconName: 'FileSpreadsheet',
    color: '#ea580c'
  },
  {
    id: 6,
    month: 'MARCH 2027',
    title: 'Result Declaration & New Session Prep',
    description: 'Results, feedback and planning for next year',
    iconName: 'Trophy',
    color: '#ea580c'
  }
];

// Examinations & Assessments table data
export const examinationSchedule = [
  {
    name: 'Periodic Test 1',
    tentativeMonth: 'July 2026',
    classesApplicable: 'IX – XII'
  },
  {
    name: 'Half-Yearly Examination',
    tentativeMonth: 'September 2026',
    classesApplicable: 'IX – XII'
  },
  {
    name: 'Periodic Test 2',
    tentativeMonth: 'November 2026',
    classesApplicable: 'IX – XII'
  },
  {
    name: 'Pre-Board Examination',
    tentativeMonth: 'January 2027',
    classesApplicable: 'X & XII'
  },
  {
    name: 'Annual Examination',
    tentativeMonth: 'February 2027',
    classesApplicable: 'IX – XII'
  }
];

// Holidays data categorized
export const holidaysData = {
  national: [
    {
      id: 'h-1',
      date: '15',
      month: 'AUG',
      name: 'Independence Day',
      type: 'National Holiday',
      day: 'Saturday',
      description: 'Celebration of India’s 79th Independence'
    },
    {
      id: 'h-2',
      date: '02',
      month: 'OCT',
      name: 'Gandhi Jayanti',
      type: 'National Holiday',
      day: 'Friday',
      description: 'Birth anniversary of Mahatma Gandhi'
    },
    {
      id: 'h-3',
      date: '26',
      month: 'JAN',
      name: 'Republic Day',
      type: 'National Holiday',
      day: 'Tuesday',
      description: 'Honoring the Constitution of India'
    },
    {
      id: 'h-4',
      date: '05',
      month: 'SEP',
      name: "Teachers' Day",
      type: 'Special Observance',
      day: 'Saturday',
      description: 'Commemorating Dr. Sarvepalli Radhakrishnan'
    }
  ],
  state: [
    {
      id: 'h-s1',
      date: '21',
      month: 'APR',
      name: 'Garia Puja',
      type: 'State Holiday',
      day: 'Tuesday',
      description: 'Ethnic festival celebrated in Tripura'
    },
    {
      id: 'h-s2',
      date: '25',
      month: 'JUL',
      name: 'Kharchi Puja',
      type: 'State Holiday',
      day: 'Saturday',
      description: 'Famous fourteen gods festival of Tripura'
    },
    {
      id: 'h-s3',
      date: '08',
      month: 'AUG',
      name: 'Ker Puja',
      type: 'State Holiday',
      day: 'Saturday',
      description: 'Traditional ritual ceremony of Tripura'
    },
    {
      id: 'h-s4',
      date: '19',
      month: 'JAN',
      name: 'Kokborok Day',
      type: 'State Observance',
      day: 'Tuesday',
      description: 'Celebrating the Kokborok language in Tripura'
    }
  ],
  school: [
    {
      id: 'h-sc1',
      date: '18',
      month: 'MAY',
      name: 'Summer Vacation',
      type: 'School Holiday',
      day: 'Monday (4 Weeks)',
      description: 'Annual summer break for all classes'
    },
    {
      id: 'h-sc2',
      date: '18',
      month: 'OCT',
      name: 'Durga Puja Holidays',
      type: 'School Holiday',
      day: 'Sunday (10 Days)',
      description: 'Autumn festival vacation'
    },
    {
      id: 'h-sc3',
      date: '25',
      month: 'DEC',
      name: 'Winter Break',
      type: 'School Holiday',
      day: 'Friday (8 Days)',
      description: 'Year-end winter recess'
    }
  ],
  special: [
    {
      id: 'h-sp1',
      date: '05',
      month: 'JUN',
      name: 'World Environment Day',
      type: 'Special Observance',
      day: 'Friday',
      description: 'Campus green drive and awareness sessions'
    },
    {
      id: 'h-sp2',
      date: '21',
      month: 'JUN',
      name: 'International Yoga Day',
      type: 'Special Observance',
      day: 'Sunday',
      description: 'Special morning wellness practice'
    },
    {
      id: 'h-sp3',
      date: '14',
      month: 'NOV',
      name: "Children's Day",
      type: 'Special Observance',
      day: 'Saturday',
      description: 'Celebration of childhood and Pt. Nehru’s birthday'
    },
    {
      id: 'h-sp4',
      date: '28',
      month: 'FEB',
      name: 'National Science Day',
      type: 'Special Observance',
      day: 'Sunday',
      description: 'Scientific exhibitions and innovation showcases'
    }
  ]
};
