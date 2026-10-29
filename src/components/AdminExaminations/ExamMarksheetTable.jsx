import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import './ExamMarksheetTable.css';

/**
 * ExamMarksheetTable (Part 3)
 * Marksheet Table container, views (Consolidated, Science breakdown, Social Science breakdown, Single Subject), and table footer
 */
const ExamMarksheetTable = ({
  currentClass,
  selectedExamTerm,
  selectedSubject,
  filteredStudents,
  totalStudentsCount,
  genderFilter,
  onGenderFilterChange,
  loading,
  consolidatedSubjects,
  maxMarks,
  passThreshold,
  subjectMarksMap,
  studentTotals,
  isSecondary,
  scienceBreakdownMeta,
  socialBreakdownMeta,
  currentViewMaxMarks,
  currentViewPassThreshold,
  getTeacherForSubject,
  computeGrade
}) => {
  return (
    <div className="admin-marksheet-card">
      <div className="marksheet-card-header">
        <div className="card-header-left">
          <h4>
            {selectedSubject === 'all'
              ? `Consolidated Marksheet: ${currentClass.name} (${selectedExamTerm})`
              : `${selectedSubject} Marksheet: ${currentClass.name} (${selectedExamTerm})`}
          </h4>
          <p>
            Showing {filteredStudents.length} of {totalStudentsCount} students enrolled in {currentClass.name}
          </p>
        </div>

        <div className="card-header-right">
          <div className="gender-tabs">
            <button
              type="button"
              className={`g-tab ${genderFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => onGenderFilterChange('ALL')}
            >
              All
            </button>
            <button
              type="button"
              className={`g-tab ${genderFilter === 'Boy' ? 'active' : ''}`}
              onClick={() => onGenderFilterChange('Boy')}
            >
              Boys
            </button>
            <button
              type="button"
              className={`g-tab ${genderFilter === 'Girl' ? 'active' : ''}`}
              onClick={() => onGenderFilterChange('Girl')}
            >
              Girls
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="marksheet-table-container">
        {loading ? (
          <div className="table-loading-state">
            <RefreshCw size={28} className="spin-icon" />
            <p>Loading examination marksheets for {currentClass.name}...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="table-empty-state">
            <Users size={36} />
            <p>No student examination records found matching your filters.</p>
          </div>
        ) : selectedSubject === 'all' ? (
          /* =========================================================================
             VIEW 1: CONSOLIDATED ALL-SUBJECTS CLASS MARKSHEET
             ========================================================================= */
          <table className="admin-roster-table consolidated-table">
            <thead>
              <tr>
                <th style={{ width: '65px', textAlign: 'center' }}>Roll</th>
                <th>Student Name</th>
                <th style={{ width: '150px' }}>APAAR ID</th>
                {consolidatedSubjects.map((subj, idx) => (
                  <th key={idx} style={{ textAlign: 'center', minWidth: '95px' }}>
                    <div className="header-subj-wrap">
                      <span>{subj}</span>
                      <small className="subj-max-sub">
                        ({subj === 'Science' && isSecondary
                          ? scienceBreakdownMeta?.total || maxMarks
                          : subj === 'Social Science' && isSecondary
                          ? socialBreakdownMeta?.total || maxMarks
                          : maxMarks})
                      </small>
                    </div>
                  </th>
                ))}
                <th style={{ width: '110px', textAlign: 'center' }}>
                  Total ({consolidatedSubjects.length * maxMarks})
                </th>
                <th style={{ width: '80px', textAlign: 'center' }}>%</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const key = st.studentId || st.id;
                const isBoy = st.gender === 'Boy' || !st.gender;
                const tot = studentTotals[key] || {
                  totalObtained: 0,
                  percentage: '0.0',
                  grade: 'D',
                  gradeColor: 'badge-grade-d',
                  isPassed: true
                };
                const penNumber =
                  st.penNumber ||
                  st.pen ||
                  (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                    ? st.enrollmentNo
                    : '');
                const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                return (
                  <tr key={key} className="marksheet-row">
                    <td style={{ textAlign: 'center' }}>
                      <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                    </td>

                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                          {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                        </div>
                        <div className="student-meta-wrap">
                          <span className="student-name-bold">{st.name}</span>
                          <span
                            className="student-reg-mini font-mono"
                            title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                          >
                            {penNumber
                              ? penNumber.startsWith('PEN')
                                ? penNumber
                                : `PEN: ${penNumber}`
                              : st.studentId || 'PEN: Pending'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                        title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                      >
                        {displayedApaarId}
                      </span>
                    </td>

                    {/* Subject Marks Columns */}
                    {consolidatedSubjects.map((subj, sIdx) => {
                      const mark = subjectMarksMap[subj]?.[key];
                      const markNum = Number(mark) || 0;
                      const isHigh = markNum >= Math.round(maxMarks * 0.8);
                      const isLow = markNum < passThreshold;

                      if (subj === 'Science' && isSecondary) {
                        const lsMark = subjectMarksMap['Science (Life Science)']?.[key] ?? '—';
                        const phyMark = subjectMarksMap['Science (Physics)']?.[key] ?? '—';
                        const chemMark = subjectMarksMap['Science (Chemistry)']?.[key] ?? '—';
                        const sciTotMax = scienceBreakdownMeta?.total || maxMarks;

                        return (
                          <td key={sIdx} style={{ textAlign: 'center' }}>
                            <div className="science-combined-cell">
                              <span
                                className={`subject-score-cell font-mono font-bold ${
                                  isHigh ? 'score-high' : isLow ? 'score-low' : ''
                                }`}
                                title={`Total Science Score: ${mark} / ${sciTotMax}`}
                              >
                                {mark !== undefined ? mark : '—'}
                              </span>
                              <div
                                className="science-parts-mini"
                                title={`Life Sci: ${lsMark}/${scienceBreakdownMeta?.life.max} | Physics: ${phyMark}/${scienceBreakdownMeta?.physics.max} | Chem: ${chemMark}/${scienceBreakdownMeta?.chem.max}`}
                              >
                                <span className="part-mini ls">L:{lsMark}</span>
                                <span className="part-mini phy">P:{phyMark}</span>
                                <span className="part-mini chem">C:{chemMark}</span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      if (subj === 'Social Science' && isSecondary) {
                        const histMark = subjectMarksMap['Social Science (History)']?.[key] ?? '—';
                        const geoMark = subjectMarksMap['Social Science (Geography)']?.[key] ?? '—';
                        const ecoMark = subjectMarksMap['Social Science (Economics)']?.[key] ?? '—';
                        const socTotMax = socialBreakdownMeta?.total || maxMarks;

                        return (
                          <td key={sIdx} style={{ textAlign: 'center' }}>
                            <div className="science-combined-cell">
                              <span
                                className={`subject-score-cell font-mono font-bold ${
                                  isHigh ? 'score-high' : isLow ? 'score-low' : ''
                                }`}
                                title={`Total Social Science Score: ${mark} / ${socTotMax}`}
                              >
                                {mark !== undefined ? mark : '—'}
                              </span>
                              <div
                                className="science-parts-mini"
                                title={`History: ${histMark}/${socialBreakdownMeta?.history.max} | Geography: ${geoMark}/${socialBreakdownMeta?.geography.max} | Economics: ${ecoMark}/${socialBreakdownMeta?.economics.max}`}
                              >
                                <span className="part-mini ls">H:{histMark}</span>
                                <span className="part-mini phy">G:{geoMark}</span>
                                <span className="part-mini chem">E:{ecoMark}</span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={sIdx} style={{ textAlign: 'center' }}>
                          <span
                            className={`subject-score-cell font-mono ${
                              isHigh ? 'score-high' : isLow ? 'score-low' : ''
                            }`}
                          >
                            {mark !== undefined ? mark : '—'}
                          </span>
                        </td>
                      );
                    })}

                    {/* Consolidated Totals */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="grand-total-pill font-mono font-bold">
                        {tot.totalObtained}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="pct-pill font-mono">{tot.percentage}%</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-grade-badge ${tot.gradeColor}`}>{tot.grade}</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-status-pill ${tot.isPassed ? 'status-pass' : 'status-fail'}`}>
                        {tot.isPassed ? 'Pass' : 'Re-test'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : selectedSubject === 'Science' && isSecondary ? (
          /* =========================================================================
             VIEW 2: DEDICATED SCIENCE BREAKDOWN TABLE (Life Science + Physics + Chem)
             ========================================================================= */
          <table className="admin-roster-table single-subj-table science-breakdown-table">
            <thead>
              <tr>
                <th style={{ width: '65px', textAlign: 'center' }}>Roll</th>
                <th>Student Name</th>
                <th style={{ width: '150px' }}>APAAR ID</th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>🌱 Life Science</span>
                    <small className="subj-max-sub">
                      ({scienceBreakdownMeta?.life.max} Marks · {scienceBreakdownMeta?.life.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>⚡ Physics</span>
                    <small className="subj-max-sub">
                      ({scienceBreakdownMeta?.physics.max} Marks · {scienceBreakdownMeta?.physics.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>🧪 Chemistry</span>
                    <small className="subj-max-sub">
                      ({scienceBreakdownMeta?.chem.max} Marks · {scienceBreakdownMeta?.chem.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ width: '130px', textAlign: 'center' }}>
                  <div className="header-subj-wrap">
                    <span>Science</span>
                    <small className="subj-max-sub">({scienceBreakdownMeta?.total || maxMarks} Marks)</small>
                  </div>
                </th>
                <th style={{ width: '80px', textAlign: 'center' }}>%</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const key = st.studentId || st.id;
                const isBoy = st.gender === 'Boy' || !st.gender;
                const ls = subjectMarksMap['Science (Life Science)']?.[key] ?? 0;
                const phy = subjectMarksMap['Science (Physics)']?.[key] ?? 0;
                const chem = subjectMarksMap['Science (Chemistry)']?.[key] ?? 0;
                const totalMax = scienceBreakdownMeta?.total || maxMarks;
                const comb = subjectMarksMap['Science']?.[key] ?? (Number(ls) + Number(phy) + Number(chem));
                const pct = Math.round((Number(comb) / totalMax) * 100);
                const gradeObj = computeGrade(comb, totalMax);
                const isPassed = Number(comb) >= Math.round(totalMax * 0.33);
                const penNumber =
                  st.penNumber ||
                  st.pen ||
                  (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                    ? st.enrollmentNo
                    : '');
                const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                return (
                  <tr key={key} className="marksheet-row">
                    <td style={{ textAlign: 'center' }}>
                      <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                    </td>

                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                          {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                        </div>
                        <div className="student-meta-wrap">
                          <span className="student-name-bold">{st.name}</span>
                          <span
                            className="student-reg-mini font-mono"
                            title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                          >
                            {penNumber
                              ? penNumber.startsWith('PEN')
                                ? penNumber
                                : `PEN: ${penNumber}`
                              : st.studentId || 'PEN: Pending'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                        title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                      >
                        {displayedApaarId}
                      </span>
                    </td>

                    {/* Life Science */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill ls font-mono">
                        {ls} <small>/{scienceBreakdownMeta?.life.max}</small>
                      </span>
                    </td>

                    {/* Physics */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill phy font-mono">
                        {phy} <small>/{scienceBreakdownMeta?.physics.max}</small>
                      </span>
                    </td>

                    {/* Chemistry */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill chem font-mono">
                        {chem} <small>/{scienceBreakdownMeta?.chem.max}</small>
                      </span>
                    </td>

                    {/* Combined Science Total */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="grand-total-pill font-mono font-bold score-science-comb">
                        {comb} / {totalMax}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="pct-pill font-mono">{pct}%</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-grade-badge ${gradeObj.color}`}>
                        {gradeObj.grade}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-status-pill ${isPassed ? 'status-pass' : 'status-fail'}`}>
                        {isPassed ? 'Pass' : 'Re-test'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : selectedSubject === 'Social Science' && isSecondary ? (
          /* =========================================================================
             VIEW 2B: DEDICATED SOCIAL SCIENCE BREAKDOWN TABLE (History + Geography + Economics)
             ========================================================================= */
          <table className="admin-roster-table single-subj-table science-breakdown-table">
            <thead>
              <tr>
                <th style={{ width: '65px', textAlign: 'center' }}>Roll</th>
                <th>Student Name</th>
                <th style={{ width: '150px' }}>APAAR ID</th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>📜 History</span>
                    <small className="subj-max-sub">
                      ({socialBreakdownMeta?.history.max} Marks · {socialBreakdownMeta?.history.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>🌍 Geography</span>
                    <small className="subj-max-sub">
                      ({socialBreakdownMeta?.geography.max} Marks · {socialBreakdownMeta?.geography.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>
                  <div className="header-subj-wrap">
                    <span>📊 Economics</span>
                    <small className="subj-max-sub">
                      ({socialBreakdownMeta?.economics.max} Marks · {socialBreakdownMeta?.economics.teacher})
                    </small>
                  </div>
                </th>
                <th style={{ width: '130px', textAlign: 'center' }}>
                  <div className="header-subj-wrap">
                    <span>Social Science</span>
                    <small className="subj-max-sub">({socialBreakdownMeta?.total || maxMarks} Marks)</small>
                  </div>
                </th>
                <th style={{ width: '80px', textAlign: 'center' }}>%</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const key = st.studentId || st.id;
                const isBoy = st.gender === 'Boy' || !st.gender;
                const hist = subjectMarksMap['Social Science (History)']?.[key] ?? 0;
                const geo = subjectMarksMap['Social Science (Geography)']?.[key] ?? 0;
                const eco = subjectMarksMap['Social Science (Economics)']?.[key] ?? 0;
                const totalMax = socialBreakdownMeta?.total || maxMarks;
                const comb = subjectMarksMap['Social Science']?.[key] ?? (Number(hist) + Number(geo) + Number(eco));
                const pct = Math.round((Number(comb) / totalMax) * 100);
                const gradeObj = computeGrade(comb, totalMax);
                const isPassed = Number(comb) >= Math.round(totalMax * 0.33);
                const penNumber =
                  st.penNumber ||
                  st.pen ||
                  (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                    ? st.enrollmentNo
                    : '');
                const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                return (
                  <tr key={key} className="marksheet-row">
                    <td style={{ textAlign: 'center' }}>
                      <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                    </td>

                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                          {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                        </div>
                        <div className="student-meta-wrap">
                          <span className="student-name-bold">{st.name}</span>
                          <span
                            className="student-reg-mini font-mono"
                            title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                          >
                            {penNumber
                              ? penNumber.startsWith('PEN')
                                ? penNumber
                                : `PEN: ${penNumber}`
                              : st.studentId || 'PEN: Pending'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                        title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                      >
                        {displayedApaarId}
                      </span>
                    </td>

                    {/* History */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill ls font-mono">
                        {hist} <small>/{socialBreakdownMeta?.history.max}</small>
                      </span>
                    </td>

                    {/* Geography */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill phy font-mono">
                        {geo} <small>/{socialBreakdownMeta?.geography.max}</small>
                      </span>
                    </td>

                    {/* Economics */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="part-score-pill chem font-mono">
                        {eco} <small>/{socialBreakdownMeta?.economics.max}</small>
                      </span>
                    </td>

                    {/* Social Science Total */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="grand-total-pill font-mono font-bold score-science-comb">
                        {comb} / {totalMax}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="pct-pill font-mono">{pct}%</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-grade-badge ${gradeObj.color}`}>
                        {gradeObj.grade}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-status-pill ${isPassed ? 'status-pass' : 'status-fail'}`}>
                        {isPassed ? 'Pass' : 'Re-test'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* =========================================================================
             VIEW 3: SINGLE SUBJECT MARKSHEET (Detailed)
             ========================================================================= */
          <table className="admin-roster-table single-subj-table">
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                <th>Student Name</th>
                <th style={{ width: '150px' }}>APAAR ID</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Marks ({currentViewMaxMarks})</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Total ({currentViewMaxMarks})</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Percentage</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Grade</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const key = st.studentId || st.id;
                const isBoy = st.gender === 'Boy' || !st.gender;
                const mark = subjectMarksMap[selectedSubject]?.[key];
                const markNum = Number(mark) || 0;
                const pct = Math.round((markNum / currentViewMaxMarks) * 100);
                const gradeObj = computeGrade(markNum, currentViewMaxMarks);
                const isPassed = markNum >= currentViewPassThreshold;
                const penNumber =
                  st.penNumber ||
                  st.pen ||
                  (st.enrollmentNo && st.enrollmentNo !== '-' && st.enrollmentNo !== '—' && !st.enrollmentNo.includes('Not found')
                    ? st.enrollmentNo
                    : '');
                const apaarId = st.apaarId && st.apaarId !== 'Not Available' ? st.apaarId : (st.apaar || '');
                const displayedApaarId = apaarId || (st.apaarId === 'Not Available' ? 'Not Available' : 'Pending');

                return (
                  <tr key={key} className="marksheet-row">
                    <td style={{ textAlign: 'center' }}>
                      <span className="roll-pill font-mono">#{st.roll || '00'}</span>
                    </td>

                    <td>
                      <div className="student-profile-cell">
                        <div className={`student-avatar-wrap ${isBoy ? 'avatar-boy' : 'avatar-girl'}`}>
                          {isBoy ? <BoyIcon size={15} /> : <GirlIcon size={15} />}
                        </div>
                        <div className="student-meta-wrap">
                          <span className="student-name-bold">{st.name}</span>
                          <span
                            className="student-reg-mini font-mono"
                            title={penNumber ? `Permanent Education No. (PEN): ${penNumber}` : 'PEN Number'}
                          >
                            {penNumber
                              ? penNumber.startsWith('PEN')
                                ? penNumber
                                : `PEN: ${penNumber}`
                              : st.studentId || 'PEN: Pending'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`identifier-badge font-mono ${!apaarId ? 'badge-pending' : ''}`}
                        title={`APAAR ID: ${apaarId || 'Not Generated'}`}
                      >
                        {displayedApaarId}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="score-input-view font-mono font-bold">
                        {mark !== undefined ? mark : '—'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="score-total-pill font-mono">
                        {mark !== undefined ? mark : '—'} / {currentViewMaxMarks}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="pct-pill font-mono">{pct}%</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-grade-badge ${gradeObj.color}`}>
                        {gradeObj.grade}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`exam-status-pill ${isPassed ? 'status-pass' : 'status-fail'}`}>
                        {isPassed ? 'Pass' : 'Re-test'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Marksheet Footer Info */}
      <div className="marksheet-card-footer">
        <div className="footer-left-info">
          <span>
            Academic Evaluation: <strong>{currentClass.name}</strong> ·{' '}
            <strong>{selectedExamTerm}</strong> ·{' '}
            {selectedSubject === 'all'
              ? `Consolidated ${consolidatedSubjects.length} Board Subjects (Science unified from LS + Phy + Chem)`
              : selectedSubject === 'Science'
              ? `Unified Science Paper: 80/40 Total (Life Science 30/15 + Physics 25/12.5 + Chemistry 25/12.5)`
              : selectedSubject === 'Social Science'
              ? `Unified Social Science: 80/40 Total (History + Geography + Economics)`
              : `${selectedSubject} (${getTeacherForSubject(selectedSubject)}) — Max Marks: ${currentViewMaxMarks}`}
          </span>
        </div>

        <div className="footer-right-counts">
          <span>
            Total Roster: <strong>{totalStudentsCount}</strong> Students Evaluated
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExamMarksheetTable;
