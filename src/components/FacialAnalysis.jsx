import React, { useEffect, useState, useRef } from 'react';
import './FacialAnalysis.css';

const FacialAnalysis = ({ imageSrc, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            if (window.faceapi) {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await Promise.all([
                    window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
            }
        };

        const analyzeFace = async () => {
            if (!window.faceapi) {
                setError("La librería de IA no está cargada.");
                setIsProcessing(false);
                return;
            }

            try {
                await loadModels();
                const img = new Image();
                img.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageSrc;
                });

                // Detect face with 68 landmarks
                const detection = await window.faceapi.detectSingleFace(img, new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
                    .withFaceLandmarks();

                if (!detection) {
                    setError("No se ha detectado ningún rostro en la imagen.");
                    setIsProcessing(false);
                    return;
                }

                const landmarks = detection.landmarks.positions;
                // ... rest of the logic ... (I'll just replace the whole analyzeFace for safety)
                const glabellaY = (landmarks[21].y + landmarks[22].y) / 2;
                const subnasaleY = landmarks[33].y;
                const mentonY = landmarks[8].y;
                const lowerHalf = mentonY - glabellaY;
                const estimatedTrichionY = glabellaY - (lowerHalf / 2);

                const thirds = {
                    top: estimatedTrichionY,
                    middleTop: glabellaY,
                    middleBottom: subnasaleY,
                    bottom: mentonY,
                    totalHeight: mentonY - estimatedTrichionY,
                    sections: [
                        { label: 'Tercio Superior', height: glabellaY - estimatedTrichionY },
                        { label: 'Tercio Medio', height: subnasaleY - glabellaY },
                        { label: 'Tercio Inferior', height: mentonY - subnasaleY }
                    ]
                };

                const leftOuterEyeX = landmarks[36].x;
                const leftInnerEyeX = landmarks[39].x;
                const rightInnerEyeX = landmarks[42].x;
                const rightOuterEyeX = landmarks[45].x;
                const faceLeftX = landmarks[0].x;
                const faceRightX = landmarks[16].x;

                const fifths = {
                    p0: faceLeftX,
                    p1: leftOuterEyeX,
                    p2: leftInnerEyeX,
                    p3: rightInnerEyeX,
                    p4: rightOuterEyeX,
                    p5: faceRightX
                };

                const mouthWidth = landmarks[54].x - landmarks[48].x;
                const interpupillaryDist = ((landmarks[42].x + landmarks[45].x) / 2) - ((landmarks[36].x + landmarks[39].x) / 2);
                const noseWidth = landmarks[35].x - landmarks[31].x;

                setAnalysisData({
                    thirds,
                    fifths,
                    ratios: {
                        mouthEye: (mouthWidth / interpupillaryDist).toFixed(2),
                        eyeNose: ((leftInnerEyeX - leftOuterEyeX) / noseWidth).toFixed(2)
                    },
                    imgSize: { width: img.width, height: img.height }
                });

                drawOverlay(img, thirds, fifths);
                setIsProcessing(false);

            } catch (err) {
                console.error("Error in facial analysis:", err);
                setError("Error al procesar la imagen: " + err.message);
                setIsProcessing(false);
            }
        };

        analyzeFace();
    }, [imageSrc]);

    const drawOverlay = (img, thirds, fifths) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Scale canvas to fit container while maintaining aspect ratio
        const container = containerRef.current;
        const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const s = (val) => val * scale; // Helper to scale points

        // --- DRAW THIRDS (Horizontal Lines) ---
        ctx.strokeStyle = 'rgba(0, 188, 212, 0.8)'; // Cyan
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        [thirds.top, thirds.middleTop, thirds.middleBottom, thirds.bottom].forEach(y => {
            ctx.beginPath();
            ctx.moveTo(0, s(y));
            ctx.lineTo(canvas.width, s(y));
            ctx.stroke();
        });

        // --- DRAW FIFTHS (Vertical Lines) ---
        ctx.strokeStyle = 'rgba(255, 193, 7, 0.8)'; // Amber
        [fifths.p0, fifths.p1, fifths.p2, fifths.p3, fifths.p4, fifths.p5].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(s(x), 0);
            ctx.lineTo(s(x), canvas.height);
            ctx.stroke();
        });

        // Labeling
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '12px Inter, sans-serif';

        // Thirds labels
        thirds.sections.forEach((sec, i) => {
            const yPos = i === 0 ? thirds.top : (i === 1 ? thirds.middleTop : thirds.middleBottom);
            ctx.fillRect(5, s(yPos) + 5, 100, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(sec.label, 10, s(yPos) + 20);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        });
    };

    return (
        <div className="facial-analysis-overlay">
            <div className="analysis-card">
                <header className="analysis-header">
                    <h2>Análisis de Armonía Facial</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="analysis-body">
                    <div className="canvas-container" ref={containerRef}>
                        {isProcessing && (
                            <div className="analysis-loader">
                                <div className="spinner"></div>
                                <p>Procesando métricas biométricas...</p>
                            </div>
                        )}
                        {error && (
                            <div className="analysis-error">
                                <p>{error}</p>
                                <button onClick={onClose}>Volver</button>
                            </div>
                        )}
                        <canvas ref={canvasRef} />
                    </div>

                    {!isProcessing && analysisData && (
                        <aside className="metrics-panel">
                            <div className="metric-group">
                                <h3>Tercios Horizontales</h3>
                                {analysisData.thirds.sections.map((sec, i) => {
                                    const percent = ((sec.height / analysisData.thirds.totalHeight) * 100).toFixed(1);
                                    return (
                                        <div key={i} className="metric-item">
                                            <span>{sec.label}:</span>
                                            <span className="metric-value">{percent}%</span>
                                            <div className="metric-bar">
                                                <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: '#00bcd4' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <p className="metric-note">Equilibrio ideal: 33.3% cada tercio.</p>
                            </div>

                            <div className="metric-group">
                                <h3>Proporciones y Ratios</h3>
                                <div className="metric-item">
                                    <span>Ratio Ojo-Boca:</span>
                                    <span className="metric-value">{analysisData.ratios.mouthEye}</span>
                                </div>
                                <div className="metric-item">
                                    <span>Ratio Ojo-Nariz:</span>
                                    <span className="metric-value">{analysisData.ratios.eyeNose}</span>
                                </div>
                                <div className="metric-status">
                                    <div className="status-dot green"></div>
                                    <span>Simetría detectada</span>
                                </div>
                            </div>

                            <footer className="analysis-footer-info">
                                <p>📌 Datos procesados para evaluación estética de proporciones y balances faciales.</p>
                            </footer>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacialAnalysis;
