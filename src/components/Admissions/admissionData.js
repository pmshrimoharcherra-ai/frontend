export const admissionQuickCards = [
  {
    id: 'guidelines',
    title: 'Admission Guidelines',
    subtitle: 'Step-by-step admission policy & procedure',
    iconType: 'book',
    iconBg: 'orange',
    target: '#process'
  },
  {
    id: 'eligibility',
    title: 'Eligibility Criteria',
    subtitle: 'Age limits & qualifications for Classes VI–XII',
    iconType: 'clipboard',
    iconBg: 'navy',
    target: '#eligibility'
  },
  {
    id: 'benefits',
    title: 'PM SHRI Benefits',
    subtitle: 'Free & subsidized govt education benefits',
    iconType: 'award',
    iconBg: 'orange',
    target: '#fees'
  },
  {
    id: 'apply-online',
    title: 'Online Application',
    subtitle: 'Submit admission form or download PDF',
    iconType: 'form',
    iconBg: 'navy',
    target: '#apply'
  }
];

export const admissionSteps = [
  {
    step: '01',
    title: 'Form Submission',
    desc: 'Fill out the online admission application form or collect the hardcopy form from the school administrative office during working hours (9:30 AM – 3:30 PM).'
  },
  {
    step: '02',
    title: 'Document Verification',
    desc: 'Submit self-attested copies of birth certificate, previous class marksheet, Transfer Certificate (TC), Aadhaar, and category certificates for official scrutiny.'
  },
  {
    step: '03',
    title: 'Merit List & Counseling',
    desc: 'Merit list for selective classes (Class IX & XI Stream Allocations) is published on the digital portal and the school notice board, followed by student counseling.'
  },
  {
    step: '04',
    title: 'Enrollment & Welcome',
    desc: 'Complete final admission registration, collect student ID card, academic calendar, complimentary textbooks and school uniform set.'
  }
];

export const eligibilityTableData = [
  {
    classLevel: 'Class VI',
    ageLimit: '10 – 12 Years as of 31st March',
    minQualification: 'Passed Class V from any recognized primary school',
    streamsAvailable: 'General Curriculum (NEP 2020)',
    status: 'Open'
  },
  {
    classLevel: 'Class VII – VIII',
    ageLimit: '11 – 14 Years as of 31st March',
    minQualification: 'Passed previous respective grade with valid Transfer Certificate',
    streamsAvailable: 'General Curriculum + Skill Subjects',
    status: 'Open'
  },
  {
    classLevel: 'Class IX',
    ageLimit: '13 – 15 Years as of 31st March',
    minQualification: 'Passed Class VIII with minimum 40% aggregate marks',
    streamsAvailable: 'Secondary Board Curriculum + IT / AI Electives',
    status: 'Open'
  },
  {
    classLevel: 'Class X',
    ageLimit: '14 – 16 Years (Subject to Board Norms)',
    minQualification: 'Direct admission only under transfer/relocation cases as per TBSE norms',
    streamsAvailable: 'Madhyamik / Secondary Board',
    status: 'Restricted'
  },
  {
    classLevel: 'Class XI (Science)',
    ageLimit: '15 – 17 Years as of 31st March',
    minQualification: 'Passed Madhyamik / Class X Board with min 60% in Science & Math',
    streamsAvailable: 'Physics, Chemistry, Mathematics, Biology, Computer Science',
    status: 'Open'
  },
  {
    classLevel: 'Class XI (Arts / Humanities)',
    ageLimit: '15 – 17 Years as of 31st March',
    minQualification: 'Passed Madhyamik / Class X Board from recognized Board',
    streamsAvailable: 'Pol. Science, History, Economics, Geography, Kokborok / Bengali',
    status: 'Open'
  },
  {
    classLevel: 'Class XI (Commerce / Voc.)',
    ageLimit: '15 – 17 Years as of 31st March',
    minQualification: 'Passed Madhyamik / Class X with min 45% aggregate marks',
    streamsAvailable: 'Accountancy, Business Studies, Economics, Information Technology',
    status: 'Open'
  }
];

