import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Load saved language preference or default to Spanish
        return localStorage.getItem('language') || 'es';
    });

    useEffect(() => {
        // Save language preference
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'es' ? 'en' : 'es');
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t: (key) => translations[language]?.[key] || key
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Translations dictionary
const translations = {
    es: {
        // TopBar
        'search.placeholder': 'Buscar paciente',

        // Sidebar
        'sidebar.patients': 'Pacientes',
        'sidebar.portfolio': 'Portafolio',
        'sidebar.account': 'Cuenta',

        // Common
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.close': 'Cerrar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.back': 'Atrás',

        // Settings
        'settings.title': 'Ajustes',
        'settings.account': 'Cuenta',
        'settings.usage': 'Uso',
        'settings.currentPlan': 'Plan actual',
        'settings.security': 'Seguridad',
        'settings.multiDevice': 'Varios dispositivos',
        'settings.contact': 'Contacto',
        'settings.information': 'Información',
        'settings.termsAndConditions': 'Términos y Condiciones',
        'settings.privacyPolicy': 'Política de Privacidad',
        'settings.version': 'Versión',

        // Google Auth
        'google.connectAccount': 'Conectar cuenta de Google',
        'google.signIn': 'Iniciar sesión con Google',
        'google.continueWith': 'Conectar cuenta de Google',
        'google.redirecting': 'Redirigiendo...',
        'google.disconnect': 'Desconectar cuenta',
        'google.logout': 'Cerrar sesión en la cuenta',
        'google.clickToAdd': '¡Haz clic para añadir una cuenta!',

        // Account
        'account.access': 'Acceso',
        'account.googleAccount': 'Cuenta Google',
        'account.connectDevices': 'Conectar dispositivos',
    },
    en: {
        // TopBar
        'search.placeholder': 'Search patient',

        // Sidebar
        'sidebar.patients': 'Patients',
        'sidebar.portfolio': 'Portfolio',
        'sidebar.account': 'Account',

        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.close': 'Close',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.back': 'Back',

        // Settings
        'settings.title': 'Settings',
        'settings.account': 'Account',
        'settings.usage': 'Usage',
        'settings.currentPlan': 'Current Plan',
        'settings.security': 'Security',
        'settings.multiDevice': 'Multi-Device',
        'settings.contact': 'Contact',
        'settings.information': 'Information',
        'settings.termsAndConditions': 'Terms and Conditions',
        'settings.privacyPolicy': 'Privacy Policy',
        'settings.version': 'Version',

        // Google Auth
        'google.connectAccount': 'Connect Google Account',
        'google.signIn': 'Sign in with Google',
        'google.continueWith': 'Continue with Google',
        'google.redirecting': 'Redirecting...',
        'google.disconnect': 'Disconnect Account',
        'google.logout': 'Sign out of account',
        'google.clickToAdd': 'Click to add an account!',

        // Account
        'account.access': 'Access',
        'account.googleAccount': 'Google Account',
        'account.connectDevices': 'Connect Devices',
    }
};

export default LanguageContext;
