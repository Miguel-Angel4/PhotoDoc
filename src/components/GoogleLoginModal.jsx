import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './GoogleLoginModal.css';

const GoogleLoginModal = ({ isOpen, onClose, onConnect }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;

            // The user will be redirected to Google for authentication
            // After successful auth, they'll be redirected back to the app
        } catch (err) {
            console.error('Error signing in with Google:', err);
            setError(err.message || 'Error al iniciar sesión con Google');
            setLoading(false);
        }
    };

    return (
        <div className="google-modal-overlay">
            <div className="google-modal-content">
                <div className="google-modal-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.35 11.1H12v2.8h5.35c-.24 1.25-1 2.3-2.15 3.05v2.5h3.5c2.05-1.9 3.2-4.7 3.2-7.85 0-.75-.05-1.45-.15-2.1z" fill="#4285F4" />
                        <path d="M12 21c2.4 0 4.45-.8 5.95-2.15l-2.9-2.25c-.8.55-1.8.85-3.05.85-2.35 0-4.35-1.55-5.05-3.65h-3.1v2.4C5.45 19.35 8.5 21 12 21z" fill="#34A853" />
                        <path d="M6.95 13.8c-.2-.55-.3-1.15-.3-1.8s.1-1.25.3-1.8v-2.4h-3.1c-.6 1.25-.95 2.65-.95 4.2s.35 2.95.95 4.2l3.1-2.4z" fill="#FBBC05" />
                        <path d="M12 6.75c1.3 0 2.5.45 3.4 1.35l2.55-2.55C16.45 4.05 14.4 3.15 12 3.15 8.5 3.15 5.45 4.8 3.9 8.1l3.1 2.4c.7-2.1 2.7-3.65 5.05-3.65z" fill="#EA4335" />
                    </svg>
                    <h2>Iniciar sesión con Google</h2>
                </div>
                <p className="google-modal-subtitle">para continuar en PhotoDoc</p>

                {error && (
                    <div style={{ color: 'red', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <div className="google-login-form">
                    <button
                        onClick={handleGoogleLogin}
                        className="primary-btn"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        {loading ? 'Redirigiendo...' : 'Conectar cuenta de Google'}
                    </button>
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onClose}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoogleLoginModal;
