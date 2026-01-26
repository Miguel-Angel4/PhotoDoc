import React, { useState } from 'react';
import './Portfolio.css';

const Portfolio = ({ photos, patients }) => {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isHashtagMenuOpen, setIsHashtagMenuOpen] = useState(false);

    // Group photos by hashtag
    const groupedPhotos = photos.reduce((acc, photo) => {
        if (!photo.description || !photo.patientId) return acc;

        const hashtags = photo.description.match(/#[^\s#]+/g);
        if (hashtags) {
            hashtags.forEach(tag => {
                if (!acc[tag]) acc[tag] = [];
                acc[tag].push(photo);
            });
        }
        return acc;
    }, {});

    const folders = Object.keys(groupedPhotos).sort();

    const handleFolderClick = (tag) => {
        setSelectedFolder(tag);
    };

    const handleBackClick = () => {
        setSelectedFolder(null);
    };

    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? patient.name : 'Paciente desconocido';
    };

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
                    <h2>{selectedFolder ? `Carpeta: ${selectedFolder}` : 'Portafolio'}</h2>
                </div>

                <div className="portfolio-header-actions">
                    <div className="hashtag-filter-wrapper">
                        <button
                            className={`hashtags-dropdown ${selectedFolder ? 'active' : ''}`}
                            onClick={() => setIsHashtagMenuOpen(!isHashtagMenuOpen)}
                        >
                            {selectedFolder || 'Hashtags'}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {isHashtagMenuOpen && (
                            <>
                                <div className="dropdown-backdrop" onClick={() => setIsHashtagMenuOpen(false)}></div>
                                <div className="hashtag-dropdown-menu">
                                    <div
                                        className={`hashtag-option ${!selectedFolder ? 'selected' : ''}`}
                                        onClick={() => { setSelectedFolder(null); setIsHashtagMenuOpen(false); }}
                                    >
                                        Ver todas las carpetas
                                    </div>
                                    {folders.map(tag => (
                                        <div
                                            key={tag}
                                            className={`hashtag-option ${selectedFolder === tag ? 'selected' : ''}`}
                                            onClick={() => { setSelectedFolder(tag); setIsHashtagMenuOpen(false); }}
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="portfolio-content">
                {folders.length > 0 ? (
                    <>
                        {!selectedFolder ? (
                            <div className="folders-grid">
                                {folders.map(tag => (
                                    <div key={tag} className="folder-card" onClick={() => handleFolderClick(tag)}>
                                        <div className="folder-icon-wrapper">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span className="folder-batch">{groupedPhotos[tag].length}</span>
                                        </div>
                                        <div className="folder-name">{tag}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="portfolio-grid">
                                {groupedPhotos[selectedFolder].map(photo => (
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
                            <p>Agrega un # En la descripcion de las imagenes para verlas ordenadas</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
