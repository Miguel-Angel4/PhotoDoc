import React, { useState, useRef, useEffect } from 'react';
import './CameraModal.css';

const CameraModal = ({ isOpen, onClose, onPhotoTaken }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, facingMode]); // Restart camera when facingMode changes

    const startCamera = async () => {
        setCapturedImage(null);
        setError(null);
        try {
            stopCamera(); // Stop any existing stream first
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageUrl);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleSave = () => {
        if (onPhotoTaken && capturedImage) {
            onPhotoTaken(capturedImage);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="camera-modal-overlay">
            <div className="camera-modal-header">
                <button className="close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <h2 className="camera-modal-title">Cámara</h2>
                <div style={{ width: 32 }}></div> {/* Spacer for alignment */}
            </div>

            <div className="camera-modal-content">
                {error ? (
                    <div className="camera-error">
                        <p>{error}</p>
                        <button className="retry-btn" onClick={startCamera}>Reintentar</button>
                    </div>
                ) : (
                    <>
                        {!capturedImage ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="camera-preview"
                            />
                        ) : (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="camera-preview"
                            />
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </>
                )}
            </div>

            <div className="camera-controls">
                {!error && (
                    <>
                        {!capturedImage ? (
                            <div className="camera-action-row">
                                <button className="switch-camera-btn" onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8h2l-3 4-3-4h2c0-5.523 4.477-10 10-10s10 4.477 10 10h-2l3 4 3-4h-2z" transform="rotate(90 12 12)" />
                                    </svg>
                                </button>
                                <button className="camera-btn" onClick={takePhoto}>
                                    <div className="camera-btn-inner"></div>
                                </button>
                                <div style={{ width: 48 }}></div> {/* Spacer to center shutter */}
                            </div>
                        ) : (
                            <>
                                <button className="retry-btn" onClick={handleRetake}>Repetir</button>
                                <button className="save-photo-btn" onClick={handleSave}>Usar foto</button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraModal;
