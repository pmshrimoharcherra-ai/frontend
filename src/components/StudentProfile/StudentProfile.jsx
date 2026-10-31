import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './StudentProfile.css';
import { GraduationCap, ShieldCheck, User, Copy, Check } from 'lucide-react';

const StudentProfile = ({ student: propStudent }) => {
  const context = useOutletContext();
  const activeStudent = propStudent || context?.activeStudent || (() => {
    try {
      const s = localStorage.getItem('pmshri_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  if (!activeStudent) return null;

  return (
    <div className="student-profile-page">
      <div className="sp-page-header">
        <div>
          <h2>Student ERP Master Record</h2>
          <p>Official verified registration details stored in School ERP database</p>
        </div>
      </div>

      <div className="sp-profile-sections-grid">
        {/* Academic Details Card */}
        <div className="sp-card profile-box">
          <div className="sp-card-header">
            <div className="sp-card-title-wrap">
              <GraduationCap size={18} className="icon-title" />
              <h4>Academic Enrollment Details</h4>
            </div>
          </div>
          <div className="profile-fields-list">
            <div className="p-field">
              <span className="p-lbl">Student Full Name</span>
              <span className="p-val font-bold">{activeStudent.name}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Enrolled Class</span>
              <span className="p-val font-bold">{activeStudent.className || 'Class VIII'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Class Roll Number</span>
              <span className="p-val font-mono font-bold">#{activeStudent.roll || '01'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Gender</span>
              <span className="p-val">{activeStudent.gender || 'Boy'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Admission Number</span>
              <span className="p-val font-mono">{activeStudent.admissionNo || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Admission Date</span>
              <span className="p-val font-mono">{activeStudent.admissionDate || '02/04/2022'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Enrollment Status</span>
              <span className="p-val text-success font-bold">{activeStudent.status || 'Enrolled (Active Regular)'}</span>
            </div>
          </div>
        </div>

        {/* Government & Identity Card */}
        <div className="sp-card profile-box">
          <div className="sp-card-header">
            <div className="sp-card-title-wrap">
              <ShieldCheck size={18} className="icon-title" />
              <h4>Government & Board Identification</h4>
            </div>
          </div>
          <div className="profile-fields-list">
            <div className="p-field">
              <span className="p-lbl">APAAR ID</span>
              <div className="val-with-copy">
                <span className="p-val font-mono font-bold">{activeStudent.apaarId || 'Pending'}</span>
                {activeStudent.apaarId && (
                  <button
                    type="button"
                    className="copy-btn-mini"
                    onClick={() => handleCopy(activeStudent.apaarId, 'apaar-prof')}
                  >
                    {copiedField === 'apaar-prof' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            <div className="p-field">
              <span className="p-lbl">PEN Number (Permanent Education No.)</span>
              <div className="val-with-copy">
                <span className="p-val font-mono font-bold">{activeStudent.penNumber || 'Pending'}</span>
                {activeStudent.penNumber && (
                  <button
                    type="button"
                    className="copy-btn-mini"
                    onClick={() => handleCopy(activeStudent.penNumber, 'pen-prof')}
                  >
                    {copiedField === 'pen-prof' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            <div className="p-field">
              <span className="p-lbl">Aadhaar Number</span>
              <span className="p-val font-mono">
                {activeStudent.aadhaar ? activeStudent.aadhaar : 'Verified in School Archive'}
              </span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Board Registration / Enrollment No.</span>
              <span className="p-val font-mono font-bold">{activeStudent.enrollmentNo || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Date of Birth (DOB)</span>
              <span className="p-val font-mono">{activeStudent.dob || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Caste / Category</span>
              <span className="p-val font-bold" style={{ color: '#ea580c' }}>{activeStudent.caste || 'Gen'}</span>
            </div>
          </div>
        </div>

        {/* Parentage & Family Info Card */}
        <div className="sp-card profile-box full-width">
          <div className="sp-card-header">
            <div className="sp-card-title-wrap">
              <User size={18} className="icon-title" />
              <h4>Parentage & Contact Details</h4>
            </div>
          </div>
          <div className="profile-fields-grid-3">
            <div className="p-field">
              <span className="p-lbl">Father's Name</span>
              <span className="p-val font-bold">{activeStudent.father || activeStudent.guardian || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Mother's Name</span>
              <span className="p-val font-bold">{activeStudent.mother || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Guardian / Emergency Contact</span>
              <span className="p-val">{activeStudent.guardian || activeStudent.father || '—'}</span>
            </div>
            <div className="p-field">
              <span className="p-lbl">Contact Phone Number</span>
              <span className="p-val font-mono">{activeStudent.phone || '+91 98621 11201'}</span>
            </div>
            <div className="p-field span-2">
              <span className="p-lbl">Permanent Village / Address</span>
              <span className="p-val">{activeStudent.address || 'Moharcherra, Teliamura, Khowai District, Tripura'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
