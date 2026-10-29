import React from 'react';
import { Award, Download, Printer, Sliders } from 'lucide-react';
import './ExamHeaderActions.css';

/**
 * ExamHeaderActions (Part 1)
 * Header crest, title, subtitle, and top action buttons (PRC, Export, Print, Weightage Scheme)
 */
const ExamHeaderActions = ({
  onOpenReportCard,
  onExportCSV,
  onPrint,
  onOpenWeightageModal
}) => {
  return (
    <div className="admin-exam-header">
      <div className="exam-header-titles">
        <div className="exam-crest-icon">
          <Award size={24} />
        </div>
        <div>
          <h3>Academic Examinations & Results Hub</h3>
          <p>
            Consolidated class-wise marksheet and subject marks submitted by faculty members for PM SHRI Moharcherra
          </p>
        </div>
      </div>

      <div className="exam-header-btns">
        <button
          type="button"
          className="exam-action-btn report-card-btn"
          onClick={onOpenReportCard}
          title="Generate official Tripura Board Holistic Progress Report Card (Bilingual Format)"
        >
          <Award size={15} />
          <span>Generate Report Card (PRC)</span>
        </button>

        <button
          type="button"
          className="exam-action-btn export"
          onClick={onExportCSV}
          title="Export Class Marksheet to Excel-compatible CSV"
        >
          <Download size={15} />
          <span>Export Marksheet (CSV)</span>
        </button>

        <button
          type="button"
          className="exam-action-btn print"
          onClick={onPrint}
          title="Print Official Marksheet"
        >
          <Printer size={15} />
          <span>Print Marksheet</span>
        </button>

        <button
          type="button"
          className="exam-action-btn weightage-btn"
          onClick={onOpenWeightageModal}
          title="Configure Science & Social Science component marks weightage"
        >
          <Sliders size={15} />
          <span>Weightage Scheme</span>
        </button>
      </div>
    </div>
  );
};

export default ExamHeaderActions;
