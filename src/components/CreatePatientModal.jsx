import React, { useState } from 'react';
import './CreatePatientModal.css';

const CreatePatientModal = ({ isOpen, onClose, onSave, patientToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        day: '',
        month: '',
        year: '',
        phone: '',
        email: ''
    });

    React.useEffect(() => {
        if (isOpen && patientToEdit) {
            const [day, month, year] = patientToEdit.dob ? patientToEdit.dob.split('/') : ['', '', ''];
            setFormData({
                name: patientToEdit.name || '',
                day: day || '',
                month: month || '',
                year: year || '',
                phone: patientToEdit.phone || '',
                email: patientToEdit.email || ''
            });
        } else if (isOpen && !patientToEdit) {
            setFormData({
                name: '',
                day: '',
                month: '',
                year: '',
                phone: '',
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
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        console.log('handleSubmit called with formData:', formData);
        if (!formData.name) {
            console.warn('Form submission blocked: Name is empty');
            return;
        }

        try {
            const newPatient = {
                id: patientToEdit ? patientToEdit.id : Date.now(),
                name: formData.name,
                dob: `${formData.day}/${formData.month}/${formData.year}`,
                phone: formData.phone,
                email: formData.email
            };
            console.log('Invoking onSave with:', newPatient);
            onSave(newPatient);
            console.log('onSave completed, closing modal');
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
                <h2 className="modal-title">{patientToEdit ? 'Editar paciente' : 'Nuevo paciente'}</h2>
                <button className="save-btn" onClick={handleSubmit}>Guardar</button>
            </div>

            <div className="modal-content">
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
                            <div className="flag-icon">
                                <div className="flag-stripe red"></div>
                                <div className="flag-stripe yellow"></div>
                                <div className="flag-stripe red"></div>
                            </div>
                            <span className="country-code">+34</span>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="Teléfono"
                                value={formData.phone}
                                onChange={handleChange}
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
        </div>
    );
};

export default CreatePatientModal;
