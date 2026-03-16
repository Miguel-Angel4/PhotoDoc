import React from 'react';
import './TopBar.css';

const TopBar = ({ onNavigate, searchQuery, setSearchQuery, onLock, isAdmin, isAdminMode, setIsAdminMode }) => {
    return (
        <header className="topbar">
            {/* Branding - Only visible on mobile in CSS */}
            <div className="topbar-branding">
                <div className="topbar-logo">
                    <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3H8V5H5V8H3V3Z" fill="#78dede" />
                        <path d="M16 3H21V8H19V5H16V3Z" fill="#78dede" />
                        <path d="M3 16H5V19H8V21H3V16Z" fill="#78dede" />
                        <path d="M16 21V19H19V16H21V21H16Z" fill="#78dede" />
                        <circle cx="12" cy="10" r="4" stroke="#78dede" strokeWidth="2" />
                        <path d="M16 19C16 16.7909 14.2091 15 12 15C9.79086 15 8 16.7909 8 19" stroke="#78dede" strokeWidth="2" />
                    </svg>
                </div>
                <a href="https://www.bambai.es/" target="_blank" rel="noopener noreferrer" className="bambai-mobile-link">
                    <span className="b-label">by</span>
                    <span className="b-brand">Bambai</span>
                </a>
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar usuario"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="topbar-actions">
                {isAdmin && (
                    <div className="admin-toggle-container">
                        <span className="admin-toggle-label">Admin</span>
                        <label className="switch admin-switch">
                            <input
                                type="checkbox"
                                checked={isAdminMode}
                                onChange={(e) => setIsAdminMode(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                )}

                <button className="action-btn" title="Refresh">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 12a11 11 0 0 1-20.36 5"></path>
                        <polyline points="1 12 1 17 6 17"></polyline>
                        <path d="M1 12a11 11 0 0 1 20.36-5"></path>
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                    </svg>
                </button>

                <button className="action-btn" title="Settings" onClick={() => onNavigate('settings')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>

                <button className="action-btn" title="Lock" onClick={onLock}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
