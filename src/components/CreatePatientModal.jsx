import React, { useState } from 'react';
import './CreatePatientModal.css';

// Common country codes
const COUNTRY_CODES = [
    { code: '+34', country: 'ES', icon: '🇪🇸' },
    { code: '+1', country: 'US/CA', icon: '🇺🇸' },
    { code: '+44', country: 'UK', icon: '🇬🇧' },
    { code: '+33', country: 'FR', icon: '🇫🇷' },
    { code: '+49', country: 'DE', icon: '🇩🇪' },
    { code: '+39', country: 'IT', icon: '🇮🇹' },
    { code: '+351', country: 'PT', icon: '🇵🇹' },
    { code: '+52', country: 'MX', icon: '🇲🇽' },
    { code: '+54', country: 'AR', icon: '🇦🇷' },
    { code: '+55', country: 'BR', icon: '🇧🇷' },
    { code: '+57', country: 'CO', icon: '🇨🇴' },
    { code: '+56', country: 'CL', icon: '🇨🇱' },
    { code: '+51', country: 'PE', icon: '🇵🇪' },
    { code: '+58', country: 'VE', icon: '🇻🇪' },
    { code: '+593', country: 'EC', icon: '🇪🇨' },
    { code: '+41', country: 'CH', icon: '🇨🇭' },
    { code: '+32', country: 'BE', icon: '🇧🇪' },
    { code: '+31', country: 'NL', icon: '🇳🇱' },
    { code: '+46', country: 'SE', icon: '🇸🇪' },
    { code: '+47', country: 'NO', icon: '🇳🇴' },
    { code: '+45', country: 'DK', icon: '🇩🇰' },
    { code: '+353', country: 'IE', icon: '🇮🇪' },
    { code: '+30', country: 'GR', icon: '🇬🇷' },
    { code: '+48', country: 'PL', icon: '🇵🇱' },
    { code: '+7', country: 'RU', icon: '🇷🇺' },
    { code: '+81', country: 'JP', icon: '🇯🇵' },
    { code: '+86', country: 'CN', icon: '🇨🇳' },
    { code: '+91', country: 'IN', icon: '🇮🇳' },
    { code: '+61', country: 'AU', icon: '🇦🇺' },
];

