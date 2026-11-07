import React, { useMemo } from 'react';
import './PendingStatusSection.css';
import { isFieldPending, isTransferredStudent, isTransferredOrFailed } from '../../utils/studentStatus';
import {
  Sparkles,
  Hash,
  Fingerprint,
  Phone,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

const PendingStatusSection = ({ students = [], onOpenModal }) => {
  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => !isTransferredOrFailed(s));
    const total = activeStudents.length;
    let apaarPending = 0;
    let penPending = 0;
    let aadhaarPending = 0;
    let phonePending = 0;
    let anyPending = 0;

    activeStudents.forEach((s) => {
      const isApaar = isFieldPending(s.apaarId);
      const isPen = isFieldPending(s.penNumber);
      const isAadhaar = isFieldPending(s.aadhaar);
      const isPhone = isFieldPending(s.phone);

      if (isApaar) apaarPending++;
      if (isPen) penPending++;
      if (isAadhaar) aadhaarPending++;
      if (isPhone) phonePending++;
      if (isApaar || isPen || isAadhaar || isPhone) anyPending++;
    });

    const getPct = (cnt) => (total > 0 ? ((cnt / total) * 100).toFixed(1) : '0.0');

    return {
      total,
      apaar: {
        pending: apaarPending,
        completed: total - apaarPending,
        pendingPct: getPct(apaarPending),
        completedPct: getPct(total - apaarPending)
      },
      pen: {
        pending: penPending,
        completed: total - penPending,
        pendingPct: getPct(penPending),
        completedPct: getPct(total - penPending)
      },
      aadhaar: {
        pending: aadhaarPending,
        completed: total - aadhaarPending,
        pendingPct: getPct(aadhaarPending),
        completedPct: getPct(total - aadhaarPending)
      },
      phone: {
        pending: phonePending,
        completed: total - phonePending,
        pendingPct: getPct(phonePending),
        completedPct: getPct(total - phonePending)
      },
      any: {
        pending: anyPending,
        fullyComplete: total - anyPending,
        pendingPct: getPct(anyPending),
        completedPct: getPct(total - anyPending)
      }
    };
  }, [students]);

  return (
    <div className="pending-status-section">
      {/* Section Header */}
      <div className="pending-section-header">
        <div className="pending-section-header-left">
          <div className="pending-section-icon-box">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="pending-section-title-row">
              <h3 className="pending-section-title">Student Documentation & Pending Status Tracker</h3>
              <span className="pending-statutory-pill">UDISE+ · APAAR · UIDAI Compliance</span>
            </div>
            <p className="pending-section-subtitle">
              Audit of student credentials across all grades (Classes I – XII). Click any metric card below to open the class-wise list of pending students.
            </p>
          </div>
        </div>

        <div className="pending-section-header-right">
          <button
            type="button"
            className="open-full-audit-btn"
            onClick={() => onOpenModal('apaarId')}
          >
            <span>Open Class-wise Audit</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="pending-cards-grid">
        {/* Card 1: APAAR ID */}
        <div
          className="pending-metric-card theme-apaar"
          onClick={() => onOpenModal('apaarId')}
          role="button"
          tabIndex={0}
          title="Click to view class-wise list of students with pending APAAR ID"
        >
          <div className="p-card-top">
            <div className="p-icon-title-wrap">
              <div className="p-card-icon apaar">
                <Sparkles size={18} />
              </div>
              <div className="p-card-title-meta">
                <h4 className="p-card-name">APAAR ID</h4>
                <span className="p-card-category">Ministry of Education ID</span>
              </div>
            </div>
            <span className="p-action-tag apaar">
              <span>Class-wise</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="p-card-numbers-wrap">
            <div className="p-big-number-row">
              <span className="p-big-number">{stats.apaar.pending}</span>
              <span className="p-number-unit">Students Pending</span>
            </div>
            <span className="p-percentage-sub">
              {stats.apaar.pendingPct}% of school awaiting APAAR generation
            </span>
          </div>

          <div className="p-progress-bar-wrap">
            <div
              className="p-progress-fill completed"
              style={{ width: `${stats.apaar.completedPct}%` }}
              title={`Generated: ${stats.apaar.completed} (${stats.apaar.completedPct}%)`}
            />
            <div
              className="p-progress-fill pending apaar"
              style={{ width: `${stats.apaar.pendingPct}%` }}
              title={`Pending: ${stats.apaar.pending} (${stats.apaar.pendingPct}%)`}
            />
          </div>

          <div className="p-card-footer">
            <span className="p-completed-count">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <strong>{stats.apaar.completed}</strong> Generated ({stats.apaar.completedPct}%)
            </span>
            <span className="p-view-link apaar">
              View Class-wise List →
            </span>
          </div>
        </div>

        {/* Card 2: PEN Number */}
        <div
          className="pending-metric-card theme-pen"
          onClick={() => onOpenModal('penNumber')}
          role="button"
          tabIndex={0}
          title="Click to view class-wise list of students with missing PEN Number"
        >
          <div className="p-card-top">
            <div className="p-icon-title-wrap">
              <div className="p-card-icon pen">
                <Hash size={18} />
              </div>
              <div className="p-card-title-meta">
                <h4 className="p-card-name">PEN Number</h4>
                <span className="p-card-category">UDISE+ National ID</span>
              </div>
            </div>
            <span className="p-action-tag pen">
              <span>Class-wise</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="p-card-numbers-wrap">
            <div className="p-big-number-row">
              <span className="p-big-number">{stats.pen.pending}</span>
              <span className="p-number-unit">Students Pending</span>
            </div>
            <span className="p-percentage-sub">
              {stats.pen.pendingPct}% of students lacking PEN Code
            </span>
          </div>

          <div className="p-progress-bar-wrap">
            <div
              className="p-progress-fill completed"
              style={{ width: `${stats.pen.completedPct}%` }}
              title={`Recorded: ${stats.pen.completed} (${stats.pen.completedPct}%)`}
            />
            <div
              className="p-progress-fill pending pen"
              style={{ width: `${stats.pen.pendingPct}%` }}
              title={`Pending: ${stats.pen.pending} (${stats.pen.pendingPct}%)`}
            />
          </div>

          <div className="p-card-footer">
            <span className="p-completed-count">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <strong>{stats.pen.completed}</strong> Recorded ({stats.pen.completedPct}%)
            </span>
            <span className="p-view-link pen">
              View Class-wise List →
            </span>
          </div>
        </div>

        {/* Card 3: Aadhaar Card */}
        <div
          className="pending-metric-card theme-aadhaar"
          onClick={() => onOpenModal('aadhaar')}
          role="button"
          tabIndex={0}
          title="Click to view class-wise list of students with missing Aadhaar Card"
        >
          <div className="p-card-top">
            <div className="p-icon-title-wrap">
              <div className="p-card-icon aadhaar">
                <Fingerprint size={18} />
              </div>
              <div className="p-card-title-meta">
                <h4 className="p-card-name">Aadhaar Card</h4>
                <span className="p-card-category">UIDAI Identification</span>
              </div>
            </div>
            <span className="p-action-tag aadhaar">
              <span>Class-wise</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="p-card-numbers-wrap">
            <div className="p-big-number-row">
              <span className="p-big-number">{stats.aadhaar.pending}</span>
              <span className="p-number-unit">Students Pending</span>
            </div>
            <span className="p-percentage-sub">
              {stats.aadhaar.pendingPct}% pending UIDAI registration
            </span>
          </div>

          <div className="p-progress-bar-wrap">
            <div
              className="p-progress-fill completed"
              style={{ width: `${stats.aadhaar.completedPct}%` }}
              title={`Linked: ${stats.aadhaar.completed} (${stats.aadhaar.completedPct}%)`}
            />
            <div
              className="p-progress-fill pending aadhaar"
              style={{ width: `${stats.aadhaar.pendingPct}%` }}
              title={`Pending: ${stats.aadhaar.pending} (${stats.aadhaar.pendingPct}%)`}
            />
          </div>

          <div className="p-card-footer">
            <span className="p-completed-count">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <strong>{stats.aadhaar.completed}</strong> Linked ({stats.aadhaar.completedPct}%)
            </span>
            <span className="p-view-link aadhaar">
              View Class-wise List →
            </span>
          </div>
        </div>

        {/* Card 4: Contact Number */}
        <div
          className="pending-metric-card theme-phone"
          onClick={() => onOpenModal('phone')}
          role="button"
          tabIndex={0}
          title="Click to view class-wise list of students missing Contact Number"
        >
          <div className="p-card-top">
            <div className="p-icon-title-wrap">
              <div className="p-card-icon phone">
                <Phone size={18} />
              </div>
              <div className="p-card-title-meta">
                <h4 className="p-card-name">Contact Number</h4>
                <span className="p-card-category">Guardian Phone</span>
              </div>
            </div>
            <span className="p-action-tag phone">
              <span>Class-wise</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="p-card-numbers-wrap">
            <div className="p-big-number-row">
              <span className="p-big-number">{stats.phone.pending}</span>
              <span className="p-number-unit">Students Pending</span>
            </div>
            <span className="p-percentage-sub">
              {stats.phone.pendingPct}% missing mobile contact details
            </span>
          </div>

          <div className="p-progress-bar-wrap">
            <div
              className="p-progress-fill completed"
              style={{ width: `${stats.phone.completedPct}%` }}
              title={`Available: ${stats.phone.completed} (${stats.phone.completedPct}%)`}
            />
            <div
              className="p-progress-fill pending phone"
              style={{ width: `${stats.phone.pendingPct}%` }}
              title={`Pending: ${stats.phone.pending} (${stats.phone.pendingPct}%)`}
            />
          </div>

          <div className="p-card-footer">
            <span className="p-completed-count">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <strong>{stats.phone.completed}</strong> Available ({stats.phone.completedPct}%)
            </span>
            <span className="p-view-link phone">
              View Class-wise List →
            </span>
          </div>
        </div>

        {/* Card 5: Summary / All Pending */}
        <div
          className="pending-metric-card theme-any"
          onClick={() => onOpenModal('any')}
          role="button"
          tabIndex={0}
          title="Click to view all students with any pending or missing document"
        >
          <div className="p-card-top">
            <div className="p-icon-title-wrap">
              <div className="p-card-icon any">
                <AlertCircle size={18} />
              </div>
              <div className="p-card-title-meta">
                <h4 className="p-card-name">Any Pending Detail</h4>
                <span className="p-card-category">Incomplete Profiles</span>
              </div>
            </div>
            <span className="p-action-tag any">
              <span>Audit All</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="p-card-numbers-wrap">
            <div className="p-big-number-row">
              <span className="p-big-number">{stats.any.pending}</span>
              <span className="p-number-unit">Students Require Action</span>
            </div>
            <span className="p-percentage-sub">
              {stats.any.pendingPct}% of school missing 1 or more documents
            </span>
          </div>

          <div className="p-progress-bar-wrap">
            <div
              className="p-progress-fill completed"
              style={{ width: `${stats.any.completedPct}%` }}
              title={`Fully Complete: ${stats.any.fullyComplete} (${stats.any.completedPct}%)`}
            />
            <div
              className="p-progress-fill pending any"
              style={{ width: `${stats.any.pendingPct}%` }}
              title={`Incomplete: ${stats.any.pending} (${stats.any.pendingPct}%)`}
            />
          </div>

          <div className="p-card-footer">
            <span className="p-completed-count">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <strong>{stats.any.fullyComplete}</strong> Fully Verified ({stats.any.completedPct}%)
            </span>
            <span className="p-view-link any">
              Audit Incomplete List →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingStatusSection;