export const requiredDocuments = [
  {
    title: 'Birth Certificate',
    desc: 'Issued by Municipal Corporation / Registrar of Births & Deaths / Panchayat.',
    mandatory: true
  },
  {
    title: 'Transfer Certificate (TC)',
    desc: 'Original Transfer Certificate from previous recognized school with DISE code.',
    mandatory: true
  },
  {
    title: 'Previous Academic Marksheet',
    desc: 'Photocopy of the final progress card / board scorecard of the last class passed.',
    mandatory: true
  },
  {
    title: 'Student Aadhaar Card',
    desc: 'Photocopy of student Aadhaar card for UDISE+ and scholarship portal link.',
    mandatory: true
  },
  {
    title: 'Caste / Category Certificate',
    desc: 'SC / ST / OBC / EWS certificate issued by competent authority (if applicable).',
    mandatory: false
  },
  {
    title: 'Passport Size Photographs',
    desc: '4 recent colored passport-size photographs of the student with white background.',
    mandatory: true
  },
  {
    title: 'Parent / Guardian ID & Address Proof',
    desc: 'Voter ID / Ration Card / Aadhaar Card of parents for communication records.',
    mandatory: true
  },
  {
    title: 'Bank Passbook (For Scholarships)',
    desc: 'First page of student’s active bank account passbook for government stipend.',
    mandatory: false
  }
];

export const pmShriBenefits = [
  {
    title: '100% Free Tuition',
    desc: 'No tuition fee or capitation charges for any student in accordance with government education policy.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Free Textbooks & Uniforms',
    desc: 'Government provided syllabus textbooks, exercise notebooks, and complimentary uniform kits.',
    icon: 'BookOpen'
  },
  {
    title: 'Nutritious PM POSHAN (Mid-Day Meal)',
    desc: 'Hygienic, high-protein cooked meals served daily for all eligible middle school students.',
    icon: 'Utensils'
  },
  {
    title: 'Smart ICT & Robotics Labs',
    desc: 'Access to modern digital classrooms, computer laboratory, STEM robotics corner, and science labs.',
    icon: 'Laptop'
  },
  {
    title: 'Co-Curricular & Sports Training',
    desc: 'Professional physical training, athletic equipment, yoga sessions, and inter-school tournament support.',
    icon: 'Trophy'
  },
  {
    title: 'Scholarship Assistance',
    desc: 'Direct facilitation of Pre-Matric & Post-Matric SC/ST/Minority & Merit government stipends.',
    icon: 'GraduationCap'
  }
];

export const admissionDownloads = [
  {
    title: 'Official School Admission Application Form 2026–27',
    desc: 'Printable bilingual application form for Classes VI to XII.',
    size: '1.2 MB',
    format: 'PDF',
    date: 'Academic Year 2026-27'
  },
  {
    title: 'Class XI Stream Selection & Subject Choice Form',
    desc: 'Elective option sheet for Science, Humanities & Commerce streams.',
    size: '850 KB',
    format: 'PDF',
    date: 'Session 2026-27'
  },
  {
    title: 'School Information Prospectus & Code of Conduct',
    desc: 'Detailed booklet detailing facilities, faculty, labs, and school rules.',
    size: '3.4 MB',
    format: 'PDF',
    date: 'Official Release'
  },
  {
    title: 'Document Checklist & Undertaking Proforma',
    desc: 'Parent undertaking and verification document checklist.',
    size: '620 KB',
    format: 'PDF',
    date: 'Version 2.0'
  }
];

export const admissionFaqs = [
  {
    q: 'When does the admission process start for the new academic session?',
    a: 'Admissions for the upcoming academic session generally commence in January and remain open until April. Lateral admissions for higher secondary streams begin immediately following the declaration of Class X board results.'
  },
  {
    q: 'Is there any admission fee or tuition fee charged by PM SHRI Moharcherra?',
    a: 'No. As a premier government PM SHRI institution, education is completely free with zero tuition fee. Minor nominal charges apply only for school identity cards and board examination registration as mandated by the board.'
  },
  {
    q: 'Can students from private or out-of-district schools apply?',
    a: 'Yes, students from all recognized schools across Tripura and other states are eligible to apply, provided they submit an authentic Transfer Certificate (TC) countersigned by the competent educational authority.'
  },
  {
    q: 'What languages/medium of instruction are offered?',
    a: 'PM SHRI Moharcherra offers bilingual instruction with strong English language learning alongside Bengali and Kokborok medium support to cater to all learners.'
  },
  {
    q: 'How are streams allocated in Class XI?',
    a: 'Stream allocation (Science, Arts, Commerce) in Class XI is purely merit-based, determined by the student’s marks in Class X Madhyamik/Board examination and counseling preferences.'
  }
];
