import React, { useState, useEffect } from 'react';
import './SecurityModal.css';

const SecurityModal = ({ isOpen, mode = 'unlock', onUnlock, onSetupComplete, onPinChange, onCancel, securitySettings }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [subMode, setSubMode] = useState(null); // For 'changePin' within 'manage'

    useEffect(() => {
        // Check if biometrics are available
        if (window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then(available => {
                    // Check if we have a configured credential
                    const hasConfigured = localStorage.getItem('biometricConfigured') === 'true';
                    setIsBiometricAvailable(available && hasConfigured);

                    // DON'T auto-trigger - let user choose manually by clicking the button
                })
                .catch(console.error);
        }
    }, [isOpen, mode]);

    // Reset states when modal closes or mode changes
    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setConfirmPin('');
            setIsConfirming(false);
            setError('');
            setSubMode(null);
        }
    }, [isOpen]);

    const handleBiometricSetup = async () => {
        if (!window.PublicKeyCredential) {
            alert('La autenticación biométrica no está disponible en este dispositivo.');
            return;
        }

        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!available) {
                alert('La autenticación biométrica no está disponible en este dispositivo.');
                return;
            }

            // Generate a random challenge
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Create credential options
            const publicKeyCredentialCreationOptions = {
                challenge: challenge,
                rp: {
                    name: "PhotoDoc",
                    id: window.location.hostname,
                },
                user: {
                    id: new Uint8Array(16),
                    name: "photodoc-user",
                    displayName: "PhotoDoc User",
                },
                pubKeyCredParams: [
                    {
                        type: "public-key",
                        alg: -7 // ES256
                    },
                    {
                        type: "public-key",
                        alg: -257 // RS256
                    }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                },
                timeout: 60000,
                attestation: "none"
            };

            // Create the credential (this will trigger biometric prompt)
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });

            if (credential) {
                // Store that biometric is configured
                localStorage.setItem('biometricConfigured', 'true');
                localStorage.setItem('biometricCredentialId', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
                setIsBiometricAvailable(true);
                alert('✓ Huella digital configurada correctamente');
            }
        } catch (err) {
            console.error('Biometric setup error:', err);
            if (err.name === 'NotAllowedError') {
                alert('Configuración cancelada o denegada');
            } else {
                alert('Error al configurar la huella digital: ' + err.message);
            }
        }
    };

    const handleBiometricAuth = async () => {
        if (!window.PublicKeyCredential) return;

        try {
            const credentialId = localStorage.getItem('biometricCredentialId');
            if (!credentialId) {
                console.log('No biometric credential found');
                return;
            }

            // Generate a random challenge
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Decode the credential ID
            const credentialIdBuffer = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));

            const publicKeyCredentialRequestOptions = {
                challenge: challenge,
                allowCredentials: [{
                    id: credentialIdBuffer,
                    type: 'public-key',
                    transports: ['internal']
                }],
                userVerification: "required",
                timeout: 60000,
            };

            // Get the credential (this will trigger biometric prompt)
            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            if (assertion) {
                // Biometric authentication successful
                onUnlock();
            }
        } catch (err) {
            console.error('Biometric error:', err);
            if (err.name === 'NotAllowedError') {
                console.log('Biometric authentication cancelled');
            }
        }
    };

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            setError('');

            if (mode === 'unlock' && newPin.length === 4) {
                if (newPin === securitySettings.pin) {
                    onUnlock();
                    setPin('');
                } else {
                    setError('PIN incorrecto');
                    setPin('');
                }
            }
        }
    };

    const handleSetup = () => {
        if (pin.length !== 4) {
            setError('El PIN debe tener 4 dígitos');
            return;
        }

        if (!isConfirming) {
            setIsConfirming(true);
            setConfirmPin(pin);
            setPin('');
        } else {
            if (pin === confirmPin) {
                if (mode === 'setup') {
                    onSetupComplete(pin);
                } else if (subMode === 'changePin' && onPinChange) {
                    onPinChange(pin);
                }
                setPin('');
                setConfirmPin('');
                setIsConfirming(false);
                setSubMode(null);
            } else {
                setError('Los PINs no coinciden');
                setPin('');
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    if (!isOpen) return null;

    // Management Menu View
    if (mode === 'manage' && !subMode) {
        return (
            <div className="security-overlay">
                <div className="security-modal">
                    <div className="security-header">
                        <div className="lock-icon-large">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h2>Seguridad</h2>
                        <p>Gestiona tus opciones de seguridad</p>
                    </div>

                    <div className="security-menu">
                        <button className="security-menu-option" onClick={() => setSubMode('changePin')}>
                            <div className="menu-option-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 1v6m0 6v6"></path>
                                    <path d="M17 7l-5 5-5-5"></path>
                                </svg>
                            </div>
                            <div className="menu-option-text">
                                <h3>Cambiar PIN</h3>
                                <p>Actualiza tu código de seguridad</p>
                            </div>
                            <div className="menu-option-arrow">›</div>
                        </button>

                        <button className="security-menu-option" onClick={handleBiometricSetup}>
                            <div className="menu-option-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                                    <path d="M12 14c-3.866 0-7 1.79-7 4v2h14v-2c0-2.21-3.134-4-7-4z"></path>
                                </svg>
                            </div>
                            <div className="menu-option-text">
                                <h3>Huella Digital</h3>
                                <p>{isBiometricAvailable ? 'Configurada' : 'Configurar autenticación biométrica'}</p>
                            </div>
                            <div className="menu-option-arrow">›</div>
                        </button>
                    </div>

                    <button className="cancel-button" onClick={onCancel}>
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    // PIN Entry View (for unlock, setup, or changePin)
    const isChangingPin = subMode === 'changePin';
    const displayMode = isChangingPin ? 'setup' : mode;

    return (
        <div className="security-overlay">
            <div className="security-modal">
                <div className="security-header">
                    <div className="lock-icon-large">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2>
                        {isChangingPin
                            ? (isConfirming ? 'Confirma tu nuevo PIN' : 'Nuevo PIN')
                            : (displayMode === 'setup'
                                ? (isConfirming ? 'Confirma tu PIN' : 'Configura tu PIN')
                                : 'Aplicación Bloqueada')
                        }
                    </h2>
                    <p>
                        {isChangingPin
                            ? 'Define tu nuevo PIN de 4 dígitos'
                            : (displayMode === 'setup'
                                ? 'Define un PIN de 4 dígitos para proteger tus datos.'
                                : 'Introduce tu PIN para continuar')
                        }
                    </p>
                </div>

                <div className="pin-display">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`pin-dot ${pin.length > i ? 'active' : ''}`}></div>
                    ))}
                </div>

                {error && <div className="pin-error">{error}</div>}

                <div className="numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} className="numpad-btn" onClick={() => handleNumberClick(num.toString())}>
                            {num}
                        </button>
                    ))}
                    <button className="numpad-btn secondary" onClick={isChangingPin ? () => setSubMode(null) : onCancel}>
                        {isChangingPin ? 'Atrás' : 'Cancelar'}
                    </button>
                    <button className="numpad-btn" onClick={() => handleNumberClick('0')}>
                        0
                    </button>
                    <button className="numpad-btn secondary" onClick={handleDelete}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                            <line x1="18" y1="9" x2="12" y2="15"></line>
                            <line x1="12" y1="9" x2="18" y2="15"></line>
                        </svg>
                    </button>
                </div>

                {(displayMode === 'setup' || isChangingPin) && (
                    <div className="setup-actions">
                        <button className="setup-confirm-btn" onClick={handleSetup}>
                            {isConfirming ? 'Confirmar PIN' : 'Siguiente'}
                        </button>
                        {!isConfirming && !isChangingPin && isBiometricAvailable && (
                            <button className="biometric-setup-link" onClick={handleBiometricSetup}>
                                Configurar Huella Digital
                            </button>
                        )}
                    </div>
                )}

                {displayMode === 'unlock' && isBiometricAvailable && (
                    <button className="biometric-trigger-btn" onClick={handleBiometricAuth}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>Usar Huella</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SecurityModal;
