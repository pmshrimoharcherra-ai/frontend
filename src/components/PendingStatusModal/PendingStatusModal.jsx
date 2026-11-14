import React, { useState, useMemo } from 'react';
import './PendingStatusModal.css';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import {
  X,
  Sparkles,
  Hash,
  Fingerprint,
  Phone,
  PhoneOff,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Pencil,
  Eye,
  ArrowRight,
  Copy,
  Check,
  Filter,
  GraduationCap,
  Users,
  ShieldAlert,
  ShieldCheck,
  Printer,
  Save,
  Loader2,
  Award
} from 'lucide-react';

import { isTransferredStudent, isFailedStudent, isTransferredOrFailed, isFieldPending } from '../../utils/studentStatus';
export { isTransferredStudent, isFailedStudent, isTransferredOrFailed, isFieldPending };

export const PENDING_FIELD_CONFIG = {
  apaarId: {
    key: 'apaarId',
    title: 'APAAR ID',
    fullTitle: 'Automated Permanent Academic Account Registry (APAAR ID)',
    shortName: 'APAAR ID',
    icon: Sparkles,
    themeColor: '#7c3aed',
    accentClass: 'theme-apaar',
    badgeClass: 'badge-apaar',
    fieldLabel: 'APAAR ID',
    description: '12-digit One Nation, One Student ID mandated by Ministry of Education / NEP 2020',
    checkFn: (s) => !isTransferredStudent(s) && isFieldPending(s.apaarId),
    getValue: (s) => s.apaarId || '—'
  },
  penNumber: {
    key: 'penNumber',
    title: 'PEN Number',
    fullTitle: 'Permanent Education Number (UDISE+ PEN)',
    shortName: 'PEN Number',
    icon: Hash,
    themeColor: '#2563eb',
    accentClass: 'theme-pen',
    badgeClass: 'badge-pen',
    fieldLabel: 'PEN Number',
    description: 'Permanent national student tracking code assigned by Ministry of Education UDISE+',
    checkFn: (s) => !isTransferredStudent(s) && isFieldPending(s.penNumber),
    getValue: (s) => s.penNumber || '—'
  },
  aadhaar: {
    key: 'aadhaar',
    title: 'Aadhaar Card',
    fullTitle: 'UIDAI Aadhaar Card Number',
    shortName: 'Aadhaar',
    icon: Fingerprint,
    themeColor: '#d97706',
    accentClass: 'theme-aadhaar',
    badgeClass: 'badge-aadhaar',
    fieldLabel: 'Aadhaar No.',
    description: '12-digit Unique Identification Authority of India (UIDAI) citizen credential',
    checkFn: (s) => !isTransferredStudent(s) && isFieldPending(s.aadhaar),
    getValue: (s) => s.aadhaar || '—'
  },
  phone: {
    key: 'phone',
    title: 'Contact Number',
    fullTitle: 'Parent / Guardian Contact Mobile',
    shortName: 'Contact No.',
    icon: Phone,
    themeColor: '#059669',
    accentClass: 'theme-phone',
    badgeClass: 'badge-phone',
    fieldLabel: 'Phone No.',
    description: 'Emergency and communication mobile number for parent or legal guardian',
    checkFn: (s) => !isTransferredStudent(s) && isFieldPending(s.phone),
    getValue: (s) => s.phone || '—'
  },
  caste: {
    key: 'caste',
    title: 'Caste / Category',
    fullTitle: 'Social Category / Caste Status',
    shortName: 'Caste',
    icon: Award,
    themeColor: '#ea580c',
    accentClass: 'theme-caste',
    badgeClass: 'badge-caste',
    fieldLabel: 'Caste / Category',
    description: 'Students awaiting official social category (SC, ST, OBC, UR/General) roster classification',
    checkFn: (s) => {
      if (isTransferredOrFailed(s)) return false;
      const c = (s.caste || '').trim().toUpperCase();
      return !['SC', 'ST', 'OBC', 'UR', 'GEN', 'GENERAL'].includes(c);
    },
    getValue: (s) => s.caste || 'Pending'
  },
  any: {
    key: 'any',
    title: 'All Incomplete',
    fullTitle: 'All Incomplete Student Profiles',
    shortName: 'Incomplete',
    icon: AlertCircle,
    themeColor: '#dc2626',
    accentClass: 'theme-any',
    badgeClass: 'badge-any',
    fieldLabel: 'Pending Fields',
    description: 'Students missing at least one critical credential (APAAR, PEN, Aadhaar, or Contact)',
    checkFn: (s) => !isTransferredStudent(s) && isFieldPending(s.apaarId) || isFieldPending(s.penNumber) || isFieldPending(s.aadhaar) || isFieldPending(s.phone),
    getValue: (s) => {
      const missing = [];
      if (isFieldPending(s.apaarId)) missing.push('APAAR');
      if (isFieldPending(s.penNumber)) missing.push('PEN');
      if (isFieldPending(s.aadhaar)) missing.push('Aadhaar');
      if (isFieldPending(s.phone)) missing.push('Phone');
      return missing.join(', ');
    }
  }
};

const UPPER_CLASSES = ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11-sci', 'class-11-arts', 'class-12-sci', 'class-12-arts'];
const PRIMARY_CLASSES = ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'];

