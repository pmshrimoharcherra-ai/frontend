import React, { useState } from 'react';
import './Admissions.css';
import AdmissionHero from './AdmissionHero';
import {
  admissionQuickCards,
  admissionSteps,
  eligibilityTableData,
  requiredDocuments,
  pmShriBenefits,
  admissionDownloads,
  admissionFaqs
} from './admissionData';
import {
  BookOpen,
  ClipboardList,
  Award,
  FileEdit,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Utensils,
  Laptop,
  Trophy,
  GraduationCap,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  Printer,
  Sparkles
} from 'lucide-react';

const Admissions = ({ onNavigate = () => {} }) => {
  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: 'Male',
    classApplying: 'Class VI',
    streamChoice: 'N/A',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    previousSchool: '',
    previousMarks: '',
    category: 'General'
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // FAQ Active State
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.dob) errors.dob = 'Date of birth is required';
    if (!formData.parentName.trim()) errors.parentName = 'Parent / Guardian name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.address.trim()) errors.address = 'Residential address is required';
    return errors;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please complete all required fields.');
      return;
    }

    const refId = `PM-ADM-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmissionId(refId);
    setFormSubmitted(true);
    showToast(`Application successfully submitted! Reference: ${refId}`);
  };

  const renderBenefitIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={22} />;
      case 'BookOpen': return <BookOpen size={22} />;
      case 'Utensils': return <Utensils size={22} />;
      case 'Laptop': return <Laptop size={22} />;
      case 'Trophy': return <Trophy size={22} />;
      case 'GraduationCap': return <GraduationCap size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  const handleScrollTo = (targetId) => {
    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="admissions-page">
      {/* 1. Hero Section */}
      <AdmissionHero onNavigate={onNavigate} />

      {/* Toast */}
      {toastMessage && (
        <div className="admission-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Top Quick Nav Action Strip */}
      <section className="adm-quick-nav-section">
        <div className="adm-container">
          <div className="adm-quick-nav-card">
            <div className="adm-quick-grid">
              {admissionQuickCards.map((card) => (
                <div
                  key={card.id}
                  className="adm-quick-col"
                  onClick={() => handleScrollTo(card.target)}
                >
                  <div className={`adm-quick-icon-circle icon-bg-${card.iconBg}`}>
                    {card.iconType === 'book' && <BookOpen size={20} />}
                    {card.iconType === 'clipboard' && <ClipboardList size={20} />}
                    {card.iconType === 'award' && <Award size={20} />}
                    {card.iconType === 'form' && <FileEdit size={20} />}
                  </div>
                  <div className="adm-quick-text">
                    <h4 className="adm-quick-title">{card.title}</h4>
                    <p className="adm-quick-subtitle">{card.subtitle}</p>
                  </div>
                  <div className="adm-quick-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Admission Process & Roadmap */}
      <section className="adm-process-section" id="process">
        <div className="adm-container">
          <div className="adm-section-head text-center">
            <span className="adm-section-tag">ENROLLMENT ROADMAP</span>
            <h2 className="adm-section-title">Step-by-Step Admission Process</h2>
            <p className="adm-section-subtitle">
              Follow these simple steps for hassle-free admission and enrollment at PM SHRI Moharcherra H.S. School.
            </p>
          </div>

          <div className="adm-steps-grid">
            {admissionSteps.map((s, idx) => (
              <div key={idx} className="adm-step-card">
                <div className="step-num-badge">{s.step}</div>
                <h3 className="step-card-title">{s.title}</h3>
                <p className="step-card-desc">{s.desc}</p>
                {idx < admissionSteps.length - 1 && (
                  <div className="step-connector-arrow" aria-hidden="true">
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Eligibility Criteria Table */}
      <section className="adm-eligibility-section" id="eligibility">
        <div className="adm-container">
          <div className="adm-section-head-flex">
            <div>
              <span className="adm-section-tag">CLASS-WISE CRITERIA</span>
              <h2 className="adm-section-title">Eligibility &amp; Age Requirements</h2>
              <p className="adm-section-subtitle">
                Minimum age limits and entry criteria for Middle, Secondary and Higher Secondary admissions.
              </p>
            </div>
            <div className="session-status-pill">
              <span className="dot-pulse"></span>
              <span>Session 2026–27 Admissions Open</span>
            </div>
          </div>

          <div className="eligibility-table-card">
            <div className="table-responsive">
              <table className="eligibility-data-table">
                <thead>
                  <tr>
                    <th>Class / Grade</th>
                    <th>Age Criteria</th>
                    <th>Minimum Academic Qualification</th>
                    <th>Curriculum &amp; Streams</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibilityTableData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-navy">{row.classLevel}</td>
                      <td className="font-semibold">{row.ageLimit}</td>
                      <td>{row.minQualification}</td>
                      <td className="text-slate">{row.streamsAvailable}</td>
                      <td>
                        <span className={`status-pill pill-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PM SHRI Free Education & Benefits */}
      <section className="adm-benefits-section" id="fees">
        <div className="adm-container">
          <div className="adm-section-head text-center">
            <span className="adm-section-tag">PM SHRI GOVT SCHEME</span>
            <h2 className="adm-section-title">100% Free Education &amp; Student Benefits</h2>
            <p className="adm-section-subtitle">
              Under the Government of India’s PM SHRI initiative, all enrolled learners receive comprehensive educational privileges.
            </p>
          </div>

          <div className="benefits-grid">
            {pmShriBenefits.map((b, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon-box">
                  {renderBenefitIcon(b.icon)}
                </div>
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Documents Checklist & Online Application Grid */}
      <section className="adm-apply-section" id="apply">
        <div className="adm-container">
          <div className="apply-split-grid">
            {/* Left: Required Documents Checklist */}
            <div className="docs-checklist-card">
              <div className="card-head-simple">
                <span className="adm-section-tag">VERIFICATION CHECKLIST</span>
                <h3 className="card-title-lg">Required Documents</h3>
                <p className="card-sub-p">Please prepare self-attested copies of the following documents during admission:</p>
              </div>

              <div className="docs-list">
                {requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="doc-check-item">
                    <div className="check-icon-col">
                      <CheckCircle2 size={18} className="text-emerald" />
                    </div>
                    <div className="doc-info-col">
                      <div className="doc-title-row">
                        <span className="doc-name">{doc.title}</span>
                        {doc.mandatory ? (
                          <span className="badge-mandatory">Mandatory</span>
                        ) : (
                          <span className="badge-optional">Optional</span>
                        )}
                      </div>
                      <p className="doc-desc-p">{doc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="docs-note-banner">
                <AlertCircle size={18} />
                <span>Original Transfer Certificate (TC) must be submitted at the time of final admission.</span>
              </div>
            </div>

            {/* Right: Online Admission Application Form */}
            <div className="online-form-card">
              <div className="card-head-simple">
                <span className="adm-section-tag">ONLINE REGISTRATION</span>
                <h3 className="card-title-lg">Admission Application Form</h3>
                <p className="card-sub-p">Fill in the student details to register for the 2026–27 academic session.</p>
              </div>

              {formSubmitted ? (
                <div className="form-success-box">
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="success-title">Application Submitted Successfully!</h4>
                  <p className="success-desc">
                    Your provisional admission application has been registered with PM SHRI Moharcherra H.S. School.
                  </p>
                  <div className="ref-id-pill">
                    <span>Reference No:</span>
                    <strong>{submissionId}</strong>
                  </div>
                  <div className="success-summary-card">
                    <div><strong>Student:</strong> {formData.studentName}</div>
                    <div><strong>Class:</strong> {formData.classApplying} {formData.streamChoice !== 'N/A' ? `(${formData.streamChoice})` : ''}</div>
                    <div><strong>Contact:</strong> {formData.phone}</div>
                  </div>
                  <div className="success-actions">
                    <button
                      type="button"
                      className="btn-print-slip"
                      onClick={() => window.print()}
                    >
                      <Printer size={16} />
                      <span>Print Application Slip</span>
                    </button>
                    <button
                      type="button"
                      className="btn-reset-form"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          studentName: '',
                          dob: '',
                          gender: 'Male',
                          classApplying: 'Class VI',
                          streamChoice: 'N/A',
                          parentName: '',
                          phone: '',
                          email: '',
                          address: '',
                          previousSchool: '',
                          previousMarks: '',
                          category: 'General'
                        });
                      }}
                    >
                      Fill Another Form
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="adm-reg-form">
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Student Full Name *</label>
                      <input
                        type="text"
                        name="studentName"
                        placeholder="e.g. Rahul Debbarma"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        className={formErrors.studentName ? 'has-error' : ''}
                      />
                      {formErrors.studentName && <span className="field-err">{formErrors.studentName}</span>}
                    </div>

                    <div className="form-field">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className={formErrors.dob ? 'has-error' : ''}
                      />
                      {formErrors.dob && <span className="field-err">{formErrors.dob}</span>}
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-field">
                      <label>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Class Applying For *</label>
                      <select name="classApplying" value={formData.classApplying} onChange={handleInputChange}>
                        <option value="Class VI">Class VI</option>
                        <option value="Class VII">Class VII</option>
                        <option value="Class VIII">Class VIII</option>
                        <option value="Class IX">Class IX</option>
                        <option value="Class X">Class X (Transfer)</option>
                        <option value="Class XI">Class XI (Higher Sec.)</option>
                        <option value="Class XII">Class XII (Transfer)</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="General">General</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="OBC">OBC</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                  </div>

                  {formData.classApplying === 'Class XI' && (
                    <div className="form-field">
                      <label>Stream Preference (Class XI)</label>
                      <select name="streamChoice" value={formData.streamChoice} onChange={handleInputChange}>
                        <option value="Science (Physics, Chem, Math, Bio/CS)">Science (PCM / PCB / PCMB)</option>
                        <option value="Arts / Humanities (Pol.Sc, Hist, Eco, Geo)">Arts / Humanities</option>
                        <option value="Commerce (Accountancy, B.St, Eco, IT)">Commerce</option>
                        <option value="Vocational & Skill Stream">Vocational &amp; Skill Stream</option>
                      </select>
                    </div>
                  )}

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Father's / Guardian's Name *</label>
                      <input
                        type="text"
                        name="parentName"
                        placeholder="e.g. Bikas Debbarma"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        className={formErrors.parentName ? 'has-error' : ''}
                      />
                      {formErrors.parentName && <span className="field-err">{formErrors.parentName}</span>}
                    </div>

                    <div className="form-field">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={formErrors.phone ? 'has-error' : ''}
                      />
                      {formErrors.phone && <span className="field-err">{formErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Residential Address *</label>
                    <textarea
                      name="address"
                      rows="2"
                      placeholder="Village / Ward, Teliamura, Khowai, PIN..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className={formErrors.address ? 'has-error' : ''}
                    ></textarea>
                    {formErrors.address && <span className="field-err">{formErrors.address}</span>}
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Previous School Attended</label>
                      <input
                        type="text"
                        name="previousSchool"
                        placeholder="School name & place"
                        value={formData.previousSchool}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Previous Class Marks (%)</label>
                      <input
                        type="text"
                        name="previousMarks"
                        placeholder="e.g. 82%"
                        value={formData.previousMarks}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-submit-application">
                    <span>Submit Admission Application</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Downloads & Prospectus Section */}
      <section className="adm-downloads-section">
        <div className="adm-container">
          <div className="adm-section-head text-center">
            <span className="adm-section-tag">FORMS &amp; BROCHURES</span>
            <h2 className="adm-section-title">Download Official Admission Documents</h2>
            <p className="adm-section-subtitle">
              Download printable application forms, Class XI elective option sheets, and official school prospectuses.
            </p>
          </div>

          <div className="adm-downloads-grid">
            {admissionDownloads.map((doc, idx) => (
              <div key={idx} className="adm-download-card">
                <div className="doc-icon-wrap">
                  <FileCheck size={24} />
                </div>
                <div className="doc-text-wrap">
                  <h4 className="doc-name-title">{doc.title}</h4>
                  <p className="doc-sub-text">{doc.desc}</p>
                  <div className="doc-meta-info">
                    <span>{doc.format}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-download-doc-pill"
                  onClick={() => showToast(`Downloaded: ${doc.title}`)}
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQs & Admission Helpdesk */}
      <section className="adm-faqs-section">
        <div className="adm-container">
          <div className="faqs-layout-grid">
            {/* Left FAQ Accordion */}
            <div className="faqs-content-side">
              <span className="adm-section-tag">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="adm-section-title">Admission Queries Answered</h2>
              <p className="adm-section-subtitle">
                Clear insights into enrollment rules, criteria, and free government educational benefits.
              </p>

              <div className="accordion-list">
                {admissionFaqs.map((faq, idx) => {
                  const isOpen = activeFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`accordion-item ${isOpen ? 'open' : ''}`}
                    >
                      <button
                        type="button"
                        className="accordion-header-btn"
                        onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      >
                        <span className="faq-question-text">{faq.q}</span>
                        <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotate' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="accordion-body-text">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Helpdesk Card */}
            <div className="helpdesk-side-card">
              <div className="helpdesk-header">
                <div className="helpdesk-badge">ADMISSION DESK</div>
                <h3 className="helpdesk-title">Need Help with Admission?</h3>
                <p className="helpdesk-sub">
                  Visit the school admission office or get in touch with our counseling coordinators.
                </p>
              </div>

              <div className="helpdesk-contacts">
                <div className="contact-row">
                  <div className="contact-icon bg-orange">
                    <Clock size={18} />
                  </div>
                  <div>
                    <strong>Office Hours:</strong>
                    <p>Mon – Sat: 09:30 AM – 03:30 PM</p>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon bg-navy">
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong>Helpline Phone:</strong>
                    <p>+91 98765 43210 / 03825-224411</p>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon bg-emerald">
                    <Mail size={18} />
                  </div>
                  <div>
                    <strong>Email Support:</strong>
                    <p>moharcherrahs@gmail.com</p>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon bg-blue">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong>Campus Address:</strong>
                    <p>PM SHRI Moharcherra H.S. School, Moharcherra, Teliamura, Khowai, Tripura – 799205</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Bottom Wave Accents */}
      <div className="adm-bottom-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="waves-svg">
          <path
            fill="#f97316"
            fillOpacity="0.85"
            d="M0,45 C320,95 480,10 820,55 C1100,90 1320,30 1440,48 L1440,100 L0,100 Z"
          ></path>
          <path
            fill="#0b1528"
            d="M0,60 C280,100 520,35 900,75 C1180,105 1360,65 1440,80 L1440,100 L0,100 Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Admissions;
