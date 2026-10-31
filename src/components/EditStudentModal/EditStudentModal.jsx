import React, { useState, useRef } from 'react';
import './EditStudentModal.css';
import GenderSelect from '../GenderSelect/GenderSelect';
import {
  X,
  User,
  GraduationCap,
  Hash,
  Users,
  Phone,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Award,
  MapPin,
  Fingerprint
} from 'lucide-react';

// Helpers for Date of Birth calendar conversions (DD/MM/YYYY <-> YYYY-MM-DD)
export const formatToIsoDate = (dStr) => {
  if (!dStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
  const parts = dStr.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (d.length === 4) {
      return `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`;
    }
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m}-${d}`;
  }
  return '';
};

export const formatToDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return isoStr;
};

const EditStudentModal = ({ student, classes, onClose, onSave }) => {
  if (!student) return null;

  const dobPickerRef = useRef(null);

  const defaultYear = (student.classId === 'class-11-arts' || student.classId === 'class-11-sci') 
    ? '2024' 
    : (['class-12-arts', 'class-12-sci'].includes(student.classId) ? '2023' : '2026');

  const [formData, setFormData] = useState({
    name: student.name || '',
    roll: student.roll || '',
    gender: student.gender ? (student.gender.toLowerCase() === 'girl' ? 'Girl' : 'Boy') : 'Boy',
    classId: student.classId || 'class-1',
    enrollmentNo: student.enrollmentNo || '',
    enrollmentYear: student.enrollmentYear || defaultYear,
    guardian: student.guardian || '',
    father: student.father || '',
    mother: student.mother || '',
    aadhaar: student.aadhaar || '',
    caste: student.caste || '',
    admissionNo: student.admissionNo || '',
    admissionDate: student.admissionDate || '',
    address: student.address || '',
    penNumber: student.penNumber || '',
    apaarId: student.apaarId || '',
    dob: student.dob || '',
    phone: student.phone || '',
    status: student.status || 'Enrolled',
    id: student.id || student.studentId || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Student Full Name is required.');
      return;
    }
    if (!String(formData.roll).trim()) {
      setErrorMessage('Roll Number is required.');
      return;
    }

    const updatedStudent = {
      ...student,
      name: formData.name.trim(),
      roll: String(formData.roll).trim().padStart(2, '0'),
      gender: formData.gender || 'Boy',
      classId: formData.classId,
      enrollmentNo: formData.enrollmentNo?.trim() || '',
      enrollmentYear: formData.enrollmentYear?.trim() || defaultYear,
      guardian: formData.guardian?.trim() || formData.father?.trim() || '',
      father: formData.father?.trim() || '',
      mother: formData.mother?.trim() || '',
      aadhaar: formData.aadhaar?.trim() || '',
      caste: formData.caste?.trim() || '',
      admissionNo: formData.admissionNo?.trim() || '',
      admissionDate: formData.admissionDate?.trim() || '',
      address: formData.address?.trim() || '',
      penNumber: formData.penNumber?.trim() || '',
      apaarId: formData.apaarId?.trim() || '',
      dob: formData.dob?.trim() || '',
      phone: formData.phone?.trim() || '',
      status: formData.status || 'Enrolled',
      id: formData.id
    };

    setSavedSuccess(true);
    setTimeout(() => {
      onSave(updatedStudent);
      onClose();
    }, 450);
  };

  const isEnrollmentClass = ['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(formData.classId) || Boolean(formData.enrollmentNo);

  return (
    <div className="edit-student-backdrop" onClick={onClose}>
      <div 
        className="edit-student-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="edit-student-header">
          <div className="edit-header-info">
            <div className="student-header-avatar">
              {formData.name.charAt(0) || 'S'}
            </div>
            <div>
              <div className="edit-title-row">
                <h3>Edit Student Details</h3>
                {isEnrollmentClass && formData.enrollmentNo && (
                  <span className="edit-student-id-pill enr-pill">
                    Reg: {formData.enrollmentNo} (Year: {formData.enrollmentYear || defaultYear})
                  </span>
                )}
              </div>
              <p className="edit-subtitle">
                Update academic record, parentage, government IDs and enrollment status
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="edit-close-btn" 
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="edit-student-form">
          {errorMessage && (
            <div className="edit-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="edit-success-banner">
              <CheckCircle2 size={16} />
              <span>Student details updated successfully!</span>
            </div>
          )}

          <div className="edit-form-grid">
            {/* Section: Academic & Basic Identity */}
            <div className="edit-form-field full-width">
              <label>
                <User size={14} />
                <span>Student Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Aarav Debbarma"
              />
            </div>

            {/* Class & Stream */}
            <div className="edit-form-field">
              <label>
                <GraduationCap size={14} />
                <span>Enrolled Class *</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleChange('classId', e.target.value)}
              >
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.stream ? `(${cls.stream})` : ''} - {cls.wing}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Number */}
            <div className="edit-form-field">
              <label>
                <Hash size={14} />
                <span>Roll Number *</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                value={formData.roll}
                onChange={(e) => handleChange('roll', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 01"
              />
            </div>

            {/* Student Gender */}
            <div className="edit-form-field">
              <label>
                <User size={14} />
                <span>Student Gender (Boy/Girl) *</span>
              </label>
              <GenderSelect
                value={formData.gender || 'Boy'}
                onChange={(val) => handleChange('gender', val)}
              />
            </div>

            {/* Contact Phone */}
            <div className="edit-form-field">
              <label>
                <Phone size={14} />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98621 11201 (or leave blank)"
              />
            </div>

            {/* Section Divider: Parents & Family */}
            <div className="edit-section-header full-width">
              <span>Parentage & Family Information</span>
            </div>

            {/* Father's Name */}
            <div className="edit-form-field">
              <label>
                <Users size={14} />
                <span>Father's Name</span>
              </label>
              <input
                type="text"
                value={formData.father}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange('father', val);
                  if (val.trim().toLowerCase() === 't/c') {
                    handleChange('status', 'Transferred');
                  }
                }}
                placeholder="e.g. Pankaj Paul (or t/c)"
              />
            </div>

            {/* Mother's Name */}
            <div className="edit-form-field">
              <label>
                <Users size={14} />
                <span>Mother's Name</span>
              </label>
              <input
                type="text"
                value={formData.mother}
                onChange={(e) => handleChange('mother', e.target.value)}
                placeholder="e.g. Shibani Das Paul"
              />
            </div>

            {/* Guardian Name */}
            <div className="edit-form-field">
              <label>
                <Users size={14} />
                <span>Guardian / Parent Name</span>
              </label>
              <input
                type="text"
                value={formData.guardian}
                onChange={(e) => handleChange('guardian', e.target.value)}
                placeholder="e.g. Manik Debbarma (or leave blank)"
              />
            </div>

            {/* Address / Location */}
            <div className="edit-form-field">
              <label>
                <MapPin size={14} />
                <span>Address / Village</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Moharchera"
              />
            </div>

            {/* Section Divider: Personal, Category & Identity */}
            <div className="edit-section-header full-width">
              <span>Personal, Category & Government Identifiers</span>
            </div>

            {/* Date of Birth (DOB) */}
            <div className="edit-form-field">
              <label htmlFor="edit-student-dob">
                <Calendar size={14} />
                <span>Date of Birth (DOB)</span>
              </label>
              <div 
                className="dob-input-wrapper"
                onClick={() => {
                  try {
                    dobPickerRef.current?.showPicker?.();
                  } catch (err) {
                    dobPickerRef.current?.focus();
                  }
                }}
              >
                <input
                  id="edit-student-dob"
                  type="text"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  placeholder="DD/MM/YYYY e.g. 20/09/2008"
                  className="dob-text-input"
                />
                <input
                  type="date"
                  ref={dobPickerRef}
                  value={formatToIsoDate(formData.dob)}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleChange('dob', formatToDisplayDate(e.target.value));
                    }
                  }}
                  className="dob-native-picker"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="dob-picker-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      dobPickerRef.current?.showPicker?.();
                    } catch (err) {
                      dobPickerRef.current?.focus();
                    }
                  }}
                  title="Choose Date of Birth from calendar"
                  aria-label="Choose Date of Birth from calendar"
                >
                  <Calendar size={16} />
                </button>
              </div>
            </div>

            {/* Caste / Category */}
            <div className="edit-form-field">
              <label>
                <Award size={14} />
                <span>Caste / Category</span>
              </label>
              <select
                value={formData.caste || ''}
                onChange={(e) => handleChange('caste', e.target.value)}
              >
                <option value="">Select Caste / Category</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="UR">UR / General</option>
                {formData.caste && !['', 'SC', 'ST', 'OBC', 'UR', 'UR / General', 'GEN', 'General'].includes(formData.caste) && (
                  <option value={formData.caste}>{formData.caste}</option>
                )}
              </select>
            </div>

            {/* Aadhaar Number */}
            <div className="edit-form-field">
              <label>
                <Fingerprint size={14} />
                <span>Aadhaar Number</span>
              </label>
              <input
                type="text"
                value={formData.aadhaar}
                onChange={(e) => handleChange('aadhaar', e.target.value)}
                placeholder="e.g. 6668 0055 5972"
              />
            </div>

            {/* PEN Number */}
            <div className="edit-form-field">
              <label>
                <Hash size={14} />
                <span>PEN Number (11 Digits)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={formData.penNumber}
                onChange={(e) => handleChange('penNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="e.g. 11-digit PEN (21952493321)"
              />
            </div>

            {/* APAAR ID */}
            <div className="edit-form-field">
              <label>
                <Sparkles size={14} />
                <span>APAAR ID (12 Digits)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={formData.apaarId}
                onChange={(e) => handleChange('apaarId', e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="e.g. 12-digit APAAR ID"
              />
            </div>

            {/* Admission Number */}
            <div className="edit-form-field">
              <label>
                <Hash size={14} />
                <span>Admission Number</span>
              </label>
              <input
                type="text"
                value={formData.admissionNo}
                onChange={(e) => handleChange('admissionNo', e.target.value)}
                placeholder="e.g. 01, 07, 36"
              />
            </div>

            {/* Admission Date */}
            <div className="edit-form-field">
              <label>
                <Calendar size={14} />
                <span>Admission Date</span>
              </label>
              <input
                type="text"
                value={formData.admissionDate}
                onChange={(e) => handleChange('admissionDate', e.target.value)}
                placeholder="e.g. 02/04/2026"
              />
            </div>

            {/* Enrollment Status */}
            <div className={`edit-form-field ${isEnrollmentClass ? '' : 'full-width'}`}>
              <label>
                <ShieldCheck size={14} />
                <span>Enrollment Status</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="Enrolled">Enrolled (Active Regular)</option>
                <option value="Leave">On Medical / Personal Leave</option>
                <option value="Transferred">Transferred (TC Issued)</option>
                <option value="Alumni">Alumni / Graduated</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Registration Details for Secondary & Higher Secondary (Class 9, 10, 11, 12) or if enrollmentNo exists */}
            {isEnrollmentClass && (
              <>
                <div className="edit-section-header full-width">
                  <span>Board Registration & Enrollment Record</span>
                </div>
                <div className="edit-form-field">
                  <label>
                    <Sparkles size={14} />
                    <span>Enrollment / Reg No.</span>
                  </label>
                  <input
                    type="text"
                    value={formData.enrollmentNo}
                    onChange={(e) => handleChange('enrollmentNo', e.target.value)}
                    placeholder="e.g. 322202805469"
                  />
                </div>
                <div className="edit-form-field">
                  <label>
                    <Sparkles size={14} />
                    <span>Enrollment Year</span>
                  </label>
                  <input
                    type="text"
                    value={formData.enrollmentYear}
                    onChange={(e) => handleChange('enrollmentYear', e.target.value)}
                    placeholder={`e.g. ${defaultYear}`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="edit-student-footer">
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save-edit"
              disabled={savedSuccess}
            >
              <Save size={16} />
              <span>{savedSuccess ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
