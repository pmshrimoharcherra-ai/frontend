import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import './AdminGallery.css';
import {
  FolderPlus,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Folder,
  FolderOpen,
  Trash2,
  Pencil,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Film,
  Plus,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Play,
  Camera,
  Star,
  RotateCcw,
  Check
} from 'lucide-react';

const AdminGallery = () => {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null); // null = all folders view
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all'); // 'all', 'image', 'video'
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderSaving, setFolderSaving] = useState(false);
  const [folderForm, setFolderForm] = useState({
    name: '',
    category: 'Clubs & Activities',
    description: '',
    coverImage: '',
    coverFile: null,
    previewCover: '',
    parentId: null,
    parentName: ''
  });
  const coverFileInputRef = useRef(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadData, setUploadData] = useState({
    folderId: '',
    title: '',
    caption: '',
    file: null,
    previewUrl: null,
    fileType: 'image'
  });

  // Edit Media Item Modal state
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [itemEditForm, setItemEditForm] = useState({
    title: '',
    caption: '',
    folderId: ''
  });

  const [previewItem, setPreviewItem] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch folders and items
  const fetchFoldersAndItems = async () => {
    try {
      setLoading(true);
      const [foldersRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/gallery/folders`),
        fetch(`${API_BASE_URL}/api/gallery/items`)
      ]);

      const foldersData = await foldersRes.json();
      const itemsData = await itemsRes.json();

      setFolders(Array.isArray(foldersData) ? foldersData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      showToast('Error connecting to gallery API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoldersAndItems();
  }, []);

  // Update selectedFolder reference if folders reload
  useEffect(() => {
    if (selectedFolder) {
      const updated = folders.find((f) => (f.id || f._id) === (selectedFolder.id || selectedFolder._id));
      if (updated) setSelectedFolder(updated);
    }
  }, [folders]);

  // Handle Create / Edit Folder
  const handleOpenFolderModal = (folderToEdit = null, parentForSubfolder = null) => {
    if (folderToEdit) {
      setEditingFolder(folderToEdit);
      setFolderForm({
        name: folderToEdit.name,
        category: folderToEdit.category || 'Clubs & Activities',
        description: folderToEdit.description || '',
        coverImage: folderToEdit.coverImage || '',
        coverFile: null,
        previewCover: folderToEdit.coverImage || '',
        parentId: folderToEdit.parentId || null,
        parentName: folderToEdit.parentName || ''
      });
    } else if (parentForSubfolder) {
      setEditingFolder(null);
      setFolderForm({
        name: '',
        category: parentForSubfolder.category || 'Clubs & Activities',
        description: '',
        coverImage: '',
        coverFile: null,
        previewCover: '',
        parentId: parentForSubfolder.id || parentForSubfolder._id,
        parentName: parentForSubfolder.name
      });
    } else {
      setEditingFolder(null);
      setFolderForm({
        name: '',
        category: 'Clubs & Activities',
        description: '',
        coverImage: '',
        coverFile: null,
        previewCover: '',
        parentId: null,
        parentName: ''
      });
    }
    setShowFolderModal(true);
  };

  // Select image file for folder thumbnail
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setFolderForm((prev) => ({
      ...prev,
      coverFile: file,
      previewCover: localUrl
    }));
  };

  // Set any photo directly as folder cover
  const handleSetAsFolderCover = async (item, e) => {
    e.stopPropagation();
    if (!selectedFolder) return;
    try {
      const folderId = selectedFolder.id || selectedFolder._id;
      const res = await fetch(`${API_BASE_URL}/api/gallery/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: item.url })
      });
      if (!res.ok) throw new Error('Failed to update album thumbnail');
      const updated = await res.json();
      setFolders((prev) =>
        prev.map((f) => ((f.id || f._id) === folderId ? { ...f, coverImage: item.url } : f))
      );
      setSelectedFolder((prev) => (prev ? { ...prev, coverImage: item.url } : prev));
      showToast(`Album thumbnail set to "${item.title || 'photo'}"!`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;

    try {
      setFolderSaving(true);
      let finalCoverUrl = folderForm.coverImage;

      // If a local image file was picked for the thumbnail, upload directly to Cloudinary
      if (folderForm.coverFile) {
        const coverData = new FormData();
        coverData.append('coverImage', folderForm.coverFile);

        const uploadRes = await fetch(`${API_BASE_URL}/api/gallery/upload-cover`, {
          method: 'POST',
          body: coverData
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload thumbnail to Cloudinary');
        }
        const uploadJson = await uploadRes.json();
        finalCoverUrl = uploadJson.url;
      }

      const url = editingFolder
        ? `${API_BASE_URL}/api/gallery/folders/${editingFolder.id || editingFolder._id}`
        : `${API_BASE_URL}/api/gallery/folders`;

      const method = editingFolder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderForm.name,
          category: folderForm.category,
          description: folderForm.description,
          coverImage: finalCoverUrl,
          parentId: folderForm.parentId || null
        })
      });

      if (!res.ok) throw new Error('Failed to save folder');
      const saved = await res.json();

      if (editingFolder) {
        setFolders((prev) =>
          prev.map((f) => ((f.id || f._id) === (saved.id || saved._id) ? { ...f, ...saved, coverImage: finalCoverUrl || f.coverImage } : f))
        );
        if (selectedFolder && (selectedFolder.id || selectedFolder._id) === (saved.id || saved._id)) {
          setSelectedFolder((prev) => ({ ...prev, ...saved, coverImage: finalCoverUrl || prev.coverImage }));
        }
        showToast(`Folder "${saved.name}" updated!`);
      } else {
        setFolders((prev) => [saved, ...prev]);
        // Also update subfolderCount of parent if it was a subfolder
        if (saved.parentId) {
          setFolders((prev) =>
            prev.map((f) =>
              (f.id || f._id) === saved.parentId
                ? { ...f, subfolderCount: (f.subfolderCount || 0) + 1 }
                : f
            )
          );
        }
        showToast(`Folder "${saved.name}" created successfully!`);
      }

      setShowFolderModal(false);
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      setFolderSaving(false);
    }
  };

  // Handle Delete Folder
  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    const isSub = Boolean(folder.parentId);
    const confirmPrompt = isSub
      ? `Are you sure you want to delete subfolder "${folder.name}" and all its photos & videos? This action cannot be undone.`
      : `Are you sure you want to delete folder "${folder.name}", all its subfolders, and all associated media? This action cannot be undone.`;

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    try {
      const folderId = folder.id || folder._id;
      const res = await fetch(`${API_BASE_URL}/api/gallery/folders/${folderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete folder');

      // Find all IDs to remove (the folder itself and any child subfolders)
      const subfolderIds = folders
        .filter((f) => f.parentId === folderId)
        .map((f) => f.id || f._id);
      const allRemovedIds = new Set([folderId, ...subfolderIds]);

      setFolders((prev) =>
        prev
          .filter((f) => !allRemovedIds.has(f.id || f._id))
          .map((f) => {
            if (folder.parentId && (f.id || f._id) === folder.parentId) {
              return {
                ...f,
                subfolderCount: Math.max(0, (f.subfolderCount || 1) - 1)
              };
            }
            return f;
          })
      );

      setItems((prev) => prev.filter((it) => !allRemovedIds.has(it.folderId)));

      if (selectedFolder && allRemovedIds.has(selectedFolder.id || selectedFolder._id)) {
        if (folder.parentId) {
          const parentF = folders.find((f) => (f.id || f._id) === folder.parentId);
          setSelectedFolder(parentF || null);
        } else {
          setSelectedFolder(null);
        }
      }
      showToast(`Folder "${folder.name}" deleted successfully.`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Handle Upload Modal Open
  const handleOpenUploadModal = (presetFolder = null) => {
    const targetFolder = presetFolder || selectedFolder || folders[0];
    setUploadData({
      folderId: targetFolder ? (targetFolder.id || targetFolder._id) : '',
      title: '',
      caption: '',
      file: null,
      previewUrl: null,
      fileType: 'image'
    });
    setShowUploadModal(true);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);

    setUploadData((prev) => ({
      ...prev,
      file,
      previewUrl,
      fileType: isVideo ? 'video' : 'image',
      title: prev.title || file.name.replace(/\.[^/.]+$/, '')
    }));
  };

  // Submit Upload to Backend & Cloudinary
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.folderId) {
      showToast('Please select a file and a destination folder');
      return;
    }

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append('mediaFile', uploadData.file);
      formData.append('folderId', uploadData.folderId);
      formData.append('title', uploadData.title);
      formData.append('caption', uploadData.caption);

      const res = await fetch(`${API_BASE_URL}/api/gallery/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cloudinary upload failed');

      // Add to items state
      setItems((prev) => [data.item, ...prev]);

      // Update folder count and set coverImage to this first uploaded image if not already set
      setFolders((prev) =>
        prev.map((f) => {
          const fId = f.id || f._id;
          if (fId === uploadData.folderId) {
            return {
              ...f,
              itemCount: (f.itemCount || 0) + 1,
              coverImage: f.coverImage || (data.item.mediaType === 'image' ? data.item.url : f.coverImage)
            };
          }
          const targetF = prev.find((pf) => (pf.id || pf._id) === uploadData.folderId);
          if (targetF?.parentId && fId === targetF.parentId && !f.coverImage && data.item.mediaType === 'image') {
            return {
              ...f,
              coverImage: data.item.url
            };
          }
          return f;
        })
      );

      if (selectedFolder && (selectedFolder.id || selectedFolder._id) === uploadData.folderId) {
        setSelectedFolder((prev) =>
          prev
            ? {
                ...prev,
                itemCount: (prev.itemCount || 0) + 1,
                coverImage: prev.coverImage || (data.item.mediaType === 'image' ? data.item.url : prev.coverImage)
              }
            : prev
        );
      }

      showToast(data.message || 'File uploaded to Cloudinary successfully!');
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload error:', err);
      showToast(`Upload failed: ${err.message}`);
    } finally {
      setUploadProgress(false);
    }
  };

  // Delete Media Item
  const handleDeleteItem = async (item, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${item.title || 'this item'}" from the gallery and Cloudinary?`)) {
      return;
    }

    try {
      const itemId = item.id || item._id;
      const res = await fetch(`${API_BASE_URL}/api/gallery/items/${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete media item');

      setItems((prev) => prev.filter((it) => (it.id || it._id) !== itemId));

      // Decrement folder count & update cover if deleted item was the cover
      setFolders((prev) =>
        prev.map((f) => {
          const fId = f.id || f._id;
          if (fId === item.folderId) {
            let nextCover = f.coverImage;
            if (f.coverImage === item.url) {
              const remainingImages = items.filter(
                (it) => (it.id || it._id) !== itemId && it.folderId === item.folderId && it.mediaType === 'image'
              );
              nextCover = remainingImages.length > 0 ? remainingImages[remainingImages.length - 1].url : '';
            }
            return {
              ...f,
              itemCount: Math.max(0, (f.itemCount || 1) - 1),
              coverImage: nextCover
            };
          }
          return f;
        })
      );

      if (previewItem && (previewItem.id || previewItem._id) === itemId) {
        setPreviewItem(null);
      }
      showToast('Media item removed successfully.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Open Edit Media Modal
  const handleOpenEditItemModal = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setItemEditForm({
      title: item.title || '',
      caption: item.caption || '',
      folderId: item.folderId || (selectedFolder ? (selectedFolder.id || selectedFolder._id) : '')
    });
    setShowEditItemModal(true);
  };

  // Save Edited Media Title / Details
  const handleSaveItemEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setItemSaving(true);
      const itemId = editingItem.id || editingItem._id;
      const res = await fetch(`${API_BASE_URL}/api/gallery/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: itemEditForm.title,
          caption: itemEditForm.caption,
          folderId: itemEditForm.folderId
        })
      });

      if (!res.ok) throw new Error('Failed to update media details');
      const data = await res.json();
      const updated = data.item;

      // Update in items state
      setItems((prev) =>
        prev.map((it) => ((it.id || it._id) === itemId ? { ...it, ...updated } : it))
      );

      // Update previewItem if currently open
      if (previewItem && (previewItem.id || previewItem._id) === itemId) {
        setPreviewItem((prev) => ({ ...prev, ...updated }));
      }

      showToast(`Media title updated to "${updated.title}"!`);
      setShowEditItemModal(false);
    } catch (err) {
      console.error('Error saving media:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setItemSaving(false);
    }
  };

  // Root folders vs subfolders
  const rootFolders = folders.filter((f) => !f.parentId);
  const parentFolder = selectedFolder?.parentId
    ? folders.find((f) => (f.id || f._id) === selectedFolder.parentId)
    : null;
  const currentSubfolders = selectedFolder
    ? folders.filter((f) => f.parentId === (selectedFolder.id || selectedFolder._id))
    : [];

  // Filter items for currently selected folder
  const displayedItems = items.filter((item) => {
    if (selectedFolder) {
      const fId = selectedFolder.id || selectedFolder._id;
      if (item.folderId !== fId) return false;
    }
    if (mediaTypeFilter !== 'all' && item.mediaType !== mediaTypeFilter) {
      return false;
    }
    return true;
  });

  const totalImages = items.filter((it) => it.mediaType === 'image').length;
  const totalVideos = items.filter((it) => it.mediaType === 'video').length;

  return (
    <div className="admin-gallery-wrapper">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="gallery-toast">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-gallery-header">
        <div className="header-left">
          <h2>School Media & Event Gallery</h2>
          <p className="gallery-subtitle">
            Create albums/folders and upload high-resolution campus photos and event videos directly to Cloudinary.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="action-btn-outline"
            onClick={() => handleOpenFolderModal(null, selectedFolder && !selectedFolder.parentId ? selectedFolder : null)}
          >
            <FolderPlus size={16} />
            <span>{selectedFolder && !selectedFolder.parentId ? 'New Subfolder' : 'New Folder / Album'}</span>
          </button>

          <button
            type="button"
            className="action-btn-primary"
            onClick={() => handleOpenUploadModal(selectedFolder)}
          >
            <Upload size={16} />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="gallery-metrics-row">
        <div className="metric-box">
          <div className="metric-icon-wrap folders">
            <Folder size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-num">{rootFolders.length}</span>
            <span className="metric-name">Event Albums / Folders</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap photos">
            <ImageIcon size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-num">{totalImages}</span>
            <span className="metric-name">Campus Photos</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap videos">
            <VideoIcon size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-num">{totalVideos}</span>
            <span className="metric-name">Recorded Videos</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap cloud">
            <Cloud size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-num active-cloud">Connected</span>
            <span className="metric-name">Cloudinary CDN Active</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation if inside folder */}
      {selectedFolder ? (
        <div className="folder-detail-header-card">
          <div className="folder-nav-left">
            <button
              type="button"
              className="back-to-folders-btn"
              onClick={() => setSelectedFolder(null)}
            >
              <ArrowLeft size={16} />
              <span>All Folders</span>
            </button>
            {parentFolder && (
              <>
                <span className="nav-separator">/</span>
                <button
                  type="button"
                  className="breadcrumb-parent-btn"
                  onClick={() => setSelectedFolder(parentFolder)}
                >
                  <FolderOpen size={14} />
                  <span>{parentFolder.name}</span>
                </button>
              </>
            )}
            <span className="nav-separator">/</span>
            <div className="active-folder-meta">
              <div className="active-folder-title-row">
                <h3>{selectedFolder.name}</h3>
                {selectedFolder.parentId ? (
                  <span className="subfolder-tag">
                    <Sparkles size={11} /> Subfolder
                  </span>
                ) : (
                  currentSubfolders.length > 0 && (
                    <span className="subfolder-count-pill">
                      {currentSubfolders.length} {currentSubfolders.length === 1 ? 'Subfolder' : 'Subfolders'}
                    </span>
                  )
                )}
              </div>
              {selectedFolder.description && (
                <p>{selectedFolder.description}</p>
              )}
            </div>
          </div>

          <div className="folder-actions-right">
            {!selectedFolder.parentId && (
              <button
                type="button"
                className="action-btn-subfolder"
                onClick={() => handleOpenFolderModal(null, selectedFolder)}
              >
                <FolderPlus size={15} />
                <span>New Subfolder</span>
              </button>
            )}

            {/* Filter pills: All, Photos, Videos */}
            <div className="media-type-pills">
              <button
                type="button"
                className={`type-pill ${mediaTypeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setMediaTypeFilter('all')}
              >
                All ({displayedItems.length})
              </button>
              <button
                type="button"
                className={`type-pill ${mediaTypeFilter === 'image' ? 'active' : ''}`}
                onClick={() => setMediaTypeFilter('image')}
              >
                <ImageIcon size={13} /> Photos
              </button>
              <button
                type="button"
                className={`type-pill ${mediaTypeFilter === 'video' ? 'active' : ''}`}
                onClick={() => setMediaTypeFilter('video')}
              >
                <VideoIcon size={13} /> Videos
              </button>
            </div>

            <button
              type="button"
              className="action-btn-primary mini"
              onClick={() => handleOpenUploadModal(selectedFolder)}
            >
              <Plus size={15} />
              <span>Add to Folder</span>
            </button>
          </div>
        </div>
      ) : (
        /* Folder Grid View */
        <div className="folders-section">
          <div className="section-title-row">
            <h4>Gallery Folders ({rootFolders.length})</h4>
            <span className="section-hint">Select a folder to view subfolders and upload respective media</span>
          </div>

          {loading ? (
            <div className="gallery-loading">
              <Loader2 size={32} className="spin-icon" />
              <p>Loading school albums from Cloudinary & database...</p>
            </div>
          ) : (
            <div className="folders-grid">
              {rootFolders.map((folder) => {
                const fId = folder.id || folder._id;
                const count = folder.itemCount || 0;
                const subCount = folder.subfolderCount || 0;
                const directImages = items.filter((it) => it.folderId === fId && it.mediaType === 'image');
                const subIds = folders.filter((f) => f.parentId === fId).map((f) => f.id || f._id);
                const subImages = items.filter((it) => subIds.includes(it.folderId) && it.mediaType === 'image');
                const firstAvailablePhoto = directImages[directImages.length - 1] || directImages[0] || subImages[subImages.length - 1] || subImages[0];
                const folderCover = folder.coverImage || firstAvailablePhoto?.url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={fId}
                    className="folder-card"
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <div className="folder-cover-wrap">
                      <img
                        src={folderCover}
                        alt={folder.name}
                        className="folder-cover-img"
                        loading="lazy"
                      />
                      <div className="folder-cover-overlay">
                        <span className="open-folder-pill">
                          <FolderOpen size={14} /> Open Folder
                        </span>
                      </div>
                      <div className="folder-badges-top-right">
                        {subCount > 0 && (
                          <span className="folder-sub-count-badge">
                            📂 {subCount} {subCount === 1 ? 'Subfolder' : 'Subfolders'}
                          </span>
                        )}
                        <span className="folder-count-badge">
                          {count} {count === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                    </div>

                    <div className="folder-content">
                      <h4 className="folder-name">{folder.name}</h4>
                      {folder.description ? (
                        <p className="folder-desc">{folder.description}</p>
                      ) : (
                        <p className="folder-desc empty">Click to explore albums and subfolders</p>
                      )}
                    </div>

                    <div className="folder-card-footer">
                      <button
                        type="button"
                        className="folder-btn change-thumb"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFolderModal(folder);
                        }}
                        title="Edit Album Thumbnail / Cover"
                      >
                        <Camera size={14} />
                      </button>
                      <button
                        type="button"
                        className="folder-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFolderModal(folder);
                        }}
                        title="Edit Folder Details"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="folder-btn delete"
                        onClick={(e) => handleDeleteFolder(folder, e)}
                        title="Delete Folder and Subfolders"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inside Folder View: Subfolders / Campaigns Section (If this is a parent folder) */}
      {selectedFolder && !selectedFolder.parentId && (
        <div className="subfolders-section">
          <div className="subfolders-header">
            <div className="subfolders-header-left">
              <FolderOpen size={18} className="subfolder-header-icon" />
              <h4>Subfolders ({currentSubfolders.length})</h4>
              <span className="subfolders-header-hint">
                Organized events & collections under {selectedFolder.name}
              </span>
            </div>
            <button
              type="button"
              className="action-btn-outline mini"
              onClick={() => handleOpenFolderModal(null, selectedFolder)}
            >
              <FolderPlus size={14} />
              <span>+ New Subfolder</span>
            </button>
          </div>

          {currentSubfolders.length > 0 ? (
            <div className="subfolders-grid">
              {currentSubfolders.map((sub) => {
                const subId = sub.id || sub._id;
                const subItemCount = sub.itemCount || 0;
                const subImages = items.filter((it) => it.folderId === subId && it.mediaType === 'image');
                const subFirstPhoto = subImages[subImages.length - 1] || subImages[0];
                const subCover = sub.coverImage || subFirstPhoto?.url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={subId}
                    className="subfolder-card"
                    onClick={() => setSelectedFolder(sub)}
                  >
                    <div className="subfolder-thumb-wrap">
                      <img
                        src={subCover}
                        alt={sub.name}
                        className="subfolder-thumb-img"
                        loading="lazy"
                      />
                      <div className="subfolder-overlay">
                        <span className="subfolder-open-pill">
                          <FolderOpen size={13} /> Open Subfolder
                        </span>
                      </div>
                      <span className="subfolder-badge">
                        {subItemCount} {subItemCount === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    <div className="subfolder-info">
                      <h5 className="subfolder-title">{sub.name}</h5>
                      {sub.description ? (
                        <p className="subfolder-desc">{sub.description}</p>
                      ) : (
                        <p className="subfolder-desc empty">Subfolder</p>
                      )}
                    </div>

                    <div className="subfolder-card-footer">
                      <button
                        type="button"
                        className="subfolder-action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFolderModal(sub);
                        }}
                        title="Edit Subfolder Details"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="subfolder-action-btn delete"
                        onClick={(e) => handleDeleteFolder(sub, e)}
                        title="Delete Subfolder"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-subfolders-prompt">
              <div className="empty-subfolders-icon-box">
                <FolderPlus size={24} />
              </div>
              <div className="empty-subfolders-text">
                <h5>Organize with Subfolders</h5>
                <p>
                  You can create subfolders (e.g., "Tree Plantation Drive 2026", "Clean Campus Drive") to organize photos and videos inside {selectedFolder.name}.
                </p>
              </div>
              <button
                type="button"
                className="create-first-subfolder-btn"
                onClick={() => handleOpenFolderModal(null, selectedFolder)}
              >
                <Plus size={14} />
                <span>Create Subfolder</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Media Items Grid (Inside Folder or All Media) */}
      {selectedFolder && (
        <div className="media-items-section">
          {displayedItems.length === 0 ? (
            <div className="empty-media-state">
              <ImageIcon size={48} className="empty-icon" />
              <h5>No Media in this Folder Yet</h5>
              <p>Upload photos and videos directly into "{selectedFolder.name}" using Cloudinary.</p>
              <button
                type="button"
                className="action-btn-primary"
                onClick={() => handleOpenUploadModal(selectedFolder)}
              >
                <Upload size={16} />
                <span>Upload First Photo / Video</span>
              </button>
            </div>
          ) : (
            <div className="media-grid">
              {displayedItems.map((item) => {
                const itemId = item.id || item._id;
                const isVideo = item.mediaType === 'video';
                const isCurrentCover = selectedFolder?.coverImage === item.url;
                return (
                  <div
                    key={itemId}
                    className={`media-card ${isVideo ? 'is-video' : ''}`}
                    onClick={() => setPreviewItem(item)}
                  >
                    <div className="media-thumb-wrap">
                      {isVideo ? (
                        <video
                          src={item.url}
                          className="media-thumb-img"
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="media-thumb-img"
                          loading="lazy"
                        />
                      )}

                      <div className="media-type-indicator">
                        {isVideo ? <Film size={13} /> : <ImageIcon size={13} />}
                        <span>{isVideo ? 'Video' : item.format?.toUpperCase() || 'Photo'}</span>
                      </div>

                      {isVideo && (
                        <div className="video-play-center">
                          <Play size={20} fill="#ffffff" color="#ffffff" />
                        </div>
                      )}

                      {!isVideo && (
                        <button
                          type="button"
                          className={`media-cover-badge-btn ${isCurrentCover ? 'is-active-cover' : ''}`}
                          onClick={(e) => handleSetAsFolderCover(item, e)}
                          title={isCurrentCover ? "Current Album Thumbnail" : "Set as Album Thumbnail"}
                        >
                          <Star size={12} fill={isCurrentCover ? "#f59e0b" : "transparent"} color={isCurrentCover ? "#f59e0b" : "#ffffff"} />
                          <span>{isCurrentCover ? "Cover" : "Set Cover"}</span>
                        </button>
                      )}

                      <div className="media-top-action-btns">
                        <button
                          type="button"
                          className="media-card-action-btn edit"
                          onClick={(e) => handleOpenEditItemModal(item, e)}
                          title="Edit Image Title & Details"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          className="media-card-action-btn delete"
                          onClick={(e) => handleDeleteItem(item, e)}
                          title="Delete from Gallery and Cloudinary"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="media-info-box">
                      <div className="media-title-row">
                        <h5 className="media-title" title={item.title}>
                          {item.title || 'Untitled Media'}
                        </h5>
                        <button
                          type="button"
                          className="quick-edit-title-btn"
                          onClick={(e) => handleOpenEditItemModal(item, e)}
                          title="Edit Title"
                        >
                          <Pencil size={11} />
                        </button>
                      </div>
                      {item.caption && <p className="media-caption">{item.caption}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT FOLDER */}
      {showFolderModal && (
        <div className="gallery-modal-backdrop" onClick={() => !folderSaving && setShowFolderModal(false)}>
          <div className="gallery-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h4>
                  {editingFolder
                    ? editingFolder.parentId
                      ? 'Edit Subfolder'
                      : 'Edit Folder & Thumbnail'
                    : folderForm.parentId
                    ? 'Create Subfolder'
                    : 'Create New Gallery Folder'}
                </h4>
                <p>
                  {folderForm.parentId
                    ? `Organize media under "${folderForm.parentName}"`
                    : 'Organize campus photos and video albums with custom cover art'}
                </p>
              </div>
              <button
                type="button"
                className="close-dialog-btn"
                disabled={folderSaving}
                onClick={() => setShowFolderModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="dialog-form">
              {folderForm.parentId && (
                <div className="parent-folder-pill-card">
                  <div className="parent-pill-icon">
                    <FolderOpen size={18} />
                  </div>
                  <div className="parent-pill-content">
                    <span className="parent-pill-label">Parent Folder:</span>
                    <strong className="parent-pill-name">{folderForm.parentName}</strong>
                  </div>
                  <span className="parent-pill-sub-tag">Subfolder</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <FolderPlus size={14} className="label-icon" />
                  <span>{folderForm.parentId ? 'Subfolder Name' : 'Folder / Event Name'}</span>
                  <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    folderForm.parentId
                      ? 'e.g. Tree Plantation Drive 2026, Clean Campus Mission...'
                      : 'e.g. Eco Club, Annual Sports Meet 2026, DNA Club...'
                  }
                  className="form-input"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Layers size={14} className="label-icon" />
                  <span>Category / Filter Section</span>
                </label>
                <div className="select-input-wrap">
                  <select
                    className="form-input form-select"
                    value={folderForm.category}
                    onChange={(e) => setFolderForm({ ...folderForm, category: e.target.value })}
                  >
                    <option value="Clubs & Activities">Clubs & Activities</option>
                    <option value="Campus & Infrastructure">Campus & Infrastructure</option>
                    <option value="Events & Celebrations">Events & Celebrations</option>
                    <option value="Sports & Athletics">Sports & Athletics</option>
                    <option value="Academics & Labs">Academics & Labs</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* FOLDER THUMBNAIL / COVER SECTION */}
              <div className="form-group thumbnail-edit-group">
                <div className="thumbnail-label-row">
                  <label className="form-label">
                    <ImageIcon size={14} className="label-icon" />
                    <span>Folder Thumbnail / Cover Image</span>
                  </label>
                  <span className="optional-tag">Auto / Optional</span>
                </div>
                <p className="form-sub-hint">
                  If no thumbnail is uploaded, the <strong>first image of the folder</strong> will automatically become the thumbnail.
                </p>

                <div className="thumbnail-edit-preview-row">
                  {(() => {
                    const fId = editingFolder ? (editingFolder.id || editingFolder._id) : null;
                    const folderImages = fId ? items.filter((it) => it.folderId === fId && it.mediaType === 'image') : [];
                    const firstPhoto = folderImages.length > 0 ? folderImages[folderImages.length - 1] : null;
                    const currentDisplayImage = folderForm.previewCover || folderForm.coverImage || firstPhoto?.url;

                    if (currentDisplayImage) {
                      return (
                        <div className="thumbnail-preview-box">
                          <img
                            src={currentDisplayImage}
                            alt="Thumbnail preview"
                            className="thumbnail-preview-img"
                          />
                          {folderForm.coverFile ? (
                            <span className="thumbnail-status-pill new-upload">
                              <Check size={11} strokeWidth={3} /> New Image Ready
                            </span>
                          ) : folderForm.coverImage ? (
                            <span className="thumbnail-status-pill active-cover">
                              Custom Cover
                            </span>
                          ) : (
                            <span className="thumbnail-status-pill auto-cover">
                              <Sparkles size={10} /> Auto: 1st Photo
                            </span>
                          )}
                        </div>
                      );
                    }

                    // Empty / Auto state when no thumbnail uploaded and no images exist yet
                    return (
                      <div className="thumbnail-auto-empty-preview">
                        <div className="auto-cover-icon-wrap">
                          <Sparkles size={18} />
                        </div>
                        <span className="auto-cover-title">Automatic</span>
                        <span className="auto-cover-desc">Uses 1st uploaded image</span>
                        <span className="thumbnail-status-pill auto-cover">
                          Auto: 1st Image
                        </span>
                      </div>
                    );
                  })()}

                  <div className="thumbnail-actions-col">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleCoverFileChange}
                    />

                    <button
                      type="button"
                      className="thumbnail-upload-btn"
                      onClick={() => coverFileInputRef.current && coverFileInputRef.current.click()}
                    >
                      <Camera size={15} />
                      <span>{folderForm.previewCover || folderForm.coverImage ? 'Change Custom Cover...' : 'Upload Custom Cover...'}</span>
                    </button>

                    {(folderForm.previewCover || folderForm.coverImage || folderForm.coverFile) && (
                      <button
                        type="button"
                        className="thumbnail-reset-btn"
                        onClick={() => {
                          setFolderForm((prev) => ({
                            ...prev,
                            coverImage: '',
                            coverFile: null,
                            previewCover: ''
                          }));
                          if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                        }}
                        title="Use first uploaded photo automatically as thumbnail"
                      >
                        <RotateCcw size={13} />
                        <span>Reset to Auto (1st Photo)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* If folder already has photos, allow 1-click select */}
                {editingFolder && (
                  (() => {
                    const fId = editingFolder.id || editingFolder._id;
                    const folderImages = items.filter(
                      (it) => it.folderId === fId && it.mediaType === 'image'
                    );
                    if (folderImages.length === 0) return null;
                    return (
                      <div className="folder-existing-photos-picker">
                        <span className="picker-title">Or choose from photos inside this album:</span>
                        <div className="picker-photo-chips">
                          {folderImages.slice(0, 10).map((pic) => {
                            const isSelected = folderForm.previewCover === pic.url;
                            return (
                              <button
                                key={pic.id || pic._id}
                                type="button"
                                className={`picker-chip ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  setFolderForm((prev) => ({
                                    ...prev,
                                    coverImage: pic.url,
                                    coverFile: null,
                                    previewCover: pic.url
                                  }));
                                  if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                                }}
                                title={pic.title || 'Choose as album thumbnail'}
                              >
                                <img src={pic.url} alt={pic.title} />
                                {isSelected && (
                                  <div className="chip-check-badge">
                                    <Check size={11} strokeWidth={3} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Sparkles size={14} className="label-icon" />
                  <span>Description / Summary</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Optional brief description of the event or campus facility..."
                  className="form-textarea"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                />
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  disabled={folderSaving}
                  onClick={() => setShowFolderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={folderSaving}>
                  {folderSaving ? (
                    <span className="btn-loading-content">
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving...</span>
                    </span>
                  ) : editingFolder ? (
                    editingFolder.parentId ? 'Update Subfolder' : 'Update Folder & Thumbnail'
                  ) : folderForm.parentId ? (
                    'Create Subfolder'
                  ) : (
                    'Create Folder'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD MEDIA TO CLOUDINARY */}
      {showUploadModal && (
        <div className="gallery-modal-backdrop" onClick={() => !uploadProgress && setShowUploadModal(false)}>
          <div className="gallery-dialog-card upload-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h4>Upload Photos & Videos</h4>
                <p>Files will be processed and securely stored in high resolution</p>
              </div>
              {!uploadProgress && (
                <button
                  type="button"
                  className="close-dialog-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleUploadSubmit} className="dialog-form">
              {/* Destination Folder Selector */}
              <div className="form-group">
                <label className="form-label">
                  Destination Folder <span className="req">*</span>
                </label>
                <select
                  required
                  className="form-select"
                  value={uploadData.folderId}
                  onChange={(e) => setUploadData({ ...uploadData, folderId: e.target.value })}
                >
                  {rootFolders.map((root) => {
                    const rId = root.id || root._id;
                    const subList = folders.filter((f) => f.parentId === rId);
                    return (
                      <optgroup key={rId} label={`📁 ${root.name}`}>
                        <option value={rId}>
                          📁 {root.name} (Direct Media — {root.itemCount || 0} items)
                        </option>
                        {subList.map((sub) => (
                          <option key={sub.id || sub._id} value={sub.id || sub._id}>
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ 📂 {sub.name} ({sub.itemCount || 0} items)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Drag and Drop / File Input Zone */}
              <div
                className={`file-drop-zone ${uploadData.file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />

                {uploadData.previewUrl ? (
                  <div className="file-preview-box">
                    {uploadData.fileType === 'video' ? (
                      <video src={uploadData.previewUrl} className="preview-media" controls />
                    ) : (
                      <img src={uploadData.previewUrl} alt="Preview" className="preview-media" />
                    )}
                    <span className="file-chosen-name">
                      {uploadData.file.name} ({(uploadData.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <span className="change-file-hint">Click to choose a different file</span>
                  </div>
                ) : (
                  <div className="drop-zone-prompt">
                    <Upload size={36} className="upload-icon" />
                    <h5>Click to select Photo or Video</h5>
                    <p>Supports JPG, PNG, WEBP, MP4, MOV, WEBM (Up to 100MB)</p>
                  </div>
                )}
              </div>

              {/* Optional Title & Caption */}
              <div className="form-group">
                <label className="form-label">Media Title / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Relay Race Finals, Science Demonstration..."
                  className="form-input"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Caption / Description</label>
                <input
                  type="text"
                  placeholder="Optional brief description of this media item..."
                  className="form-input"
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                />
              </div>

              {/* Uploading Animation Banner */}
              {uploadProgress && (
                <div className="upload-progress-container">
                  <div className="upload-progress-header">
                    <div className="upload-spinner-ring"></div>
                    <div className="upload-progress-info">
                      <h5>Uploading Media...</h5>
                      <p>Please wait while your media is being processed and saved</p>
                    </div>
                  </div>
                  <div className="upload-progress-track">
                    <div className="upload-progress-indeterminate"></div>
                  </div>
                </div>
              )}

              <div className="dialog-footer">
                <button
                  type="button"
                  disabled={uploadProgress}
                  className="cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadProgress || !uploadData.file}
                  className={`submit-btn ${uploadProgress ? 'is-uploading' : ''}`}
                >
                  {uploadProgress ? (
                    <span className="btn-loading-content">
                      <span className="upload-btn-spinner"></span>
                      <span>Uploading</span>
                      <span className="animated-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </span>
                  ) : (
                    'Upload to Gallery'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LIGHTBOX PREVIEW */}
      {previewItem && (
        <div className="lightbox-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setPreviewItem(null)}
            >
              <X size={22} />
            </button>

            <div className="lightbox-media-container">
              {previewItem.mediaType === 'video' ? (
                <video src={previewItem.url} controls autoPlay className="lightbox-media" />
              ) : (
                <img src={previewItem.url} alt={previewItem.title} className="lightbox-media" />
              )}
            </div>

            <div className="lightbox-footer">
              <div>
                <h4>{previewItem.title}</h4>
                {previewItem.caption && <p>{previewItem.caption}</p>}
                <span className="lightbox-folder-tag">Album: {previewItem.folderName}</span>
              </div>
              <div className="lightbox-actions-group">
                <button
                  type="button"
                  className="lightbox-edit-btn"
                  onClick={() => handleOpenEditItemModal(previewItem)}
                >
                  <Pencil size={13} />
                  <span>Edit Title</span>
                </button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="view-original-btn"
                >
                  Open Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT MEDIA TITLE & DETAILS */}
      {showEditItemModal && editingItem && (
        <div className="gallery-modal-backdrop" onClick={() => !itemSaving && setShowEditItemModal(false)}>
          <div className="gallery-dialog-card edit-media-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h4>Edit Media Title & Details</h4>
                <p>Customize the headline title and caption for this media item</p>
              </div>
              <button
                type="button"
                className="close-dialog-btn"
                disabled={itemSaving}
                onClick={() => setShowEditItemModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="dialog-form">
              {/* Media Preview Box */}
              <div className="edit-media-preview-row">
                <div className="edit-media-preview-box">
                  {editingItem.mediaType === 'video' ? (
                    <video src={editingItem.url} className="edit-preview-img" preload="metadata" />
                  ) : (
                    <img src={editingItem.url} alt={editingItem.title} className="edit-preview-img" />
                  )}
                  <span className="edit-preview-badge">
                    {editingItem.mediaType === 'video' ? 'Video' : editingItem.format?.toUpperCase() || 'Photo'}
                  </span>
                </div>
                <div className="edit-media-meta">
                  <span className="meta-folder-name">📁 {editingItem.folderName}</span>
                  <span className="meta-filename">{editingItem.title || 'Untitled Media'}</span>
                </div>
              </div>

              {/* Title Input */}
              <div className="form-group">
                <label className="form-label">
                  <Pencil size={14} className="label-icon" />
                  <span>Media Title / Headline</span>
                  <span className="req">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Campaign 6: E-Waste Warriors Drive..."
                  className="form-input"
                  value={itemEditForm.title}
                  onChange={(e) => setItemEditForm({ ...itemEditForm, title: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Caption Input */}
              <div className="form-group">
                <label className="form-label">
                  <Sparkles size={14} className="label-icon" />
                  <span>Caption / Description</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Optional brief description of this photo or event..."
                  className="form-textarea"
                  value={itemEditForm.caption}
                  onChange={(e) => setItemEditForm({ ...itemEditForm, caption: e.target.value })}
                />
              </div>

              {/* Destination Folder Selector */}
              <div className="form-group">
                <label className="form-label">
                  <Folder size={14} className="label-icon" />
                  <span>Album / Folder Location</span>
                </label>
                <div className="select-input-wrap">
                  <select
                    className="form-input form-select"
                    value={itemEditForm.folderId}
                    onChange={(e) => setItemEditForm({ ...itemEditForm, folderId: e.target.value })}
                  >
                    {rootFolders.map((root) => {
                      const rId = root.id || root._id;
                      const subList = folders.filter((f) => f.parentId === rId);
                      return (
                        <optgroup key={rId} label={`📁 ${root.name}`}>
                          <option value={rId}>📁 {root.name}</option>
                          {subList.map((sub) => (
                            <option key={sub.id || sub._id} value={sub.id || sub._id}>
                              &nbsp;&nbsp;&nbsp;&nbsp;↳ 📂 {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  disabled={itemSaving}
                  onClick={() => setShowEditItemModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={itemSaving}>
                  {itemSaving ? (
                    <span className="btn-loading-content">
                      <span className="upload-btn-spinner"></span>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Title & Details'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
