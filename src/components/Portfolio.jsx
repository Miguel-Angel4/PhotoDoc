import React, { useState } from 'react';
import './Portfolio.css';

const Portfolio = ({ photos, patients }) => {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isHashtagMenuOpen, setIsHashtagMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('folders'); // 'folders' or 'gallery'
    const [groupingMode, setGroupingMode] = useState('hashtags'); // 'hashtags', 'date', 'user'

    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? patient.name : 'Paciente desconocido';
    };

    // Group photos based on active grouping mode
    const groupedPhotos = photos.reduce((acc, photo) => {
        if (!photo.patientId) return acc;

        let groups = [];
        if (groupingMode === 'hashtags') {
            const hashtags = photo.description?.match(/#[^\s#]+/g);
            if (hashtags) {
                groups = hashtags;
            }
        } else if (groupingMode === 'date') {
            groups = [photo.date];
        } else if (groupingMode === 'user') {
            groups = [getPatientName(photo.patientId)];
        }

        groups.forEach(group => {
            if (!acc[group]) acc[group] = [];
            acc[group].push(photo);
        });

        return acc;
    }, {});

    const folders = Object.keys(groupedPhotos).sort((a, b) => {
        if (groupingMode === 'date') {
            const parseDate = (d) => {
                const [day, month, year] = d.split('/');
                return new Date(year, month - 1, day);
            };
            return parseDate(b) - parseDate(a);
        }
        return a.localeCompare(b);
    });

    const handleFolderClick = (tag) => {
        setSelectedFolder(tag);
        setViewMode('folders'); // When entering a folder, we are in a specific view
    };

    const handleBackClick = () => {
        setSelectedFolder(null);
    };

    const getDropdownLabel = () => {
        if (selectedFolder) return selectedFolder;
        if (groupingMode === 'hashtags') return 'Hashtags';
        if (groupingMode === 'date') return 'Fecha';
        if (groupingMode === 'user') return 'Usuario';
        return 'Filtrar';
    };

    const allPhotosList = viewMode === 'gallery' ? photos.filter(p => !selectedFolder || groupedPhotos[selectedFolder]?.some(gp => gp.id === p.id)) : [];

    return (
        <div className="portfolio-container">
            <header className="portfolio-header">
                <div className="header-left">
                    {selectedFolder && (
                        <button className="back-button" onClick={handleBackClick}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    )}
                    <h2>{selectedFolder ? `${groupingMode === 'hashtags' ? 'Carpeta' : groupingMode === 'date' ? 'Día' : 'Paciente'}: ${selectedFolder}` : 'Portafolio'}</h2>
                </div>

                <div className="portfolio-header-actions">
                    <div className="view-switcher">
                        <button
                            className={`switch-btn ${viewMode === 'folders' && !selectedFolder ? 'active' : ''}`}
                            onClick={() => { setViewMode('folders'); setSelectedFolder(null); }}
                            title="Vista por carpetas"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Carpetas</span>
                        </button>
                        <button
                            className={`switch-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                            onClick={() => { setViewMode('gallery'); setSelectedFolder(null); }}
                            title="Vista galería"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Galería</span>
                        </button>
                    </div>

                    <div className="hashtag-filter-wrapper">
                        <button
                            className={`hashtags-dropdown ${(selectedFolder || groupingMode !== 'hashtags') ? 'active' : ''}`}
                            onClick={() => setIsHashtagMenuOpen(!isHashtagMenuOpen)}
                        >
                            {getDropdownLabel()}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {isHashtagMenuOpen && (
                            <>
                                <div className="dropdown-backdrop" onClick={() => setIsHashtagMenuOpen(false)}></div>
                                <div className="hashtag-dropdown-menu">
                                    <div className="dropdown-section">
                                        <div className="dropdown-section-title">Agrupar por</div>
                                        <div
                                            className={`hashtag-option ${groupingMode === 'hashtags' ? 'selected' : ''}`}
                                            onClick={() => { setGroupingMode('hashtags'); setSelectedFolder(null); setIsHashtagMenuOpen(false); }}
                                        >
                                            # Hashtags
                                        </div>
                                        <div
                                            className={`hashtag-option ${groupingMode === 'date' ? 'selected' : ''}`}
                                            onClick={() => { setGroupingMode('date'); setSelectedFolder(null); setIsHashtagMenuOpen(false); }}
                                        >
                                            📅 Fecha
                                        </div>
                                        <div
                                            className={`hashtag-option ${groupingMode === 'user' ? 'selected' : ''}`}
                                            onClick={() => { setGroupingMode('user'); setSelectedFolder(null); setIsHashtagMenuOpen(false); }}
                                        >
                                            👤 Usuario
                                        </div>
                                    </div>

                                    {folders.length > 0 && (
                                        <div className="dropdown-section">
                                            <div className="dropdown-divider"></div>
                                            <div className="dropdown-section-title">
                                                {groupingMode === 'hashtags' ? 'Carpetas' : groupingMode === 'date' ? 'Fechas' : 'Pacientes'}
                                            </div>
                                            <div className="folders-list-scroll">
                                                {folders.map(tag => (
                                                    <div
                                                        key={tag}
                                                        className={`hashtag-option ${selectedFolder === tag ? 'selected' : ''}`}
                                                        onClick={() => { setSelectedFolder(tag); setViewMode('folders'); setIsHashtagMenuOpen(false); }}
                                                    >
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="portfolio-content">
                {photos.length > 0 ? (
                    <>
                        {viewMode === 'folders' && !selectedFolder ? (
                            <div className="folders-grid">
                                {folders.map(tag => (
                                    <div key={tag} className="folder-card" onClick={() => handleFolderClick(tag)}>
                                        <div className="folder-icon-wrapper">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                {groupingMode === 'hashtags' ? (
                                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                ) : groupingMode === 'date' ? (
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                ) : (
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                )}
                                                {groupingMode === 'date' && <line x1="16" y1="2" x2="16" y2="6"></line>}
                                                {groupingMode === 'date' && <line x1="8" y1="2" x2="8" y2="6"></line>}
                                                {groupingMode === 'date' && <line x1="3" y1="10" x2="21" y2="10"></line>}
                                                {groupingMode === 'user' && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>}
                                            </svg>
                                            <span className="folder-batch">{groupedPhotos[tag].length}</span>
                                        </div>
                                        <div className="folder-name">{tag}</div>
                                    </div>
                                ))}
                            </div>
                        ) : viewMode === 'gallery' ? (
                            <div className="portfolio-grid">
                                {photos.map(photo => (
                                    <div key={photo.id} className="portfolio-card">
                                        <img src={photo.url} alt="Portfolio Item" />
                                        <div className="portfolio-photo-info">
                                            <div className="patient-owner-tag">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                {getPatientName(photo.patientId)}
                                            </div>
                                            <div className="portfolio-timestamp">{photo.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="portfolio-grid">
                                {groupedPhotos[selectedFolder]?.map(photo => (
                                    <div key={photo.id} className="portfolio-card">
                                        <img src={photo.url} alt="Portfolio Item" />
                                        <div className="portfolio-photo-info">
                                            <div className="patient-owner-tag">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                {getPatientName(photo.patientId)}
                                            </div>
                                            <div className="portfolio-timestamp">{photo.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-portfolio-full">
                        <div className="empty-portfolio-content">
                            <div className="empty-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <h3>Organiza tu portafolio</h3>
                            <p>Agrega un # En la descripcion de las imagenes para verlas ordenadas o filtra por fecha y usuario.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
