import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavigate }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H8V5H5V8H3V3Z" fill="#78dede" />
                    <path d="M16 3H21V8H19V5H16V3Z" fill="#78dede" />
                    <path d="M3 16H5V19H8V21H3V16Z" fill="#78dede" />
                    <path d="M16 21V19H19V16H21V21H16Z" fill="#78dede" />
                    <circle cx="12" cy="10" r="4" stroke="#78dede" strokeWidth="2" />
                    <path d="M16 19C16 16.7909 14.2091 15 12 15C9.79086 15 8 16.7909 8 19" stroke="#78dede" strokeWidth="2" />
                </svg>
                <span className="logo-text">PhotoDoc</span>
            </div>

            <nav className="sidebar-nav">
                <div
                    className={`nav-item ${activeView === 'patients' ? 'active' : ''}`}
                    onClick={() => onNavigate('patients')}
                >
                    <div className="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.005 6.11684 19.005 7.005C19.005 7.89316 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>Pacientes</span>
                </div>
                <div
                    className={`nav-item ${activeView === 'portfolio' ? 'active' : ''}`}
                    onClick={() => onNavigate('portfolio')}
                >
                    <div className="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 11H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>Portafolio</span>
                </div>
                <div
                    className={`nav-item ${activeView === 'account' ? 'active' : ''}`}
                    onClick={() => onNavigate('account')}
                >
                    <div className="icon-container">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>Cuenta</span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
