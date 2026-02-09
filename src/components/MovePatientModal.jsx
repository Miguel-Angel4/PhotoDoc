import React, { useState } from 'react';
import './CreatePatientModal.css'; // Reuse modal styles

const MovePatientModal = ({ isOpen, onClose, patients, currentPatientId, onMove }) => {
    const [selectedTargetId, setSelectedTargetId] = useState(null);

    if (!isOpen) return null;

    const availablePatients = patients.filter(p => p.id !== currentPatientId);

    const handleConfirm = () => {
        if (selectedTargetId) {
            onMove(selectedTargetId);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Mover a otro paciente</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <p style={{ color: '#aaa', marginBottom: '15px' }}>Selecciona el paciente al que quieres mover las fotos seleccionadas:</p>

                    <div className="patient-select-list" style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {availablePatients.map(patient => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedTargetId(patient.id)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor: selectedTargetId === patient.id ? '#00e5ff' : '#2a2f35',
                                    color: selectedTargetId === patient.id ? '#000' : '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedTargetId === patient.id ? '#000' : '#444',
                                    color: selectedTargetId === patient.id ? '#fff' : '#ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{patient.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancelar</button>
                    <button
                        className="save-btn"
                        onClick={handleConfirm}
                        disabled={!selectedTargetId}
                        style={{ opacity: !selectedTargetId ? 0.5 : 1 }}
                    >
                        Mover
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovePatientModal;
