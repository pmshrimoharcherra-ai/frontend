import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  DEFAULT_WEIGHTAGE_SCHEME,
  getSubjectWeightageScheme,
  saveSubjectWeightageScheme,
  resetSubjectWeightageScheme
} from '../../data/curriculumData';
import './SubjectWeightageModal.css';

const TARGET_ANNUAL = 80;
const TARGET_PERIODIC = 40;

const SubjectWeightageModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const getInitialScheme = () => {
    const active = getSubjectWeightageScheme();
    return {
      science: DEFAULT_WEIGHTAGE_SCHEME.science.map((defPart) => {
        const found = (active?.science || []).find((p) => p.id === defPart.id);
        return found ? { ...defPart, ...found } : { ...defPart };
      }),
      socialScience: DEFAULT_WEIGHTAGE_SCHEME.socialScience.map((defPart) => {
        const found = (active?.socialScience || []).find((p) => p.id === defPart.id);
        return found ? { ...defPart, ...found } : { ...defPart };
      })
    };
  };

  const [scheme, setScheme] = useState(getInitialScheme);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setScheme(getInitialScheme());
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Always guarantee all 3 components are present and safely populated
  const safeScience = DEFAULT_WEIGHTAGE_SCHEME.science.map((defPart, idx) => {
    const found = (scheme?.science || []).find((p) => p.id === defPart.id) || (scheme?.science || [])[idx];
    return found ? { ...defPart, ...found } : { ...defPart };
  });

  const safeSocial = DEFAULT_WEIGHTAGE_SCHEME.socialScience.map((defPart, idx) => {
    const found = (scheme?.socialScience || []).find((p) => p.id === defPart.id) || (scheme?.socialScience || [])[idx];
    return found ? { ...defPart, ...found } : { ...defPart };
  });

  const handleScienceChange = (index, field, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const updated = [...safeScience];
    updated[index] = { ...updated[index], [field]: num };
    setScheme({ ...scheme, science: updated });
    setErrorMsg('');
  };

  const handleSocialScienceChange = (index, field, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const updated = [...safeSocial];
    updated[index] = { ...updated[index], [field]: num };
    setScheme({ ...scheme, socialScience: updated });
    setErrorMsg('');
  };

  // Totals
  const sciTotal80 = Number(safeScience.reduce((acc, p) => acc + (Number(p.max80) || 0), 0).toFixed(1));
  const sciTotal40 = Number(safeScience.reduce((acc, p) => acc + (Number(p.max40) || 0), 0).toFixed(1));

  const socTotal80 = Number(safeSocial.reduce((acc, p) => acc + (Number(p.max80) || 0), 0).toFixed(1));
  const socTotal40 = Number(safeSocial.reduce((acc, p) => acc + (Number(p.max40) || 0), 0).toFixed(1));

  // Diffs relative to strict fixed targets (80 for Annual, 40 for PT)
  const sci80Diff = Number((sciTotal80 - TARGET_ANNUAL).toFixed(1));
  const sci40Diff = Number((sciTotal40 - TARGET_PERIODIC).toFixed(1));
  const soc80Diff = Number((socTotal80 - TARGET_ANNUAL).toFixed(1));
  const soc40Diff = Number((socTotal40 - TARGET_PERIODIC).toFixed(1));

  const isSci80Valid = sci80Diff === 0;
  const isSci40Valid = sci40Diff === 0;
  const isSoc80Valid = soc80Diff === 0;
  const isSoc40Valid = soc40Diff === 0;

  const isAllValid = isSci80Valid && isSci40Valid && isSoc80Valid && isSoc40Valid;

  const handleSave = () => {
    if (!isAllValid) {
      setErrorMsg('Cannot save: Combined subject marks must equal exactly 80 for Annual and 40 for Periodic Test (PT). Please reduce or adjust component marks.');
      return;
    }

    try {
      const payload = {
        science: safeScience,
        socialScience: safeSocial
      };
      saveSubjectWeightageScheme(payload);
      setSuccessMsg('Subject weightage scheme updated and saved successfully!');
      if (onSaveSuccess) onSaveSuccess(payload);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 900);
    } catch (err) {
      setErrorMsg('Failed to save scheme. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all component marks to standard 80 Marks (Annual) & 40 Marks (Periodic Test) board defaults?')) {
      const def = resetSubjectWeightageScheme();
      setScheme({
        science: def.science.map(p => ({ ...p })),
        socialScience: def.socialScience.map(p => ({ ...p }))
      });
      setSuccessMsg('Reset to standard 80M / 40M board defaults.');
      setErrorMsg('');
      if (onSaveSuccess) onSaveSuccess(def);
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const modalContent = (
    <div className="weightage-modal-overlay" onClick={onClose}>
      <div
        className="weightage-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="weightage-modal-header">
          <div className="header-icon-title">
            <div className="header-icon-wrap">
              <Sliders size={22} />
            </div>
            <div>
              <h3>Subject Marks Weightage Scheme</h3>
              <p>Configure Class IX & X component marks breakdown (Strict 80M Annual / 40M Periodic Scheme)</p>
            </div>
          </div>
          <button
            type="button"
            className="weightage-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Feedback Messages */}
        {successMsg && (
          <div className="weightage-alert success">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="weightage-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mismatch Alert Box if Any Subject is Overflown or Underflown */}
        {!isAllValid && (
          <div className="weightage-overflow-warning">
            <div className="overflow-warning-head">
              <AlertTriangle size={18} />
              <span>Target Marks Mismatch — Adjust components to enable saving:</span>
            </div>
            <ul className="overflow-warning-list">
              {!isSci80Valid && (
                <li>
                  <strong>Science (Annual 80M Exam):</strong> Total is {sciTotal80} / 80 Marks.{' '}
                  {sci80Diff > 0 ? (
                    <span className="reduce-hint">Overflow by +{sci80Diff} M. Please reduce component marks by {sci80Diff}.</span>
                  ) : (
                    <span className="add-hint">Short by {Math.abs(sci80Diff)} M. Please add {Math.abs(sci80Diff)} marks.</span>
                  )}
                </li>
              )}
              {!isSci40Valid && (
                <li>
                  <strong>Science (PT 40M Exam):</strong> Total is {sciTotal40} / 40 Marks.{' '}
                  {sci40Diff > 0 ? (
                    <span className="reduce-hint">Overflow by +{sci40Diff} M. Please reduce component marks by {sci40Diff}.</span>
                  ) : (
                    <span className="add-hint">Short by {Math.abs(sci40Diff)} M. Please add {Math.abs(sci40Diff)} marks.</span>
                  )}
                </li>
              )}
              {!isSoc80Valid && (
                <li>
                  <strong>Social Science (Annual 80M Exam):</strong> Total is {socTotal80} / 80 Marks.{' '}
                  {soc80Diff > 0 ? (
                    <span className="reduce-hint">Overflow by +{soc80Diff} M. Please reduce component marks by {soc80Diff}.</span>
                  ) : (
                    <span className="add-hint">Short by {Math.abs(soc80Diff)} M. Please add {Math.abs(soc80Diff)} marks.</span>
                  )}
                </li>
              )}
              {!isSoc40Valid && (
                <li>
                  <strong>Social Science (PT 40M Exam):</strong> Total is {socTotal40} / 40 Marks.{' '}
                  {soc40Diff > 0 ? (
                    <span className="reduce-hint">Overflow by +{soc40Diff} M. Please reduce component marks by {soc40Diff}.</span>
                  ) : (
                    <span className="add-hint">Short by {Math.abs(soc40Diff)} M. Please add {Math.abs(soc40Diff)} marks.</span>
                  )}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Modal Body */}
        <div className="weightage-modal-body">
          {/* Section 1: Science Components */}
          <div className="scheme-section-card">
            <div className="section-card-head">
              <div className="section-title-wrap">
                <span className="sec-emoji">🔬</span>
                <div>
                  <h4>Science Sub-Subjects</h4>
                  <small>Life Science / Biology, Physics, Chemistry</small>
                </div>
              </div>
              <div className="section-totals-group">
                <span className={`status-pill ${isSci80Valid ? 'valid' : sci80Diff > 0 ? 'overflow' : 'underflow'}`}>
                  {isSci80Valid ? (
                    <>Annual: <strong>80 / 80M</strong></>
                  ) : sci80Diff > 0 ? (
                    <>Annual: <strong>{sciTotal80} / 80M (+{sci80Diff})</strong></>
                  ) : (
                    <>Annual: <strong>{sciTotal80} / 80M ({sci80Diff})</strong></>
                  )}
                </span>
                <span className={`status-pill ${isSci40Valid ? 'valid' : sci40Diff > 0 ? 'overflow' : 'underflow'}`}>
                  {isSci40Valid ? (
                    <>Periodic: <strong>40 / 40M</strong></>
                  ) : sci40Diff > 0 ? (
                    <>Periodic: <strong>{sciTotal40} / 40M (+{sci40Diff})</strong></>
                  ) : (
                    <>Periodic: <strong>{sciTotal40} / 40M ({sci40Diff})</strong></>
                  )}
                </span>
              </div>
            </div>

            <div className="scheme-table-wrap">
              <table className="scheme-table">
                <thead>
                  <tr>
                    <th>Sub-Subject</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>80 Marks Exam (Half-Yearly / Annual)</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>40 Marks Exam (Periodic Test)</th>
                  </tr>
                </thead>
                <tbody>
                  {safeScience.map((part, idx) => (
                    <tr key={part.id}>
                      <td>
                        <strong>{part.name}</strong>
                        <span className="sub-tag">{part.label}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            step="0.5"
                            value={part.max80}
                            onChange={(e) => handleScienceChange(idx, 'max80', e.target.value)}
                          />
                          <span className="unit">Marks</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            step="0.5"
                            value={part.max40}
                            onChange={(e) => handleScienceChange(idx, 'max40', e.target.value)}
                          />
                          <span className="unit">Marks</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Social Science Components */}
          <div className="scheme-section-card">
            <div className="section-card-head">
              <div className="section-title-wrap">
                <span className="sec-emoji">📚</span>
                <div>
                  <h4>Social Science Sub-Subjects</h4>
                  <small>History, Geography, Economics</small>
                </div>
              </div>
              <div className="section-totals-group">
                <span className={`status-pill ${isSoc80Valid ? 'valid' : soc80Diff > 0 ? 'overflow' : 'underflow'}`}>
                  {isSoc80Valid ? (
                    <>Annual: <strong>80 / 80M</strong></>
                  ) : soc80Diff > 0 ? (
                    <>Annual: <strong>{socTotal80} / 80M (+{soc80Diff})</strong></>
                  ) : (
                    <>Annual: <strong>{socTotal80} / 80M ({soc80Diff})</strong></>
                  )}
                </span>
                <span className={`status-pill ${isSoc40Valid ? 'valid' : soc40Diff > 0 ? 'overflow' : 'underflow'}`}>
                  {isSoc40Valid ? (
                    <>Periodic: <strong>40 / 40M</strong></>
                  ) : soc40Diff > 0 ? (
                    <>Periodic: <strong>{socTotal40} / 40M (+{soc40Diff})</strong></>
                  ) : (
                    <>Periodic: <strong>{socTotal40} / 40M ({soc40Diff})</strong></>
                  )}
                </span>
              </div>
            </div>

            <div className="scheme-table-wrap">
              <table className="scheme-table">
                <thead>
                  <tr>
                    <th>Sub-Subject</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>80 Marks Exam (Half-Yearly / Annual)</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>40 Marks Exam (Periodic Test)</th>
                  </tr>
                </thead>
                <tbody>
                  {safeSocial.map((part, idx) => (
                    <tr key={part.id}>
                      <td>
                        <strong>{part.name}</strong>
                        <span className="sub-tag">{part.label}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            step="0.5"
                            value={part.max80}
                            onChange={(e) => handleSocialScienceChange(idx, 'max80', e.target.value)}
                          />
                          <span className="unit">Marks</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            step="0.5"
                            value={part.max40}
                            onChange={(e) => handleSocialScienceChange(idx, 'max40', e.target.value)}
                          />
                          <span className="unit">Marks</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="weightage-modal-footer">
          <button
            type="button"
            className="footer-btn reset-btn"
            onClick={handleReset}
            title="Reset to 80M & 40M board defaults"
          >
            <RotateCcw size={15} />
            <span>Reset to Board Defaults</span>
          </button>
          <div className="footer-right-actions">
            <button
              type="button"
              className="footer-btn cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`footer-btn save-btn ${!isAllValid ? 'disabled' : ''}`}
              onClick={handleSave}
              disabled={!isAllValid}
              title={
                isAllValid
                  ? 'Save Weightage Scheme'
                  : 'Cannot save: Both Science and Social Science must equal exactly 80 (Annual) and 40 (PT)'
              }
            >
              {isAllValid ? <Check size={16} /> : <Lock size={15} />}
              <span>{isAllValid ? 'Save Weightage Scheme' : 'Adjust Marks to Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SubjectWeightageModal;
