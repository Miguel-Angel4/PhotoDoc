import React, { useState, useEffect } from 'react';
import './SecurityModal.css';

const SecurityModal = ({ isOpen, mode = 'unlock', onUnlock, onSetupComplete, onCancel, securitySettings }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
        // Check if biometrics are available
        if (window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then(available => {
                    setIsBiometricAvailable(available);
                    if (available && mode === 'unlock' && isOpen) {
                        handleBiometricAuth();
                    }
                })
                .catch(console.error);
        }
    }, [isOpen, mode]);

    const handleBiometricSetup = async () => {
        if (!window.PublicKeyCredential) return;

        try {
            // Check if already supported and available
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!available) {
                alert('La autenticación biométrica no está disponible en este dispositivo.');
                return;
            }

            // Note: Real registration requires a challenge from a server.
            // For this UI, we will simulate the biometric check if it's just for the "feel"
            // Or use a generic local registration if the environment allows.

            // Simplified prompt for demonstration of "Huella"
            alert('En un dispositivo móvil o con soporte WebAuthn, aquí se activaría el escáner de huellas.');
            setIsBiometricAvailable(true);
        } catch (err) {
            console.error('Biometric setup error:', err);
        }
    };

    const handleBiometricAuth = async () => {
        if (!window.PublicKeyCredential) return;

        try {
            // Again, real WebAuthn needs a server. 
            // We'll simulate the "unlocking" behavior for the user request.
            // On a real PWA on mobile, this would trigger the system prompt.

            // Simple check to show the intent
            console.log('Biometric prompt triggered');
            // For simulation purposes:
            if (window.confirm('¿Simular escaneo de huella correcto?')) {
                onUnlock();
            }
        } catch (err) {
            console.error('Biometric error:', err);
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
                onSetupComplete(pin);
                setPin('');
                setConfirmPin('');
                setIsConfirming(false);
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
                    <h2>{mode === 'setup' ? (isConfirming ? 'Confirma tu PIN' : 'Configura tu PIN') : 'Aplicación Bloqueada'}</h2>
                    <p>{mode === 'setup' ? 'Define un PIN de 4 dígitos para proteger tus datos.' : 'Introduce tu PIN para continuar'}</p>
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
                    <button className="numpad-btn secondary" onClick={onCancel}>
                        Cancelar
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

                {mode === 'setup' && (
                    <div className="setup-actions">
                        <button className="setup-confirm-btn" onClick={handleSetup}>
                            {isConfirming ? 'Confirmar PIN' : 'Siguiente'}
                        </button>
                        {!isConfirming && isBiometricAvailable && (
                            <button className="biometric-setup-link" onClick={handleBiometricSetup}>
                                Configurar Huella Digital
                            </button>
                        )}
                    </div>
                )}

                {mode === 'unlock' && isBiometricAvailable && (
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
