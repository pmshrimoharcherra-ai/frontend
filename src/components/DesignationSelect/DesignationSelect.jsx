import React, { useState, useRef, useEffect } from 'react';
import './DesignationSelect.css';
import {
  ChevronDown,
  Check,
  Award,
  GraduationCap,
  Briefcase,
  Sparkles,
  School
} from 'lucide-react';

export const DESIGNATION_OPTIONS = [
  {
    code: 'UGT',
    title: 'Under Graduate Teacher',
    scope: 'Primary Wing (Classes I – V)',
    badgeClass: 'desig-ugt',
    category: 'teaching',
    icon: GraduationCap,
  },
  {
    code: 'TGT',
    title: 'Trained Graduate Teacher',
    scope: 'Elementary & Secondary (Classes VI – X)',
    badgeClass: 'desig-tgt',
    category: 'teaching',
    icon: GraduationCap,
  },
  {
    code: 'PGT',
    title: 'Post Graduate Teacher',
    scope: 'Higher Secondary (Classes XI & XII)',
    badgeClass: 'desig-pgt',
    category: 'teaching',
    icon: GraduationCap,
  },
  {
    code: 'GT',
    title: 'Graduate Teacher',
    scope: 'High School / Secondary Wing',
    badgeClass: 'desig-gt',
    category: 'teaching',
    icon: GraduationCap,
  },
  {
    code: 'HM',
    title: 'Headmaster / Headmistress',
    scope: 'Head of Institution',
    badgeClass: 'desig-hm',
    category: 'leadership',
    icon: Award,
  },
  {
    code: 'TIC',
    title: 'Teacher-In-Charge',
    scope: 'Acting Head of Institution',
    badgeClass: 'desig-tic',
    category: 'leadership',
    icon: Award,
  },
  {
    code: 'AHM',
    title: 'Assistant Headmaster / Headmistress',
    scope: 'School Administration & Leadership',
    badgeClass: 'desig-ahm',
    category: 'leadership',
    icon: School,
  },
];

const DesignationSelect = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Select Designation',
  accent = 'orange', // 'orange' or 'emerald'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Find selected item config
  const selectedItem = DESIGNATION_OPTIONS.find((item) => item.code === value);
  const isCustomValue = Boolean(value && !selectedItem);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    if (disabled) return;
    if (onChange) {
      onChange(code);
    }
    setIsOpen(false);
  };

  return (
    <div
      className={`desig-select-container ${isOpen ? 'is-open' : ''} accent-${accent}`}
      ref={containerRef}
    >
      {/* ── Trigger Button ── */}
      <button
        type="button"
        className={`desig-select-trigger ${isOpen ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="desig-trigger-content">
          {selectedItem ? (
            <div className="desig-selected-pill-wrap">
              <span className={`desig-badge ${selectedItem.badgeClass}`}>
                {selectedItem.code}
              </span>
              <span className="desig-selected-title">
                {selectedItem.title}
              </span>
            </div>
          ) : isCustomValue ? (
            <div className="desig-selected-pill-wrap">
              <span className="desig-badge desig-custom">
                {value}
              </span>
              <span className="desig-selected-title custom-text">
                Current Designation
              </span>
            </div>
          ) : (
            <span className="desig-trigger-placeholder">
              <Briefcase size={14} className="desig-placeholder-icon" />
              <span>{placeholder}</span>
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`desig-trigger-chevron ${isOpen ? 'is-open' : ''}`}
        />
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div className="desig-dropdown-menu" role="listbox">
          <div className="desig-menu-header">
            <span className="desig-menu-label">
              <Sparkles size={12} />
              <span>Official School Designations</span>
            </span>
            <span className="desig-menu-count">
              {DESIGNATION_OPTIONS.length} Roles
            </span>
          </div>

          <div className="desig-menu-list">
            {/* If there's a custom / legacy value preserved */}
            {isCustomValue && (
              <div
                role="option"
                aria-selected={true}
                className="desig-menu-item is-selected is-custom-item"
                onClick={() => handleSelect(value)}
              >
                <div className="desig-item-left">
                  <span className="desig-badge desig-custom">{value}</span>
                  <div className="desig-item-info">
                    <span className="desig-item-title">{value}</span>
                    <span className="desig-item-scope">Custom / Legacy Designation</span>
                  </div>
                </div>
                <div className="desig-item-check">
                  <Check size={14} />
                </div>
              </div>
            )}

            {/* Standard Predefined Designations */}
            {DESIGNATION_OPTIONS.map((item) => {
              const isSelected = item.code === value;
              const IconComp = item.icon;

              return (
                <div
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  className={`desig-menu-item ${isSelected ? 'is-selected' : ''} ${item.badgeClass}`}
                  onClick={() => handleSelect(item.code)}
                >
                  <div className="desig-item-left">
                    <div className="desig-badge-cluster">
                      <span className={`desig-badge ${item.badgeClass}`}>
                        {item.code}
                      </span>
                    </div>

                    <div className="desig-item-info">
                      <div className="desig-item-title-row">
                        <span className="desig-item-title">{item.title}</span>
                        {item.category === 'leadership' && (
                          <span className="desig-leadership-tag">
                            <Award size={10} />
                            <span>Leadership</span>
                          </span>
                        )}
                      </div>
                      <span className="desig-item-scope">{item.scope}</span>
                    </div>
                  </div>

                  <div className="desig-item-right">
                    {isSelected ? (
                      <span className="desig-item-check">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="desig-item-hint-icon">
                        <IconComp size={14} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationSelect;
