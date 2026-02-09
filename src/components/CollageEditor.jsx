import React, { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import html2canvas from 'html2canvas';
import './CollageEditor.css';

const CollageEditor = ({ onBack, photos, onSave }) => {
    const [activeTool, setActiveTool] = useState('layout'); // layout, zoom, remove_bg, etc.
    const [selectedLayout, setSelectedLayout] = useState('2-cols');

    const layouts = [
        { id: '2-cols', icon: <path d="M3 3h8v18H3V3zM13 3h8v18h-8V3z" /> },
        { id: '2-rows', icon: <path d="M3 3h18v8H3V3zM3 13h18v8H3v-8z" /> },
        { id: '3-cols', icon: <path d="M3 3h5v18H3V3zM10 3h4v18h-4V3zM16 3h5v18h-5V3z" /> },
        { id: '3-rows', icon: <path d="M3 3h18v5H3V3zM3 10h18v4H3v-4zM3 16h18v5H3v-5z" /> },
        { id: '1-right-2-left', icon: <path d="M13 3h8v18h-8V3zM3 3h8v8H3V3zM3 13h8v8H3v-8z" /> }, // Option 5: Reversed
        { id: '1-left-2-right', icon: <path d="M3 3h8v18H3V3zM13 3h8v8h-8V3zM13 13h8v8h-8v-8z" /> },
        { id: '1-top-2-bottom', icon: <path d="M3 3h18v8H3V3zM3 13h8v8H3v-8zM13 13h8v8h-8v-8z" /> },
        { id: '4-mix', icon: <path d="M3 3h8v8H3V3zM13 3h8v8h-8V3zM3 13h8v8H3v-8zM13 13h8v8h-8v-8z" /> },
        { id: '1-vertical-split', icon: <path d="M3 3h18v18H3V3zM12 3v18" /> }, // Option 9: 1 img, vertical line
        { id: '1-horizontal-split', icon: <path d="M3 3h18v18H3V3zM3 12h18" /> } // Option 10: 1 img, horizontal line
    ];

    const [selectedZoom, setSelectedZoom] = useState('whole');
    const [slotZooms, setSlotZooms] = useState({}); // Per-slot zoom overrides
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedSidebarPhoto, setSelectedSidebarPhoto] = useState(null); // New: For mobile click-to-place
    const [rotations, setRotations] = useState({});
    const [fineRotations, setFineRotations] = useState({});

    const [hasBorder, setHasBorder] = useState(false);
    const [slotImages, setSlotImages] = useState({});
    // Store original images to support "Before/After" feature
    const [originalImages, setOriginalImages] = useState({});
    const [landmarkData, setLandmarkData] = useState({}); // Stores { slotIdx: { eyes: {x,y}, mouth: {x,y}, ... } }
    const [isAiLoaded, setIsAiLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingText, setProcessingText] = useState('Escaneando rostros con IA...');

    // Before/After Mode State
    const [isBeforeAfterActive, setIsBeforeAfterActive] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [showDate, setShowDate] = useState(false);

    // Ref to track which image URLs have already been processed to avoid infinite loops
    const processedUrlsRef = React.useRef({});

    // Initial AI Setup
    React.useEffect(() => {
        const loadModels = async () => {
            if (window.faceapi && !isAiLoaded) {
                // Models are loaded from CDN for zero-backend setup
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await Promise.all([
                    window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Use higher accuracy model
                    window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
                setIsAiLoaded(true);
            }
        };
        loadModels();
    }, []);

    // Helper to detect face for a specific slot on demand
    const detectFace = async (idx) => {
        if (!isAiLoaded || !slotImages[idx]) return null;

        // If we already have valid data, return it
        if (landmarkData[idx] && !landmarkData[idx].fallback && landmarkData[idx].alignment) {
            return landmarkData[idx];
        }

        setIsProcessing(true);
        setProcessingText('Escaneando rostro...');

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = slotImages[idx];
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

                const newData = {
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

                setLandmarkData(prev => ({ ...prev, [idx]: newData }));
                setIsProcessing(false);
                return newData;
            } else {
                setLandmarkData(prev => ({ ...prev, [idx]: { fallback: true } }));
                setIsProcessing(false);
                return null;
            }
        } catch (err) {
            console.error(`Error detecting face in slot ${idx}:`, err);
            setLandmarkData(prev => ({ ...prev, [idx]: { fallback: true } }));
            setIsProcessing(false);
            return null;
        }
    };

    // Automatic Processing Effect: Scans new images when they are added
    React.useEffect(() => {
        if (!isAiLoaded) return;

        Object.entries(slotImages).forEach(([key, url]) => {
            const idx = parseInt(key);
            // If this exact URL hasn't been successfully processed or attempted yet
            if (processedUrlsRef.current[idx] !== url) {
                // Update ref immediately to prevent double-triggering
                processedUrlsRef.current[idx] = url;
                detectFace(idx);
            }
        });
    }, [slotImages, isAiLoaded]);

    // Effect for Before/After 5-second toggle
    React.useEffect(() => {
        let interval;
        if (isBeforeAfterActive) {
            // Start showing original immediately? Or wait? Let's start with original for impact
            setShowOriginal(true);
            interval = setInterval(() => {
                setShowOriginal(prev => !prev);
            }, 5000);
        } else {
            setShowOriginal(false);
        }
        return () => clearInterval(interval);
    }, [isBeforeAfterActive]);

    const handleDragStart = (e, photoUrl) => {
        e.dataTransfer.setData('text/plain', photoUrl);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, slotIndex) => {
        e.preventDefault();
        const photoUrl = e.dataTransfer.getData('text/plain');
        if (photoUrl) {
            setSlotImages(prev => ({
                ...prev,
                [slotIndex]: photoUrl
            }));
            // Also save to originalImages
            setOriginalImages(prev => ({
                ...prev,
                [slotIndex]: photoUrl
            }));

            // Clear previous landmarks for this slot
            setLandmarkData(prev => {
                const next = { ...prev };
                delete next[slotIndex];
                return next;
            });

            // Reset rotation
            setRotations(prev => {
                const next = { ...prev };
                delete next[slotIndex];
                return next;
            });
            // Reset fine rotation
            setFineRotations(prev => {
                const next = { ...prev };
                delete next[slotIndex];
                return next;
            });
        }
    };

    const zoomOptions = [
        {
            id: 'face',
            label: 'Cara',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
        },
        {
            id: 'eyes',
            label: 'Ojos',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12s2.5-7.5 9.5-7.5S21.5 12 21.5 12s-2.5 7.5-9.5 7.5-9.5-7.5-9.5-7.5z" /><circle cx="12" cy="12" r="3" /></svg>
        },
        {
            id: 'nose',
            label: 'Nariz',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" opacity="0.1" /><path d="M18 14a6 6 0 0 1-12 0v-4a6 6 0 0 1 12 0z" opacity="0.1" /><path d="M10 15c0 1.5 2 1.5 2 3s2-1.5 2-3" /></svg> // Abstract Nose
        },
        {
            id: 'mouth',
            label: 'Boca',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 10h.01" /><path d="M15 10h.01" /></svg> // Using simple smile for mouth or similar
        },
        {
            id: 'whole',
            label: 'Toda la foto',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-5-5" /><path d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" /><path d="M3 3l18 18" strokeWidth="1" opacity="0.5" /></svg> // Frame icon better
        }
    ];

    const getSlotCount = (layoutId) => {
        switch (layoutId) {
            case '2-cols': return 2;
            case '2-rows': return 2;
            case '3-cols': return 3;
            case '3-rows': return 3;
            case '1-right-2-left': return 3; // New option 5
            case '1-left-2-right': return 3;
            case '1-top-2-bottom': return 3;
            case '4-mix': return 4;
            case '1-vertical-split': return 2; // New option 9
            case '1-horizontal-split': return 2; // New option 10
            default: return 4;
        }
    };

    const getSlotStyle = (i) => {
        const baseStyle = {
            width: '100%',
            height: '100%',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        };

        // Use specific slot zoom if available, otherwise global default
        const effectiveZoom = slotZooms[i] || selectedZoom;

        if (effectiveZoom === 'whole') {
            const data = landmarkData[i];
            // When "whole" is selected, we just want standard fit-contain behavior usually, 
            // but if we had data we could use it. Here we stick to simple behavior.

            let objectFit = 'contain';
            let objectPosition = 'center';

            if (selectedLayout === '1-vertical-split') {
                objectFit = 'cover';
                objectPosition = i === 0 ? 'left center' : 'right center';
            } else if (selectedLayout === '1-horizontal-split') {
                objectFit = 'cover';
                objectPosition = i === 0 ? 'top center' : 'bottom center';
            }

            return {
                ...baseStyle,
                objectFit,
                objectPosition,
                transform: `rotate(${(rotations[i] || 0) + (fineRotations[i] || 0)}deg)`,
                position: 'relative',
                left: 'auto',
                top: 'auto',
                minWidth: 'auto',
                minHeight: 'auto'
            };
        }

        const data = landmarkData[i];
        if (!data || data.fallback) {
            // Fallback for failed detection or loading
            return {
                ...baseStyle,
                objectFit: 'cover'
            };
        }

        let origin = { x: 50, y: 50 };
        let featureSize = 1; // % of image
        let targetFill = 100; // % of container
        let isHeightBased = false;

        if (effectiveZoom === 'face') {
            targetFill = 60;
            featureSize = data.face.width;
            origin = { x: data.face.x, y: data.face.y };
        } else if (effectiveZoom === 'eyes') {
            targetFill = 60;
            featureSize = data.eyes.width;
            origin = data.eyes;
        } else if (effectiveZoom === 'nose') {
            // Nose is Height-based
            isHeightBased = true;
            targetFill = 60;
            featureSize = data.nose.height;
            origin = data.nose;
        } else if (effectiveZoom === 'mouth') {
            targetFill = 50;
            featureSize = data.mouth.width;
            origin = data.mouth;
        }

        // Calculate Zoom Factor
        // If feature is 10% of image, and we want it to be 50% of container...
        // Image needs to be 500% width.
        // Formula: (Target / Feature)
        if (featureSize <= 0) featureSize = 1; // Safety

        let zoomFactor = targetFill / featureSize;

        // Cap max zoom at 20x to prevent crashes/rendering issues, min 1x
        zoomFactor = Math.min(Math.max(zoomFactor, 1), 20);

        const dimStyle = isHeightBased
            ? { height: `${zoomFactor * 100}%`, width: 'auto' }
            : { width: `${zoomFactor * 100}%`, height: 'auto' };

        return {
            position: 'absolute',
            left: '50%',
            top: '50%',
            minWidth: '100%',
            minHeight: '100%',
            ...dimStyle,
            // Centering:
            // Anchor is 50%, 50% of container.
            // We want 'origin' point of image to be at Anchor.
            // translate(-origin%) moves that point to 0,0 of the element... which is at Anchor.
            transform: `translate(-${origin.x}%, -${origin.y}%) rotate(${(rotations[i] || 0) + (fineRotations[i] || 0)}deg)`,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        };
    };

    const handleRotate = () => {
        if (selectedSlot === null) return;
        setActiveTool(prev => prev === 'rotate' ? 'layout' : 'rotate');
    };

    const handleFineRotate = (deg) => {
        if (selectedSlot === null) return;
        setFineRotations(prev => ({
            ...prev,
            [selectedSlot]: deg
        }));
    };

    const handleZoomOptionClick = async (zoomId) => {
        if (selectedSlot !== null) {
            // If in selection mode, apply ONLY to this slot
            setSlotZooms(prev => ({
                ...prev,
                [selectedSlot]: zoomId
            }));

            // If selecting a facial feature zoom, ensure we have data
            if (['face', 'eyes', 'nose', 'mouth'].includes(zoomId)) {
                const data = landmarkData[selectedSlot];
                if (!data || data.fallback || !data.alignment) {
                    await detectFace(selectedSlot);
                }
            }
        } else {
            // If in global mode, apply global setting (and reset individual overrides?)
            // Usually global overrides specific, or specific overrides global?
            // Let's clear specific overrides so global takes effect everywhere
            setSelectedZoom(zoomId);
            setSlotZooms({});

            // Note: In global mode we don't auto-trigger AI for all (expensive), 
            // relies on the new auto-scan or user waiting.
        }
    };

    const handleRemoveBackground = async () => {
        // If a slot is selected, only process that one. Otherwise process all.
        const slotsToProcess = selectedSlot !== null
            ? [selectedSlot.toString()]
            : Object.keys(slotImages);

        if (slotsToProcess.length === 0) return;

        setIsProcessing(true);
        let processedCount = 0;
        const total = Object.keys(slotImages).length;

        try {
            for (const slotIndex of slotsToProcess) {
                processedCount++;
                setProcessingText(`Removiendo fondo (${processedCount}/${total})...`);

                const currentUrl = slotImages[slotIndex];
                if (!currentUrl) continue;

                try {
                    // Remove background for this specific image
                    const blob = await removeBackground(currentUrl);
                    const newUrl = URL.createObjectURL(blob);

                    // Update state immediately so user sees progress
                    setSlotImages(prev => ({
                        ...prev,
                        [slotIndex]: newUrl
                    }));
                } catch (innerError) {
                    console.error(`Failed to remove bg for slot ${slotIndex}`, innerError);
                }
            }
        } catch (error) {
            console.error('Batch background removal error:', error);
        } finally {
            setIsProcessing(false);
            setProcessingText('Escaneando rostros con IA...');
        }
    };

    const handleHideEyes = async () => {
        const slotsToProcess = selectedSlot !== null
            ? [selectedSlot.toString()]
            : Object.keys(slotImages);

        if (slotsToProcess.length === 0) return;

        setIsProcessing(true);
        let processedCount = 0;
        const total = Object.keys(slotImages).length;

        try {
            for (const slotIndex of slotsToProcess) {
                processedCount++;
                setProcessingText(`Censurando ojos (${processedCount}/${total})...`);

                const currentUrl = slotImages[slotIndex];

                // Ensure data exists before proceeding
                let data = landmarkData[slotIndex];
                if (!data || !data.eyes || data.fallback) {
                    data = await detectFace(slotIndex);
                }

                // If no eyes detected (or fallback), skip or just skip logic
                if (!currentUrl || !data || !data.eyes || data.fallback) continue;

                try {
                    // Create canvas to draw the censorship bar
                    const img = new Image();
                    img.crossOrigin = 'anonymous';

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = currentUrl;
                    });

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    // Draw original image
                    ctx.drawImage(img, 0, 0);

                    // Draw Black Bar over Eyes
                    // data.eyes contains center x,y and width,height in PERCENTAGES
                    const { x, y, width, height } = data.eyes;

                    // Convert % to px
                    // x, y are center points, so subtract half dim to get top-left
                    const rectW = (width / 100) * canvas.width;
                    const rectH = (height / 100) * canvas.height;
                    const rectX = ((x / 100) * canvas.width) - (rectW / 2);
                    const rectY = ((y / 100) * canvas.height) - (rectH / 2);

                    ctx.fillStyle = 'black';
                    // Make the bar slightly wider than the exact eye area for better coverage
                    const padding = rectW * 0.15; // Increased padding
                    ctx.fillRect(rectX - padding, rectY - (rectH * 0.2), rectW + (padding * 2), rectH * 1.4);

                    // Export
                    const blob = await new Promise(resolve => canvas.toBlob(resolve));
                    const newUrl = URL.createObjectURL(blob);

                    // Prevent auto-rescan of this image since we know it has a face (censored)
                    processedUrlsRef.current[slotIndex] = newUrl;

                    setSlotImages(prev => ({
                        ...prev,
                        [slotIndex]: newUrl
                    }));

                } catch (innerError) {
                    console.error(`Failed to censor eyes for slot ${slotIndex}`, innerError);
                }
            }
        } catch (error) {
            console.error('Batch hide eyes error:', error);
        } finally {
            setIsProcessing(false);
            setProcessingText('Escaneando rostros con IA...');
        }
    };

    const handleLevelEyes = async () => {
        const slotsToProcess = selectedSlot !== null
            ? [selectedSlot.toString()]
            : Object.keys(slotImages);

        if (slotsToProcess.length === 0) return;

        setIsProcessing(true);
        let processedCount = 0;
        const total = Object.keys(slotImages).length;

        try {
            for (const slotIndex of slotsToProcess) {
                processedCount++;
                setProcessingText(`Nivelando ojos (${processedCount}/${total})...`);

                const currentUrl = slotImages[slotIndex];

                // Ensure data exists before proceeding
                let data = landmarkData[slotIndex];
                if (!data || !data.alignment || data.fallback) {
                    data = await detectFace(slotIndex);
                }

                // Check specifically for alignment data
                if (!currentUrl || !data || !data.alignment) continue;

                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';

                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = currentUrl;
                    });

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    // Calculate Angle
                    const { left, right } = data.alignment;
                    // dy is positive if right eye is lower than left (y increases downwards)
                    const dy = right.y - left.y;
                    const dx = right.x - left.x;
                    const angle = Math.atan2(dy, dx);

                    // Rotate around center
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    // We rotate by -angle to counteract the tilt
                    ctx.rotate(-angle);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);

                    const blob = await new Promise(resolve => canvas.toBlob(resolve));
                    const newUrl = URL.createObjectURL(blob);

                    // Calculate rotated landmarks so we don't lose them
                    // Rotate point (x,y) around (50,50) by -angle
                    const rotatePoint = (p) => {
                        const cx = 50, cy = 50; // Percentages
                        // Convert to ratio for aspect ratio correction? 
                        // Actually, landmarks are %, so we need to account for aspect ratio if image isn't square
                        // But here we can approximate if we assume the rotation is small or handle logic strictly
                        // Simplest: Convert % to pixels, rotate, convert back
                        const px = (p.x / 100) * img.width;
                        const py = (p.y / 100) * img.height;
                        const cpx = img.width / 2;
                        const cpy = img.height / 2;

                        const dx = px - cpx;
                        const dy = py - cpy;

                        // Rotate -angle
                        const cos = Math.cos(-angle);
                        const sin = Math.sin(-angle);

                        const newX = cpx + (dx * cos - dy * sin);
                        const newY = cpy + (dx * sin + dy * cos);

                        return {
                            x: (newX / img.width) * 100,
                            y: (newY / img.height) * 100
                        };
                    };

                    // Helper to rotate a box (just rotate center and validation dims roughly)
                    const rotateBox = (box) => {
                        // For box, we rotate the center. Width/Height technically essentially flip if 90deg
                        // But for small leveling, we keep dims roughly? 
                        // Better: Rotate the underlying points? 
                        // For simplicity, we rotate only the center position which is critical for Zoom/Tools
                        const center = rotatePoint(box);
                        return { ...box, ...center };
                    }

                    const newLandmarkData = {
                        ...data,
                        face: rotateBox(data.face),
                        eyes: rotateBox(data.eyes),
                        nose: rotateBox(data.nose),
                        mouth: rotateBox(data.mouth),
                        alignment: {
                            left: rotatePoint(data.alignment.left),
                            right: rotatePoint(data.alignment.right)
                        }
                    };

                    // Prevent auto-rescan
                    processedUrlsRef.current[slotIndex] = newUrl;

                    // Update Landmarks
                    setLandmarkData(prev => ({
                        ...prev,
                        [slotIndex]: newLandmarkData
                    }));

                    setSlotImages(prev => ({
                        ...prev,
                        [slotIndex]: newUrl
                    }));

                } catch (innerError) {
                    console.error(`Failed to level eyes for slot ${slotIndex}`, innerError);
                }
            }
        } catch (error) {
            console.error('Batch level eyes error:', error);
        } finally {
            setIsProcessing(false);
            setProcessingText('Escaneando rostros con IA...');
        }
    };

    const handleBeforeAfterToggle = () => {
        setIsBeforeAfterActive(prev => {
            const newState = !prev;
            if (newState) setShowDate(false); // Disable date if activating B/A
            return newState;
        });
    };

    const handleSave = async () => {
        // Validation: Check if all visible slots are filled
        const requiredSlots = getSlotCount(selectedLayout);
        let filledCount = 0;
        for (let i = 0; i < requiredSlots; i++) {
            if (slotImages[i]) filledCount++;
        }

        if (filledCount < requiredSlots) {
            alert('Por favor, rellena todos los huecos con fotos antes de guardar.');
            return;
        }

        setIsProcessing(true);
        setProcessingText('Generando imagen final...');

        // Deselect any active slot to remove selection UI artifacts from the screenshot
        setSelectedSlot(null);

        // Slight delay to ensure UI updates (selection border removal)
        setTimeout(async () => {
            try {
                const element = document.querySelector('.collage-canvas');
                if (!element) throw new Error('Canvas element not found');

                const canvas = await html2canvas(element, {
                    useCORS: true,
                    scale: 2, // Better resolution
                    backgroundColor: null // Transparent background if any
                });

                const dataUrl = canvas.toDataURL('image/png');
                if (onSave) {
                    onSave(dataUrl);
                }
            } catch (error) {
                console.error('Error saving collage:', error);
                alert('Hubo un error al guardar el collage.');
            } finally {
                setIsProcessing(false);
                setProcessingText('Escaneando rostros con IA...');
            }
        }, 100);
    };

    const getAiStatus = (i) => {
        if (!isAiLoaded) return null;
        if (!slotImages[i]) return null;
        if (!landmarkData[i]) return <span className="ai-status-badge processing">Analizando...</span>;
        if (landmarkData[i].fallback) return <span className="ai-status-badge error">Rostro no detectado</span>;
        return <span className="ai-status-badge success">Detectado</span>;
    };

    const handleSidebarPhotoClick = (photoUrl) => {
        if (selectedSidebarPhoto === photoUrl) {
            setSelectedSidebarPhoto(null);
        } else {
            setSelectedSidebarPhoto(photoUrl);
            setSelectedSlot(null); // Deselect any active slot
        }
    };

    const handleSlotClick = (e, i) => {
        e.stopPropagation();

        // If we have a photo selected from sidebar, place it!
        if (selectedSidebarPhoto) {
            setSlotImages(prev => ({
                ...prev,
                [i]: selectedSidebarPhoto
            }));
            setOriginalImages(prev => ({
                ...prev,
                [i]: selectedSidebarPhoto
            }));

            // Clear landmarks and rotations for new image
            setLandmarkData(prev => {
                const next = { ...prev };
                delete next[i];
                return next;
            });
            setRotations(prev => {
                const next = { ...prev };
                delete next[i];
                return next;
            });
            setFineRotations(prev => {
                const next = { ...prev };
                delete next[i];
                return next;
            });

            setSelectedSidebarPhoto(null); // Clear selection after placement
        } else {
            // Normal behavior: Select slot for editing
            setSelectedSlot(i);
        }
    };

    return (
        <div className="collage-editor-container">
            {/* Header */}
            {selectedSlot !== null ? (
                <header className="collage-header selection-mode">
                    <button className="close-selection-btn" onClick={() => setSelectedSlot(null)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className="selection-info">
                        <span className="selection-count">1 foto seleccionada</span>
                        {/* Dynamic date would go here based on selected photo */}
                        <span className="selection-date">6/1/2026 20:30</span>
                    </div>
                    <button className="menu-dots-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </header>
            ) : (
                <header className="collage-header">
                    <div className="collage-title-row">
                        <button className="back-button" onClick={onBack}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <span className="collage-title">Collage</span>
                        {isProcessing && (
                            <div className="ai-processing-status">
                                <div className="ai-pulse"></div>
                                <span>{processingText}</span>
                            </div>
                        )}
                        {!isAiLoaded && !isProcessing && (
                            <div className="ai-loading-status">Cargando IA...</div>
                        )}
                    </div>
                    <button className="save-collage-btn" onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? 'Guardando...' : 'Guardar'}
                    </button>
                </header>
            )}

            <div className="collage-content">
                {/* Preview Area */}
                <div className="collage-preview-area" onClick={() => setSelectedSlot(null)}>
                    {selectedSidebarPhoto && (
                        <div className="mobile-instruction-overlay">
                            Toca un hueco para colocar la foto
                        </div>
                    )}
                    <div className={`collage-canvas layout-${selectedLayout} fit-mode-${selectedZoom} ${hasBorder ? 'border-active' : ''}`}>
                        {[...Array(getSlotCount(selectedLayout))].map((_, i) => {
                            // Determine which image to show
                            const currentSrc = (isBeforeAfterActive && showOriginal && originalImages[i])
                                ? originalImages[i]
                                : slotImages[i];

                            return (
                                <div
                                    key={i}
                                    className={`collage-slot slot-${i + 1} ${!currentSrc ? 'empty' : 'has-image'} ${selectedSlot === i ? 'is-selected' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, i)}
                                    onClick={(e) => handleSlotClick(e, i)}
                                >
                                    {currentSrc ? (
                                        <>
                                            <img
                                                src={currentSrc}
                                                alt={`Slot ${i + 1}`}
                                                className={selectedZoom === 'whole' ? 'fit-contain' : 'fit-cover'}
                                                style={getSlotStyle(i)}
                                            />
                                            {/* AI Status Indicator */}
                                            {activeTool === 'zoom' && selectedZoom !== 'whole' && (
                                                <div className="slot-ai-indicator">
                                                    {getAiStatus(i)}
                                                </div>
                                            )}

                                            {/* Before/After Indicator Overlay */}
                                            {isBeforeAfterActive && (
                                                <div className="slot-ai-indicator" style={{ top: 'auto', bottom: '10px' }}>
                                                    <span className={`ai-status-badge ${showOriginal ? 'processing' : 'success'}`}>
                                                        {showOriginal ? 'Original' : 'Actual'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Date Indicator Overlay */}
                                            {showDate && (
                                                <div className="date-overlay">
                                                    {/* Lookup date using originalImages if available (for modified images) or current slot image */}
                                                    {(() => {
                                                        const lookupUrl = originalImages[i] || currentSrc;
                                                        const photo = photos && photos.find(p => p.url === lookupUrl);
                                                        return photo?.date || 'Fecha desconocida';
                                                    })()}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tools Area */}
                <div className="collage-tools-area">
                    {selectedSlot === null ? (
                        /* Default State: Render Normal Toolbar */
                        <>
                            {/* Top Toolbar */}
                            <div className="tools-toolbar">
                                <button
                                    className={`tool-btn ${activeTool === 'layout' ? 'active' : ''}`}
                                    onClick={() => setActiveTool('layout')}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="12" y1="3" x2="12" y2="21"></line>
                                    </svg>
                                    <span className="tool-label">Disposición</span>
                                </button>

                                <button
                                    className={`tool-btn ${activeTool === 'zoom' ? 'active' : ''}`}
                                    onClick={() => setActiveTool('zoom')}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        <line x1="11" y1="8" x2="11" y2="14"></line>
                                        <line x1="8" y1="11" x2="14" y2="11"></line>
                                    </svg>
                                    <span className="tool-label">Zoom inteligente</span>
                                </button>

                                <button
                                    className="tool-btn"
                                    onClick={handleRemoveBackground}
                                    disabled={isProcessing}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 21a4 1 0 0 1-4-10 4 1 0 0 1 4-10h10a4 4 0 0 1 4 10 4 4 0 0 1-4 10z"></path>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Quitar fondo de la cara</span>
                                </button>

                                <button
                                    className="tool-btn"
                                    onClick={handleHideEyes}
                                    disabled={isProcessing}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Ocultar ojos</span>
                                </button>

                                <button
                                    className="tool-btn"
                                    onClick={handleLevelEyes}
                                    disabled={isProcessing}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 4v6h6"></path>
                                        <path d="M23 20v-6h-6"></path>
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Nivelar ojos</span>
                                </button>

                                <button
                                    className={`tool-btn ${activeTool === 'labels' ? 'active' : ''}`}
                                    onClick={() => setActiveTool('labels')}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                    <span className="tool-label">Etiqueta</span>
                                </button>

                                <button
                                    className={`tool-btn ${hasBorder ? 'active' : ''}`}
                                    onClick={() => setHasBorder(!hasBorder)}
                                >
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    </svg>
                                    <span className="tool-label">Borde</span>
                                </button>
                            </div>

                            {/* Layouts Section - ONLY in default mode */}
                            {activeTool === 'layout' && (
                                <>
                                    <h3 className="tools-section-title">Disposición</h3>
                                    <div className="layout-grid">
                                        {layouts.map(layout => (
                                            <button
                                                key={layout.id}
                                                className={`layout-option-btn ${selectedLayout === layout.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedLayout(layout.id)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    {layout.icon}
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Standard Sub-menus for default mode */}
                            {/* Zoom Section */}
                            {activeTool === 'zoom' && (
                                <>
                                    <h3 className="tools-section-title">Zoom inteligente</h3>
                                    <div className="zoom-grid">
                                        {zoomOptions.map(option => (
                                            <button
                                                key={option.id}
                                                className={`zoom-option-btn ${selectedZoom === option.id ? 'selected' : ''}`}
                                                onClick={() => handleZoomOptionClick(option.id)}
                                            >
                                                <div className="zoom-icon-wrapper">
                                                    {option.icon}
                                                </div>
                                                <span className="zoom-label">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Labels Section */}
                            {activeTool === 'labels' && (
                                <>
                                    <h3 className="tools-section-title">Etiqueta</h3>
                                    <div className="zoom-grid">
                                        <button
                                            className={`zoom-option-btn ${isBeforeAfterActive ? 'active' : ''}`}
                                            onClick={handleBeforeAfterToggle}
                                        >
                                            <div className="zoom-icon-wrapper">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M7 10h14l-4-4" />
                                                    <path d="M17 14H3l4 4" />
                                                </svg>
                                            </div>
                                            <span className="zoom-label zoom-label-long">Antes / Después</span>
                                        </button>
                                        <button
                                            className={`zoom-option-btn ${showDate ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowDate(prev => {
                                                    const newState = !prev;
                                                    if (newState) setIsBeforeAfterActive(false);
                                                    return newState;
                                                });
                                            }}
                                        >
                                            <div className="zoom-icon-wrapper">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                            </div>
                                            <span className="zoom-label">Fecha</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Photos Sidebar Section - Only in default mode */}
                            <div className="sidebar-photos-section">
                                <h3 className="tools-section-title">Fotos</h3>
                                <div className="sidebar-photos-grid">
                                    {photos && photos.length > 0 ? (
                                        photos.map(photo => (
                                            <div
                                                key={photo.id}
                                                className={`sidebar-photo-item ${selectedSidebarPhoto === photo.url ? 'selected' : ''}`}
                                                draggable="true"
                                                onDragStart={(e) => handleDragStart(e, photo.url)}
                                                onClick={() => handleSidebarPhotoClick(photo.url)}
                                            >
                                                <img src={photo.url} alt="Available" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-photos-message">No hay fotos disponibles</div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Selection Mode: Specific Tools Centered */
                        <div className="contextual-tools-container">
                            <div className="tools-toolbar grid-view-centered">
                                <button className="tool-btn" onClick={() => setActiveTool('zoom')}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        <line x1="11" y1="8" x2="11" y2="14"></line>
                                        <line x1="8" y1="11" x2="14" y2="11"></line>
                                    </svg>
                                    <span className="tool-label">Zoom Inteligente</span>
                                </button>

                                <button className="tool-btn" onClick={handleRemoveBackground} disabled={isProcessing}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 21a4 1 0 0 1-4-10 4 1 0 0 1 4-10h10a4 4 0 0 1 4 10 4 4 0 0 1-4 10z"></path>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Quitar fondo de la cara</span>
                                </button>

                                <button className="tool-btn" onClick={handleHideEyes} disabled={isProcessing}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Ocultar ojos</span>
                                </button>

                                <button className="tool-btn" onClick={handleLevelEyes} disabled={isProcessing}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 4v6h6"></path>
                                        <path d="M23 20v-6h-6"></path>
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                    </svg>
                                    <span className="tool-badge-ia">IA</span>
                                    <span className="tool-label">Nivelar ojos</span>
                                </button>

                                <button className="tool-btn" onClick={handleRotate}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    <span className="tool-label">Rotar</span>
                                </button>

                                <button className="tool-btn" onClick={() => setActiveTool('labels')}>
                                    <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                    <span className="tool-label">Etiqueta</span>
                                </button>
                            </div>

                            {/* Selection Mode Sub-menus */}
                            {activeTool === 'rotate' && (
                                <div className="rotation-slider-container">
                                    <div className="rotation-slider-controls">
                                        <button className="slider-reset-btn" onClick={() => handleFineRotate(0)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                <path d="M3 3v5h5" />
                                            </svg>
                                        </button>
                                        <input
                                            type="range"
                                            min="-45"
                                            max="45"
                                            value={fineRotations[selectedSlot] || 0}
                                            onChange={(e) => handleFineRotate(parseInt(e.target.value))}
                                            className="rotation-range-input"
                                        />
                                        <span className="rotation-value">{fineRotations[selectedSlot] || 0}°</span>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'zoom' && (
                                <div className="zoom-grid" style={{ marginTop: '20px', justifyContent: 'center' }}>
                                    {zoomOptions.map(option => (
                                        <button
                                            key={option.id}
                                            className={`zoom-option-btn ${(slotZooms[selectedSlot] || selectedZoom) === option.id ? 'selected' : ''}`}
                                            onClick={() => handleZoomOptionClick(option.id)}
                                        >
                                            <div className="zoom-icon-wrapper">
                                                {option.icon}
                                            </div>
                                            <span className="zoom-label">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTool === 'labels' && (
                                <div className="zoom-grid" style={{ marginTop: '20px', justifyContent: 'center' }}>
                                    <button
                                        className={`zoom-option-btn ${isBeforeAfterActive ? 'active' : ''}`}
                                        onClick={handleBeforeAfterToggle}
                                    >
                                        <div className="zoom-icon-wrapper">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M7 10h14l-4-4" />
                                                <path d="M17 14H3l4 4" />
                                            </svg>
                                        </div>
                                        <span className="zoom-label zoom-label-long">Antes / Después</span>
                                    </button>
                                    <button
                                        className={`zoom-option-btn ${showDate ? 'active' : ''}`}
                                        onClick={() => {
                                            setShowDate(prev => {
                                                const newState = !prev;
                                                if (newState) setIsBeforeAfterActive(false);
                                                return newState;
                                            });
                                        }}
                                    >
                                        <div className="zoom-icon-wrapper">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        </div>
                                        <span className="zoom-label">Fecha</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollageEditor;
