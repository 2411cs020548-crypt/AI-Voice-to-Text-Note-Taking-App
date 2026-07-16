import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Notes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Filter & Sorting state - support both 'search' (direct filter) and 'query' (navbar search)
  const searchFilter = searchParams.get('search') || searchParams.get('query') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  // Dynamically set filters based on query param OR path name
  const isArchiveRoute = location.pathname === '/archive';
  const isFavoriteRoute = location.pathname === '/favorites';
  const isSearchRoute = location.pathname === '/search';
  
  const pinnedFilter = searchParams.get('pinned') === 'true' ? true : null;
  const archivedFilter = searchParams.get('archived') === 'true' || isArchiveRoute;
  const favoriteFilter = searchParams.get('favorite') === 'true' || isFavoriteRoute ? true : null;

  const [sortBy, setSortBy] = useState('createdDate');
  const [order, setOrder] = useState('desc');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 12,
        sortBy,
        order,
      };

      if (searchFilter) params.search = searchFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (pinnedFilter !== null) params.pinned = pinnedFilter;
      if (archivedFilter !== null) params.archived = archivedFilter;
      if (favoriteFilter !== null) params.favorite = favoriteFilter;

      const response = await api.get('/api/notes', { params });
      if (response.data.success && response.data.data) {
        setNotes(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchParams, currentPage, sortBy, order]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchFilter, categoryFilter, pinnedFilter, archivedFilter, favoriteFilter]);

  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/pin/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/favorite/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleArchive = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/archive/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to archive/restore note');
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to permanently delete this note?')) return;
    try {
      const response = await api.delete(`/api/notes/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'newest') {
      setSortBy('createdDate');
      setOrder('desc');
    } else if (value === 'oldest') {
      setSortBy('createdDate');
      setOrder('asc');
    } else if (value === 'alpha') {
      setSortBy('title');
      setOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const getPageHeaderTitle = () => {
    if (archivedFilter) return 'Archived Notes';
    if (favoriteFilter) return 'Favorite Notes';
    if (pinnedFilter) return 'Pinned Notes';
    if (categoryFilter) return `${categoryFilter} Notes`;
    if (searchFilter) return `Search Results for "${searchFilter}"`;
    return 'All Notes';
  };

  return (
    <div>
      {/* Filters Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white border border-light-subtle">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-6 d-flex flex-wrap gap-2 align-items-center">
            <h4 className="fs-5 mb-0 display-font me-3">{getPageHeaderTitle()}</h4>
            {(categoryFilter || searchFilter || pinnedFilter || favoriteFilter || archivedFilter) && (
              <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1" onClick={clearFilters}>
                <i className="material-icons-round fs-6">clear_all</i>
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          <div className="col-md-4 d-flex gap-2 justify-content-md-end">
            <select className="form-select max-width-200" onChange={handleSortChange} defaultValue="newest" style={{ maxWidth: '200px' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetically</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
          <div className="spinner-border text-indigo mb-3" role="status" style={{ color: '#6366f1' }} />
          <span className="text-secondary">Retrieving your notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state p-5 bg-white border border-light-subtle rounded-4 text-center my-5">
          <i className="material-icons-round empty-state-icon">sticky_note_2</i>
          <h5>No notes found</h5>
          <p className="text-secondary small mb-4">No notes match your active filters or search queries.</p>
          <Link to="/notes/create" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
            Create New Note
          </Link>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {notes.map((note) => (
              <div key={note.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="note-card bg-white border border-light-subtle rounded-4 p-3 position-relative cursor-pointer h-100 d-flex flex-column justify-content-between"
                  onClick={() => navigate(`/notes/view/${note.id}`)}
                >
                  <div 
                    className="position-absolute start-0 top-0 bottom-0" 
                    style={{ width: '6px', backgroundColor: note.color || '#818cf8', borderRadius: '16px 0 0 16px' }}
                  />

                  <div className="ps-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.75rem' }}>
                        {note.category}
                      </span>
                      
                      <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`btn btn-sm rounded-circle p-1 border-0 ${note.pinned ? 'text-warning' : 'text-muted'}`}
                          onClick={(e) => handleTogglePin(note.id, e)}
                          title={note.pinned ? 'Unpin' : 'Pin'}
                        >
                          <i className="material-icons-round fs-5">push_pin</i>
                        </button>
                        <button 
                          className={`btn btn-sm rounded-circle p-1 border-0 ${note.favorite ? 'text-danger' : 'text-muted'}`}
                          onClick={(e) => handleToggleFavorite(note.id, e)}
                          title={note.favorite ? 'Remove Favorite' : 'Mark Favorite'}
                        >
                          <i className="material-icons-round fs-5">{note.favorite ? 'favorite' : 'favorite_border'}</i>
                        </button>
                        <button 
                          className={`btn btn-sm rounded-circle p-1 border-0 ${note.archived ? 'text-indigo' : 'text-muted'}`}
                          onClick={(e) => handleToggleArchive(note.id, e)}
                          title={note.archived ? 'Restore' : 'Archive'}
                        >
                          <i className="material-icons-round fs-5">archive</i>
                        </button>
                        <button 
                          className="btn btn-sm rounded-circle p-1 border-0 text-muted hover-text-danger"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          title="Delete"
                        >
                          <i className="material-icons-round fs-5">delete_outline</i>
                        </button>
                      </div>
                    </div>

                    <h4 className="fs-6 fw-bold mb-2 text-truncate" style={{ maxWidth: '90%' }}>{note.title}</h4>
                    <p className="text-secondary small mb-3" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.5'
                    }}>
                      {note.content}
                    </p>
                  </div>

                  <div className="ps-3 d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-light-subtle">
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {new Date(note.createdDate).toLocaleDateString()}
                    </span>
                    
                    {note.voiceTranscript && (
                      <div className="d-flex align-items-center gap-1 text-success small" style={{ fontSize: '0.75rem' }}>
                        <i className="material-icons-round" style={{ fontSize: '14px' }}>volume_up</i>
                        <span>Voice</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
              <button 
                className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-1"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
              >
                <i className="material-icons-round fs-6">arrow_back</i>
                <span>Previous</span>
              </button>
              
              <span className="text-secondary small fw-medium">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button 
                className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-1"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
              >
                <span>Next</span>
                <i className="material-icons-round fs-6">arrow_forward</i>
              </button>
            </div>
          )}
        </>
      )}

      {/* FAB Shortcut */}
      <button 
        onClick={() => navigate('/notes/create')} 
        className="fab-btn"
        title="Create New Note"
      >
        <i className="material-icons-round fs-2">add</i>
      </button>
    </div>
  );
};

export default Notes;
