import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config/api';
import './Gallery.css';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Folder,
  FolderOpen,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Filter,
  ExternalLink,
  Camera,
  Film,
  ArrowLeft,
  Search,
  Calendar,
  Eye,
  Users,
  Star
} from 'lucide-react';

const Gallery = ({ onNavigate = () => {}, initialFolderSlug = null }) => {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Folder navigation state: null = all folders directory, folder object = inside folder
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Category filter for the folders directory
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');

  // Media type filter when inside a folder: 'all', 'image', 'video'
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');

  // Fullscreen Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Fetch gallery folders and items from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [foldersRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gallery/folders`),
          fetch(`${API_BASE_URL}/api/gallery/items`)
        ]);

        const foldersData = await foldersRes.json();
        const itemsData = await itemsRes.json();

        const safeFolders = Array.isArray(foldersData) ? foldersData : [];
        const safeItems = Array.isArray(itemsData) ? itemsData : [];

        setFolders(safeFolders);
        setItems(safeItems);

        // If an initialFolderSlug was passed, open that folder directly
        if (initialFolderSlug) {
          const match = safeFolders.find((f) => f.slug === initialFolderSlug);
          if (match) {
            setSelectedFolder(match);
          }
        }
      } catch (err) {
        console.error('Error loading public gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialFolderSlug]);

  // Extract distinct categories from folders for the filter bar
  const categories = useMemo(() => {
    const set = new Set();
    folders.forEach((f) => {
      if (f.category && f.category.trim()) {
        set.add(f.category.trim());
      }
    });
    // If no custom categories exist, provide standard categories
    if (set.size === 0) {
      return ['All', 'Clubs & Activities', 'Campus & Infrastructure', 'Events & Celebrations', 'Sports & Athletics'];
    }
    return ['All', ...Array.from(set)];
  }, [folders]);

  // Filter folders by category and search keyword
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const cat = f.category || 'Clubs & Activities';
        if (cat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Search query filter
      if (folderSearchQuery.trim()) {
        const query = folderSearchQuery.toLowerCase();
        const nameMatch = f.name?.toLowerCase().includes(query);
        const descMatch = f.description?.toLowerCase().includes(query);
        const catMatch = f.category?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }
      return true;
    });
  }, [folders, selectedCategory, folderSearchQuery]);

  // Items inside the currently selected folder
  const currentFolderItems = useMemo(() => {
    if (!selectedFolder) return [];
    const fId = String(selectedFolder.id || selectedFolder._id);
    return items.filter((item) => String(item.folderId) === fId);
  }, [items, selectedFolder]);

  // Items filtered by media type ('all', 'image', 'video') inside folder
  const displayedItems = useMemo(() => {
    return currentFolderItems.filter((item) => {
      if (mediaTypeFilter === 'all') return true;
      return item.mediaType === mediaTypeFilter;
    });
  }, [currentFolderItems, mediaTypeFilter]);

  // Count photos and videos inside current folder
  const photoCount = useMemo(() => {
    return currentFolderItems.filter((i) => i.mediaType === 'image').length;
  }, [currentFolderItems]);

  const videoCount = useMemo(() => {
    return currentFolderItems.filter((i) => i.mediaType === 'video').length;
  }, [currentFolderItems]);

  // Open folder handler
  const handleOpenFolder = (folder) => {
    setSelectedFolder(folder);
    setMediaTypeFilter('all');
    window.scrollTo({ top: 340, behavior: 'smooth' });
  };

  // Back to all folders handler
  const handleBackToAllFolders = () => {
    setSelectedFolder(null);
    setLightboxIndex(null);
    window.scrollTo({ top: 340, behavior: 'smooth' });
  };

  // Lightbox handlers
  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrevLightbox = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(displayedItems.length - 1);
    }
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < displayedItems.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrevLightbox(e);
      if (e.key === 'ArrowRight') handleNextLightbox(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, displayedItems]);

  const activeLightboxItem = lightboxIndex !== null ? displayedItems[lightboxIndex] : null;

  return (
    <div className="public-gallery-page">
      {/* Hero Header */}
      <section className="gallery-hero-banner">
        <div className="gallery-hero-overlay"></div>
        <div className="gallery-hero-inner">
          <div className="gallery-hero-content">
            <div className="hero-pill-badge">
              <Camera size={14} className="hero-camera-icon" />
              <span>PM SHRI MEDIA &amp; CAMPUS ARCHIVE</span>
            </div>
            <h1>
              Photo &amp; Video <span className="gallery-title-accent">Gallery</span>
            </h1>
            <p className="gallery-hero-desc">
              Explore the vibrant life at <strong>PM SHRI Moharcherra H.S. School</strong> — our campus, activities, achievements, and memorable moments through photos and videos.
            </p>

            <div className="gallery-hero-highlights">
              <div className="hero-highlight-item">
                <div className="highlight-icon-box">
                  <ImageIcon size={20} />
                </div>
                <div className="highlight-text-col">
                  <span className="highlight-number">{folders.length > 0 ? `${folders.length}+` : '12+'}</span>
                  <span className="highlight-label">Albums</span>
                </div>
              </div>

              <div className="hero-highlight-item">
                <div className="highlight-icon-box">
                  <Users size={20} />
                </div>
                <div className="highlight-text-col">
                  <span className="highlight-number">{items.length > 0 ? `${items.length}+` : '250+'}</span>
                  <span className="highlight-label">Memories</span>
                </div>
              </div>

              <div className="hero-highlight-item">
                <div className="highlight-icon-box star-box">
                  <Star size={20} fill="#f59e0b" color="#f59e0b" />
                </div>
                <div className="highlight-text-col">
                  <span className="highlight-number highlight-title-text">School Life</span>
                  <span className="highlight-label">In Pictures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="gallery-main-container">
        {loading ? (
          <div className="public-gallery-loading">
            <div className="gallery-spinner"></div>
            <p>Loading school albums from Cloudinary & database...</p>
          </div>
        ) : !selectedFolder ? (
          /* ========================================================= */
          /* VIEW 1: ALL FOLDERS DIRECTORY VIEW                        */
          /* ========================================================= */
          <div className="public-folders-directory">
            {/* Category Filter & Search Bar */}
            <div className="albums-filter-bar">
              {/* Category Pills */}
              <div className="categories-scroll-track">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const countForCat =
                    cat === 'All'
                      ? folders.length
                      : folders.filter(
                          (f) => (f.category || 'Clubs & Activities').toLowerCase() === cat.toLowerCase()
                        ).length;

                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-pill-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat === 'All' ? 'All Albums' : cat}</span>
                      <span className="category-count-tag">{countForCat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Folder Search Input */}
              <div className="folder-search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={folderSearchQuery}
                  onChange={(e) => setFolderSearchQuery(e.target.value)}
                  className="folder-search-input"
                />
                {folderSearchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setFolderSearchQuery('')}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Folder Directory Header */}
            <div className="folders-grid-header">
              <div className="header-text">
                <h3>School Albums ({filteredFolders.length})</h3>
                <p>Click any folder to view its photos, videos, and campus activities.</p>
              </div>
            </div>

            {/* Folders Cards Grid */}
            {filteredFolders.length === 0 ? (
              <div className="public-empty-gallery">
                <Folder size={48} className="empty-icon" />
                <h3>No Albums Found</h3>
                <p>No albums matched your current category or search criteria.</p>
                {(selectedCategory !== 'All' || folderSearchQuery) && (
                  <button
                    type="button"
                    className="view-all-albums-btn"
                    onClick={() => {
                      setSelectedCategory('All');
                      setFolderSearchQuery('');
                    }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="public-folders-grid">
                {filteredFolders.map((folder) => {
                  const fId = folder.id || folder._id;
                  const count = folder.itemCount || 0;
                  const cover =
                    folder.coverImage ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
                  const categoryName = folder.category || 'Clubs & Activities';

                  return (
                    <div
                      key={fId}
                      className="public-folder-card"
                      onClick={() => handleOpenFolder(folder)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleOpenFolder(folder);
                        }
                      }}
                    >
                      <div className="folder-visual-wrap">
                        <img
                          src={cover}
                          alt={folder.name}
                          className="folder-cover-image"
                          loading="lazy"
                        />
                        <div className="folder-hover-overlay">
                          <span className="open-folder-pill">
                            <FolderOpen size={16} /> Open Folder
                          </span>
                        </div>

                        {/* Top Badges */}
                        <div className="folder-badge-row">
                          <span className="folder-cat-badge">
                            <Sparkles size={11} /> {categoryName}
                          </span>
                          <span className="folder-count-badge">
                            <Layers size={11} /> {count} {count === 1 ? 'Item' : 'Items'}
                          </span>
                        </div>
                      </div>

                      <div className="folder-card-body">
                        <div className="folder-name-row">
                          <Folder size={18} className="folder-accent-icon" />
                          <h4 className="folder-title">{folder.name}</h4>
                        </div>
                        {folder.description ? (
                          <p className="folder-desc">{folder.description}</p>
                        ) : (
                          <p className="folder-desc empty">No description provided</p>
                        )}

                        <div className="folder-card-footer">
                          <span className="folder-year-tag">
                            <Calendar size={12} /> {folder.academicYear || '2026–27'}
                          </span>
                          <span className="folder-enter-action">
                            View Contents →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: INSIDE FOLDER VIEW (PHOTOS & VIDEOS)              */
          /* ========================================================= */
          <div className="public-inside-folder">
            {/* Breadcrumb Navigation Bar */}
            <div className="inside-folder-nav">
              <button
                type="button"
                className="back-btn"
                onClick={handleBackToAllFolders}
              >
                <ArrowLeft size={16} />
                <span>Back to All Folders</span>
              </button>

              <div className="breadcrumbs-track">
                <span className="crumb-root" onClick={handleBackToAllFolders}>
                  All Albums
                </span>
                <span className="crumb-sep">/</span>
                <span className="crumb-category">
                  {selectedFolder.category || 'Clubs & Activities'}
                </span>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{selectedFolder.name}</span>
              </div>
            </div>

            {/* Folder Header Detail Card */}
            <div className="folder-detail-hero">
              <div className="folder-hero-thumb">
                <img
                  src={
                    selectedFolder.coverImage ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={selectedFolder.name}
                  className="folder-hero-cover-img"
                />
              </div>

              <div className="folder-hero-content">
                <div className="folder-hero-badges">
                  <span className="folder-hero-pill category">
                    <Sparkles size={12} /> {selectedFolder.category || 'Clubs & Activities'}
                  </span>
                  <span className="folder-hero-pill year">
                    <Calendar size={12} /> {selectedFolder.academicYear || '2026–27'}
                  </span>
                </div>

                <h2>{selectedFolder.name}</h2>
                {selectedFolder.description && (
                  <p className="folder-hero-description">{selectedFolder.description}</p>
                )}

                <div className="folder-hero-stats">
                  <span className="stat-pill">
                    <Layers size={13} /> {currentFolderItems.length} Total Media
                  </span>
                  <span className="stat-pill">
                    <ImageIcon size={13} /> {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                  </span>
                  <span className="stat-pill">
                    <Film size={13} /> {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                  </span>
                </div>
              </div>

              {/* Media Filter Toggles (All / Photos / Videos) */}
              <div className="folder-media-toggles">
                <button
                  type="button"
                  className={`toggle-tab ${mediaTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMediaTypeFilter('all')}
                >
                  All ({currentFolderItems.length})
                </button>
                <button
                  type="button"
                  className={`toggle-tab ${mediaTypeFilter === 'image' ? 'active' : ''}`}
                  onClick={() => setMediaTypeFilter('image')}
                >
                  <ImageIcon size={14} /> Photos ({photoCount})
                </button>
                <button
                  type="button"
                  className={`toggle-tab ${mediaTypeFilter === 'video' ? 'active' : ''}`}
                  onClick={() => setMediaTypeFilter('video')}
                >
                  <Film size={14} /> Videos ({videoCount})
                </button>
              </div>
            </div>

            {/* Folder Media Grid */}
            {displayedItems.length === 0 ? (
              <div className="public-empty-gallery">
                <Camera size={48} className="empty-icon" />
                <h3>No Media in "{selectedFolder.name}" Yet</h3>
                <p>
                  {mediaTypeFilter !== 'all'
                    ? `There are no ${mediaTypeFilter === 'video' ? 'videos' : 'photos'} in this album.`
                    : 'Photos and videos will be displayed here once uploaded by the school administration.'}
                </p>
                <div className="empty-actions">
                  {mediaTypeFilter !== 'all' && (
                    <button
                      type="button"
                      className="view-all-albums-btn"
                      onClick={() => setMediaTypeFilter('all')}
                    >
                      Show All Media
                    </button>
                  )}
                  <button
                    type="button"
                    className="view-all-albums-btn secondary"
                    onClick={handleBackToAllFolders}
                  >
                    <ArrowLeft size={15} /> Back to All Folders
                  </button>
                </div>
              </div>
            ) : (
              <div className="public-media-grid">
                {displayedItems.map((item, index) => {
                  const isVideo = item.mediaType === 'video';
                  return (
                    <div
                      key={item.id || item._id || index}
                      className={`public-media-card ${isVideo ? 'video-card' : ''}`}
                      onClick={() => handleOpenLightbox(index)}
                    >
                      <div className="media-visual-wrapper">
                        {isVideo ? (
                          <video
                            src={item.url}
                            className="media-visual"
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title || 'School Gallery Photo'}
                            className="media-visual"
                            loading="lazy"
                          />
                        )}

                        <div className="media-visual-overlay">
                          <div className="overlay-top">
                            <span className="media-type-tag">
                              {isVideo ? (
                                <>
                                  <Film size={12} /> Video
                                </>
                              ) : (
                                <>
                                  <ImageIcon size={12} /> Photo
                                </>
                              )}
                            </span>
                            <span className="media-folder-pill">{item.folderName || selectedFolder.name}</span>
                          </div>

                          {isVideo ? (
                            <div className="overlay-play-btn">
                              <Play size={24} fill="#ffffff" color="#ffffff" />
                            </div>
                          ) : (
                            <div className="overlay-zoom-icon">
                              <Camera size={20} />
                            </div>
                          )}

                          <div className="overlay-bottom">
                            <h4>{item.title}</h4>
                            {item.caption && <p>{item.caption}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="inside-folder-bottom-bar">
              <button
                type="button"
                className="bottom-back-btn"
                onClick={handleBackToAllFolders}
              >
                <ArrowLeft size={16} />
                <span>Return to All Folders</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen HD Lightbox Modal */}
      {activeLightboxItem && (
        <div className="public-lightbox-backdrop" onClick={handleCloseLightbox}>
          <button
            type="button"
            className="lightbox-close-cross"
            onClick={handleCloseLightbox}
            title="Close (Esc)"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            className="lightbox-nav-arrow prev"
            onClick={handlePrevLightbox}
            title="Previous (Left Arrow)"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            type="button"
            className="lightbox-nav-arrow next"
            onClick={handleNextLightbox}
            title="Next (Right Arrow)"
          >
            <ChevronRight size={28} />
          </button>

          <div className="public-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-media-box">
              {activeLightboxItem.mediaType === 'video' ? (
                <video
                  src={activeLightboxItem.url}
                  controls
                  autoPlay
                  className="lightbox-active-media"
                />
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.title}
                  className="lightbox-active-media"
                />
              )}
            </div>

            <div className="lightbox-caption-bar">
              <div className="caption-text-area">
                <div className="caption-tag-row">
                  <span className="caption-folder-badge">📁 {activeLightboxItem.folderName || selectedFolder?.name}</span>
                  <span className="caption-index-badge">
                    {lightboxIndex + 1} of {displayedItems.length}
                  </span>
                </div>
                <h3>{activeLightboxItem.title}</h3>
                {activeLightboxItem.caption && <p>{activeLightboxItem.caption}</p>}
              </div>

              <a
                href={activeLightboxItem.url}
                target="_blank"
                rel="noreferrer"
                className="lightbox-direct-link"
              >
                <span>View Full HD</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
