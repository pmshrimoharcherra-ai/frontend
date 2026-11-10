import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  Award,
  Sparkles,
  ShieldCheck,
  Check,
  Search,
  X
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../../GenderIcons/GenderIcons';
import { API_BASE_URL } from '../../../config/api';
import './ClassTeacherCoScholastic.css';

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

const RESULT_OPTIONS = [
  'Promoted',
  'Eligible for Compartment',
  'Detained'
];

const REMARK_PRESETS = [
  'v. good',
  'Very Good',
  'Excellent',
  'Good',
  'Satisfactory',
  'Needs Improvement'
];

const ClassTeacherCoScholastic = ({
  sectionType = 'section_b', // 'section_b' | 'section_c'
  examClassId,
  students = [],
  activeUser,
  teacherName,
  onOpenReportModal
}) => {
  const isSectionB = sectionType === 'section_b';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local state map for students: { [studentId]: { workEducation, artEducation, healthPhysicalEducation, discipline, remarks, result } }
  const [recordsMap, setRecordsMap] = useState({});

  // Fetch saved metadata from backend
  useEffect(() => {
    if (!examClassId) return;

    const fetchMeta = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/examinations/co-scholastic?classId=${examClassId}`);
        const data = await res.json();

        const initial = {};
        // Initialize defaults for all students
        students.forEach((st) => {
          const key = st.studentId || st.id;
          initial[key] = {
            studentId: key,
            workEducation: 'B',
            artEducation: 'B',
            healthPhysicalEducation: 'C',
            discipline: 'B',
            remarks: 'v. good',
            result: 'Promoted'
          };
        });

        // Overlay saved records from backend
        if (data.success && Array.isArray(data.records)) {
          data.records.forEach((rec) => {
            if (initial[rec.studentId]) {
              initial[rec.studentId] = {
                ...initial[rec.studentId],
                workEducation: rec.workEducation || 'B',
                artEducation: rec.artEducation || 'B',
                healthPhysicalEducation: rec.healthPhysicalEducation || 'C',
                discipline: rec.discipline || 'B',
                remarks: rec.remarks || 'v. good',
                result: rec.result || 'Promoted'
              };
            }
          });
        }

        setRecordsMap(initial);
      } catch (err) {
        console.warn('Error fetching co-scholastic metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [examClassId, students]);

  // Update a single field for a student
  const handleFieldChange = (studentId, field, value) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
    setSaveSuccess(false);
  };

  // Bulk set a field for all students
  const handleBulkSet = (field, value) => {
    setRecordsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          [field]: value
        };
      });
      return next;
    });
    setSaveSuccess(false);
  };

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter((st) => {
      const name = (st.name || '').toLowerCase();
      const roll = String(st.roll || '').toLowerCase();
      const pen = String(st.penNumber || '').toLowerCase();
      const apaar = String(st.apaarId || '').toLowerCase();
      return name.includes(q) || roll === q || roll.includes(q) || pen.includes(q) || apaar.includes(q);
    });
  }, [students, searchQuery]);

  // Save to backend
  const handleSave = async () => {
    try {
      setSaving(true);
      const items = Object.values(recordsMap);

      const payload = {
        classId: examClassId,
        sectionType,
        items,
        teacherName: teacherName || activeUser?.name || 'Class Teacher',
        academicYear: '2025-2026'
      };

      const res = await fetch(`${API_BASE_URL}/api/examinations/co-scholastic/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4500);
      }
    } catch (err) {
      console.error('Failed to save co-scholastic:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coscholastic-section-card">
      {/* Top Banner & Context Description */}
      <div className="coscholastic-header-bar">
        <div className="coscholastic-info">
          <div className="coscholastic-badge-icon">
            {isSectionB ? <Sparkles size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h4 className="coscholastic-title">
              {isSectionB
                ? 'Section B: Co-Scholastic Areas (On 5-Points Grading Scale A to E)'
                : 'Section C: Discipline, Teacher Remarks & Results'}
            </h4>
            <p className="coscholastic-subtitle">
              {isSectionB
                ? 'Manage Work Education, Art Education, and Health & Physical Education grades for each student.'
                : 'Grade student attendance, behaviour, sincerity, punctuality, values, remarks, and promotion status.'}
            </p>
          </div>
        </div>

        <div className="coscholastic-actions">
          {onOpenReportModal && (
            <button
              type="button"
              className="generate-report-btn"
              onClick={onOpenReportModal}
              title="Preview & Generate Annual Performance Report Cards"
            >
              <Award size={16} />
              <span>Generate Report Cards</span>
            </button>
          )}

          <button
            type="button"
            className="save-coscholastic-btn"
            onClick={handleSave}
            disabled={saving || students.length === 0}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>Grades Saved!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Grades</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="coscholastic-success-banner">
          <CheckCircle2 size={16} />
          <span>
            {isSectionB
              ? 'Section B Co-Scholastic grades recorded and locked successfully!'
              : 'Section C Discipline and Remarks updated successfully!'}
          </span>
        </div>
      )}

      {/* Quick Bulk Presets & Search Filter */}
      <div className="coscholastic-toolbar">
        <div className="coscholastic-presets">
          <span className="preset-label">Quick Presets:</span>
          {isSectionB ? (
            <>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handleBulkSet('workEducation', 'B')}
              >
                Set All Work Ed to <strong>B</strong>
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handleBulkSet('artEducation', 'B')}
              >
                Set All Art Ed to <strong>B</strong>
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handleBulkSet('healthPhysicalEducation', 'C')}
              >
                Set All Health & PE to <strong>C</strong>
              </button>
              <button
                type="button"
                className="preset-chip highlight"
                onClick={() => {
                  handleBulkSet('workEducation', 'B');
                  handleBulkSet('artEducation', 'B');
                  handleBulkSet('healthPhysicalEducation', 'C');
                }}
              >
                Apply Sample Card Defaults (B, B, C)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handleBulkSet('discipline', 'B')}
              >
                Set All Discipline to <strong>B</strong>
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handleBulkSet('remarks', 'v. good')}
              >
                Set All Remarks to <strong>"v. good"</strong>
              </button>
              <button
                type="button"
                className="preset-chip highlight"
                onClick={() => handleBulkSet('result', 'Promoted')}
              >
                Set All Result to <strong>"Promoted"</strong>
              </button>
            </>
          )}
        </div>

        <div className="coscholastic-search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Filter student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="coscholastic-table-container">
        {loading ? (
          <div className="coscholastic-loading">
            <RefreshCw size={24} className="spin-icon" />
            <span>Loading students...</span>
          </div>
        ) : (
          <table className="coscholastic-table">
            <thead>
              {isSectionB ? (
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name</th>
                  <th style={{ width: '170px', textAlign: 'center' }}>
                    Work Education
                    <span className="th-sub">5-Point (A to E)</span>
                  </th>
                  <th style={{ width: '170px', textAlign: 'center' }}>
                    Art Education
                    <span className="th-sub">5-Point (A to E)</span>
                  </th>
                  <th style={{ width: '200px', textAlign: 'center' }}>
                    Health & Physical Ed.
                    <span className="th-sub">5-Point (A to E)</span>
                  </th>
                </tr>
              ) : (
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>
                    Discipline Grade
                    <span className="th-sub">Attendance, Values (A-E)</span>
                  </th>
                  <th style={{ width: '240px' }}>
                    Class Teacher Remarks
                    <span className="th-sub">e.g. v. good, Good</span>
                  </th>
                  <th style={{ width: '180px', textAlign: 'center' }}>
                    Result Status
                    <span className="th-sub">Annual Promotion</span>
                  </th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isSectionB ? 5 : 5} className="empty-row">
                    No students found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const key = st.studentId || st.id;
                  const item = recordsMap[key] || {};
                  const isBoy = st.gender === 'Boy' || !st.gender;
                  const penNumber = st.penNumber || st.pen || st.enrollmentNo || '';

                  return (
                    <tr key={key} className="coscholastic-row">
                      <td style={{ textAlign: 'center' }}>
                        <span className="roll-pill">#{st.roll || '00'}</span>
                      </td>

                      <td>
                        <div className="student-profile-cell">
                          <div className={`avatar ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                            {isBoy ? <BoyIcon size={14} /> : <GirlIcon size={14} />}
                          </div>
                          <div>
                            <div className="student-name">{st.name}</div>
                            <div className="student-sub">{penNumber ? `PEN: ${penNumber}` : 'PEN: Pending'}</div>
                          </div>
                        </div>
                      </td>

                      {isSectionB ? (
                        <>
                          {/* Work Education */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={item.workEducation || 'B'}
                              onChange={(e) => handleFieldChange(key, 'workEducation', e.target.value)}
                              className={`grade-select grade-${item.workEducation || 'B'}`}
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Art Education */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={item.artEducation || 'B'}
                              onChange={(e) => handleFieldChange(key, 'artEducation', e.target.value)}
                              className={`grade-select grade-${item.artEducation || 'B'}`}
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Health & Physical Education */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={item.healthPhysicalEducation || 'C'}
                              onChange={(e) =>
                                handleFieldChange(key, 'healthPhysicalEducation', e.target.value)
                              }
                              className={`grade-select grade-${item.healthPhysicalEducation || 'C'}`}
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Discipline */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={item.discipline || 'B'}
                              onChange={(e) => handleFieldChange(key, 'discipline', e.target.value)}
                              className={`grade-select grade-${item.discipline || 'B'}`}
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Remarks */}
                          <td>
                            <div className="remarks-cell-wrap">
                              <input
                                type="text"
                                value={item.remarks || ''}
                                onChange={(e) => handleFieldChange(key, 'remarks', e.target.value)}
                                placeholder="Enter remarks..."
                                className="remarks-input"
                              />
                              <div className="remark-chips">
                                {REMARK_PRESETS.slice(0, 3).map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    className="remark-mini-chip"
                                    onClick={() => handleFieldChange(key, 'remarks', preset)}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Result */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={item.result || 'Promoted'}
                              onChange={(e) => handleFieldChange(key, 'result', e.target.value)}
                              className={`result-select result-${(item.result || 'Promoted').toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {RESULT_OPTIONS.map((resOpt) => (
                                <option key={resOpt} value={resOpt}>
                                  {resOpt}
                                </option>
                              ))}
                            </select>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer bar */}
      <div className="coscholastic-footer-bar">
        <span>
          Managing <strong>{filteredStudents.length}</strong> students for {isSectionB ? 'Section B' : 'Section C'}
        </span>
        <button
          type="button"
          className="save-coscholastic-btn"
          onClick={handleSave}
          disabled={saving || students.length === 0}
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Grades'}</span>
        </button>
      </div>
    </div>
  );
};

export default ClassTeacherCoScholastic;
