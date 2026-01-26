import React, { useState, useRef } from 'react';
import './PatientDetail.css';
import CameraModal from './CameraModal';
import FacialAnalysis from './FacialAnalysis';

const PatientDetail = ({ patient, onBack, onOpenCollage, onEditPatient, photos, setPhotos }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isHashtagMenuOpen, setIsHashtagMenuOpen] = useState(false);
    const [activeHashtagFilter, setActiveHashtagFilter] = useState(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [analysisImage, setAnalysisImage] = useState(null);
    const [isAnalysisSourceModalOpen, setIsAnalysisSourceModalOpen] = useState(false);
    const [isAnalysisCameraOpen, setIsAnalysisCameraOpen] = useState(false);
    const [isSelectingFromGallery, setIsSelectingFromGallery] = useState(false);
    const fileInputRef = useRef(null);
    const analysisFileInputRef = useRef(null);

    const handleCollageClick = () => {
        setIsMenuOpen(false);
        onOpenCollage();
    };

    const handleCameraClick = () => {
        setIsMenuOpen(false);
        setIsCameraOpen(true);
    };

    const handlePhotoTaken = (photoUrl) => {
        const newPhoto = {
            id: Date.now(),
            url: photoUrl,
            date: new Date().toLocaleDateString(),
            patientId: patient.id // Associate with current patient
        };
        setPhotos(prev => [newPhoto, ...prev]);
        setIsMenuOpen(false); // Ensure menu is closed
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
        setIsMenuOpen(false);
    };

    const handleAnalysisClick = () => {
        setIsMenuOpen(false);
        setIsAnalysisSourceModalOpen(true);
        setIsSelectingFromGallery(false);
    };

    const handleAnalysisCameraClick = () => {
        setIsAnalysisSourceModalOpen(false);
        setIsAnalysisCameraOpen(true);
    };

    const handleAnalysisImportClick = () => {
        setIsSelectingFromGallery(true);
    };

    const handleAnalysisGalleryPhotoSelect = (photoUrl) => {
        setAnalysisImage(photoUrl);
        setIsAnalysisSourceModalOpen(false);
        setIsAnalysisOpen(true);
    };

    const handleAnalysisNewImportClick = () => {
        analysisFileInputRef.current.click();
    };

    const handleAnalysisPhotoTaken = (photoUrl) => {
        setAnalysisImage(photoUrl);
        setIsAnalysisCameraOpen(false);
        setIsAnalysisOpen(true);
    };

    const handleAnalysisFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAnalysisImage(e.target.result);
                setIsAnalysisOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);

            Promise.all(fileArray.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            id: Date.now() + Math.random(),
                            url: e.target.result, // This is now a persistent Base64 Data URL
                            date: new Date().toLocaleDateString(),
                            patientId: patient.id
                        });
                    };
                    reader.readAsDataURL(file);
                });
            })).then(newPhotos => {
                setPhotos(prev => [...newPhotos, ...prev]);
            });
        }
    };

    // Helper to calculate age from standard DD/MM/YYYY format or fallback
    const calculateAge = (dobString) => {
        if (!dobString) return '';

        try {
            const [day, month, year] = dobString.split('/');
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return `${age} años`;
        } catch (e) {
            return '';
        }
    };

    // Extract unique hashtags for this patient
    const availableHashtags = Array.from(new Set(
        photos
            .filter(p => p.patientId === patient.id)
            .flatMap(p => p.description?.match(/#[^\s#]+/g) || [])
    )).sort();

    const handleUpdatePhotoDescription = (photoId, description) => {
        setPhotos(prev => prev.map(p =>
            p.id === photoId ? { ...p, description, patientId: patient.id } : p
        ));
    };

    const handleDeletePhoto = (photoId) => {
        if (window.confirm('¿Estás seguro de que quieres borrar esta foto?')) {
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        }
    };

    // Filter photos: show those belonging to this patient OR those with no patientId (legacy)
    // AND apply active hashtag filter
    const patientPhotos = photos.filter(p => {
        const belongsToPatient = p.patientId === patient.id || !p.patientId;
        if (!belongsToPatient) return false;

        if (activeHashtagFilter) {
            return p.description?.includes(activeHashtagFilter);
        }
        return true;
    });

    const handleHashtagClick = (tag) => {
        setActiveHashtagFilter(tag);
        setIsHashtagMenuOpen(false);
    };

    return (
        <div className="patient-detail-container">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleFileChange}
            />
            <input
                type="file"
                ref={analysisFileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAnalysisFileChange}
            />
            {/* Header */}
            <header className="detail-header">
                <div className="header-left">
                    <button className="back-button" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <div className="patient-profile-summary" onClick={onEditPatient} style={{ cursor: 'pointer' }}>
                        <div className="detail-avatar">
                            {/* User Icon from screenshot */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                            </svg>
                        </div>
                        <div className="detail-info">
                            <span className="detail-name">{patient.name}</span>
                            <span className="detail-age">{calculateAge(patient.dob)}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                    <button className="action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Controls */}
            <div className="controls-bar">
                <div className="hashtag-filter-wrapper">
                    <button
                        className={`hashtags-dropdown ${activeHashtagFilter ? 'active' : ''}`}
                        onClick={() => setIsHashtagMenuOpen(!isHashtagMenuOpen)}
                    >
                        {activeHashtagFilter || 'Hashtags'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {isHashtagMenuOpen && (
                        <>
                            <div className="dropdown-backdrop" onClick={() => setIsHashtagMenuOpen(false)}></div>
                            <div className="hashtag-dropdown-menu">
                                <div
                                    className={`hashtag-option ${!activeHashtagFilter ? 'selected' : ''}`}
                                    onClick={() => handleHashtagClick(null)}
                                >
                                    Ver todas
                                </div>
                                {availableHashtags.map(tag => (
                                    <div
                                        key={tag}
                                        className={`hashtag-option ${activeHashtagFilter === tag ? 'selected' : ''}`}
                                        onClick={() => handleHashtagClick(tag)}
                                    >
                                        {tag}
                                    </div>
                                ))}
                                {availableHashtags.length === 0 && (
                                    <div className="hashtag-option-empty">No hay hashtags aún</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="detail-content">
                {patientPhotos.length > 0 ? (
                    <div className="photos-groups">
                        {Object.entries(
                            patientPhotos.reduce((groups, photo) => {
                                const date = photo.date;
                                if (!groups[date]) groups[date] = [];
                                groups[date].push(photo);
                                return groups;
                            }, {})
                        )
                            .sort((a, b) => {
                                // Parse dd/mm/yyyy to Date for sorting
                                const parseDate = (dateStr) => {
                                    const [day, month, year] = dateStr.split('/');
                                    return new Date(year, month - 1, day);
                                };
                                return parseDate(b[0]) - parseDate(a[0]); // Descending
                            })
                            .map(([date, photos]) => (
                                <div key={date} className="photo-group">
                                    <h3 className="group-header">{date} • Sesión de fotos</h3>
                                    <div className="photos-grid">
                                        {photos.map(photo => (
                                            <div key={photo.id} className="photo-card">
                                                <button
                                                    className="delete-photo-btn"
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    title="Borrar foto"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                                <img src={photo.url} alt="Patient" />
                                                <div className="photo-info-bar">
                                                    <input
                                                        type="text"
                                                        className="photo-note-input"
                                                        placeholder="Añadir descripción (#...)"
                                                        value={photo.description || ''}
                                                        onChange={(e) => handleUpdatePhotoDescription(photo.id, e.target.value)}
                                                    />
                                                    {/* Date removed from card since it's in header now, OR keep it if user wants individual timestamps */}
                                                    {/* <div className="photo-timestamp">{photo.date}</div> */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <>
                        <div className="empty-state-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <p className="empty-state-text">
                            Las fotos del paciente se mostrarán aquí. Utilice la aplicación PhotoDoc en dispositivos móviles para tomar o importar fotos.
                        </p>
                    </>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="detail-footer">
                <button className="create-fab" onClick={() => setIsMenuOpen(true)}>
                    <span>+</span> Crear
                </button>
            </div>

            {/* Create Menu Overlay */}
            {isMenuOpen && (
                <>
                    <div className="create-menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="create-menu-container">
                        <div className="menu-handle"></div>
                        <div className="menu-options-row">
                            <button className="menu-option" onClick={handleCollageClick}>
                                <div className="option-icon-circle">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                </div>
                                <span className="option-label">Collage</span>
                            </button>
                            <button className="menu-option" onClick={handleAnalysisClick}>
                                <div className="option-icon-circle">
                                    {/* Face Analysis Icon */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="4"></circle>
                                        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                                        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                                        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                                        <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                                        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                                    </svg>
                                    <span className="badge-ia">IA</span>
                                </div>
                                <span className="option-label">Análisis facial</span>
                            </button>
                            <button className="menu-option" onClick={handleCameraClick}>
                                <div className="option-icon-circle">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </div>
                                <span className="option-label">Cámara</span>
                            </button>
                            <button className="menu-option" onClick={handleImportClick}>
                                <div className="option-icon-circle">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>
                                <span className="option-label">Importar</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Facial Analysis Components */}
            {isAnalysisSourceModalOpen && (
                <>
                    <div className="create-menu-backdrop" onClick={() => setIsAnalysisSourceModalOpen(false)}></div>
                    <div className={`analysis-source-modal ${isSelectingFromGallery ? 'gallery-mode' : ''}`}>
                        <div className="menu-handle"></div>
                        <h3>{isSelectingFromGallery ? 'Seleccionar foto del paciente' : 'Seleccionar origen para análisis'}</h3>

                        {!isSelectingFromGallery ? (
                            <div className="source-options">
                                <button className="source-btn" onClick={handleAnalysisCameraClick}>
                                    <div className="source-icon">📷</div>
                                    <span>Cámara</span>
                                </button>
                                <button className="source-btn" onClick={handleAnalysisImportClick}>
                                    <div className="source-icon">📁</div>
                                    <span>Galería</span>
                                </button>
                            </div>
                        ) : (
                            <div className="analysis-gallery-view">
                                <div className="analysis-photo-grid">
                                    {patientPhotos.map(photo => (
                                        <div
                                            key={photo.id}
                                            className="analysis-photo-item"
                                            onClick={() => handleAnalysisGalleryPhotoSelect(photo.url)}
                                        >
                                            <img src={photo.url} alt="Patient" />
                                        </div>
                                    ))}
                                    {patientPhotos.length === 0 && (
                                        <p className="no-photos-msg">No hay fotos previas del paciente.</p>
                                    )}
                                </div>
                                <div className="gallery-extra-actions">
                                    <button className="back-to-sources-btn" onClick={() => setIsSelectingFromGallery(false)}>
                                        Volver
                                    </button>
                                    <button className="import-new-btn" onClick={handleAnalysisNewImportClick}>
                                        Importar nueva
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {isAnalysisOpen && analysisImage && (
                <FacialAnalysis
                    imageSrc={analysisImage}
                    onClose={() => setIsAnalysisOpen(false)}
                />
            )}

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onPhotoTaken={handlePhotoTaken}
            />

            <CameraModal
                isOpen={isAnalysisCameraOpen}
                onClose={() => setIsAnalysisCameraOpen(false)}
                onPhotoTaken={handleAnalysisPhotoTaken}
            />
        </div>
    );
};

export default PatientDetail;
