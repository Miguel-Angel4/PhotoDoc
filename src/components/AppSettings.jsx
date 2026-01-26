import React, { useState } from 'react';
import './AppSettings.css';
import GoogleLoginModal from './GoogleLoginModal';
import TermsAndConditions from './TermsAndConditions';

const AppSettings = ({ googleAccount, onConnect, onDisconnect, onBack, photos = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const photoCount = photos.length;
    const limit = 50;
    const percentage = Math.min((photoCount / limit) * 100, 100);

    const handleDisconnect = () => {
        onDisconnect();
    };

    return (
        <div className="app-settings-container">
            {/* Header with Back button */}
            <header className="settings-top-header">
                <button className="back-btn" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2>Ajustes</h2>
            </header>

            <div className="settings-content">
                {/* Section: Cuenta */}
                <section className="settings-section">
                    <h3 className="section-label">Cuenta</h3>
                    <div className="section-card">
                        <div className="account-row">
                            <div className="google-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.35 11.1H12v2.8h5.35c-.24 1.25-1 2.3-2.15 3.05v2.5h3.5c2.05-1.9 3.2-4.7 3.2-7.85 0-.75-.05-1.45-.15-2.1z" fill="#4285F4" />
                                    <path d="M12 21c2.4 0 4.45-.8 5.95-2.15l-2.9-2.25c-.8.55-1.8.85-3.05.85-2.35 0-4.35-1.55-5.05-3.65h-3.1v2.4C5.45 19.35 8.5 21 12 21z" fill="#34A853" />
                                    <path d="M6.95 13.8c-.2-.55-.3-1.15-.3-1.8s.1-1.25.3-1.8v-2.4h-3.1c-.6 1.25-.95 2.65-.95 4.2s.35 2.95.95 4.2l3.1-2.4z" fill="#FBBC05" />
                                    <path d="M12 6.75c1.3 0 2.5.45 3.4 1.35l2.55-2.55C16.45 4.05 14.4 3.15 12 3.15 8.5 3.15 5.45 4.8 3.9 8.1l3.1 2.4c.7-2.1 2.7-3.65 5.05-3.65z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div className="account-info">
                                <span className="account-title">Cuenta Google</span>
                                <span className="account-email-text">{googleAccount?.email || '¡Haz clic para añadir una cuenta!'}</span>
                            </div>
                        </div>
                        {googleAccount ? (
                            <button className="logout-btn" onClick={handleDisconnect}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Cerrar sesión en la cuenta
                            </button>
                        ) : (
                            <button className="login-btn" onClick={() => setIsModalOpen(true)}>
                                Conectar cuenta de Google
                            </button>
                        )}
                    </div>
                </section>

                {/* Section: Uso */}
                <section className="settings-section">
                    <h3 className="section-label">Uso</h3>
                    <div className="section-card">
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
                    </div>
                </section>

                {/* Section: Plan actual */}
                <section className="settings-section">
                    <h3 className="section-label">Plan actual</h3>
                    <div className="section-card">
                        <p className="plan-v-text">
                            Aumente la capacidad suscribiéndose a un plan a través de un dispositivo iOS o Android.
                        </p>
                    </div>
                </section>

                {/* Section: Seguridad */}
                <section className="settings-section">
                    <h3 className="section-label">Seguridad</h3>
                    <div className="section-card">
                        <div className="setting-item">
                            <div className="setting-text">
                                <span className="setting-name">Proteger la aplicación con biometrica y PIN</span>
                                <p className="setting-desc">Al abrir la aplicación, se requerirá una autenticación biométrica (si este dispositivo lo admite) o un PIN que usted definirá.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={biometricsEnabled} onChange={() => setBiometricsEnabled(!biometricsEnabled)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="setting-item disabled">
                            <div className="setting-text">
                                <span className="setting-name">Bloquear automáticamente después de</span>
                                <p className="setting-desc">30 minutos sin usar</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Varios dispositivos */}
                <section className="settings-section">
                    <h3 className="section-label">Varios dispositivos</h3>
                    <div className="section-card">
                        <div className="setting-item">
                            <div className="setting-text">
                                <span className="setting-name">Recibir notificación cuando se abre un paciente en otro dispositivo</span>
                                <p className="setting-desc">Le ayuda a abrir al mismo paciente en todos sus dispositivos durante la atención</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section: Contacto */}
                <section className="settings-section">
                    <h3 className="section-label">Contacto</h3>
                    <div className="section-list-card">
                        <a href="https://wa.me/support" target="_blank" rel="noopener noreferrer" className="list-item">
                            <div className="item-content">
                                <span className="item-name">WhatsApp</span>
                                <span className="item-sub">Soporte</span>
                            </div>
                            <span className="chevron">›</span>
                        </a>
                        <a href="https://instagram.com/photodocapp" target="_blank" rel="noopener noreferrer" className="list-item">
                            <div className="item-content">
                                <span className="item-name">Instagram</span>
                                <span className="item-sub">@photodocapp</span>
                            </div>
                            <span className="chevron">›</span>
                        </a>
                        <a href="https://photodoc.app" target="_blank" rel="noopener noreferrer" className="list-item">
                            <div className="item-content">
                                <span className="item-name">Sitio</span>
                                <span className="item-sub">https://photodoc.app</span>
                            </div>
                            <span className="chevron">›</span>
                        </a>
                    </div>
                </section>

                {/* Section: Información */}
                <section className="settings-section">
                    <h3 className="section-label">Información</h3>
                    <div className="section-list-card">
                        <div className="list-item clickable" onClick={() => setShowTerms(true)}>
                            <div className="item-content">
                                <span className="item-name">Términos y Condiciones</span>
                                <span className="item-sub">Ver términos de uso</span>
                            </div>
                            <span className="chevron">›</span>
                        </div>
                        <a href="https://photodoc.app/privacy" target="_blank" rel="noopener noreferrer" className="list-item">
                            <div className="item-content">
                                <span className="item-name">Política de Privacidad</span>
                                <span className="item-sub">https://photodoc.app/privacy_policy.html</span>
                            </div>
                            <span className="chevron">›</span>
                        </a>
                    </div>
                </section>

                <div className="version-info">
                    <span>Versión</span>
                    <span className="version-num">3.5.1 (198)</span>
                </div>
            </div>

            <GoogleLoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConnect={onConnect}
            />

            <TermsAndConditions
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
            />
        </div>
    );
};

export default AppSettings;
