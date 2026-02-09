import React, { useState } from 'react';
import './Dashboard.css';
import CreatePatientModal from './CreatePatientModal';
import PatientDetail from './PatientDetail';
import CollageEditor from './CollageEditor';
import { dataService } from '../dataService';

const Dashboard = ({ photos, setPhotos, patients, setPatients, googleAccount, searchQuery }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isCollageOpen, setIsCollageOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);

    const handleSavePatient = (patient) => {
        console.log('handleSavePatient called with:', patient);
        try {
            const existingIndex = patients.findIndex(p => p.id === patient.id);
            if (existingIndex >= 0) {
                // Update existing
                console.log('Updating existing patient at index:', existingIndex);
                const updatedPatients = [...patients];
                updatedPatients[existingIndex] = patient;
                setPatients(updatedPatients);
                setSelectedPatient(patient); // Update selected view as well
            } else {
                // Add new
                console.log('Adding new patient');
                setPatients([...patients, patient]);
            }
            setEditingPatient(null);
            console.log('handleSavePatient completed successfully');
        } catch (error) {
            console.error('Error in handleSavePatient:', error);
        }
    };

    const handleEditPatient = () => {
        setEditingPatient(selectedPatient);
        setIsModalOpen(true);
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
    };

    const handleBackToDashboard = () => {
        setSelectedPatient(null);
    };

    const handleOpenCollage = () => {
        setIsCollageOpen(true);
    };

    const handleBackFromCollage = () => {
        setIsCollageOpen(false);
    };

    const handleCollageSave = (collageDataUrl) => {
        if (!selectedPatient) return;

        const newPhoto = {
            id: Date.now(),
            url: collageDataUrl, // Data URL from html2canvas
            date: new Date().toLocaleDateString(),
            patientId: selectedPatient.id,
            description: 'collage' // Optional tag
        };

        setPhotos(prev => [newPhoto, ...prev]);
        setIsCollageOpen(false); // Return to patient detail with new photo
    };

    if (isCollageOpen) {
        // Filter photos: show those belonging to the selected patient OR those with no patientId (legacy)
        const patientPhotos = photos.filter(p => p.patientId === selectedPatient?.id || !p.patientId);
        return <CollageEditor onBack={handleBackFromCollage} photos={patientPhotos} onSave={handleCollageSave} />;
    }

    if (selectedPatient) {
        return (
            <>
                <PatientDetail
                    patient={selectedPatient}
                    onBack={handleBackToDashboard}
                    onOpenCollage={handleOpenCollage}
                    onEditPatient={handleEditPatient}
                    photos={photos}
                    setPhotos={setPhotos}
                    patients={patients}
                />
                <CreatePatientModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
                    onSave={handleSavePatient}
                    onDelete={(id) => {
                        const patientName = patients.find(p => p.id === id)?.name;
                        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${patientName}?`)) {
                            setPatients(patients.filter(p => p.id !== id));
                            setPhotos(photos.filter(p => p.patientId !== id));
                            setIsModalOpen(false);
                            setSelectedPatient(null);
                        }
                    }}
                    patientToEdit={editingPatient}
                />
            </>
        );
    }

    return (
        <main className="dashboard-content">
            <CreatePatientModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
                onSave={handleSavePatient}
                onDelete={(id) => {
                    const patientName = patients.find(p => p.id === id)?.name;
                    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${patientName}?`)) {
                        setPatients(patients.filter(p => p.id !== id));
                        setPhotos(photos.filter(p => p.patientId !== id));
                        setIsModalOpen(false);
                        setSelectedPatient(null);
                    }
                }}
                patientToEdit={editingPatient}
            />

            {!import.meta.env.VITE_SUPABASE_ANON_KEY?.startsWith('eyJ') && googleAccount && (
                <div className="connection-warning" style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid #ffc107',
                    color: '#ffc107',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                }}>
                    <strong>⚠️ Error de configuración:</strong> La clave de Supabase en el archivo .env parece incorrecta (empieza por sb_publishable). Por favor, usa la "Anon Key" de Supabase.
                </div>
            )}

            <div className="content-header">
                <span className="patient-count">{patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}</span>
            </div>

            <div className="patient-list">
                {patients
                    .filter(patient =>
                        !searchQuery ||
                        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(patient => (
                        <div
                            className="patient-item"
                            key={patient.id}
                            onClick={() => handlePatientClick(patient)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="avatar">
                                {/* Initials or First letter */}
                                {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="patient-info">
                                <span className="patient-name">{patient.name}</span>
                                {/* Maybe show DOB or just name as requested "pone en la parte de pacientes" */}
                            </div>
                            <button
                                className="delete-patient-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${patient.name}?`)) {
                                        const updatedPatients = patients.filter(p => p.id !== patient.id);
                                        setPatients(updatedPatients);
                                        // Also remove photos for this patient
                                        const updatedPhotos = photos.filter(p => p.patientId !== patient.id);
                                        setPhotos(updatedPhotos);
                                    }
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    ))}
            </div>

            <button className="create-patient-btn" onClick={() => setIsModalOpen(true)}>
                <span className="plus-icon">+</span> Crear paciente
            </button>
        </main>
    );
};

export default Dashboard;
