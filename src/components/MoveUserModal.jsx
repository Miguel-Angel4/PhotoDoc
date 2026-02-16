import React, { useState } from 'react';
import './CreateUserModal.css'; // Reuse modal styles

const MoveUserModal = ({ isOpen, onClose, users, currentUserId, onMove }) => {
    const [selectedTargetId, setSelectedTargetId] = useState(null);

    if (!isOpen) return null;

    const availableUsers = users.filter(u => u.id !== currentUserId);

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
                    <h2>Mover a otro usuario</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <p style={{ color: '#aaa', marginBottom: '15px' }}>Selecciona el usuario al que quieres mover las fotos seleccionadas:</p>

                    <div className="patient-select-list" style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {availableUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedTargetId(user.id)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor: selectedTargetId === user.id ? '#00e5ff' : '#2a2f35',
                                    color: selectedTargetId === user.id ? '#000' : '#fff',
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
                                    backgroundColor: selectedTargetId === user.id ? '#000' : '#444',
                                    color: selectedTargetId === user.id ? '#fff' : '#ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{user.name}</span>
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

export default MoveUserModal;
