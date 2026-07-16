import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/notes/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/pin/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to pin note');
    }
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/favorite/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to favorite note');
    }
  };

  const handleToggleArchive = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.put(`/api/notes/archive/${id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to archive note');
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
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
        <div className="spinner-border text-indigo mb-3" role="status" style={{ color: '#6366f1' }} />
        <span className="text-secondary">Loading dashboard stats...</span>
      </div>
    );
  }

  // Calculate highest count for category statistics progress bar maximums
  const categoryValues = stats?.categoryStats ? Object.values(stats.categoryStats) : [];
  const maxCategoryCount = Math.max(...categoryValues, 1);

  return (
    <div>
      {/* Stat Grid */}
      <div className="row g-4 mb-5">
        <div className="col-6 col-lg-3">
          <RouterLink to="/notes" className="text-decoration-none">
            <div className="stat-card d-flex align-items-center gap-3">
              <div className="rounded-4 p-3 bg-opacity-10 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <i className="material-icons-round fs-2">description</i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Total Notes</div>
                <h3 className="mb-0 fs-3 text-dark-emphasis">{stats?.totalNotes || 0}</h3>
              </div>
            </div>
          </RouterLink>
        </div>

        <div className="col-6 col-lg-3">
          <RouterLink to="/notes?pinned=true" className="text-decoration-none">
            <div className="stat-card d-flex align-items-center gap-3">
              <div className="rounded-4 p-3 bg-opacity-10 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <i className="material-icons-round fs-2">push_pin</i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Pinned</div>
                <h3 className="mb-0 fs-3 text-dark-emphasis">{stats?.pinnedNotes || 0}</h3>
              </div>
            </div>
          </RouterLink>
        </div>

        <div className="col-6 col-lg-3">
          <RouterLink to="/favorites" className="text-decoration-none">
            <div className="stat-card d-flex align-items-center gap-3">
              <div className="rounded-4 p-3 bg-opacity-10 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <i className="material-icons-round fs-2">favorite</i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Favorites</div>
                <h3 className="mb-0 fs-3 text-dark-emphasis">{stats?.favoriteNotes || 0}</h3>
              </div>
            </div>
          </RouterLink>
        </div>

        <div className="col-6 col-lg-3">
          <RouterLink to="/archive" className="text-decoration-none">
            <div className="stat-card d-flex align-items-center gap-3">
              <div className="rounded-4 p-3 bg-opacity-10 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
                <i className="material-icons-round fs-2">archive</i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Archived</div>
                <h3 className="mb-0 fs-3 text-dark-emphasis">{stats?.archivedNotes || 0}</h3>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Notes Panel */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="fs-5 mb-0 display-font">Recent Notes</h3>
            <RouterLink to="/notes" className="text-decoration-none small text-indigo fw-semibold" style={{ color: '#6366f1' }}>
              View All Notes
            </RouterLink>
          </div>

          {stats?.latestNotes?.length === 0 ? (
            <div className="empty-state p-5 bg-white border border-light-subtle rounded-4">
              <i className="material-icons-round empty-state-icon">description_off</i>
              <h5>No notes available</h5>
              <p className="text-secondary small mb-4">Speak to create your first voice note!</p>
              <RouterLink to="/notes/create" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                Create Note
              </RouterLink>
            </div>
          ) : (
            <div className="row g-3">
              {stats?.latestNotes?.map((note) => (
                <div key={note.id} className="col-12">
                  <div 
                    className="note-card bg-white border border-light-subtle rounded-4 p-3 position-relative cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/notes/view/${note.id}`)}
                  >
                    {/* Left Accent Color Indicator */}
                    <div 
                      className="position-absolute start-0 top-0 bottom-0" 
                      style={{ width: '6px', backgroundColor: note.color || '#818cf8', borderRadius: '16px 0 0 16px' }}
                    />
                    
                    <div className="ps-3 d-flex flex-column justify-content-between h-100">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge rounded-pill px-2.5 py-1" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.75rem' }}>
                            {note.category}
                          </span>
                          
                          {/* Note Toggles */}
                          <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className={`btn btn-sm rounded-circle p-1 border-0 ${note.pinned ? 'text-warning' : 'text-muted'}`}
                              onClick={(e) => handleTogglePin(note.id, e)}
                              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
                            >
                              <i className="material-icons-round fs-5">{note.pinned ? 'push_pin' : 'push_pin'}</i>
                            </button>
                            <button 
                              className={`btn btn-sm rounded-circle p-1 border-0 ${note.favorite ? 'text-danger' : 'text-muted'}`}
                              onClick={(e) => handleToggleFavorite(note.id, e)}
                              title={note.favorite ? 'Remove Favorite' : 'Mark Favorite'}
                            >
                              <i className="material-icons-round fs-5">{note.favorite ? 'favorite' : 'favorite_border'}</i>
                            </button>
                            <button 
                              className="btn btn-sm rounded-circle p-1 border-0 text-muted"
                              onClick={(e) => handleToggleArchive(note.id, e)}
                              title="Archive Note"
                            >
                              <i className="material-icons-round fs-5">archive</i>
                            </button>
                            <button 
                              className="btn btn-sm rounded-circle p-1 border-0 text-muted hover-text-danger"
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              title="Delete Note"
                            >
                              <i className="material-icons-round fs-5">delete_outline</i>
                            </button>
                          </div>
                        </div>

                        <h4 className="fs-6 fw-bold mb-1">{note.title}</h4>
                        <p className="text-secondary small text-truncate mb-2" style={{ maxWidth: '90%' }}>
                          {note.content}
                        </p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-light-subtle">
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          Created: {new Date(note.createdDate).toLocaleDateString()}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Statistics Panel */}
        <div className="col-lg-4">
          <h3 className="fs-5 mb-4 display-font">Category Stats</h3>
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border border-light-subtle">
            {stats?.categoryStats && Object.entries(stats.categoryStats).map(([category, count]) => {
              const percentage = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={category} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small text-secondary">{category}</span>
                    <span className="badge rounded-pill bg-light text-dark small">{count} notes</span>
                  </div>
                  <div className="progress" style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)' }}>
                    <div 
                      className="progress-bar rounded-pill" 
                      role="progressbar" 
                      style={{ 
                        width: `${percentage}%`, 
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
                      }} 
                      aria-valuenow={percentage} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
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

export default Dashboard;
