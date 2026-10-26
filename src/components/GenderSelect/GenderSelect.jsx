import React, { useState, useRef, useEffect } from 'react';
import './GenderSelect.css';
import { BoyIcon, GirlIcon } from '../GenderIcons/GenderIcons';
import { ChevronDown, Check } from 'lucide-react';

const GenderSelect = ({ value = 'Boy', onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedValue = value === 'Girl' ? 'Girl' : 'Boy';

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
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

  const handleSelect = (genderVal) => {
    if (onChange) {
      onChange(genderVal);
    }
    setIsOpen(false);
  };

  return (
    <div className={`custom-gender-select-container ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`gender-select-trigger ${selectedValue.toLowerCase()} ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-value-wrap">
          <span className={`trigger-icon-pill ${selectedValue.toLowerCase()}`}>
            {selectedValue === 'Girl' ? <GirlIcon size={15} /> : <BoyIcon size={15} />}
          </span>
          <span className="trigger-text-val">{selectedValue}</span>
        </div>
        <ChevronDown size={16} className={`trigger-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && (
        <div className="gender-dropdown-menu" role="listbox">
          {/* Option: Boy */}
          <div
            role="option"
            aria-selected={selectedValue === 'Boy'}
            className={`gender-menu-option boy ${selectedValue === 'Boy' ? 'selected' : ''}`}
            onClick={() => handleSelect('Boy')}
          >
            <div className="option-content-left">
              <span className="option-icon-avatar boy">
                <BoyIcon size={16} />
              </span>
              <div className="option-labels">
                <span className="option-primary-title">Boy</span>
                <span className="option-subtitle">Male Student</span>
              </div>
            </div>
            {selectedValue === 'Boy' && (
              <span className="option-check-wrap boy">
                <Check size={14} />
              </span>
            )}
          </div>

          {/* Option: Girl */}
          <div
            role="option"
            aria-selected={selectedValue === 'Girl'}
            className={`gender-menu-option girl ${selectedValue === 'Girl' ? 'selected' : ''}`}
            onClick={() => handleSelect('Girl')}
          >
            <div className="option-content-left">
              <span className="option-icon-avatar girl">
                <GirlIcon size={16} />
              </span>
              <div className="option-labels">
                <span className="option-primary-title">Girl</span>
                <span className="option-subtitle">Female Student</span>
              </div>
            </div>
            {selectedValue === 'Girl' && (
              <span className="option-check-wrap girl">
                <Check size={14} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenderSelect;