const CreatePatientModal = ({ isOpen, onClose, onSave, onDelete, patientToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        day: '',
        month: '',
        year: '',
        phone: '',
        countryCode: '+34',
        email: ''
    });

    React.useEffect(() => {
        if (isOpen && patientToEdit) {
            const [day, month, year] = patientToEdit.dob ? patientToEdit.dob.split('/') : ['', '', ''];
            // Extract country code if present (simple heuristic: starts with +)
            // Assuming phone stored might be "123456789" or "+34 123456789"
            // For now, let's keep it simple. If we were storing it joined, we'd split it.
            // Let's assume phone is just the number for editing unless we decide to store full string.
            // WE WILL STORE as separate for now in UI but save as full string maybe?
            // "saved as database" -> "Patients JSON".
            // Let's assume phone is just the digits in the edit object for simplicity or we'd need to parse.

            setFormData({
                name: patientToEdit.name || '',
                day: day || '',
                month: month || '',
                year: year || '',
                phone: patientToEdit.phone || '', // Assuming this comes clean or we'd need to parse
                countryCode: patientToEdit.countryCode || '+34',
                email: patientToEdit.email || ''
            });
        } else if (isOpen && !patientToEdit) {
            setFormData({
                name: '',
                day: '',
                month: '',
                year: '',
                phone: '',
                countryCode: '+34',
                email: ''
            });
        }
    }, [isOpen, patientToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleDateChange = (field, value) => {
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const validateForm = () => {
        // 1. Name: Alphabetic only (allowing spaces), start with Uppercase
        // Regex: First char [A-Z], then [a-zA-Z\s]*
        const nameRegex = /^[A-Z][a-zA-Z\u00C0-\u017F\s]*$/; // Added unicode range for accents (Á, ñ, etc)
        if (!nameRegex.test(formData.name)) {
            alert('El nombre debe empezar con mayúscula y contener solo letras.');
            return false;
        }

        // 2. Date: Not in future
        if (!formData.day || !formData.month || !formData.year) {
            alert('Por favor complete la fecha de nacimiento.');
            return false;
        }
        const d = parseInt(formData.day, 10);
        const m = parseInt(formData.month, 10);
        const y = parseInt(formData.year, 10);

        // Basic date validity
        if (m < 1 || m > 12) { alert('Mes incorrecto.'); return false; }
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d < 1 || d > daysInMonth) { alert(`Dia incorrecto para el mes ${m}.`); return false; }
        if (y < 1900 || y > 2100) { alert('Año fuera de rango razonable.'); return false; }

        const dob = new Date(y, m - 1, d);
        const today = new Date();
        // Reset hours to compare just dates
        today.setHours(0, 0, 0, 0);

        if (dob > today) {
            alert('la persona no puede nacer en el futuro.');
            return false;
        }

        // 3. Phone: Only numbers (handled in input), exactly 9 digits
        // Assuming the input stores just the 9 digits
        if (formData.phone.length !== 9) {
            alert('El teléfono debe tener exactamente 9 números.');
            return false;
        }

        // 4. Email: End in @gmail.com or @hotmail.com
        const emailRegex = /@(?:gmail\.com|hotmail\.com)$/;
        if (!emailRegex.test(formData.email)) {
            alert('El correo electrónico debe ser de @gmail.com o @hotmail.com');
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (!formData.name) {
            alert('El nombre es obligatorio.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            const newPatient = {
                id: patientToEdit ? patientToEdit.id : Date.now(),
                name: formData.name,
                dob: `${formData.day.padStart(2, '0')}/${formData.month.padStart(2, '0')}/${formData.year}`,
                phone: formData.phone,
                countryCode: formData.countryCode, // Save this separately to restore it
                fullPhone: `${formData.countryCode} ${formData.phone}`, // Optional convenience
                email: formData.email
            };
            onSave(newPatient);
            onClose();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <h2 className="modal-title">{patientToEdit ? 'Paciente' : 'Nuevo paciente'}</h2>
                <button className="save-btn" onClick={handleSubmit}>Guardar</button>
            </div>

            <div className="modal-content">
                {patientToEdit && (
                    <div className="edit-avatar-container">
                        <div className="big-avatar">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                            </svg>
                        </div>
                    </div>
                )}
                <form className="patient-form" onSubmit={(e) => e.preventDefault()}>

                    {/* Name Field */}
                    <div className="form-row">
                        <div className="field-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="input-group outlined">
                            <input
                                type="text"
                                id="name"
                                placeholder=" "
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <label htmlFor="name">Nombre</label>
                        </div>
                    </div>

                    {/* Date of Birth Field */}
                    <div className="form-row">
                        <div className="field-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <div className="date-group-container">
                            <label className="date-main-label">Fecha de nacimiento</label>
                            <div className="date-inputs">
                                <div className="date-input-wrapper">
                                    <label>Dia</label>
                                    <input
                                        type="text"
                                        placeholder="DD"
                                        maxLength="2"
                                        value={formData.day}
                                        onChange={(e) => handleDateChange('day', e.target.value)}
                                    />
                                </div>
                                <div className="date-input-wrapper">
                                    <label>Mes</label>
                                    <input
                                        type="text"
                                        placeholder="MM"
                                        maxLength="2"
                                        value={formData.month}
                                        onChange={(e) => handleDateChange('month', e.target.value)}
                                    />
                                </div>
                                <div className="date-input-wrapper">
                                    <label>Año</label>
                                    <input
                                        type="text"
                                        placeholder="AAAA"
                                        maxLength="4"
                                        value={formData.year}
                                        onChange={(e) => handleDateChange('year', e.target.value)}
                                    />
                                </div>
                                <button className="clear-date-btn" onClick={() => setFormData(prev => ({ ...prev, day: '', month: '', year: '' }))}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="form-row">
                        <div className="field-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <div className="input-group phone-group">
                            <div className="country-select-wrapper">
                                <select
                                    className="country-select"
                                    value={formData.countryCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                                >
                                    {COUNTRY_CODES.map((country) => (
                                        <option key={country.code + country.country} value={country.code}>
                                            {country.icon} {country.code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="Teléfono"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                maxLength="9"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="form-row">
                        <div className="field-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                </form>
            </div>

            {patientToEdit && (
                <div className="modal-footer-actions">
                    <button
                        className="delete-patient-footer-btn"
                        onClick={() => {
                            if (window.confirm(`¿Estás seguro de que quieres eliminar a ${patientToEdit.name}?`)) {
                                onDelete(patientToEdit.id);
                                onClose();
                            }
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Eliminar paciente
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreatePatientModal;
