import React, { useState } from 'react';
import './AccountSettings.css';
import GoogleLoginModal from './GoogleLoginModal';

const AccountSettings = ({ googleAccount, onConnect, onDisconnect, photos = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const safePhotos = Array.isArray(photos) ? photos : [];
    const photoCount = safePhotos.length;
    const limit = 50;
    const percentage = Math.min((photoCount / limit) * 100, 100);

    const handleDisconnect = () => {
        try {
            onDisconnect();
        } catch (e) {
            console.error('Error during disconnect:', e);
        }
    };

    return (
        <div className="account-view-container">
            <div className="account-view-content">

                {/* Section: Acceso */}
                <section className="account-v-section">
                    <h3 className="account-v-header">Acceso</h3>
                    <div
                        className={`google-v-card ${!googleAccount ? 'clickable' : ''}`}
                        onClick={!googleAccount ? () => setIsModalOpen(true) : undefined}
                        style={!googleAccount ? { cursor: 'pointer' } : {}}
                    >
                        <div className="google-v-main">
                            <div className="google-v-icon-text">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.35 11.1H12v2.8h5.35c-.24 1.25-1 2.3-2.15 3.05v2.5h3.5c2.05-1.9 3.2-4.7 3.2-7.85 0-.75-.05-1.45-.15-2.1z" fill="#fff" />
                                    <path d="M12 21c2.4 0 4.45-.8 5.95-2.15l-2.9-2.25c-.8.55-1.8.85-3.05.85-2.35 0-4.35-1.55-5.05-3.65h-3.1v2.4C5.45 19.35 8.5 21 12 21z" fill="#fff" />
                                    <path d="M6.95 13.8c-.2-.55-.3-1.15-.3-1.8s.1-1.25.3-1.8v-2.4h-3.1c-.6 1.25-.95 2.65-.95 4.2s.35 2.95.95 4.2l3.1-2.4z" fill="#fff" />
                                    <path d="M12 6.75c1.3 0 2.5.45 3.4 1.35l2.55-2.55C16.45 4.05 14.4 3.15 12 3.15 8.5 3.15 5.45 4.8 3.9 8.1l3.1 2.4c.7-2.1 2.7-3.65 5.05-3.65z" fill="#fff" />
                                </svg>
                                <span>Cuenta Google</span>
                            </div>
                            <div className="google-v-email">{googleAccount?.email || '¡Haz clic para añadir una cuenta!'}</div>
                        </div>

                        {googleAccount ? (
                            <button className="v-action-link" onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                </svg>
                                Desconectar cuenta
                            </button>
                        ) : (
                            <button className="v-action-link" onClick={() => setIsModalOpen(true)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                </svg>
                                Conectar dispositivos
                            </button>
                        )}
                    </div>
                </section>

                <div className="v-divider"></div>

                {/* Section: Uso */}
                <section className="account-v-section">
                    <h3 className="account-v-header">Uso</h3>
                    <div className="usage-v-container">
                        <div className="usage-v-track">
                            <div className="usage-v-bar" style={{ width: `${percentage}%` }}></div>
                            <div className="usage-v-dot" style={{ left: `${percentage}%` }}></div>
                        </div>
                        <div className="usage-v-labels">
                            <span>0</span>
                            <span className="usage-v-center">{Math.round(percentage)}% ({photoCount} fotos)</span>
                            <span>{limit}</span>
                        </div>
                    </div>
                </section>

                <div className="v-divider"></div>

                {/* Section: Plan actual */}
                <section className="account-v-section">
                    <h3 className="account-v-header">Plan actual</h3>
                    <p className="plan-v-text">
                        Aumente la capacidad suscribiéndose a un plan a través de un dispositivo iOS o Android.
                    </p>
                </section>

                <div className="v-divider"></div>

            </div>

            <GoogleLoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnect={onConnect}
            />
        </div>
    );
};

export default AccountSettings;
