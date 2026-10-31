import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { 
  Mail, 
  Phone, 
  LogIn, 
  LogOut,
  ChevronDown, 
  Menu, 
  X 
} from 'lucide-react';

// Brand SVGs for Facebook, YouTube, Instagram
const FacebookIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Navbar = ({ 
  currentPage = 'home', 
  onNavigate = () => {}, 
  onLoginClick = null,
  currentUser = null,
  onLogout = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const handleSubItemClick = (parentItem, subItem) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    const targetPage = subItem.page || (parentItem.id === 'about' ? 'about' : 'home');
    onNavigate(targetPage, subItem.folderSlug);

    if (subItem.target) {
      setTimeout(() => {
        const el = document.getElementById(subItem.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    }
  };

  const navItems = [
    { label: 'Home', id: 'home', link: '#', active: currentPage === 'home' },
    { 
      label: 'About', 
      id: 'about',
      hasDropdown: true,
      active: currentPage === 'about',
      subItems: [
        { label: 'Overview', target: 'about-overview', page: 'about' },
        { label: "Teacher-In-Charge's Message", target: 'teacher-desk', page: 'about' },
        { label: 'Vision & Mission', target: 'vision-mission', page: 'about' },
        { label: 'School Management', target: 'about-overview', page: 'about' },
        { label: 'Faculty & Staff', target: 'teacher-desk', page: 'about' }
      ] 
    },
    { 
      label: 'Academics', 
      id: 'academics',
      hasDropdown: true,
      active: currentPage === 'academic-calendar' || currentPage === 'examinations-results',
      subItems: [
        { label: 'Academic Calendar', page: 'academic-calendar' },
        { label: 'Examinations & Results', page: 'examinations-results' }
      ] 
    },

    { 
      label: 'Admissions', 
      id: 'admissions',
      hasDropdown: true,
      active: currentPage === 'admissions',
      subItems: [
        { label: 'Admission Guidelines', target: 'process', page: 'admissions' },
        { label: 'Eligibility Criteria', target: 'eligibility', page: 'admissions' },
        { label: 'Online Application & Forms', target: 'apply', page: 'admissions' }
      ] 
    },
    { 
      label: 'Gallery', 
      id: 'gallery', 
      active: currentPage === 'gallery' 
    },
    { 
      label: 'Notices', 
      id: 'notices', 
      active: currentPage === 'notices' 
    },
    { label: 'Contact', id: 'contact', link: '#contact' },
  ];

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled-floating' : ''}`}>
      {/* Top Utility Info Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span className="motto-text">PM SHRI – Schools for a Rising India</span>
          </div>
          <div className="top-bar-right">
            <a href="mailto:moharcherrahs@gmail.com" className="top-contact-item">
              <Mail size={14} className="top-icon" />
              <span>moharcherrahs@gmail.com</span>
            </a>
            <span className="top-divider"></span>
            <a href="tel:+919876543210" className="top-contact-item">
              <Phone size={14} className="top-icon" />
              <span>+91 98765 43210</span>
            </a>
            <div className="top-social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon-btn">
                <FacebookIcon size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-icon-btn">
                <YoutubeIcon size={15} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon-btn">
                <InstagramIcon size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="navbar-container">
          {/* Logo Section */}
          <a 
            href="#" 
            className="navbar-brand"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
          >
            <img src="/logo.png" alt="PM SHRI Logo Emblem" className="brand-logo-img" />
            <div className="brand-text">
              <div className="brand-title">
                <span className="brand-pm">PM </span>
                <span className="brand-shri">SHRI</span>
              </div>
              <div className="brand-school">Moharcherra H.S. School</div>
              <div className="brand-location">Teliamura, Khowai, Tripura</div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="nav-menu">
            <ul className="nav-links">
              {navItems.map((item, index) => (
                <li 
                  key={index} 
                  className={`nav-item ${item.hasDropdown ? 'has-dropdown' : ''} ${item.active ? 'active' : ''}`}
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(index)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <a 
                    href={item.link || '#'} 
                    className={`nav-link ${item.active ? 'active-link' : ''}`}
                    onClick={(e) => {
                      if (item.id === 'home' || item.id === 'about' || item.id === 'gallery' || item.id === 'notices') {
                        e.preventDefault();
                        onNavigate(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (item.hasDropdown) {
                        e.preventDefault();
                        toggleDropdown(index);
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && <ChevronDown size={14} className="chevron-icon" />}
                  </a>

                  {/* Dropdown Menu */}
                  {item.hasDropdown && (
                    <ul className={`dropdown-menu ${activeDropdown === index ? 'show' : ''}`}>
                      {item.subItems.map((subItem, subIdx) => (
                        <li key={subIdx} className="dropdown-item">
                          <a 
                            href={`#${subItem.target || ''}`} 
                            className="dropdown-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubItemClick(item, subItem);
                            }}
                          >
                            {subItem.label || subItem}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* User Profile Pill or Login Button */}
            <div className="nav-action-wrapper">
              {currentUser ? (
                <div className="user-logged-pill">
                  <div className="user-logged-info">
                    <span className="user-logged-role">{currentUser.role}</span>
                    <span className="user-logged-name">{currentUser.name}</span>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button 
                      className="nav-admin-portal-btn"
                      onClick={() => onNavigate('admin')}
                      title="Open School ERP Admin Dashboard"
                    >
                      Admin Panel
                    </button>
                  )}
                  {currentUser.role === 'student' && (
                    <button 
                      className="nav-admin-portal-btn"
                      onClick={() => onNavigate('student')}
                      title="Open Student Portal"
                    >
                      Student Portal
                    </button>
                  )}
                  {currentUser.role === 'teacher' && (
                    <button 
                      className="nav-admin-portal-btn"
                      onClick={() => onNavigate('dashboard')}
                      title="Open Teacher Dashboard"
                    >
                      Dashboard
                    </button>
                  )}
                  <button 
                    className="logout-icon-btn" 
                    onClick={onLogout}
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button 
                  className="nav-login-btn" 
                  aria-label="Login to ERP Portal"
                  onClick={() => {
                    if (onLoginClick) {
                      onLoginClick();
                    } else {
                      onNavigate('login');
                    }
                  }}
                >
                  <LogIn size={16} className="login-icon" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Actions: Login/User & Hamburger */}
          <div className="mobile-actions">
            {currentUser ? (
              <button 
                className="mobile-logout-btn" 
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
                <span>Exit</span>
              </button>
            ) : (
              <button 
                className="mobile-login-btn" 
                aria-label="Login to ERP Portal"
                onClick={() => {
                  if (onLoginClick) {
                    onLoginClick();
                  } else {
                    onNavigate('login');
                  }
                }}
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
            )}
            <button 
              className="hamburger-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="mobile-nav-item">
                <div 
                  className={`mobile-nav-header ${item.active ? 'active' : ''}`}
                  onClick={() => item.hasDropdown && toggleDropdown(index)}
                >
                  <a 
                    href={item.link || '#'} 
                    onClick={(e) => {
                      if (item.id === 'home' || item.id === 'about' || item.id === 'gallery' || item.id === 'notices') {
                        e.preventDefault();
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (item.hasDropdown) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.label}
                  </a>
                  {item.hasDropdown && (
                    <ChevronDown 
                      size={16} 
                      className={`mobile-chevron ${activeDropdown === index ? 'rotated' : ''}`} 
                    />
                  )}
                </div>

                {item.hasDropdown && activeDropdown === index && (
                  <ul className="mobile-sub-list">
                    {item.subItems.map((sub, sIdx) => (
                      <li key={sIdx} className="mobile-sub-item">
                        <a 
                          href={`#${sub.target || ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubItemClick(item, sub);
                          }}
                        >
                          {sub.label || sub}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mobile-drawer-footer">
            {currentUser ? (
              <div className="mobile-drawer-user-card">
                <div className="mobile-drawer-user-info">
                  <span className="mobile-drawer-role">{currentUser.role.toUpperCase()}</span>
                  <span className="mobile-drawer-name">{currentUser.name}</span>
                </div>
                <button 
                  className="mobile-drawer-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                className="mobile-drawer-login-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) {
                    onLoginClick();
                  } else {
                    onNavigate('login');
                  }
                }}
              >
                <LogIn size={18} />
                <span>Login to ERP Portal</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
    <div className="navbar-spacer" aria-hidden="true" />
  </>
  );
};

export default Navbar;
