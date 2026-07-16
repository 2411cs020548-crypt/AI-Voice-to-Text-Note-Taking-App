import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/notes') return 'All Notes';
    if (path === '/notes/create') return 'Create Note';
    if (path.startsWith('/notes/edit/')) return 'Edit Note';
    if (path.startsWith('/notes/view/')) return 'View Note';
    if (path === '/archive') return 'Archive';
    if (path === '/favorites') return 'Favorites';
    if (path === '/search') return 'Search Results';
    if (path === '/profile') return 'My Profile';
    return 'Voice Notes';
  };

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-brand d-flex align-items-center justify-content-between">
          <Link to="/dashboard" className="text-white text-decoration-none d-flex align-items-center" onClick={closeSidebar}>
            <i className="material-icons-round me-2 text-primary-emphasis" style={{ fontSize: '28px', color: '#818cf8' }}>mic_none</i>
            <span>Voice Notes</span>
          </Link>
          <button className="btn d-lg-none text-white p-0 border-0" onClick={toggleSidebar}>
            <i className="material-icons-round">close</i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="material-icons-round">dashboard</i>
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/notes" 
            className={`sidebar-link ${location.pathname === '/notes' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="material-icons-round">description</i>
            <span>All Notes</span>
          </Link>

          <Link 
            to="/favorites" 
            className={`sidebar-link ${location.pathname === '/favorites' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="material-icons-round">favorite</i>
            <span>Favorites</span>
          </Link>

          <Link 
            to="/archive" 
            className={`sidebar-link ${location.pathname === '/archive' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="material-icons-round">archive</i>
            <span>Archive</span>
          </Link>

          <Link 
            to="/profile" 
            className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="material-icons-round">account_circle</i>
            <span>Profile</span>
          </Link>
          
          <div className="mt-5 px-3 border-top border-secondary border-opacity-25 pt-4">
            <div className="small text-muted mb-2">Category Shortcuts</div>
            {['Work', 'Study', 'Meeting', 'Ideas', 'Shopping', 'Personal', 'Travel', 'Others'].map((cat) => (
              <Link
                key={cat}
                to={`/notes?category=${cat}`}
                className="text-decoration-none d-block py-1 text-secondary hover-text-white sidebar-category-item"
                style={{ fontSize: '0.9rem' }}
                onClick={closeSidebar}
              >
                <span className="bullet-dot me-2 d-inline-block" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#818cf8' }} />
                {cat}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="app-navbar">
          <div className="d-flex align-items-center">
            {/* Hamburger for mobile */}
            <button className="btn btn-icon d-lg-none me-3" onClick={toggleSidebar}>
              <i className="material-icons-round">menu</i>
            </button>
            <h2 className="fs-4 mb-0 display-font d-none d-sm-block">{getPageTitle()}</h2>
          </div>

          {/* Search form */}
          <form className="d-flex mx-3 flex-grow-1 max-width-300" style={{ maxWidth: '400px' }} onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 border-light-subtle rounded-start-pill">
                <i className="material-icons-round text-muted fs-5">search</i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 border-light-subtle rounded-end-pill ps-0"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle */}
            <button className="btn btn-icon" onClick={toggleTheme} title="Toggle theme mode">
              <i className="material-icons-round">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </i>
            </button>

            {/* Logout button */}
            <button className="btn btn-icon text-danger" onClick={logout} title="Sign Out">
              <i className="material-icons-round">logout</i>
            </button>
            
            {/* Profile Avatar */}
            <Link to="/profile" className="text-decoration-none d-none d-md-flex align-items-center ms-2 gap-2">
              <div 
                className="rounded-circle bg-indigo text-white d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', fontWeight: 'bold' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