const PendingStatusModal = ({
  activeField = 'apaarId',
  setActiveField,
  initialClassId = 'ALL',
  students = [],
  classes = [],
  onClose,
  onSaveStudent,
  onEditStudent,
  onViewStudent,
  onNavigateToClass
}) => {
  const [selectedField, setSelectedField] = useState(activeField || 'apaarId');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState(initialClassId || 'ALL');
  const [collapsedClasses, setCollapsedClasses] = useState({});
  const [copiedNotification, setCopiedNotification] = useState('');

  // Quick Fill Modal State (Shows ONLY the fields that are missing)
  const [quickFillStudent, setQuickFillStudent] = useState(null);
  const [quickFillClass, setQuickFillClass] = useState(null);
  const [quickFillData, setQuickFillData] = useState({
    apaarId: '',
    penNumber: '',
    aadhaar: '',
    phone: '',
    caste: ''
  });
  const [quickFillSaving, setQuickFillSaving] = useState(false);
  const [showAllFieldsInQuickFill, setShowAllFieldsInQuickFill] = useState(false);

  const handleOpenQuickFill = (st, classObj) => {
    setQuickFillStudent(st);
    setQuickFillClass(classObj);
    setQuickFillData({
      apaarId: isFieldPending(st.apaarId) ? '' : String(st.apaarId || '').trim(),
      penNumber: isFieldPending(st.penNumber) ? '' : String(st.penNumber || '').trim(),
      aadhaar: isFieldPending(st.aadhaar) ? '' : String(st.aadhaar || '').trim(),
      phone: isFieldPending(st.phone) ? '' : String(st.phone || '').trim(),
      caste: (st.caste || '').trim()
    });
    setShowAllFieldsInQuickFill(false);
  };

  // Determine ONLY the fields that are pending/missing for quickFillStudent
  const pendingFieldsForQuickFill = useMemo(() => {
    if (!quickFillStudent) return [];
    const fields = [];
    if (isFieldPending(quickFillStudent.apaarId)) {
      fields.push({
        key: 'apaarId',
        label: 'APAAR ID',
        icon: Sparkles,
        placeholder: 'Not Available',
        maxLength: 12,
        theme: 'apaar'
      });
    }
    if (isFieldPending(quickFillStudent.penNumber)) {
      fields.push({
        key: 'penNumber',
        label: 'PEN Number',
        icon: Hash,
        placeholder: 'Not Available',
        maxLength: 11,
        theme: 'pen'
      });
    }
    if (isFieldPending(quickFillStudent.aadhaar)) {
      fields.push({
        key: 'aadhaar',
        label: 'Aadhaar Card Number',
        icon: Fingerprint,
        placeholder: 'Not Available',
        maxLength: 12,
        theme: 'aadhaar'
      });
    }
    if (isFieldPending(quickFillStudent.phone)) {
      fields.push({
        key: 'phone',
        label: 'Contact Phone Number',
        icon: Phone,
        placeholder: 'Not Available',
        maxLength: 10,
        theme: 'phone'
      });
    }
    const casteVal = (quickFillStudent.caste || '').trim().toUpperCase();
    if (!['SC', 'ST', 'OBC', 'UR', 'GEN', 'GENERAL'].includes(casteVal)) {
      fields.push({
        key: 'caste',
        label: 'Caste / Social Category',
        icon: Award,
        type: 'select',
        placeholder: 'Select Caste (SC/ST/OBC/UR)',
        theme: 'caste'
      });
    }
    return fields;
  }, [quickFillStudent]);

  // Already recorded fields (for optional review/adjustment)
  const recordedFieldsForQuickFill = useMemo(() => {
    if (!quickFillStudent) return [];
    const fields = [];
    if (!isFieldPending(quickFillStudent.apaarId)) {
      fields.push({ key: 'apaarId', label: 'APAAR ID', icon: Sparkles, value: quickFillStudent.apaarId, maxLength: 12 });
    }
    if (!isFieldPending(quickFillStudent.penNumber)) {
      fields.push({ key: 'penNumber', label: 'PEN Number', icon: Hash, value: quickFillStudent.penNumber, maxLength: 11 });
    }
    if (!isFieldPending(quickFillStudent.aadhaar)) {
      fields.push({ key: 'aadhaar', label: 'Aadhaar Card Number', icon: Fingerprint, value: quickFillStudent.aadhaar, maxLength: 12 });
    }
    if (!isFieldPending(quickFillStudent.phone)) {
      fields.push({ key: 'phone', label: 'Contact Phone Number', icon: Phone, value: quickFillStudent.phone, maxLength: 10 });
    }
    const casteVal = (quickFillStudent.caste || '').trim().toUpperCase();
    if (['SC', 'ST', 'OBC', 'UR', 'GEN', 'GENERAL'].includes(casteVal)) {
      fields.push({ key: 'caste', label: 'Caste / Category', icon: Award, value: quickFillStudent.caste, type: 'select' });
    }
    return fields;
  }, [quickFillStudent]);

  // Handle typing input: accepts only digits (integers)
  const handleCredentialInputChange = (key, rawValue, maxLength) => {
    const digitsOnly = String(rawValue || '').replace(/\D/g, '');
    const finalVal = maxLength ? digitsOnly.slice(0, maxLength) : digitsOnly;
    setQuickFillData((prev) => ({
      ...prev,
      [key]: finalVal
    }));
  };

  // Validation for Quick Fill Save button
  const isFormReadyToSave = useMemo(() => {
    if (!quickFillStudent) return false;

    // Check if any entered pending field is incomplete (has characters but hasn't reached required maxLength)
    const hasIncompletePending = pendingFieldsForQuickFill.some((f) => {
      const val = (quickFillData[f.key] || '').trim();
      if (f.type === 'select') return false;
      return val.length > 0 && f.maxLength && val.length < f.maxLength;
    });
    if (hasIncompletePending) return false;

    // Check if any entered recorded field is incomplete
    const hasIncompleteRecorded = recordedFieldsForQuickFill.some((rf) => {
      const val = (quickFillData[rf.key] || '').trim();
      if (rf.type === 'select') return false;
      return val.length > 0 && rf.maxLength && val.length < rf.maxLength;
    });
    if (hasIncompleteRecorded) return false;

    // Must have at least one pending field completely fulfilled
    // OR at least one recorded field changed and complete
    const hasFulfilledPending = pendingFieldsForQuickFill.some((f) => {
      const val = (quickFillData[f.key] || '').trim();
      if (f.type === 'select') return val.length > 0;
      return f.maxLength ? val.length === f.maxLength : val.length > 0;
    });

    const hasChangedRecorded = recordedFieldsForQuickFill.some((rf) => {
      const val = (quickFillData[rf.key] || '').trim();
      if (rf.type === 'select') {
        return val !== String(rf.value || '').trim() && val.length > 0;
      }
      return val !== String(rf.value || '').trim() && (rf.maxLength ? val.length === rf.maxLength : val.length > 0);
    });

    return hasFulfilledPending || hasChangedRecorded;
  }, [quickFillStudent, pendingFieldsForQuickFill, recordedFieldsForQuickFill, quickFillData]);

  const handleSaveQuickFill = async (e) => {
    e.preventDefault();
    if (!quickFillStudent || !isFormReadyToSave) return;

    // Check if at least one pending field has an entry, or recorded field was changed
    const hasAnyFilled = pendingFieldsForQuickFill.some(
      (f) => (quickFillData[f.key] || '').trim().length > 0
    ) || recordedFieldsForQuickFill.some(
      (rf) => (quickFillData[rf.key] || '').trim() !== String(rf.value || '').trim()
    );

    if (!hasAnyFilled) {
      alert('Please enter or select at least one value before saving.');
      return;
    }

    const updated = {
      ...quickFillStudent
    };

    if (quickFillData.apaarId !== undefined && quickFillData.apaarId.trim() !== '') {
      updated.apaarId = quickFillData.apaarId.trim();
    }
    if (quickFillData.penNumber !== undefined && quickFillData.penNumber.trim() !== '') {
      updated.penNumber = quickFillData.penNumber.trim();
    }
    if (quickFillData.aadhaar !== undefined && quickFillData.aadhaar.trim() !== '') {
      updated.aadhaar = quickFillData.aadhaar.trim();
    }
    if (quickFillData.phone !== undefined && quickFillData.phone.trim() !== '') {
      updated.phone = quickFillData.phone.trim();
    }
    if (quickFillData.caste !== undefined && quickFillData.caste.trim() !== '') {
      updated.caste = quickFillData.caste.trim();
    }

    setQuickFillSaving(true);
    try {
      if (onSaveStudent) {
        await onSaveStudent(updated);
      }
      setCopiedNotification(`Saved! Credentials updated for ${quickFillStudent.name}.`);
      setTimeout(() => setCopiedNotification(''), 3000);
      setQuickFillStudent(null);
    } catch (err) {
      console.error('Error saving quick fill credentials:', err);
      alert('Failed to save student details. Please try again.');
    } finally {
      setQuickFillSaving(false);
    }
  };

  // Synchronize internal field with external prop if it changes
  React.useEffect(() => {
    if (activeField) {
      setSelectedField(activeField);
    }
  }, [activeField]);

  React.useEffect(() => {
    if (initialClassId) {
      setSelectedClassFilter(initialClassId);
    }
  }, [initialClassId]);

  const currentConfig = PENDING_FIELD_CONFIG[selectedField] || PENDING_FIELD_CONFIG.apaarId;
  const targetClassObj = classes.find((c) => c.id === selectedClassFilter);
  const isUpperWingFilter = selectedClassFilter === 'upper' || selectedClassFilter === 'WING_UPPER';
  const isPrimaryWingFilter = selectedClassFilter === 'primary' || selectedClassFilter === 'WING_PRIMARY';

  const filterDisplayName = useMemo(() => {
    if (targetClassObj) return targetClassObj.name;
    if (isUpperWingFilter) return 'Classes VI – XII';
    if (isPrimaryWingFilter) return 'Classes I – V';
    return null;
  }, [targetClassObj, isUpperWingFilter, isPrimaryWingFilter]);

  const filterSubtitle = useMemo(() => {
    if (targetClassObj) return `${targetClassObj.wing} ${targetClassObj.stream ? `· ${targetClassObj.stream} Stream` : ''}`;
    if (isUpperWingFilter) return 'Higher Secondary Section (Classes VI – XII)';
    if (isPrimaryWingFilter) return 'Primary Section (Classes I – V)';
    return null;
  }, [targetClassObj, isUpperWingFilter, isPrimaryWingFilter]);

  // Scoped students based on selected class filter (single class vs wing vs all school)
  const scopedStudents = useMemo(() => {
    const active = students.filter((s) => !isTransferredOrFailed(s));
    if (selectedClassFilter === 'ALL' || selectedClassFilter === 'overall') return active;
    if (isUpperWingFilter) {
      return active.filter((s) => UPPER_CLASSES.includes(s.classId));
    }
    if (isPrimaryWingFilter) {
      return active.filter((s) => PRIMARY_CLASSES.includes(s.classId));
    }
    return active.filter((s) => s.classId === selectedClassFilter);
  }, [students, selectedClassFilter, isUpperWingFilter, isPrimaryWingFilter]);

  // Calculate counts for all pending fields (scoped to selected class or school)
  const fieldCounts = useMemo(() => {
    const counts = {
      apaarId: 0,
      penNumber: 0,
      aadhaar: 0,
      phone: 0,
      caste: 0,
      any: 0
    };
    scopedStudents.forEach((s) => {
      const isApaar = isFieldPending(s.apaarId);
      const isPen = isFieldPending(s.penNumber);
      const isAadhaar = isFieldPending(s.aadhaar);
      const isPhone = isFieldPending(s.phone);
      const c = (s.caste || '').trim().toUpperCase();
      const isCaste = !['SC', 'ST', 'OBC', 'UR', 'GEN', 'GENERAL'].includes(c);

      if (isApaar) counts.apaarId++;
      if (isPen) counts.penNumber++;
      if (isAadhaar) counts.aadhaar++;
      if (isPhone) counts.phone++;
      if (isCaste) counts.caste++;
      if (isApaar || isPen || isAadhaar || isPhone) counts.any++;
    });
    return counts;
  }, [scopedStudents]);

  // Group pending students class by class for the current selected field
  const classWisePendingGroups = useMemo(() => {
    const checkFn = currentConfig.checkFn;
    const query = searchQuery.trim().toLowerCase();

    // Grouping container
    const groups = [];

    classes.forEach((cls) => {
      if (isUpperWingFilter) {
        if (!UPPER_CLASSES.includes(cls.id)) return;
      } else if (isPrimaryWingFilter) {
        if (!PRIMARY_CLASSES.includes(cls.id)) return;
      } else if (selectedClassFilter !== 'ALL' && selectedClassFilter !== 'overall' && cls.id !== selectedClassFilter) {
        return;
      }

      const classStudents = students.filter((s) => s.classId === cls.id && !isTransferredOrFailed(s));
      const pendingStudents = classStudents
        .filter((s) => checkFn(s))
        .filter((s) => {
          if (!query) return true;
          const nameMatch = (s.name || '').toLowerCase().includes(query);
          const rollMatch = String(s.roll || '').includes(query);
          const fatherMatch = (s.father || s.guardian || '').toLowerCase().includes(query);
          const motherMatch = (s.mother || '').toLowerCase().includes(query);
          return nameMatch || rollMatch || fatherMatch || motherMatch;
        })
        .sort((a, b) => (parseInt(a.roll, 10) || 0) - (parseInt(b.roll, 10) || 0));

      if (pendingStudents.length > 0) {
        groups.push({
          classInfo: cls,
          totalEnrolled: classStudents.length,
          pendingCount: pendingStudents.length,
          pendingPercent: classStudents.length > 0 ? Math.round((pendingStudents.length / classStudents.length) * 100) : 0,
          students: pendingStudents
        });
      }
    });

    return groups;
  }, [students, classes, currentConfig, searchQuery, selectedClassFilter, isUpperWingFilter, isPrimaryWingFilter]);

  const totalPendingInView = useMemo(() => {
    return classWisePendingGroups.reduce((acc, g) => acc + g.students.length, 0);
  }, [classWisePendingGroups]);

  const toggleCollapseClass = (classId) => {
    setCollapsedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const handleExpandAll = () => {
    setCollapsedClasses({});
  };

  const handleCollapseAll = () => {
    const all = {};
    classWisePendingGroups.forEach((g) => {
      all[g.classInfo.id] = true;
    });
    setCollapsedClasses(all);
  };

  const handleCopyList = () => {
    const lines = [];
    lines.push(`PM SHRI MOHARCHERRA H.S. SCHOOL`);
    lines.push(`PENDING ${currentConfig.title.toUpperCase()} REPORT`);
    if (targetClassObj) {
      lines.push(`Class: ${targetClassObj.name} (${targetClassObj.wing})`);
    }
    lines.push(`Date: ${new Date().toLocaleDateString('en-GB')}`);
    lines.push(`Total Students Pending: ${totalPendingInView}`);
    lines.push(`----------------------------------------\n`);

    classWisePendingGroups.forEach((g) => {
      lines.push(`[${g.classInfo.name} - ${g.pendingCount} Pending]`);
      g.students.forEach((st) => {
        lines.push(`  Roll #${st.roll} - ${st.name} (${st.gender || 'Boy'}) | Guardian: ${st.guardian || st.father || '—'}`);
      });
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedNotification('Class-wise pending list copied to clipboard!');
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  const handleFieldChange = (fieldKey) => {
    setSelectedField(fieldKey);
    if (setActiveField) {
      setActiveField(fieldKey);
    }
  };

  const totalStudents = scopedStudents.length;
  const currentPendingCount = fieldCounts[selectedField] || 0;
  const verifiedCount = Math.max(0, totalStudents - currentPendingCount);
  const verifiedPercent = totalStudents > 0 ? ((verifiedCount / totalStudents) * 100).toFixed(1) : '0.0';

  const CurrentIcon = currentConfig.icon;

  return (
    <div className="pending-modal-backdrop" onClick={onClose}>
      <div 
        className="pending-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-modal-title"
      >
        {/* Top Gradient Accent Line */}
        <div className={`pending-top-accent-line ${currentConfig.accentClass}`} />

        {/* Header Bar */}
        <div className="pending-modal-header">
          <div className="pending-header-left">
            <div className={`pending-header-icon-box ${currentConfig.accentClass}`}>
              <CurrentIcon size={22} />
            </div>
            <div className="pending-header-text">
              <div className="pending-meta-tag-line">
                <span className="pending-statutory-micro-badge">
                  <ShieldCheck size={12} />
                  <span>UDISE+ & APAAR COMPLIANCE</span>
                </span>
                <span className="pending-meta-dot">•</span>
                <span className="pending-session-text">Session 2026–2027</span>
                {targetClassObj && (
                  <>
                    <span className="pending-meta-dot">•</span>
                    <span className="pending-class-focus-tag">{targetClassObj.name} Only</span>
                  </>
                )}
              </div>
              <div className="pending-title-row">
                <h2 id="pending-modal-title">
                  {filterDisplayName ? (
                    <>
                      <span className="target-class-title-tag">{filterDisplayName}</span>
                      {' — '}
                      {currentConfig.title} Pending
                    </>
                  ) : (
                    <>{currentConfig.title} — Class-wise Pending</>
                  )}
                </h2>
                <div className="pending-title-badges">
                  <span className="pending-count-chip">
                    <span className="pulse-indicator-dot" />
                    <strong>{currentPendingCount}</strong> Students Pending
                  </span>
                  {filterSubtitle ? (
                    <span className="pending-classes-chip selected-class-pill">
                      {filterSubtitle}
                    </span>
                  ) : (
                    <span className="pending-classes-chip">
                      Across <strong>{classWisePendingGroups.length}</strong> {classWisePendingGroups.length === 1 ? 'Class' : 'Classes'}
                    </span>
                  )}
                </div>
              </div>
              <p className="pending-header-desc">
                {filterDisplayName ? (
                  <>
                    Showing pending students strictly for <strong>{filterDisplayName}</strong> ({filterSubtitle}).{' '}
                    <button 
                      type="button" 
                      className="inline-switch-all-btn"
                      onClick={() => setSelectedClassFilter('ALL')}
                    >
                      Show all school classes →
                    </button>
                  </>
                ) : (
                  currentConfig.description
                )}
              </p>
            </div>
          </div>

          <div className="pending-header-right">
            <div className="pending-header-stat-box" title={`Status: ${verifiedCount} of ${totalStudents} students verified`}>
              <div className="header-stat-label-row">
                <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                <span>Verified Compliance</span>
              </div>
              <div className="header-stat-val-row">
                <strong className="header-stat-num">{verifiedCount} / {totalStudents}</strong>
                <span className="header-stat-pct">({verifiedPercent}%)</span>
              </div>
            </div>

            <button 
              type="button" 
              className="pending-close-btn" 
              onClick={onClose} 
              title="Close Pending Details (Esc)"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selector for Quick Field Switching */}
        <div className="pending-field-tabs-nav-bar">
          <div className="pending-segmented-pill-container">
            <button
              type="button"
              className={`pending-tab-pill tab-apaar ${selectedField === 'apaarId' ? 'active' : ''}`}
              onClick={() => handleFieldChange('apaarId')}
            >
              <Sparkles size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">APAAR ID</span>
              <span className="tab-pill-badge">{fieldCounts.apaarId}</span>
            </button>

            <button
              type="button"
              className={`pending-tab-pill tab-pen ${selectedField === 'penNumber' ? 'active' : ''}`}
              onClick={() => handleFieldChange('penNumber')}
            >
              <Hash size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">PEN Number</span>
              <span className="tab-pill-badge">{fieldCounts.penNumber}</span>
            </button>

            <button
              type="button"
              className={`pending-tab-pill tab-aadhaar ${selectedField === 'aadhaar' ? 'active' : ''}`}
              onClick={() => handleFieldChange('aadhaar')}
            >
              <Fingerprint size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">Aadhaar Card</span>
              <span className="tab-pill-badge">{fieldCounts.aadhaar}</span>
            </button>

            <button
              type="button"
              className={`pending-tab-pill tab-phone ${selectedField === 'phone' ? 'active' : ''}`}
              onClick={() => handleFieldChange('phone')}
            >
              <Phone size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">Contact Number</span>
              <span className="tab-pill-badge">{fieldCounts.phone}</span>
            </button>

            <button
              type="button"
              className={`pending-tab-pill tab-caste ${selectedField === 'caste' ? 'active' : ''}`}
              onClick={() => handleFieldChange('caste')}
            >
              <Award size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">Caste / Category</span>
              <span className="tab-pill-badge">{fieldCounts.caste}</span>
            </button>

            <button
              type="button"
              className={`pending-tab-pill tab-any ${selectedField === 'any' ? 'active' : ''}`}
              onClick={() => handleFieldChange('any')}
            >
              <AlertCircle size={14} className="tab-pill-icon" />
              <span className="tab-pill-title">All Incomplete</span>
              <span className="tab-pill-badge">{fieldCounts.any}</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="pending-modal-toolbar">
          <div className="pending-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder={targetClassObj ? `Search within ${targetClassObj.name} pending students...` : "Search by student name, roll no, father/guardian..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="pending-toolbar-actions">
            {/* Class filter dropdown */}
            <div className="pending-class-dropdown-wrap">
              <Filter size={13} className="filter-icon" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="pending-class-select"
              >
                <option value="ALL">All Classes (Entire School)</option>
                <option value="upper">Classes VI – XII (Higher Secondary Section)</option>
                <option value="primary">Classes I – V (Primary Section)</option>
                <optgroup label="Individual Classes">
                  {classes.map((cls) => {
                    const checkFn = currentConfig.checkFn;
                    const cCount = students.filter((s) => s.classId === cls.id && checkFn(s)).length;
                    if (cCount === 0) return null;
                    return (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cCount} pending)
                      </option>
                    );
                  })}
                </optgroup>
              </select>

              {selectedClassFilter !== 'ALL' && (
                <button
                  type="button"
                  className="quick-clear-class-btn"
                  onClick={() => setSelectedClassFilter('ALL')}
                  title="Switch to view all classes"
                >
                  Show All Classes
                </button>
              )}
            </div>

            <div className="accordion-toggle-btns">
              <button 
                type="button" 
                className="mini-util-btn" 
                onClick={handleExpandAll}
                title="Expand all classes"
              >
                Expand All
              </button>
              <span className="util-sep">/</span>
              <button 
                type="button" 
                className="mini-util-btn" 
                onClick={handleCollapseAll}
                title="Collapse all classes"
              >
                Collapse All
              </button>
            </div>

            <button 
              type="button" 
              className="copy-report-btn" 
              onClick={handleCopyList}
              title="Copy formatted class-wise list to clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check size={14} style={{ color: '#16a34a' }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="pending-copy-toast">
            <CheckCircle2 size={16} />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="pending-modal-body">
          {classWisePendingGroups.length === 0 ? (
            <div className="pending-empty-state">
              <div className="empty-state-icon-box">
                <CheckCircle2 size={40} style={{ color: '#16a34a' }} />
              </div>
              <h3>No Pending Records Found</h3>
              <p>
                {searchQuery || selectedClassFilter !== 'ALL'
                  ? 'No students match your active filters.'
                  : `All students have recorded and verified ${currentConfig.title}! Great compliance!`}
              </p>
              {(searchQuery || selectedClassFilter !== 'ALL') && (
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClassFilter('ALL');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="class-wise-groups-list">
              {classWisePendingGroups.map((group) => {
                const isCollapsed = collapsedClasses[group.classInfo.id];
                const cls = group.classInfo;
                const isScience = cls.stream === 'Science';
                const isArts = cls.stream === 'Arts';

                return (
                  <div key={cls.id} className="pending-class-group-card">
                    {/* Class Group Banner */}
                    <div 
                      className={`pending-group-header ${isCollapsed ? 'collapsed' : ''}`}
                      onClick={() => toggleCollapseClass(cls.id)}
                    >
                      <div className="group-header-left">
                        <div className="group-class-name-row">
                          <span className="group-class-name">{cls.name}</span>
                          <span className="group-wing-tag">{cls.wing}</span>
                          {cls.stream && (
                            <span className={`group-stream-tag ${isScience ? 'sci' : 'arts'}`}>
                              {cls.stream} Stream
                            </span>
                          )}
                        </div>
                        <div className="group-count-row">
                          <span className="pending-count-tag">
                            <strong>{group.pendingCount}</strong> Pending ({group.pendingPercent}% of class)
                          </span>
                          <span className="total-enrolled-tag">
                            Total Enrolled: {group.totalEnrolled}
                          </span>
                        </div>
                      </div>

                      <div className="group-header-right">
                        {onNavigateToClass && (
                          <button
                            type="button"
                            className="open-class-roster-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToClass(cls.id, selectedField);
                            }}
                            title={`Open full ${cls.name} Class View`}
                          >
                            <span>Open Class</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="collapse-toggle-icon"
                          aria-label={isCollapsed ? 'Expand class' : 'Collapse class'}
                        >
                          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Table of Students in This Class (Shown if not collapsed) */}
                    {!isCollapsed && (
                      <div className="group-students-table-wrap">
                        <table className="pending-students-table">
                          <thead>
                            <tr>
                              <th style={{ width: '68px', textAlign: 'center' }}>Roll</th>
                              <th style={{ minWidth: '190px' }}>Student Name</th>
                              <th style={{ minWidth: '150px' }}>Guardian / Father</th>
                              <th style={{ minWidth: '140px' }}>{currentConfig.fieldLabel} Status</th>
                              <th style={{ minWidth: '190px' }}>Other Credentials</th>
                              <th style={{ width: '130px', textAlign: 'center' }}>Quick Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.students.map((st) => {
                              const apaarPending = isFieldPending(st.apaarId);
                              const penPending = isFieldPending(st.penNumber);
                              const aadhaarPending = isFieldPending(st.aadhaar);
                              const phonePending = isFieldPending(st.phone);
                              const cUpper = (st.caste || '').trim().toUpperCase();
                              const castePending = !['SC', 'ST', 'OBC', 'UR', 'GEN', 'GENERAL'].includes(cUpper);

                              return (
                                <tr key={st.id || st.studentId}>
                                  {/* Roll No */}
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="pending-roll-pill">#{st.roll}</span>
                                  </td>

                                  {/* Student Name */}
                                  <td>
                                    <div 
                                      className="pending-student-name-box clickable"
                                      onClick={() => onViewStudent && onViewStudent(st, cls)}
                                      title="Click to view full student profile"
                                    >
                                      <div className="student-avatar-mini">
                                        {st.name?.charAt(0) || 'S'}
                                      </div>
                                      <div className="pending-student-name-meta">
                                        <div className="name-gender-line">
                                          <span className="p-student-name">{st.name}</span>
                                          <span className={`p-gender-pill ${st.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}>
                                            {st.gender?.toLowerCase() === 'girl' ? <GirlIcon size={11} /> : <BoyIcon size={11} />}
                                            <span>{st.gender === 'Girl' ? 'Girl' : 'Boy'}</span>
                                          </span>
                                        </div>
                                        {st.caste && (
                                          <span className="p-caste-tag">{st.caste}</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Guardian */}
                                  <td className="guardian-cell">
                                    <span className="guardian-text">
                                      {st.guardian || st.father || '—'}
                                    </span>
                                  </td>

                                  {/* Primary Field Status */}
                                  <td>
                                    {selectedField === 'caste' ? (
                                      <div className="pending-caste-assign-wrap">
                                        <select
                                          className="pending-caste-select"
                                          value={st.caste && ['SC', 'ST', 'OBC', 'UR'].includes(st.caste.toUpperCase()) ? st.caste.toUpperCase() : ''}
                                          onChange={async (e) => {
                                            const newCaste = e.target.value;
                                            if (!newCaste) return;
                                            try {
                                              if (onSaveStudent) {
                                                await onSaveStudent({ ...st, caste: newCaste });
                                                setCopiedNotification(`Saved! Caste updated to ${newCaste} for ${st.name}.`);
                                                setTimeout(() => setCopiedNotification(''), 3000);
                                              }
                                            } catch (err) {
                                              console.error('Error updating caste:', err);
                                            }
                                          }}
                                          title={`Assign Caste for ${st.name}`}
                                        >
                                          <option value="">Select Caste...</option>
                                          <option value="SC">SC (Scheduled Caste)</option>
                                          <option value="ST">ST (Scheduled Tribe)</option>
                                          <option value="OBC">OBC (Other Backward)</option>
                                          <option value="UR">UR / General</option>
                                        </select>
                                      </div>
                                    ) : selectedField === 'any' ? (
                                      <div className="any-missing-chips">
                                        {apaarPending && <span className="missing-chip apaar">No APAAR</span>}
                                        {penPending && <span className="missing-chip pen">No PEN</span>}
                                        {aadhaarPending && <span className="missing-chip aadhaar">No Aadhaar</span>}
                                        {phonePending && <span className="missing-chip phone">No Phone</span>}
                                        {castePending && <span className="missing-chip caste">No Caste</span>}
                                      </div>
                                    ) : (
                                      <span className="missing-primary-badge">
                                        <AlertCircle size={13} />
                                        <span>Missing / Pending</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Other Credentials Overview */}
                                  <td>
                                    <div className="other-cred-badges-row">
                                      {selectedField !== 'apaarId' && (
                                        <span 
                                          className={`cred-status-dot ${apaarPending ? 'pending' : 'ok'}`}
                                          title={apaarPending ? 'APAAR ID: Missing' : `APAAR: ${st.apaarId}`}
                                        >
                                          APAAR: {apaarPending ? '✗' : '✓'}
                                        </span>
                                      )}
                                      {selectedField !== 'penNumber' && (
                                        <span 
                                          className={`cred-status-dot ${penPending ? 'pending' : 'ok'}`}
                                          title={penPending ? 'PEN Number: Missing' : `PEN: ${st.penNumber}`}
                                        >
                                          PEN: {penPending ? '✗' : '✓'}
                                        </span>
                                      )}
                                      {selectedField !== 'aadhaar' && (
                                        <span 
                                          className={`cred-status-dot ${aadhaarPending ? 'pending' : 'ok'}`}
                                          title={aadhaarPending ? 'Aadhaar: Missing' : `Aadhaar: ${st.aadhaar}`}
                                        >
                                          Aadhaar: {aadhaarPending ? '✗' : '✓'}
                                        </span>
                                      )}
                                      {selectedField !== 'phone' && (
                                        <span 
                                          className={`cred-status-dot ${phonePending ? 'pending' : 'ok'}`}
                                          title={phonePending ? 'Phone: Missing' : `Phone: ${st.phone}`}
                                        >
                                          Phone: {phonePending ? '✗' : '✓'}
                                        </span>
                                      )}
                                      {selectedField !== 'caste' && (
                                        <span 
                                          className={`cred-status-dot ${castePending ? 'pending' : 'ok'}`}
                                          title={castePending ? 'Caste: Missing / Unrecorded' : `Caste: ${st.caste}`}
                                        >
                                          Caste: {castePending ? '✗' : '✓'}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td style={{ textAlign: 'center' }}>
                                    <div className="pending-actions-cell">
                                      <button
                                        type="button"
                                        className="quick-edit-btn"
                                        onClick={() => handleOpenQuickFill(st, cls)}
                                        title={`Quick fill missing credentials for ${st.name}`}
                                      >
                                        <Pencil size={13} />
                                        <span>Fill Details</span>
                                      </button>

                                      <button
                                        type="button"
                                        className="quick-view-btn"
                                        onClick={() => onViewStudent && onViewStudent(st, cls)}
                                        title={`View Full Details for ${st.name}`}
                                      >
                                        <Eye size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="pending-modal-footer">
          <div className="footer-stats-left">
            <span>Showing <strong>{totalPendingInView}</strong> pending records in <strong>{classWisePendingGroups.length}</strong> grades</span>
          </div>
          <div className="footer-actions-right">
            <button type="button" className="footer-close-btn" onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* QUICK FILL PENDING DETAILS POPUP (Displays ONLY the missing fields!) */}
      {quickFillStudent && (
        <div className="quick-fill-overlay" onClick={() => !quickFillSaving && setQuickFillStudent(null)}>
          <div className="quick-fill-card" onClick={(e) => e.stopPropagation()}>
            {/* Quick Fill Header */}
            <div className="quick-fill-header">
              <div className="qf-header-left">
                <div className="qf-avatar">{quickFillStudent.name?.charAt(0) || 'S'}</div>
                <div>
                  <div className="qf-badge-line">
                    <span className="qf-roll-pill">Roll #{quickFillStudent.roll}</span>
                    <span className="qf-class-pill">
                      {quickFillClass?.name || quickFillStudent.className || 'Class'}
                    </span>
                    <span className={`qf-gender-pill ${quickFillStudent.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy'}`}>
                      {quickFillStudent.gender === 'Girl' ? <GirlIcon size={11} /> : <BoyIcon size={11} />}
                      <span>{quickFillStudent.gender || 'Boy'}</span>
                    </span>
                  </div>
                  <h3 className="qf-student-name">{quickFillStudent.name}</h3>
                  <span className="qf-guardian-text">Guardian: {quickFillStudent.guardian || quickFillStudent.father || '—'}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="qf-close-btn" 
                onClick={() => !quickFillSaving && setQuickFillStudent(null)}
                disabled={quickFillSaving}
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Fill Form */}
            <form onSubmit={handleSaveQuickFill} className="quick-fill-form">
              <div className="qf-notice-bar">
                <AlertCircle size={15} className="qf-notice-icon" />
                <span>
                  <strong>Required Entry:</strong> Showing only fields that are missing for this student. Enter values and save.
                </span>
              </div>

              <div className="qf-fields-list">
                {pendingFieldsForQuickFill.length > 0 ? (
                  pendingFieldsForQuickFill.map((field, idx) => {
                    const FieldIcon = field.icon;
                    const currentVal = quickFillData[field.key] || '';
                    const isComplete = field.maxLength && currentVal.length === field.maxLength;
                    return (
                      <div key={field.key} className={`qf-field-group ${field.theme}`}>
                        <label className="qf-field-label">
                          <span className="qf-label-left">
                            <FieldIcon size={14} className="qf-label-icon" />
                            <strong>{field.label}</strong>
                          </span>
                          <span className="qf-required-tag">Missing / Required</span>
                        </label>
                        <div className="qf-input-wrapper">
                          {field.type === 'select' ? (
                            <select
                              value={currentVal}
                              onChange={(e) => setQuickFillData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="qf-select-dropdown"
                              autoFocus={idx === 0}
                            >
                              <option value="">-- Select Caste / Category --</option>
                              <option value="SC">SC (Scheduled Caste)</option>
                              <option value="ST">ST (Scheduled Tribe)</option>
                              <option value="OBC">OBC (Other Backward Class)</option>
                              <option value="UR">UR / General</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              inputMode="numeric"
                              autoFocus={idx === 0}
                              placeholder={field.placeholder}
                              value={currentVal}
                              onChange={(e) => handleCredentialInputChange(field.key, e.target.value, field.maxLength)}
                              className={`qf-input ${isComplete ? 'is-complete' : ''}`}
                              maxLength={field.maxLength}
                              autoComplete="off"
                            />
                          )}
                          {currentVal && field.type !== 'select' ? (
                            <button
                              type="button"
                              className="qf-input-clear-btn"
                              title="Clear entry"
                              onClick={() => handleCredentialInputChange(field.key, '', field.maxLength)}
                            >
                              <X size={13} />
                            </button>
                          ) : null}
                        </div>
                        <div className="qf-field-hint-line">
                          {field.type === 'select' ? (
                            <span className="qf-helper-text">Select official social category for scholarship & statutory roster</span>
                          ) : (
                            <>
                              {field.helper && <span className="qf-helper-text">{field.helper}</span>}
                              <span className={`qf-char-counter ${isComplete ? 'complete' : (currentVal.length > 0 ? 'incomplete' : '')}`}>
                                {field.maxLength ? `${currentVal.length}/${field.maxLength}` : currentVal.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="qf-all-filled-msg">
                    <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                    <span>All credentials are already filled for this student! You can review or edit below.</span>
                  </div>
                )}

                {/* Optional toggle to show already recorded credentials */}
                {recordedFieldsForQuickFill.length > 0 && (
                  <div className="qf-recorded-section">
                    <button
                      type="button"
                      className="qf-toggle-recorded-btn"
                      onClick={() => setShowAllFieldsInQuickFill(!showAllFieldsInQuickFill)}
                    >
                      <span>{showAllFieldsInQuickFill ? 'Hide' : 'Show'} Already Recorded Credentials ({recordedFieldsForQuickFill.length})</span>
                      {showAllFieldsInQuickFill ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAllFieldsInQuickFill && (
                      <div className="qf-recorded-fields-grid">
                        {recordedFieldsForQuickFill.map((rf) => {
                          const RIcon = rf.icon;
                          const rVal = quickFillData[rf.key] || '';
                          return (
                            <div key={rf.key} className="qf-recorded-field-item">
                              <label className="qf-recorded-label">
                                <RIcon size={13} />
                                <span>{rf.label}</span>
                                <span className="qf-recorded-ok-tag">Recorded ✓</span>
                              </label>
                              {rf.type === 'select' ? (
                                <select
                                  value={rVal}
                                  onChange={(e) => setQuickFillData((prev) => ({ ...prev, [rf.key]: e.target.value }))}
                                  className="qf-select-dropdown small"
                                >
                                  <option value="">-- Select Caste --</option>
                                  <option value="SC">SC (Scheduled Caste)</option>
                                  <option value="ST">ST (Scheduled Tribe)</option>
                                  <option value="OBC">OBC (Other Backward Class)</option>
                                  <option value="UR">UR / General</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={rVal}
                                  onChange={(e) => handleCredentialInputChange(rf.key, e.target.value, rf.maxLength)}
                                  className="qf-input small"
                                  maxLength={rf.maxLength}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="qf-form-actions">
                <button
                  type="button"
                  className="qf-cancel-btn"
                  onClick={() => setQuickFillStudent(null)}
                  disabled={quickFillSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="qf-save-btn"
                  disabled={quickFillSaving || !isFormReadyToSave}
                  title={!isFormReadyToSave ? 'Please fulfill the required digits before saving' : 'Save Details'}
                >
                  {quickFillSaving ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Details</span>
                    </>
                  )}
                </button>
              </div>

              {/* Link to Full Profile Editor */}
              {onEditStudent && (
                <div className="qf-full-edit-hint">
                  <span>Need to edit other student fields (DOB, Father, Mother, Caste)?</span>
                  <button
                    type="button"
                    className="qf-open-full-edit-link"
                    onClick={() => {
                      const st = quickFillStudent;
                      setQuickFillStudent(null);
                      onEditStudent(st);
                    }}
                  >
                    Open Full Profile Editor →
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingStatusModal;
