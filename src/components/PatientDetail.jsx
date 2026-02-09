import React, { useState, useRef, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import './PatientDetail.css';
import CameraModal from './CameraModal';
import FacialAnalysis from './FacialAnalysis';
import MovePatientModal from './MovePatientModal';

const PatientDetail = ({ patient, onBack, onOpenCollage, onEditPatient, photos, setPhotos, patients }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false); // 3-dot menu
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isHashtagMenuOpen, setIsHashtagMenuOpen] = useState(false);
    const [activeHashtagFilter, setActiveHashtagFilter] = useState(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [analysisImage, setAnalysisImage] = useState(null);
    const [isAnalysisSourceModalOpen, setIsAnalysisSourceModalOpen] = useState(false);
    const [isAnalysisCameraOpen, setIsAnalysisCameraOpen] = useState(false);
    const [isSelectingFromGallery, setIsSelectingFromGallery] = useState(false);
    const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false);
    const [isFilterEditorOpen, setIsFilterEditorOpen] = useState(false);
    const [filterImage, setFilterImage] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [fineRotation, setFineRotation] = useState(0);
    const [hasBorder, setHasBorder] = useState(false);
    const [activeFilterTool, setActiveFilterTool] = useState(null);
    const [isCropped, setIsCropped] = useState(false);
    const [isEyesHidden, setIsEyesHidden] = useState(false);
    const [isEyesLeveled, setIsEyesLeveled] = useState(false);
    const [isBackgroundRemoved, setIsBackgroundRemoved] = useState(false);
    const [isAiLoaded, setIsAiLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingText, setProcessingText] = useState('Escaneando rostro...');
    const [landmarkData, setLandmarkData] = useState(null);
    const [viewMode, setViewMode] = useState('sessions'); // 'sessions' (grouped) or 'gallery' (ungrouped)
    const [groupingMode, setGroupingMode] = useState('date'); // 'date', 'hashtags', or 'user'
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

    // Initial AI Setup (same as CollageEditor)
    useEffect(() => {
        const loadModels = async () => {
            if (window.faceapi && !isAiLoaded) {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                try {
                    await Promise.all([
                        window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                        window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                    ]);
                    setIsAiLoaded(true);
                } catch (err) {
                    console.error("Error loading face-api models:", err);
                }
            }
        };
        loadModels();
    }, [isAiLoaded]);

    const detectFace = async (imageUrl) => {
        if (!window.faceapi || !isAiLoaded) return null;

        setIsProcessing(true);
        setProcessingText('Escaneando rostro...');

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            const detection = await window.faceapi.detectSingleFace(img, new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }))
                .withFaceLandmarks();

            if (detection) {
                const landmarks = detection.landmarks;
                const faceBox = detection.detection.box;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const mouth = landmarks.getMouth();
                const nose = landmarks.getNose();

                const getBounds = (pts) => {
                    const xs = pts.map(p => p.x);
                    const ys = pts.map(p => p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    const width = maxX - minX;
                    const height = maxY - minY;
                    const centerX = minX + width / 2;
                    const centerY = minY + height / 2;

                    return {
                        x: (centerX / img.width) * 100,
                        y: (centerY / img.height) * 100,
                        width: (width / img.width) * 100,
                        height: (height / img.height) * 100
                    };
                };

                const getCentroid = (points) => {
                    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                    return { x: sum.x / points.length, y: sum.y / points.length };
                };

                const data = {
                    face: {
                        x: ((faceBox.x + faceBox.width / 2) / img.width) * 100,
                        y: ((faceBox.y + faceBox.height / 2) / img.height) * 100,
                        width: (faceBox.width / img.width) * 100,
                        height: (faceBox.height / img.height) * 100
                    },
                    eyes: getBounds([...leftEye, ...rightEye]),
                    nose: getBounds(nose),
                    mouth: getBounds(mouth),
                    alignment: {
                        left: getCentroid(leftEye),
                        right: getCentroid(rightEye)
                    }
                };

                setLandmarkData(data);
                setIsProcessing(false);
                return data;
            }
            setIsProcessing(false);
            return null;
        } catch (err) {
            console.error("Detection error:", err);
            setIsProcessing(false);
            return null;
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

    // groupingMode is now initialized above

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
    // AND apply active hashtag filter if any
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
        if (tag) setGroupingMode('hashtags');
        setIsHashtagMenuOpen(false);
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`¿Estás seguro de que quieres borrar ${selectedPhotos.length} fotos?`)) {
            setPhotos(prev => prev.filter(p => !selectedPhotos.includes(p.id)));
            setSelectedPhotos([]);
            setIsSelectionMode(false);
        }
    };

    const handleMovePhotos = (targetPatientId) => {
        setPhotos(prev => prev.map(p =>
            selectedPhotos.includes(p.id) ? { ...p, patientId: targetPatientId } : p
        ));
        setSelectedPhotos([]);
        setIsSelectionMode(false);
        setIsMoveModalOpen(false);
    };

    const handleOpenFilters = () => {
        if (selectedPhotos.length === 1) {
            const photo = photos.find(p => p.id === selectedPhotos[0]);
            if (photo) {
                setFilterImage(photo.url);
                setRotation(0);
                setFineRotation(0);
                setHasBorder(false);
                setIsCropped(false);
                setIsEyesHidden(false);
                setIsEyesLeveled(false);
                setIsBackgroundRemoved(false);
                setIsFilterEditorOpen(true);
            }
        }
    };

    const handleActionAnalysis = () => {
        if (selectedPhotos.length === 1) {
            const photo = photos.find(p => p.id === selectedPhotos[0]);
            if (photo) {
                setAnalysisImage(photo.url);
                setIsAnalysisOpen(true);
            }
        }
    };

    const handleApplyFilters = async () => {
        if (selectedPhotos.length === 1) {
            // Simulated: In a real app we'd save the canvas as a new photo or update the existing one
            setIsFilterEditorOpen(false);
            setIsSelectionMode(false);
            setSelectedPhotos([]);
        }
    };

    const handleRemoveBgAction = async () => {
        if (!filterImage) return;
        setIsProcessing(true);
        setProcessingText('Quitando fondo...');
        try {
            const blob = await removeBackground(filterImage);
            const newUrl = URL.createObjectURL(blob);
            setFilterImage(newUrl);
            setIsBackgroundRemoved(true);
        } catch (e) {
            console.error('Error removing background:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleHideEyesAction = async () => {
        if (!filterImage) return;
        setIsProcessing(true);
        setProcessingText('Ocultando ojos...');
        try {
            const data = await detectFace(filterImage);
            if (data && data.eyes) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = filterImage;
                });
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const { x, y, width, height } = data.eyes;
                const rectW = (width / 100) * canvas.width;
                const rectH = (height / 100) * canvas.height;
                const rectX = ((x / 100) * canvas.width) - (rectW / 2);
                const rectY = ((y / 100) * canvas.height) - (rectH / 2);
                ctx.fillStyle = 'black';
                const padding = rectW * 0.15;
                ctx.fillRect(rectX - padding, rectY - (rectH * 0.2), rectW + (padding * 2), rectH * 1.4);
                setFilterImage(canvas.toDataURL());
                setIsEyesHidden(true);
            } else {
                alert('No se detectaron ojos en la imagen.');
            }
        } catch (e) {
            console.error('Error hiding eyes:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLevelEyesAction = async () => {
        if (!filterImage) return;
        setIsProcessing(true);
        setProcessingText('Nivelando ojos...');
        try {
            const data = await detectFace(filterImage);
            if (data && data.alignment) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = filterImage;
                });
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                const { left, right } = data.alignment;
                const dy = right.y - left.y;
                const dx = right.x - left.x;
                const angle = Math.atan2(dy, dx);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-angle);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                setFilterImage(canvas.toDataURL());
                setIsEyesLeveled(true);
            } else {
                alert('No se pudieron alinear los ojos.');
            }
        } catch (e) {
            console.error('Error leveling eyes:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    // Grouping logic for rendering
    const photoGroups = patientPhotos.reduce((groups, photo) => {
        let keys = [];
        if (groupingMode === 'date') {
            keys = [photo.date];
        } else if (groupingMode === 'hashtags') {
            const hashtags = photo.description?.match(/#[^\s#]+/g);
            keys = hashtags || ['Sin hashtag'];
        } else if (groupingMode === 'user') {
            keys = [patient.name];
        }

        keys.forEach(key => {
            if (!groups[key]) groups[key] = [];
            groups[key].push(photo);
        });
        return groups;
    }, {});

    const sortedGroupKeys = Object.keys(photoGroups).sort((a, b) => {
        if (groupingMode === 'date') {
            const parseDate = (d) => {
                const [day, month, year] = d.split('/');
                return new Date(year, month - 1, day);
            };
            return parseDate(b) - parseDate(a);
        }
        return a.localeCompare(b);
    });

    return (
        <div className="patient-detail-container">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
                accept="image/*"
            />
            <input
                type="file"
                ref={analysisFileInputRef}
                style={{ display: 'none' }}
                onChange={handleAnalysisFileChange}
                accept="image/*"
            />

            <header className="detail-header">
                <div className="header-left">
                    <button className="back-button" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <div className="patient-profile-summary">
                        <div className="detail-avatar">{patient.name.charAt(0).toUpperCase()}</div>
                        <div className="detail-info">
                            <span className="detail-name">{patient.name}</span>
                            <span className="detail-age">{calculateAge(patient.dob)}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`action-btn ${isSelectionMode ? 'active' : ''}`}
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedPhotos([]);
                        }}
                        title="Seleccionar fotos"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <div className="view-switcher" style={{ marginRight: '8px' }}>
                        <button
                            className={`switch-btn ${viewMode === 'sessions' ? 'active' : ''}`}
                            onClick={() => setViewMode('sessions')}
                            title="Vista por sesiones"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <button
                            className={`switch-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                            onClick={() => setViewMode('gallery')}
                            title="Vista galería"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                    </div>
                    <div className="action-menu-wrapper">
                        <button className="action-btn" onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                        {isActionMenuOpen && (
                            <>
                                <div className="dropdown-backdrop" onClick={() => setIsActionMenuOpen(false)}></div>
                                <div className="action-dropdown-menu">
                                    <div className="action-option" onClick={() => { onEditPatient(); setIsActionMenuOpen(false); }}>Editar paciente</div>
                                    <div className="action-option" onClick={() => { handleCollageClick(); setIsActionMenuOpen(false); }}>Crear Collage</div>
                                    <div className="action-option" onClick={() => { handleAnalysisClick(); setIsActionMenuOpen(false); }}>Análisis facial IA</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="controls-bar">
                <div className="hashtag-filter-wrapper">
                    <button
                        className={`hashtags-dropdown ${(activeHashtagFilter || groupingMode !== 'date' || viewMode === 'gallery') ? 'active' : ''}`}
                        onClick={() => setIsHashtagMenuOpen(!isHashtagMenuOpen)}
                    >
                        {activeHashtagFilter || (viewMode === 'gallery' ? 'Galería' : groupingMode === 'date' ? 'Agrupado por Fecha' : groupingMode === 'hashtags' ? 'Agrupado por Hashtags' : 'Agrupado por Usuario')}
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
                                        className={`hashtag-option ${groupingMode === 'hashtags' && !activeHashtagFilter ? 'selected' : ''}`}
                                        onClick={() => { setGroupingMode('hashtags'); setActiveHashtagFilter(null); setViewMode('sessions'); setIsHashtagMenuOpen(false); }}
                                    >
                                        # Hashtags
                                    </div>
                                    <div
                                        className={`hashtag-option ${groupingMode === 'date' && !activeHashtagFilter ? 'selected' : ''}`}
                                        onClick={() => { setGroupingMode('date'); setActiveHashtagFilter(null); setViewMode('sessions'); setIsHashtagMenuOpen(false); }}
                                    >
                                        📅 Fecha
                                    </div>
                                    <div
                                        className={`hashtag-option ${groupingMode === 'user' && !activeHashtagFilter ? 'selected' : ''}`}
                                        onClick={() => { setGroupingMode('user'); setActiveHashtagFilter(null); setViewMode('sessions'); setIsHashtagMenuOpen(false); }}
                                    >
                                        👤 Usuario
                                    </div>
                                </div>

                                {availableHashtags.length > 0 && (
                                    <div className="dropdown-section">
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-section-title">Filtrar por hashtag</div>
                                        <div className="folders-list-scroll">
                                            <div
                                                className={`hashtag-option ${!activeHashtagFilter ? 'selected' : ''}`}
                                                onClick={() => handleHashtagClick(null)}
                                            >
                                                Ver todos
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="detail-content">
                {patientPhotos.length > 0 ? (
                    viewMode === 'gallery' ? (
                        <div className="photos-grid">
                            {patientPhotos.map(photo => (
                                <div
                                    key={photo.id}
                                    className={`photo-card ${isSelectionMode ? 'selection-mode' : ''} ${selectedPhotos.includes(photo.id) ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (isSelectionMode) {
                                            setSelectedPhotos(prev =>
                                                prev.includes(photo.id)
                                                    ? prev.filter(id => id !== photo.id)
                                                    : [...prev, photo.id]
                                            );
                                        }
                                    }}
                                >
                                    {isSelectionMode && (
                                        <div className="selection-circle">
                                            {selectedPhotos.includes(photo.id) && <div className="checked-inner"></div>}
                                        </div>
                                    )}
                                    <img src={photo.url} alt="Patient" />
                                    <button
                                        className="delete-photo-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(photo.id);
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                    <div className="photo-info-bar">
                                        <input
                                            type="text"
                                            className="photo-note-input"
                                            placeholder="Añadir nota..."
                                            value={photo.description || ''}
                                            onChange={(e) => handleUpdatePhotoDescription(photo.id, e.target.value)}
                                        />
                                        <div className="photo-timestamp">{photo.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="photos-groups">
                            {sortedGroupKeys.map(key => (
                                <div key={key} className="photo-group">
                                    <h3 className="group-header">
                                        {groupingMode === 'date' ? `${key} • Sesión de fotos` : `${key}`}
                                    </h3>
                                    <div className="photos-grid">
                                        {photoGroups[key].map(photo => (
                                            <div
                                                key={photo.id}
                                                className={`photo-card ${isSelectionMode ? 'selection-mode' : ''} ${selectedPhotos.includes(photo.id) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (isSelectionMode) {
                                                        setSelectedPhotos(prev =>
                                                            prev.includes(photo.id)
                                                                ? prev.filter(id => id !== photo.id)
                                                                : [...prev, photo.id]
                                                        );
                                                    }
                                                }}
                                            >
                                                {isSelectionMode && (
                                                    <div className="selection-circle">
                                                        {selectedPhotos.includes(photo.id) && <div className="checked-inner"></div>}
                                                    </div>
                                                )}
                                                <img src={photo.url} alt="Patient" />
                                                <button
                                                    className="delete-photo-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePhoto(photo.id);
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                                <div className="photo-info-bar">
                                                    <input
                                                        type="text"
                                                        className="photo-note-input"
                                                        placeholder="Añadir nota..."
                                                        value={photo.description || ''}
                                                        onChange={(e) => handleUpdatePhotoDescription(photo.id, e.target.value)}
                                                    />
                                                    <div className="photo-timestamp">{photo.date}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="empty-state">
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
                    </div>
                )}
            </div>

            <div className="detail-footer">
                {!isSelectionMode && (
                    <button className="create-fab" onClick={() => setIsMenuOpen(true)}>
                        <span>+</span> Crear
                    </button>
                )}
            </div>

            {
                isMenuOpen && (
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
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <circle cx="12" cy="12" r="4"></circle>
                                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
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
                )
            }

            {
                isAnalysisSourceModalOpen && (
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
                )
            }

            {
                isAnalysisOpen && analysisImage && (
                    <FacialAnalysis
                        imageSrc={analysisImage}
                        onClose={() => setIsAnalysisOpen(false)}
                    />
                )
            }

            {
                isSelectionMode && (
                    <div className="selection-action-bar-container">
                        <div className="selection-action-bar">
                            <div className="menu-handle"></div>
                            <div className="selection-options">
                                <button
                                    className={`selection-option-btn ${selectedPhotos.length !== 1 ? 'disabled' : ''}`}
                                    onClick={selectedPhotos.length === 1 ? handleCollageClick : null}
                                    disabled={selectedPhotos.length !== 1}
                                >
                                    <div className="option-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                    </div>
                                    <span>Collage</span>
                                </button>

                                <button
                                    className={`selection-option-btn ${selectedPhotos.length !== 1 ? 'disabled' : ''}`}
                                    onClick={handleOpenFilters}
                                    disabled={selectedPhotos.length !== 1}
                                >
                                    <div className="option-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="12" y1="3" x2="12" y2="21"></line>
                                            <path d="M7 8l-4 4 4 4"></path>
                                            <path d="M17 8l4 4-4 4"></path>
                                        </svg>
                                    </div>
                                    <span>Filtros</span>
                                </button>

                                <button
                                    className={`selection-option-btn ${selectedPhotos.length !== 1 ? 'disabled' : ''}`}
                                    onClick={selectedPhotos.length === 1 ? handleActionAnalysis : null}
                                    disabled={selectedPhotos.length !== 1}
                                >
                                    <div className="option-icon" style={{ position: 'relative' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <circle cx="12" cy="12" r="4"></circle>
                                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                                        </svg>
                                        <span className="badge-ia" style={{ top: '-8px', right: '-12px' }}>IA</span>
                                    </div>
                                    <span>Análisis facial</span>
                                </button>

                                <button className="selection-option-btn" onClick={() => setIsMoveModalOpen(true)}>
                                    <div className="option-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 17l-5-5 5-5"></path>
                                            <path d="M18 17l-5-5 5-5"></path>
                                        </svg>
                                    </div>
                                    <span>Mover</span>
                                </button>

                                <button
                                    className="selection-option-btn delete"
                                    onClick={handleDeleteSelected}
                                >
                                    <div className="option-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </div>
                                    <span>Eliminar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <MovePatientModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                patients={patients}
                currentPatientId={patient.id}
                onMove={handleMovePhotos}
            />

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

            {
                isFilterEditorOpen && (
                    <div className="filter-editor-overlay">
                        <header className="filter-editor-header">
                            <div className="header-left">
                                <button className="back-button" onClick={() => setIsFilterEditorOpen(false)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                </button>
                                <span className="editor-title">1 foto</span>
                            </div>
                            <div className="header-right">
                                {isProcessing && (
                                    <div className="ai-processing-status">
                                        <div className="ai-pulse"></div>
                                        <span>{processingText}</span>
                                    </div>
                                )}
                                <button className="apply-filters-btn" onClick={handleApplyFilters} disabled={isProcessing}>
                                    {isProcessing ? 'Procesando...' : 'Aplicar filtros'}
                                </button>
                            </div>
                        </header>

                        <div className="filter-editor-content">
                            <div className="editor-preview-container">
                                <div className="editor-image-wrapper" style={{ transform: `rotate(${rotation + fineRotation}deg)` }}>
                                    <img src={filterImage} alt="Preview" className={`editor-preview-image ${hasBorder ? 'with-border' : ''}`} />
                                </div>
                            </div>

                            {activeFilterTool === 'rotate' && (
                                <div className="editor-floating-slider">
                                    <button className="slider-reset-btn" onClick={() => setFineRotation(0)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                        </svg>
                                    </button>
                                    <input
                                        type="range"
                                        min="-45"
                                        max="45"
                                        value={fineRotation}
                                        onChange={(e) => setFineRotation(parseInt(e.target.value))}
                                        className="rotation-range-input"
                                    />
                                    <span className="rotation-value">{fineRotation}°</span>
                                </div>
                            )}

                            <div className="editor-controls-sidebar">
                                <div
                                    className={`filter-card ${isBackgroundRemoved ? 'active' : ''}`}
                                    onClick={handleRemoveBgAction}
                                >
                                    <div className="filter-icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                            <path d="M3 3h4M17 3h4M3 21h4M17 21h4M3 3v4M21 3v4M3 17v4M21 17v4"></path>
                                        </svg>
                                        <span className="ia-badge-label">IA</span>
                                    </div>
                                    <span>Quitar fondo de la cara</span>
                                </div>
                                <div
                                    className={`filter-card ${isEyesHidden ? 'active' : ''}`}
                                    onClick={handleHideEyesAction}
                                >
                                    <div className="filter-icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                        <span className="ia-badge-label">IA</span>
                                    </div>
                                    <span>Ocultar ojos</span>
                                </div>
                                <div
                                    className={`filter-card ${isEyesLeveled ? 'active' : ''}`}
                                    onClick={handleLevelEyesAction}
                                >
                                    <div className="filter-icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 4v6h-6"></path>
                                            <path d="M1 20v-6h6"></path>
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                                        </svg>
                                        <span className="ia-badge-label">IA</span>
                                    </div>
                                    <span>Nivelar ojos</span>
                                </div>
                                <div
                                    className={`filter-card ${activeFilterTool === 'rotate' ? 'active' : ''}`}
                                    onClick={() => setActiveFilterTool(activeFilterTool === 'rotate' ? null : 'rotate')}
                                >
                                    <div className="filter-icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <path d="M7 2h10"></path>
                                            <path d="M7 22h10"></path>
                                            <path d="M2 7v10"></path>
                                            <path d="M22 7v10"></path>
                                            <path d="M16 8l-4-4-4 4"></path>
                                        </svg>
                                    </div>
                                    <span>Rotar</span>
                                </div>
                                <div
                                    className={`filter-card ${hasBorder ? 'active' : ''}`}
                                    onClick={() => setHasBorder(!hasBorder)}
                                >
                                    <div className="filter-icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <rect x="7" y="7" width="10" height="10"></rect>
                                        </svg>
                                    </div>
                                    <span>Borde</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PatientDetail;
