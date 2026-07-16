import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/notes/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load user profile statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
        <div className="spinner-border text-indigo mb-3" role="status" style={{ color: '#6366f1' }} />
        <span className="text-secondary">Retrieving profile information...</span>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '700px' }}>
      <div className="card border-0 shadow-sm rounded-4 bg-white border border-light-subtle overflow-hidden">
        {/* Banner */}
        <div style={{ height: '140px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }} />
        
        {/* Profile Details Container */}
        <div className="p-4 p-md-5 position-relative">
          {/* Avatar floating */}
          <div 
            className="rounded-circle text-white d-flex align-items-center justify-content-center border border-4 border-white shadow-lg"
            style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', 
              fontWeight: 'bold', 
              fontSize: '2.5rem',
              position: 'absolute',
              top: '-50px',
              left: '50px'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="pt-5">
            <h2 className="fs-3 fw-bold display-font text-dark-emphasis mb-1">{user?.name || 'User'}</h2>
            <p className="text-secondary small mb-4">{user?.email}</p>

            <div className="row g-3 border-top border-bottom border-light-subtle py-4 my-4">
              <div className="col-6 col-sm-3 text-center border-end border-light-subtle">
                <h3 className="fs-4 fw-bold text-dark-emphasis mb-1">{stats?.totalNotes || 0}</h3>
                <span className="text-muted small">Notes Created</span>
              </div>
              <div className="col-6 col-sm-3 text-center border-sm-end border-light-subtle">
                <h3 className="fs-4 fw-bold text-warning mb-1">{stats?.pinnedNotes || 0}</h3>
                <span className="text-muted small">Pinned</span>
              </div>
              <div className="col-6 col-sm-3 text-center border-end border-light-subtle">
                <h3 className="fs-4 fw-bold text-danger mb-1">{stats?.favoriteNotes || 0}</h3>
                <span className="text-muted small">Favorites</span>
              </div>
              <div className="col-6 col-sm-3 text-center">
                <h3 className="fs-4 fw-bold text-secondary mb-1">{stats?.archivedNotes || 0}</h3>
                <span className="text-muted small">Archived</span>
              </div>
            </div>

            <div className="mb-3">
              <h5 className="fs-6 fw-bold text-dark-emphasis mb-3">Account Details</h5>
              <div className="d-flex justify-content-between py-2 border-bottom border-light-subtle small text-secondary">
                <span>Account Created:</span>
                <span className="fw-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-light-subtle small text-secondary">
                <span>User Role:</span>
                <span className="fw-medium text-success d-flex align-items-center gap-1">
                  <span className="bullet-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#198754' }} />
                  Standard User (USER)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
