import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import './EditTeacherModal.css';
import {
  X,
  User,
  BookOpen,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Plus
} from 'lucide-react';
import { getSubjectsForClass } from '../../data/curriculumData';
import DesignationSelect from '../DesignationSelect/DesignationSelect';

export const CLASS_OPTIONS = [
  { id: '', label: 'None / Unassigned' },
  { id: 'class-1', label: 'Class I (Primary Wing)' },
  { id: 'class-2', label: 'Class II (Primary Wing)' },
  { id: 'class-3', label: 'Class III (Primary Wing)' },
  { id: 'class-4', label: 'Class IV (Primary Wing)' },
  { id: 'class-5', label: 'Class V (Primary Wing)' },
  { id: 'class-6', label: 'Class VI (Elementary)' },
  { id: 'class-7', label: 'Class VII (Elementary)' },
  { id: 'class-8', label: 'Class VIII (Elementary)' },
  { id: 'class-9', label: 'Class IX (Secondary)' },
  { id: 'class-10', label: 'Class X (Secondary)' },
  { id: 'class-11', label: 'Class XI (Arts & Science)' },
  { id: 'class-12', label: 'Class XII (Arts & Science)' },
];

const normalizeClassId = (cid) => {
  if (cid === 'class-11-arts' || cid === 'class-11-sci') return 'class-11';
  if (cid === 'class-12-arts' || cid === 'class-12-sci') return 'class-12';
  return cid || '';
};

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

const EditTeacherModal = ({ teacher, onClose, onSave }) => {
  if (!teacher) return null;

  const [formData, setFormData] = useState({
    name: teacher.name || '',
    role: teacher.role || '',
    subject: teacher.subject || '',
    phone: teacher.phone || '',
    email: teacher.email || '',
    status: teacher.status || 'Active Faculty',
    assignedClassId: normalizeClassId(teacher.assignedClassId),
    assignedClassName: teacher.assignedClassName || '',
    teachingAssignments: Array.isArray(teacher.teachingAssignments) ? teacher.teachingAssignments : [],
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

  // Sync form if teacher prop changes
  useEffect(() => {
    setFormData({
      name: teacher.name || '',
      role: teacher.role || '',
      subject: teacher.subject || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      status: teacher.status || 'Active Faculty',
      assignedClassId: normalizeClassId(teacher.assignedClassId),
      assignedClassName: teacher.assignedClassName || '',
      teachingAssignments: Array.isArray(teacher.teachingAssignments) ? teacher.teachingAssignments : [],
    });
    setNewAllotmentClass('');
    setNewAllotmentSubject('');
    setSavedSuccess(false);
    setErrorMessage('');
  }, [teacher]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleClassChange = (newClassId) => {
    const selected = CLASS_OPTIONS.find((c) => c.id === newClassId);
    let cName = '';
    if (newClassId === 'class-11') cName = 'Class XI';
    else if (newClassId === 'class-12') cName = 'Class XII';
    else if (selected && newClassId) cName = selected.label.split(' (')[0];

    setFormData((prev) => ({
      ...prev,
      assignedClassId: newClassId,
      assignedClassName: cName,
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

    if (!formData.name.trim()) {
      setErrorMessage('Teacher Name is required.');
      return;
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Subject is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const teacherId = teacher._id || teacher.id || teacher.teacherId;
      const res = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          role: formData.role.trim(),
          subject: formData.subject.trim(),
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
        throw new Error(data.message || 'Failed to update teacher details.');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onSave(data.teacher || { ...teacher, ...formData });
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-teacher-backdrop" onClick={onClose}>
      <div
        className="edit-teacher-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit teacher: ${teacher.name}`}
      >
        {/* ── Modal Header ── */}
        <div className="edit-teacher-header">
          <div className="edit-teacher-header-left">
            <div className="edit-teacher-avatar">
              {formData.name.charAt(0).toUpperCase() || 'T'}
            </div>
            <div>
              <div className="edit-teacher-title-row">
                <h3>Edit Teacher Profile</h3>
                <span className="teacher-id-readonly-pill">
                  {teacher.teacherId}
                </span>
              </div>
              <p className="edit-teacher-subtitle">
                Update faculty details, contact info and status
              </p>
            </div>
          </div>
          <button
            type="button"
            className="edit-teacher-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="edit-teacher-form" noValidate>
          {/* Error Banner */}
          {errorMessage && (
            <div className="et-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <div className="et-success-banner">
              <CheckCircle2 size={16} />
              <span>Teacher details updated successfully!</span>
            </div>
          )}

          <div className="et-form-grid">
            {/* Full Name */}
            <div className="et-form-field full-width">
              <label>
                <User size={14} />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Joydeb Debnath"
                required
              />
            </div>

            {/* Role / Designation */}
            <div className="et-form-field">
              <label>
                <Briefcase size={14} />
                <span>Role / Designation</span>
              </label>
              <DesignationSelect
                value={formData.role}
                onChange={(val) => handleChange('role', val)}
                accent="orange"
                placeholder="Select Designation"
              />
            </div>

            {/* Subject */}
            <div className="et-form-field">
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
            <div className="et-form-field">
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
            <div className="et-form-field">
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
            <div className="et-form-field">
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
            <div className="et-form-field">
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

            {/* Teacher ID — read only */}
            <div className="et-form-field full-width">
              <label>
                <Hash size={14} />
                <span>Teacher Government ID</span>
              </label>
              <input
                type="text"
                value={teacher.teacherId || ''}
                readOnly
                className="et-input-readonly"
                title="Government-issued Teacher ID — not editable"
              />
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
          <div className="edit-teacher-footer">
            <button
              type="button"
              className="et-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="et-btn-save"
              disabled={saving || savedSuccess}
            >
              <Save size={16} />
              <span>
                {savedSuccess
                  ? 'Saved!'
                  : saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherModal;
