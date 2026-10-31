import React from 'react';
import {
  Search,
  Users,
  BookOpen,
  TrendingUp,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Clock
} from 'lucide-react';
import './ExamControlsTracker.css';

/**
 * ExamControlsTracker (Part 2)
 * Filter Toolbar, Summary KPI Metrics, and Faculty Subject Submissions Tracker
 */
const ExamControlsTracker = ({
  selectedClassId,
  onSelectClassId,
  selectedExamTerm,
  onSelectExamTerm,
  selectedSubject,
  onSelectSubject,
  searchQuery,
  onSearchChange,
  currentClass,
  classesList,
  examTermsList,
  curriculumSubjects,
  consolidatedSubjects,
  isSecondary,
  maxMarks,
  currentViewMaxMarks,
  classMetrics,
  savedRecords,
  getTeacherForSubject,
  getSubjectMaxMarks,
  scienceBreakdownMeta,
  socialBreakdownMeta,
  isSecondarySciencePart,
  isSecondarySocialSciencePart
}) => {
  return (
    <>
      {/* ── Filter & Configuration Toolbar ── */}
      <div className="admin-exam-toolbar">
        {/* Class Selection Dropdown */}
        <div className="toolbar-field-group">
          <label>Academic Class</label>
          <select
            className="exam-select-box class-select"
            value={selectedClassId}
            onChange={(e) => onSelectClassId(e.target.value)}
          >
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.wing ? `(${c.wing})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Evaluation Exam Dropdown */}
        <div className="toolbar-field-group">
          <label>Evaluation Exam</label>
          <select
            className="exam-select-box exam-term-select"
            value={selectedExamTerm}
            onChange={(e) => onSelectExamTerm(e.target.value)}
          >
            {examTermsList.map((term, idx) => (
              <option key={idx} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter Dropdown */}
        <div className="toolbar-field-group">
          <label>Subject View</label>
          <select
            className="exam-select-box subject-select"
            value={selectedSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>

            {isSecondary && (
              <>
                <option value="Science">Science</option>
                <option value="Science (Life Science)">Life Science</option>
                <option value="Science (Physics)">Physics</option>
                <option value="Science (Chemistry)">Chemistry</option>
                <option value="Social Science">Social Science</option>
                <option value="Social Science (History)">History</option>
                <option value="Social Science (Geography)">Geography</option>
                <option value="Social Science (Economics)">Economics</option>
              </>
            )}

            {curriculumSubjects
              .filter(
                (s) =>
                  !isSecondarySciencePart(selectedClassId, s) &&
                  !isSecondarySocialSciencePart(selectedClassId, s)
              )
              .map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>

        {/* Search Student */}
        <div className="toolbar-field-group search-group">
          <label>Search Student</label>
          <div className="exam-search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, roll, reg no..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Max Marks Pill */}
        <div className="exam-scheme-pill">
          <span>
            SCHEME:{' '}
            <strong>
              {selectedSubject === 'all' || selectedSubject === 'Science'
                ? `${maxMarks} MARKS / SUBJECT`
                : `${currentViewMaxMarks} MARKS (${selectedSubject})`}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="exam-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon students">
            <Users size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Roster</span>
            <h4>{classMetrics.totalStudents} Students</h4>
            <span className="kpi-sub">{currentClass.name}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon subjects">
            <BookOpen size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Subjects Evaluated</span>
            <h4>{consolidatedSubjects.length} Board Subjects</h4>
            <span className="kpi-sub">
              {savedRecords.length} Submitted Live by Faculty
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon average">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Average</span>
            <h4>{classMetrics.avgPct}%</h4>
            <span className="kpi-sub">Overall Class Performance</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pass">
            <UserCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pass Percentage</span>
            <h4>{classMetrics.passRate}%</h4>
            <span className="kpi-sub">Minimum Pass Criteria: 33%</span>
          </div>
        </div>

        <div className="kpi-card topper-card">
          <div className="kpi-icon topper">
            <Sparkles size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Highest</span>
            <h4 className="topper-text">{classMetrics.topper}</h4>
            <span className="kpi-sub">Top Rank Scorer</span>
          </div>
        </div>
      </div>

      {/* ── Faculty Subject Submissions Grid ── */}
      <div className="faculty-tracker-panel">
        <div className="tracker-panel-header">
          <div className="tracker-title">
            <FileSpreadsheet size={18} className="tracker-icon" />
            <h4>Faculty Subject Submissions Tracker — {currentClass.name}</h4>
          </div>
          <span className="tracker-term-badge">{selectedExamTerm}</span>
        </div>

        <div className="faculty-cards-row">
          {/* If Class IX or X, show the Science card */}
          {isSecondary && (
            <div
              className={`faculty-sub-card science-combined ${
                selectedSubject === 'Science' ? 'selected' : ''
              }`}
              onClick={() => onSelectSubject(selectedSubject === 'Science' ? 'all' : 'Science')}
              title="Click to view science marksheet"
            >
              <div className="sub-card-top">
                <span className="sub-name">🔬 Science</span>
                <span className="submission-badge ready">
                  <CheckCircle2 size={12} />
                  <span>Ready</span>
                </span>
              </div>
              <div className="sub-card-teacher">
                <span className="teacher-lbl">Teachers:</span>
                <span className="teacher-val science-teacher-subtext">
                  {selectedClassId === 'class-10' ? 'Jolly, Joydeb, Debamoy' : 'Jolly, K.K. Debnath, Dipankar'}
                </span>
              </div>
              <div className="sub-card-footer">
                <span>Max Marks: {scienceBreakdownMeta?.total || maxMarks}</span>
                <span className="view-detail-link">
                  {selectedSubject === 'Science' ? 'Viewing Subject' : 'View Marks →'}
                </span>
              </div>
            </div>
          )}

          {/* If Class IX or X, show the Social Science card */}
          {isSecondary && (
            <div
              className={`faculty-sub-card science-combined ${
                selectedSubject === 'Social Science' ? 'selected' : ''
              }`}
              onClick={() => onSelectSubject(selectedSubject === 'Social Science' ? 'all' : 'Social Science')}
              title="Click to view social science marksheet"
            >
              <div className="sub-card-top">
                <span className="sub-name">📚 Social Science</span>
                <span className="submission-badge ready">
                  <CheckCircle2 size={12} />
                  <span>Ready</span>
                </span>
              </div>
              <div className="sub-card-teacher">
                <span className="teacher-lbl">Teachers:</span>
                <span className="teacher-val science-teacher-subtext">
                  Subarna, Minakshi, Mitan
                </span>
              </div>
              <div className="sub-card-footer">
                <span>Max Marks: {socialBreakdownMeta?.total || maxMarks}</span>
                <span className="view-detail-link">
                  {selectedSubject === 'Social Science' ? 'Viewing Subject' : 'View Marks →'}
                </span>
              </div>
            </div>
          )}

          {curriculumSubjects
            .filter(
              (subj) =>
                !isSecondarySciencePart(selectedClassId, subj) &&
                !isSecondarySocialSciencePart(selectedClassId, subj)
            )
            .map((subj, idx) => {
              const isLiveSubmitted = savedRecords.some((r) => r.subject === subj);
              const teacherName = getTeacherForSubject(subj);
              const isSelected = selectedSubject === subj;
              const subjMax = getSubjectMaxMarks(selectedClassId, subj, selectedExamTerm);

              return (
                <div
                  key={idx}
                  className={`faculty-sub-card ${isSelected ? 'selected' : ''} ${
                    isLiveSubmitted ? 'submitted' : 'pending'
                  }`}
                  onClick={() => onSelectSubject(isSelected ? 'all' : subj)}
                  title="Click to filter table by this subject"
                >
                  <div className="sub-card-top">
                    <span className="sub-name">{subj}</span>
                    {isLiveSubmitted ? (
                      <span className="submission-badge live">
                        <CheckCircle2 size={12} />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <span className="submission-badge ready">
                        <Clock size={12} />
                        <span>Ready</span>
                      </span>
                    )}
                  </div>
                  <div className="sub-card-teacher">
                    <span className="teacher-lbl">Teacher:</span>
                    <span className="teacher-val">{teacherName}</span>
                  </div>
                  <div className="sub-card-footer">
                    <span>Max Marks: {subjMax}</span>
                    <span className="view-detail-link">
                      {isSelected ? 'Viewing Subject' : 'View Marks →'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default ExamControlsTracker;
