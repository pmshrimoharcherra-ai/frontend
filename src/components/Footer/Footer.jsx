import React from 'react';
import './Footer.css';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ChevronRight, 
  Heart 
} from 'lucide-react';

// Social Icon Components
const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Footer = ({ onNavigate = () => {} }) => {
  const quickLinks = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Academic Calendar', page: 'academic-calendar' },
    { label: 'Examinations & Results', page: 'examinations-results' },
    { label: 'Admissions 2026–27', page: 'admissions' },
    { label: 'PM SHRI Initiatives', href: '#initiatives' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'News & Notices', page: 'notices' },
    { label: 'Media Gallery', page: 'gallery' },
    { label: 'Contact Us', href: '#contact' }
  ];

  const importantLinks = [
    { label: 'Department of School Education (Tripura)', href: 'https://highereducation.tripura.gov.in/' },
    { label: 'PM SHRI Portal', href: 'https://pmshri.education.gov.in/' },
    { label: 'National Education Policy 2020', href: 'https://www.education.gov.in/nep' },
    { label: 'DISE (UDISE+)', href: 'https://udiseplus.gov.in/' },
    { label: 'Samagra Shiksha Tripura', href: '#' },
    { label: 'CBSE', href: 'https://www.cbse.gov.in/' },
    { label: 'NCERT', href: 'https://ncert.nic.in/' },
    { label: 'Career Guidance', href: '#' },
    { label: 'RTI', href: '#' },
    { label: 'School Login', href: '#' }
  ];

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Column 1: Brand & Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img src="/logo.png" alt="PM SHRI Logo" className="footer-logo-img" />
              <div className="footer-brand-text">
                <div className="footer-brand-title">
                  <span className="brand-pm-text">PM </span>
                  <span className="brand-shri-text">SHRI</span>
                </div>
                <h3 className="footer-school-name">MOHARCHERRA H.S. SCHOOL</h3>
                <p className="footer-location">Moharcherra, Teliamura, Khowai Tripura</p>
              </div>
            </div>

            <div className="footer-brand-line"></div>

            <p className="footer-about-text">
              A centre of learning, values and community development committed to holistic education and a brighter future for every learner.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-heading-line"></div>
            <ul className="footer-nav-list">
              {quickLinks.map((item, index) => (
                <li key={index} className="footer-nav-item">
                  <a
                    href={item.href || '#'}
                    className="footer-nav-link"
                    onClick={(e) => {
                      if (item.page) {
                        e.preventDefault();
                        onNavigate(item.page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <ChevronRight size={14} className="link-chevron" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Important Links */}
          <div className="footer-col links-col important-col">
            <h4 className="footer-heading">Important Links</h4>
            <div className="footer-heading-line"></div>
            <ul className="footer-nav-list">
              {importantLinks.map((item, index) => (
                <li key={index} className="footer-nav-item">
                  <a href={item.href} target="_blank" rel="noreferrer" className="footer-nav-link">
                    <ChevronRight size={14} className="link-chevron" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us & Follow Us */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-heading-line"></div>

            <div className="footer-contact-list">
              {/* Address */}
              <div className="contact-item">
                <div className="contact-icon-circle">
                  <MapPin size={17} />
                </div>
                <div className="contact-info">
                  <span>Moharcherra, Teliamura, Khowai, Tripura, India</span>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-item">
                <div className="contact-icon-circle">
                  <Phone size={17} />
                </div>
                <div className="contact-info">
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
              </div>

              {/* Email */}
              <div className="contact-item">
                <div className="contact-icon-circle">
                  <Mail size={17} />
                </div>
                <div className="contact-info">
                  <a href="mailto:moharcherrahs@gmail.com">moharcherrahs@gmail.com</a>
                </div>
              </div>

              {/* Website */}
              <div className="contact-item">
                <div className="contact-icon-circle">
                  <Globe size={17} />
                </div>
                <div className="contact-info">
                  <a href="https://www.moharcherrahs.in" target="_blank" rel="noreferrer">www.moharcherrahs.in</a>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="footer-social-block">
              <h5 className="follow-heading">Follow Us</h5>
              <div className="social-icon-row">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-pill fb-btn">
                  <FacebookIcon />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-pill yt-btn">
                  <YoutubeIcon />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-pill ig-btn">
                  <InstagramIcon />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X" className="social-pill x-btn">
                  <XIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal Strip */}
      <div className="footer-bottom-strip">
        <div className="bottom-strip-container">
          <p className="copyright-text">
            © 2026 PM SHRI Moharcherra H.S. School. All Rights Reserved.
          </p>

          <div className="legal-links">
            <a href="#sitemap">Sitemap</a>
            <span className="legal-sep">|</span>
            <a href="#privacy">Privacy Policy</a>
            <span className="legal-sep">|</span>
            <a href="#terms">Terms of Use</a>
            <span className="legal-sep">|</span>
            <a href="#accessibility">Accessibility</a>
            <span className="legal-sep">|</span>
            <a href="#disclaimer">Disclaimer</a>
          </div>

          <div className="designed-by">
            <span>Designed with</span>
            <Heart size={14} className="heart-icon" />
            <span>for a Brighter Tomorrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
