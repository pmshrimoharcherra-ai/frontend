import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AddTeacherModal.css';
import {
  X,
  User,
  BookOpen,
  Phone,
  Mail,
  Plus,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { CLASS_OPTIONS } from '../EditTeacherModal/EditTeacherModal';
import { getSubjectsForClass } from '../../data/curriculumData';
import DesignationSelect from '../DesignationSelect/DesignationSelect';

const STATUS_OPTIONS = [
  'Active Faculty',
  'On Leave',
  'Transferred',
  'Retired',
  'Contract Faculty',
];

const DESIGNATION_OPTIONS = [
  'UGT',
  'TGT',
  'PGT',
  'GT',
  'HM',
  'TIC',
  'AHM',
];

const AddTeacherModal = ({ onClose, onTeacherAdded }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    role: 'TGT',
    subject: '',
    phone: '',
    email: '',
    status: 'Active Faculty',
    assignedClassId: '',
    assignedClassName: '',
    teachingAssignments: [],
  });

  const [newAllotmentClass, setNewAllotmentClass] = useState('');
  const [newAllotmentSubject, setNewAllotmentSubject] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-suggest official email when typing name if email hasn't been manually edited
      if (field === 'name' && (!prev.email || prev.email.endsWith('@pmshri.ac.in'))) {
        const cleanName = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '.');
        if (cleanName) {
          updated.email = `${cleanName}@pmshri.ac.in`;
        }
      }
      return updated;
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleClassChange = (newClassId) => {
    const selected = CLASS_OPTIONS.find((c) => c.id === newClassId);
    setFormData((prev) => ({
      ...prev,
      assignedClassId: newClassId,
      assignedClassName: selected ? (newClassId ? selected.label.split(' (')[0] : '') : '',
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleAddAllotment = () => {
    if (!newAllotmentClass || !newAllotmentSubject) return;
    const selected = CLASS_OPTIONS.find((c) => c.id === newAllotmentClass);
    const className = selected ? selected.label.split(' (')[0] : newAllotmentClass;

    const exists = (formData.teachingAssignments || []).some(
      (a) => a.classId === newAllotmentClass && a.subject === newAllotmentSubject
    );
    if (exists) {
      setErrorMessage(`Teaching assignment for ${className} — ${newAllotmentSubject} already exists.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      teachingAssignments: [
        ...(prev.teachingAssignments || []),
        { classId: newAllotmentClass, className, subject: newAllotmentSubject },
      ],
    }));
    setNewAllotmentClass('');
    setNewAllotmentSubject('');
    if (errorMessage) setErrorMessage('');
  };

  const handleRemoveAllotment = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      teachingAssignments: (prev.teachingAssignments || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanTeacherId = formData.teacherId.trim().toUpperCase();
    const cleanName = formData.name.trim();
    const cleanSubject = formData.subject.trim();

    if (!cleanTeacherId) {
      setErrorMessage('Teacher ID is required (e.g. TR45208338 or TP00693724).');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Teacher Full Name is required.');
      return;
    }
    if (!cleanSubject) {
      setErrorMessage('Assigned Subject is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: cleanTeacherId,
          name: cleanName,
          role: formData.role.trim() || 'Faculty Member',
          subject: cleanSubject,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          status: formData.status,
          assignedClassId: formData.assignedClassId || '',
          assignedClassName: formData.assignedClassName || '',
          teachingAssignments: formData.teachingAssignments || [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add teacher.');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onTeacherAdded(data.teacher);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-teacher-backdrop" onClick={onClose}>
      <div
        className="add-teacher-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add New Teacher"
      >
        {/* ── Modal Header ── */}
        <div className="add-teacher-header">
          <div className="add-teacher-header-left">
            <div className="add-teacher-avatar">
              <Plus size={22} />
            </div>
            <div>
              <h3>Add New Faculty Member</h3>
              <p className="add-teacher-subtitle">
                Register a new teacher to the PM SHRI Moharcherra roster
              </p>
            </div>
          </div>
          <button
            type="button"
            className="add-teacher-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="add-teacher-form" noValidate>
          {/* Error Banner */}
          {errorMessage && (
            <div className="at-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <div className="at-success-banner">
              <CheckCircle2 size={16} />
              <span>Teacher added to faculty roster successfully!</span>
            </div>
          )}

          <div className="at-form-grid">
            {/* Teacher ID */}
            <div className="at-form-field">
              <label>
                <Hash size={14} />
                <span>Teacher ID *</span>
              </label>
              <input
                type="text"
                value={formData.teacherId}
                onChange={(e) => handleChange('teacherId', e.target.value.toUpperCase())}
                placeholder="e.g. TR45208338 or TP00693724"
                required
                autoFocus
              />
            </div>

            {/* Full Name */}
            <div className="at-form-field">
              <label>
                <User size={14} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Minakshi Sarkar"
                required
              />
            </div>

            {/* Role / Designation */}
            <div className="at-form-field">
              <label>
                <Briefcase size={14} />
                <span>Role / Designation</span>
              </label>
              <DesignationSelect
                value={formData.role}
                onChange={(val) => handleChange('role', val)}
                accent="emerald"
                placeholder="Select Designation"
              />
            </div>

            {/* Subject */}
            <div className="at-form-field">
              <label>
                <BookOpen size={14} />
                <span>Assigned Subject *</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. Mathematics & Physical Science"
                required
              />
            </div>

            {/* Phone */}
            <div className="at-form-field">
              <label>
                <Phone size={14} />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 94361 00000"
              />
            </div>

            {/* Email */}
            <div className="at-form-field">
              <label>
                <Mail size={14} />
                <span>Official Email</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="name@pmshri.ac.in"
              />
            </div>

            {/* Status */}
            <div className="at-form-field">
              <label>
                <ShieldCheck size={14} />
                <span>Faculty Status</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Teacher of (Attendance) */}
            <div className="at-form-field">
              <label>
                <GraduationCap size={14} />
                <span>Class Teacher of (Attendance)</span>
              </label>
              <select
                value={formData.assignedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                title="Class Teacher manages student attendance for this class"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Teaching Subjects & Classes Allotments ── */}
          <div className="et-teaching-section">
            <div className="et-section-header">
              <div className="et-section-title-wrap">
                <BookOpen size={16} className="text-orange" />
                <div>
                  <h4 className="et-section-title">Teaching Subjects & Classes Allotment</h4>
                  <p className="et-section-hint">
                    Assign which subjects this teacher teaches in different classes (e.g. English in Class X, English in Class IX, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Current Teaching Allotments Tags */}
            <div className="et-allotments-container">
              {formData.teachingAssignments && formData.teachingAssignments.length > 0 ? (
                <div className="et-allotments-grid">
                  {formData.teachingAssignments.map((item, idx) => (
                    <div key={idx} className="et-allotment-tag">
                      <span className="et-tag-class">{item.className || item.classId}</span>
                      <span className="et-tag-arrow">→</span>
                      <span className="et-tag-subject">{item.subject}</span>
                      <button
                        type="button"
                        className="et-remove-tag-btn"
                        onClick={() => handleRemoveAllotment(idx)}
                        title="Remove allotment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="et-no-allotments">
                  <span>No teaching assignments added yet. Select a class and subject below to allot.</span>
                </div>
              )}
            </div>

            {/* New Allotment Adder Row */}
            <div className="et-adder-bar">
              <div className="et-adder-field">
                <label>Select Class</label>
                <select
                  value={newAllotmentClass}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setNewAllotmentClass(cid);
                    const subList = getSubjectsForClass(cid);
                    if (subList.length > 0) {
                      setNewAllotmentSubject(subList[0]);
                    } else {
                      setNewAllotmentSubject('');
                    }
                  }}
                >
                  <option value="">-- Choose Class --</option>
                  {CLASS_OPTIONS.filter((c) => c.id).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="et-adder-field">
                <label>Select Subject</label>
                <select
                  value={newAllotmentSubject}
                  onChange={(e) => setNewAllotmentSubject(e.target.value)}
                  disabled={!newAllotmentClass}
                >
                  <option value="">-- Choose Subject --</option>
                  {(newAllotmentClass ? getSubjectsForClass(newAllotmentClass) : []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="et-add-allotment-btn"
                onClick={handleAddAllotment}
                disabled={!newAllotmentClass || !newAllotmentSubject}
              >
                <Plus size={14} />
                <span>Add Teaching Subject</span>
              </button>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="add-teacher-footer">
            <button
              type="button"
              className="at-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="at-btn-submit"
              disabled={saving || savedSuccess}
            >
              <Plus size={16} />
              <span>
                {savedSuccess
                  ? 'Added!'
                  : saving
                  ? 'Adding...'
                  : 'Add Teacher'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;
