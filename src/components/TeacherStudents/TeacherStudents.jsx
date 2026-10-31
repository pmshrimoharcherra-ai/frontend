import React, { useState, useMemo } from 'react';
import './TeacherStudents.css';
import {
  Users,
  Search,
  Eye,
  Pencil,
  Phone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Filter,
  GraduationCap,
  Sparkles,
  UserCheck,
  ShieldAlert,
  ArrowUpDown,
  PieChart,
  Layers,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import EditStudentModal from '../EditStudentModal/EditStudentModal';
import StudentDetailsModal from '../StudentDetailsModal/StudentDetailsModal';
import { SCHOOL_CLASSES } from '../AdminStudents/AdminStudents';

const TeacherStudents = ({
  teacher,
  assignedClassId,
  assignedClassName,
  students = [],
  loading = false,
  error = null,
  onRefresh = () => {},
  onSaveStudent = async () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'boy' | 'girl'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Enrolled' | 'Transferred' | 'Leave' | 'Failed' | 'Alumni'
  const [casteFilter, setCasteFilter] = useState('all'); // 'all' | 'GEN' | 'OBC' | 'SC' | 'ST'
  const [streamFilter, setStreamFilter] = useState('all'); // 'all' | 'arts' | 'sci'
  const [viewMode, setViewMode] = useState('auto'); // 'auto' (cards on mobile, table on desktop) | 'cards' | 'table'

  // Determine if assigned class is Senior Secondary (Class XI or XII with Arts & Science)
  const isSeniorSecondary = useMemo(() => {
    const cid = String(assignedClassId || '').toLowerCase();
    const cname = String(assignedClassName || '').toLowerCase();
    return cid.includes('11') || cid.includes('12') || cname.includes('xi') || cname.includes('xii');
  }, [assignedClassId, assignedClassName]);

  const { artsCount, sciCount } = useMemo(() => {
    let arts = 0;
    let sci = 0;
    students.forEach((s) => {
      const cid = (s.classId || '').toLowerCase();
      const cname = (s.className || '').toLowerCase();
      if (cid.includes('arts') || cname.includes('arts')) arts++;
      else if (cid.includes('sci') || cname.includes('sci') || cname.includes('science')) sci++;
    });
    return { artsCount: arts, sciCount: sci };
  }, [students]);

  // Modals state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Current class definition
  const currentClass = useMemo(() => {
    return (
      SCHOOL_CLASSES.find((c) => c.id === assignedClassId) || {
        id: assignedClassId,
        name: assignedClassName || 'Class Roster',
        wing: 'Elementary / Secondary'
      }
    );
  }, [assignedClassId, assignedClassName]);

  // Gender, status & caste distribution statistics
  const stats = useMemo(() => {
    const total = students.length;
    let boys = 0;
    let girls = 0;
    let enrolled = 0;
    let failed = 0;

    const casteCounts = {
      GEN: 0,
      OBC: 0,
      SC: 0,
      ST: 0,
      Other: 0
    };

    students.forEach((s) => {
      const g = (s.gender || '').trim().toLowerCase();
      if (g === 'girl') girls++;
      else boys++;

      const st = (s.status || '').trim();
      if (st === 'Failed') failed++;
      else if (st === 'Enrolled' || !st) enrolled++;

      // Caste normalization
      const c = (s.caste || '').trim().toUpperCase();
      if (c === 'GEN' || c === 'GENERAL' || c === 'UR' || c === 'UNRESERVED') {
        casteCounts.GEN++;
      } else if (c.includes('OBC')) {
        casteCounts.OBC++;
      } else if (c === 'SC') {
        casteCounts.SC++;
      } else if (c === 'ST') {
        casteCounts.ST++;
      } else if (c) {
        casteCounts.Other++;
      } else {
        casteCounts.Other++;
      }
    });

    return { total, boys, girls, enrolled, failed, casteCounts };
  }, [students]);

  // Filtered students list (ordered by roll number)
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Stream filter for Senior Secondary
        if (isSeniorSecondary && streamFilter !== 'all') {
          const cid = (s.classId || '').toLowerCase();
          const cname = (s.className || '').toLowerCase();
          if (streamFilter === 'arts' && !cid.includes('arts') && !cname.includes('arts')) return false;
          if (streamFilter === 'sci' && !cid.includes('sci') && !cname.includes('sci') && !cname.includes('science')) return false;
        }

        // Gender filter
        if (genderFilter !== 'all') {
          const g = (s.gender || '').trim().toLowerCase();
          if (genderFilter === 'boy' && g === 'girl') return false;
          if (genderFilter === 'girl' && g !== 'girl') return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          const st = s.status || 'Enrolled';
          if (st.toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        // Caste filter
        if (casteFilter !== 'all') {
          const c = (s.caste || '').trim().toUpperCase();
          if (casteFilter === 'GEN') {
            if (c !== 'GEN' && c !== 'GENERAL' && c !== 'UR' && c !== 'UNRESERVED') return false;
          } else if (casteFilter === 'OBC') {
            if (!c.includes('OBC')) return false;
          } else if (casteFilter === 'SC') {
            if (c !== 'SC') return false;
          } else if (casteFilter === 'ST') {
            if (c !== 'ST') return false;
          } else if (casteFilter === 'Other') {
            if (['GEN', 'GENERAL', 'UR', 'UNRESERVED', 'SC', 'ST'].includes(c) || c.includes('OBC')) return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (s.name || '').toLowerCase().includes(q);
          const matchRoll = String(s.roll || '').includes(q);
          const matchFather = (s.father || s.guardian || '').toLowerCase().includes(q);
          const matchMother = (s.mother || '').toLowerCase().includes(q);
          const matchPen = (s.penNumber || '').toLowerCase().includes(q);
          const matchApaar = (s.apaarId || '').toLowerCase().includes(q);
          const matchId = (s.id || s.studentId || '').toLowerCase().includes(q);

          if (!matchName && !matchRoll && !matchFather && !matchMother && !matchPen && !matchApaar && !matchId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const rollA = parseInt(a.roll, 10) || 0;
        const rollB = parseInt(b.roll, 10) || 0;
        return rollA - rollB;
      });
  }, [students, isSeniorSecondary, streamFilter, genderFilter, statusFilter, casteFilter, searchQuery]);

  const handleSaveStudentDetails = async (updatedData) => {
    try {
      await onSaveStudent(updatedData);
      setEditingStudent(null);
      setSaveSuccessMsg(`Updated student record for "${updatedData.name}" successfully!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };

  const renderStatusBadge = (status) => {
    const s = status || 'Enrolled';
    let badgeClass = 'status-enrolled';
    if (s === 'Transferred') badgeClass = 'status-transferred';
    else if (s === 'Leave') badgeClass = 'status-leave';
    else if (s === 'Failed') badgeClass = 'status-failed';
    else if (s === 'Alumni') badgeClass = 'status-alumni';

    return <span className={`teacher-status-badge ${badgeClass}`}>{s}</span>;
  };

  return (
    <div className="teacher-students-container">
      {/* ── Top Header Banner ── */}
      <div className="teacher-students-header">
        <div className="header-titles">
          <div className="header-title-row">
            <div className="title-icon-wrap">
              <Users size={24} />
            </div>
            <div>
              <h2>Student's Database — {assignedClassName || currentClass.name}</h2>
              <p>
                Class Teacher Management Portal • {assignedClassName || currentClass.name} • Academic Year 2026–2027
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="refresh-roster-btn"
            onClick={onRefresh}
            title="Refresh student records from database"
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh Database</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccessMsg && (
        <div className="teacher-success-banner" role="alert">
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── Summary KPI Cards ── */}
      <div className="teacher-students-kpis">
        <div className="ts-kpi-card total">
          <div className="kpi-icon total">
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Strength</span>
            <h3>{stats.total}</h3>
            <span className="kpi-sub">{assignedClassName || currentClass.name} Students</span>
          </div>
        </div>

        <div className="ts-kpi-card boy">
          <div className="kpi-icon boy">
            <BoyIcon size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Boys Enrolled</span>
            <h3>{stats.boys}</h3>
            <span className="kpi-sub">
              {stats.total > 0 ? Math.round((stats.boys / stats.total) * 100) : 0}% of class
            </span>
          </div>
        </div>

        <div className="ts-kpi-card girl">
          <div className="kpi-icon girl">
            <GirlIcon size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Girls Enrolled</span>
            <h3>{stats.girls}</h3>
            <span className="kpi-sub">
              {stats.total > 0 ? Math.round((stats.girls / stats.total) * 100) : 0}% of class
            </span>
          </div>
        </div>

        {/* Caste Distribution KPI Card */}
        <div className="ts-kpi-card caste">
          <div className="kpi-icon caste">
            <PieChart size={22} />
          </div>
          <div className="kpi-info caste-info">
            <span className="kpi-label">Caste Distribution</span>
            <div className="caste-breakdown-row">
              <span
                className={`caste-chip gen ${casteFilter === 'GEN' ? 'active' : ''}`}
                onClick={() => setCasteFilter((prev) => (prev === 'GEN' ? 'all' : 'GEN'))}
                title="Click to filter Gen category students (click again to remove filter)"
              >
                <strong>{stats.casteCounts.GEN}</strong> Gen
              </span>
              <span
                className={`caste-chip obc ${casteFilter === 'OBC' ? 'active' : ''}`}
                onClick={() => setCasteFilter((prev) => (prev === 'OBC' ? 'all' : 'OBC'))}
                title="Click to filter OBC category students (click again to remove filter)"
              >
                <strong>{stats.casteCounts.OBC}</strong> OBC
              </span>
              <span
                className={`caste-chip sc ${casteFilter === 'SC' ? 'active' : ''}`}
                onClick={() => setCasteFilter((prev) => (prev === 'SC' ? 'all' : 'SC'))}
                title="Click to filter SC category students (click again to remove filter)"
              >
                <strong>{stats.casteCounts.SC}</strong> SC
              </span>
              <span
                className={`caste-chip st ${casteFilter === 'ST' ? 'active' : ''}`}
                onClick={() => setCasteFilter((prev) => (prev === 'ST' ? 'all' : 'ST'))}
                title="Click to filter ST category students (click again to remove filter)"
              >
                <strong>{stats.casteCounts.ST}</strong> ST
              </span>
              {stats.casteCounts.Other > 0 && (
                <span
                  className={`caste-chip other ${casteFilter === 'Other' ? 'active' : ''}`}
                  onClick={() => setCasteFilter((prev) => (prev === 'Other' ? 'all' : 'Other'))}
                  title="Click to filter other category students (click again to remove filter)"
                >
                  <strong>{stats.casteCounts.Other}</strong> Other
                </span>
              )}
            </div>
            {stats.total > 0 && (
              <div className="caste-ratio-bar">
                <div
                  className="caste-bar-seg gen"
                  style={{ width: `${(stats.casteCounts.GEN / stats.total) * 100}%` }}
                  title={`Gen: ${stats.casteCounts.GEN} (${Math.round((stats.casteCounts.GEN / stats.total) * 100)}%)`}
                />
                <div
                  className="caste-bar-seg obc"
                  style={{ width: `${(stats.casteCounts.OBC / stats.total) * 100}%` }}
                  title={`OBC: ${stats.casteCounts.OBC} (${Math.round((stats.casteCounts.OBC / stats.total) * 100)}%)`}
                />
                <div
                  className="caste-bar-seg sc"
                  style={{ width: `${(stats.casteCounts.SC / stats.total) * 100}%` }}
                  title={`SC: ${stats.casteCounts.SC} (${Math.round((stats.casteCounts.SC / stats.total) * 100)}%)`}
                />
                <div
                  className="caste-bar-seg st"
                  style={{ width: `${(stats.casteCounts.ST / stats.total) * 100}%` }}
                  title={`ST: ${stats.casteCounts.ST} (${Math.round((stats.casteCounts.ST / stats.total) * 100)}%)`}
                />
                {stats.casteCounts.Other > 0 && (
                  <div
                    className="caste-bar-seg other"
                    style={{ width: `${(stats.casteCounts.Other / stats.total) * 100}%` }}
                    title={`Other: ${stats.casteCounts.Other} (${Math.round((stats.casteCounts.Other / stats.total) * 100)}%)`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="ts-kpi-card incharge">
          <div className="kpi-icon incharge">
            <GraduationCap size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Class Teacher</span>
            <h3>{teacher?.name || 'Class In-Charge'}</h3>
            <span className="kpi-sub">{assignedClassName || 'Assigned Class'}</span>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="teacher-students-toolbar">
        <div className="ts-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${assignedClassName || currentClass.name} students by name, roll no, father, PEN or APAAR ID...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="ts-filters-group">
          {/* Stream Filter Pills for Class XI & XII */}
          {isSeniorSecondary && (artsCount > 0 || sciCount > 0) && (
            <div className="ts-gender-pills stream-pills">
              <button
                type="button"
                className={`ts-filter-pill ${streamFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStreamFilter('all')}
                title="Show both Arts & Science students"
              >
                All ({students.length})
              </button>
              {artsCount > 0 && (
                <button
                  type="button"
                  className={`ts-filter-pill ${streamFilter === 'arts' ? 'active' : ''}`}
                  onClick={() => setStreamFilter('arts')}
                  title="Show Class XI/XII Arts students only"
                >
                  <span>Arts ({artsCount})</span>
                </button>
              )}
              {sciCount > 0 && (
                <button
                  type="button"
                  className={`ts-filter-pill ${streamFilter === 'sci' ? 'active' : ''}`}
                  onClick={() => setStreamFilter('sci')}
                  title="Show Class XI/XII Science students only"
                >
                  <span>Science ({sciCount})</span>
                </button>
              )}
            </div>
          )}

          {/* Gender Filter Buttons */}
          <div className="ts-gender-pills">
            <button
              type="button"
              className={`ts-filter-pill ${genderFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGenderFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`ts-filter-pill boy ${genderFilter === 'boy' ? 'active' : ''}`}
              onClick={() => setGenderFilter('boy')}
            >
              <BoyIcon size={14} />
              <span>Boys ({stats.boys})</span>
            </button>
            <button
              type="button"
              className={`ts-filter-pill girl ${genderFilter === 'girl' ? 'active' : ''}`}
              onClick={() => setGenderFilter('girl')}
            >
              <GirlIcon size={14} />
              <span>Girls ({stats.girls})</span>
            </button>
          </div>

          {/* Status Filter Dropdown */}
          <div className="ts-status-select-wrap">
            <Filter size={14} className="filter-select-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by enrollment status"
            >
              <option value="all">All Statuses</option>
              <option value="Enrolled">Enrolled (Active)</option>
              <option value="Leave">On Leave</option>
              <option value="Transferred">Transferred (TC)</option>
              <option value="Failed">Failed</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          {/* Caste Filter Dropdown */}
          <div className="ts-status-select-wrap">
            <Layers size={14} className="filter-select-icon" />
            <select
              value={casteFilter}
              onChange={(e) => setCasteFilter(e.target.value)}
              aria-label="Filter by caste"
            >
              <option value="all">All Castes</option>
              <option value="GEN">Gen ({stats.casteCounts.GEN})</option>
              <option value="OBC">OBC ({stats.casteCounts.OBC})</option>
              <option value="SC">SC ({stats.casteCounts.SC})</option>
              <option value="ST">ST ({stats.casteCounts.ST})</option>
              {stats.casteCounts.Other > 0 && (
                <option value="Other">Other ({stats.casteCounts.Other})</option>
              )}
            </select>
          </div>

          {/* View Mode Toggle: Cards (Mobile friendly) vs Table */}
          <div className="ts-view-mode-toggle" title="Switch layout">
            <button
              type="button"
              className={`ts-view-btn ${viewMode === 'cards' || viewMode === 'auto' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards layout (Optimal for mobile)"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`ts-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table layout"
            >
              <List size={13} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Filter Badges ── */}
      {(casteFilter !== 'all' || streamFilter !== 'all' || genderFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
        <div className="active-filters-bar">
          <span className="active-filters-label">Active Filter:</span>
          {casteFilter !== 'all' && (
            <span
              className="active-filter-badge caste-badge"
              onClick={() => setCasteFilter('all')}
              title="Click to remove caste filter"
            >
              Caste: <strong>{casteFilter}</strong> <X size={13} />
            </span>
          )}
          {streamFilter !== 'all' && (
            <span
              className="active-filter-badge stream-badge"
              onClick={() => setStreamFilter('all')}
              title="Click to show all streams"
            >
              Stream: <strong>{streamFilter === 'arts' ? 'Arts' : 'Science'}</strong> <X size={13} />
            </span>
          )}
          {genderFilter !== 'all' && (
            <span
              className="active-filter-badge"
              onClick={() => setGenderFilter('all')}
              title="Click to show all genders"
            >
              Gender: <strong>{genderFilter === 'boy' ? 'Boys' : 'Girls'}</strong> <X size={13} />
            </span>
          )}
          {statusFilter !== 'all' && (
            <span
              className="active-filter-badge"
              onClick={() => setStatusFilter('all')}
              title="Click to remove status filter"
            >
              Status: <strong>{statusFilter}</strong> <X size={13} />
            </span>
          )}
          {searchQuery && (
            <span
              className="active-filter-badge"
              onClick={() => setSearchQuery('')}
              title="Click to clear search query"
            >
              Search: <strong>"{searchQuery}"</strong> <X size={13} />
            </span>
          )}
          <button
            type="button"
            className="clear-all-filters-btn"
            onClick={() => {
              setCasteFilter('all');
              setStreamFilter('all');
              setGenderFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── Students Roster Content ── */}
      {loading ? (
        <div className="ts-table-loading">
          <RefreshCw size={28} className="spinning" />
          <p>Loading student roster...</p>
        </div>
      ) : error ? (
        <div className="ts-table-error">
          <AlertCircle size={28} />
          <p>{error}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="ts-table-empty">
          <Users size={38} className="empty-icon" />
          <h4>No students found</h4>
          <p>No student records matched your search or filters.</p>
          {(searchQuery || genderFilter !== 'all' || statusFilter !== 'all' || casteFilter !== 'all' || streamFilter !== 'all') && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('all');
                setStatusFilter('all');
                setCasteFilter('all');
                setStreamFilter('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (Touch-optimized for phones and small screens) */}
          <div className={`ts-mobile-card-list ${viewMode === 'table' ? 'hide-force' : ''}`}>
            {filteredStudents.map((st) => {
              const isGirl = (st.gender || '').trim().toLowerCase() === 'girl';
              const avatarInitial = st.name ? st.name.charAt(0).toUpperCase() : 'S';

              return (
                <div key={st.id || st.studentId || st._id} className="ts-mobile-student-card">
                  {/* Top: Roll, Avatar, Name, Gender, Caste & Status */}
                  <div className="m-card-header">
                    <div className="m-card-left">
                      <span className="m-roll-badge font-mono">#{st.roll || '—'}</span>
                      <div className={`avatar-pill ${isGirl ? 'girl' : 'boy'}`}>
                        {avatarInitial}
                      </div>
                      <div className="m-student-meta">
                        <span
                          className="m-student-name"
                          onClick={() => setViewingStudent(st)}
                          title="Click to view full profile"
                        >
                          {st.name}
                        </span>
                        <div className="m-tags-row">
                          <span className={`gender-tag ${isGirl ? 'girl' : 'boy'}`}>
                            {isGirl ? 'Girl' : 'Boy'}
                          </span>
                          {st.caste && <span className="caste-tag">{st.caste}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="m-card-status">
                      {renderStatusBadge(st.status)}
                    </div>
                  </div>

                  {/* Body: Identification & Family Details */}
                  <div className="m-card-body">
                    <div className="m-detail-item">
                      <span className="m-lbl">PEN / APAAR:</span>
                      <span className="m-val font-mono">{st.penNumber || st.apaarId || st.studentId || '—'}</span>
                    </div>

                    {(st.father || st.guardian) && (
                      <div className="m-detail-item">
                        <span className="m-lbl">Father / Guardian:</span>
                        <span className="m-val">{st.father || st.guardian}</span>
                      </div>
                    )}

                    {st.mother && (
                      <div className="m-detail-item">
                        <span className="m-lbl">Mother's Name:</span>
                        <span className="m-val">{st.mother}</span>
                      </div>
                    )}

                    {st.phone && (
                      <div className="m-detail-item">
                        <span className="m-lbl">Contact Phone:</span>
                        <a href={`tel:${st.phone.split('/')[0].trim()}`} className="m-phone-link">
                          <Phone size={12} />
                          <span>{st.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="m-card-actions">
                    <button
                      type="button"
                      className="m-action-btn view-btn"
                      onClick={() => setViewingStudent(st)}
                      title={`View details of ${st.name}`}
                    >
                      <Eye size={14} />
                      <span>View Profile</span>
                    </button>
                    <button
                      type="button"
                      className="m-action-btn edit-btn"
                      onClick={() => setEditingStudent(st)}
                      title={`Edit details of ${st.name}`}
                    >
                      <Pencil size={14} />
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop & Tablet Table View (with horizontal scroll support) */}
          <div className={`teacher-students-table-wrap ${viewMode === 'cards' ? 'hide-on-mobile' : ''}`}>
            <div className="ts-table-scroll-hint">
              <span>⇄ Swipe horizontally to view full table columns</span>
            </div>
            <table className="teacher-students-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Roll</th>
                  <th>Student Name & Identifiers</th>
                  <th>Father / Guardian</th>
                  <th>Mother's Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const isGirl = (st.gender || '').trim().toLowerCase() === 'girl';
                  const avatarInitial = st.name ? st.name.charAt(0).toUpperCase() : 'S';

                  return (
                    <tr key={st.id || st.studentId || st._id} className="student-row">
                      {/* Roll */}
                      <td className="roll-cell font-mono">
                        <span className="roll-pill">#{st.roll || '—'}</span>
                      </td>

                      {/* Student Name & Identifiers */}
                      <td className="student-info-cell">
                        <div className="student-flex">
                          <div className={`avatar-pill ${isGirl ? 'girl' : 'boy'}`}>
                            {avatarInitial}
                          </div>
                          <div className="student-details-inline">
                            <div className="student-name-row">
                              <span
                                className="student-name clickable"
                                onClick={() => setViewingStudent(st)}
                                title="Click to view complete student profile"
                              >
                                {st.name}
                              </span>
                              <span className={`gender-tag ${isGirl ? 'girl' : 'boy'}`}>
                                {isGirl ? 'Girl' : 'Boy'}
                              </span>
                              {st.caste && (
                                <span className="caste-tag">{st.caste}</span>
                              )}
                            </div>
                            <div className="student-id-row font-mono">
                              {st.penNumber ? (
                                <span>PEN: {st.penNumber}</span>
                              ) : st.apaarId ? (
                                <span>APAAR: {st.apaarId}</span>
                              ) : (
                                <span className="id-subtext">ID: {st.studentId || st.id}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Father / Guardian */}
                      <td className="guardian-cell">
                        <span className="parent-text">{st.father || st.guardian || '—'}</span>
                      </td>

                      {/* Mother */}
                      <td className="guardian-cell">
                        <span className="parent-text">{st.mother || '—'}</span>
                      </td>

                      {/* Phone */}
                      <td className="contact-cell">
                        {st.phone ? (
                          <a href={`tel:${st.phone.split('/')[0].trim()}`} className="phone-link">
                            <Phone size={13} />
                            <span>{st.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Enrollment Status */}
                      <td className="status-cell">
                        {renderStatusBadge(st.status)}
                      </td>

                      {/* Actions */}
                      <td className="actions-cell">
                        <div className="actions-button-group">
                          <button
                            type="button"
                            className="ts-action-btn view-btn"
                            onClick={() => setViewingStudent(st)}
                            title={`View details of ${st.name}`}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="ts-action-btn edit-btn"
                            onClick={() => setEditingStudent(st)}
                            title={`Edit profile and details of ${st.name}`}
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── View Student Details Modal ── */}
      {viewingStudent && (
        <StudentDetailsModal
          student={viewingStudent}
          currentClass={currentClass}
          onClose={() => setViewingStudent(null)}
          onEdit={(st) => {
            setViewingStudent(null);
            setEditingStudent(st);
          }}
        />
      )}

      {/* ── Edit Student Details Modal ── */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          classes={SCHOOL_CLASSES}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveStudentDetails}
        />
      )}
    </div>
  );
};

export default TeacherStudents;
