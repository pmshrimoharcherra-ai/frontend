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
  Calendar
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

  const [formData, setFormData] = useState({
    name: student.name || '',
    roll: student.roll || '',
    gender: student.gender ? (student.gender.toLowerCase() === 'girl' ? 'Girl' : 'Boy') : 'Boy',
    classId: student.classId || 'class-1',
    enrollmentNo: student.enrollmentNo || '',
    enrollmentYear: student.enrollmentYear || '2026',
    guardian: student.guardian || '',
    father: student.father || '',
    mother: student.mother || '',
    aadhaar: student.aadhaar || '',
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
    if (!formData.roll.trim()) {
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
      enrollmentYear: formData.enrollmentYear?.trim() || '2026',
      guardian: formData.guardian.trim() || formData.father.trim() || '',
      father: formData.father.trim(),
      mother: formData.mother.trim(),
      aadhaar: formData.aadhaar.trim(),
      penNumber: formData.penNumber?.trim() || '',
      apaarId: formData.apaarId?.trim() || '',
      dob: formData.dob.trim(),
      phone: formData.phone.trim(),
      status: formData.status,
      id: formData.id
    };

    setSavedSuccess(true);
    setTimeout(() => {
      onSave(updatedStudent);
      onClose();
    }, 450);
  };

  const currentClassObj = classes?.find(c => c.id === formData.classId);
  const isClass8 = formData.classId === 'class-8';
  const hasDetailedFamily = isClass8 || formData.classId === 'class-6';
  const isEnrollmentClass = ['class-9', 'class-10', 'class-11-arts', 'class-11-sci', 'class-12-arts', 'class-12-sci'].includes(formData.classId);
  const isClass1to8 = ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8'].includes(formData.classId);
  const showStudentId = !isClass1to8 && !isEnrollmentClass;
  const defaultYear = (formData.classId === 'class-11-arts' || formData.classId === 'class-11-sci') ? '2024' : '2026';

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
                {isEnrollmentClass && (
                  <span className="edit-student-id-pill enr-pill">
                    Reg: {formData.enrollmentNo || 'N/A'} (Year: {formData.enrollmentYear || defaultYear})
                  </span>
                )}
              </div>
              <p className="edit-subtitle">
                Update academic record, parent contact and enrollment status
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
            {/* Full Name */}
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
                required
                value={formData.roll}
                onChange={(e) => handleChange('roll', e.target.value)}
                placeholder="e.g. 01"
              />
            </div>

            {/* Class 6 & 8 Detailed Parent & Identity Details OR Standard Guardian */}
            {hasDetailedFamily ? (
              <>
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
                      placeholder="DD/MM/YYYY e.g. 20/09/2013"
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

                {/* PEN Number */}
                <div className="edit-form-field">
                  <label>
                    <Hash size={14} />
                    <span>PEN Number (Permanent Education No.)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.penNumber}
                    onChange={(e) => handleChange('penNumber', e.target.value)}
                    placeholder="e.g. 21952493321"
                  />
                </div>

                {/* APAAR ID */}
                <div className="edit-form-field">
                  <label>
                    <Sparkles size={14} />
                    <span>APAAR ID</span>
                  </label>
                  <input
                    type="text"
                    value={formData.apaarId}
                    onChange={(e) => handleChange('apaarId', e.target.value)}
                    placeholder="e.g. 12-digit APAAR ID (or leave blank)"
                  />
                </div>

                {/* Aadhaar Number */}
                <div className="edit-form-field">
                  <label>
                    <ShieldCheck size={14} />
                    <span>Aadhaar Number</span>
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaar}
                    onChange={(e) => handleChange('aadhaar', e.target.value)}
                    placeholder="e.g. 6668 0055 5972"
                  />
                </div>
              </>
            ) : (
              /* Guardian Name */
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
            )}

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

            {/* Enrollment Status */}
            <div className={`edit-form-field ${isClass8 ? 'full-width' : ''}`}>
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
              </select>
            </div>

            {/* Enrollment No & Year for Class 9 & Class 11; Permanent ID for other secondary/senior classes */}
            {isEnrollmentClass && (
              <>
                <div className="edit-form-field">
                  <label>
                    <Sparkles size={14} />
                    <span>Enrollment / Reg No.</span>
                  </label>
                  <input
                    type="text"
                    value={formData.enrollmentNo}
                    onChange={(e) => handleChange('enrollmentNo', e.target.value)}
                    placeholder="e.g. 321202805425, Not found, or Verify duplicate"
                  />
                </div>
                <div className="edit-form-field">
                  <label>
                    <Sparkles size={14} />
                    <span>Enrollment Year</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.enrollmentYear || defaultYear}
                    className="input-readonly"
                    title={`Enrollment year is fixed to ${defaultYear}`}
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
