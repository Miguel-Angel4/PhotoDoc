import React, { useState } from 'react';
import './Dashboard.css';
import CreateUserModal from './CreateUserModal';
import UserDetail from './UserDetail';
import CollageEditor from './CollageEditor';
import { dataService } from '../dataService';

const Dashboard = ({ photos, setPhotos, users, setUsers, googleAccount, searchQuery }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCollageOpen, setIsCollageOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleSaveUser = (user) => {
        console.log('handleSaveUser called with:', user);
        try {
            const existingIndex = users.findIndex(u => u.id === user.id);
            if (existingIndex >= 0) {
                // Update existing
                console.log('Updating existing user at index:', existingIndex);
                const updatedUsers = [...users];
                updatedUsers[existingIndex] = user;
                setUsers(updatedUsers);
                setSelectedUser(user); // Update selected view as well
            } else {
                // Add new
                console.log('Adding new user');
                setUsers([...users, user]);
            }
            setEditingUser(null);
            console.log('handleSaveUser completed successfully');
        } catch (error) {
            console.error('Error in handleSaveUser:', error);
        }
    };

    const handleEditUser = () => {
        setEditingUser(selectedUser);
        setIsModalOpen(true);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleBackToDashboard = () => {
        setSelectedUser(null);
    };

    const handleOpenCollage = () => {
        setIsCollageOpen(true);
    };

    const handleBackFromCollage = () => {
        setIsCollageOpen(false);
    };

    const handleCollageSave = (collageDataUrl) => {
        if (!selectedUser) return;

        const newPhoto = {
            id: Date.now(),
            url: collageDataUrl, // Data URL from html2canvas
            date: new Date().toLocaleDateString(),
            patientId: selectedUser.id,
            description: 'collage' // Optional tag
        };

        setPhotos(prev => [newPhoto, ...prev]);
        setIsCollageOpen(false); // Return to patient detail with new photo
    };

    if (isCollageOpen) {
        // Filter photos: show those belonging to the selected user OR those with no patientId (legacy)
        const userPhotos = photos.filter(p => p.patientId === selectedUser?.id || !p.patientId);
        return <CollageEditor onBack={handleBackFromCollage} photos={userPhotos} onSave={handleCollageSave} />;
    }

    if (selectedUser) {
        return (
            <>
                <UserDetail
                    user={selectedUser}
                    onBack={handleBackToDashboard}
                    onOpenCollage={handleOpenCollage}
                    onEditUser={handleEditUser}
                    photos={photos}
                    setPhotos={setPhotos}
                    users={users}
                />
                <CreateUserModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
                    onSave={handleSaveUser}
                    onDelete={(id) => {
                        const userName = users.find(u => u.id === id)?.name;
                        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}?`)) {
                            setUsers(users.filter(u => u.id !== id));
                            setPhotos(photos.filter(p => p.patientId !== id));
                            setIsModalOpen(false);
                            setSelectedUser(null);
                        }
                    }}
                    userToEdit={editingUser}
                />
            </>
        );
    }

    return (
        <main className="dashboard-content">
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
                onSave={handleSaveUser}
                onDelete={(id) => {
                    const userName = users.find(u => u.id === id)?.name;
                    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}?`)) {
                        setUsers(users.filter(u => u.id !== id));
                        setPhotos(photos.filter(p => p.patientId !== id));
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }
                }}
                userToEdit={editingUser}
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
                <span className="patient-count">{users.length} {users.length === 1 ? 'usuario' : 'usuarios'}</span>
            </div>

            <div className="patient-list">
                {users
                    .filter(user =>
                        !searchQuery ||
                        user.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(user => (
                        <div
                            className="patient-item"
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="avatar">
                                {/* Initials or First letter */}
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="patient-info">
                                <span className="patient-name">{user.name}</span>
                                {/* Maybe show DOB or just name as requested "pone en la parte de pacientes" */}
                            </div>
                            <button
                                className="delete-patient-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
                                        const updatedUsers = users.filter(u => u.id !== user.id);
                                        setUsers(updatedUsers);
                                        // Also remove photos for this user
                                        const updatedPhotos = photos.filter(p => p.patientId !== user.id);
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
                <span className="plus-icon">+</span> Crear usuario
            </button>
        </main>
    );
};

export default Dashboard;
