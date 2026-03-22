import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './AdminAppointments.css';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modifyingAppt, setModifyingAppt] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const fetchAppointments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching appointments:', error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAccept = async (id) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'accepted' })
            .eq('id', id);

        if (error) console.error('Error accepting appointment:', error);
        else fetchAppointments();
    };

    const handleReject = async (id) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) console.error('Error rejecting appointment:', error);
        else fetchAppointments();
    };

    const handleModifyClick = (appt) => {
        const dateObj = new Date(appt.date);
        setModifyingAppt(appt);
        setNewDate(dateObj.toISOString().split('T')[0]);
        setNewTime(dateObj.toTimeString().slice(0, 5));
    };

    const handleSaveModification = async () => {
        if (!modifyingAppt) return;

        const combinedDateTime = new Date(`${newDate}T${newTime}`).toISOString();

        const { error } = await supabase
            .from('appointments')
            .update({ 
                date: combinedDateTime,
                status: 'proposed' 
            })
            .eq('id', modifyingAppt.id);

        if (error) {
            console.error('Error modifying appointment:', error);
        } else {
            setModifyingAppt(null);
            fetchAppointments();
        }
    };

    if (loading) return <div className="admin-appointments-container">Cargando citas...</div>;

    return (
        <div className="admin-appointments-container">
            <header className="admin-header">
                <h2>Gestión de Citas</h2>
                <p>Gestiona las solicitudes de tus clientes.</p>
            </header>

            <div className="appointments-list">
                {appointments.length === 0 ? (
                    <p className="no-data">No hay citas registradas.</p>
                ) : (
                    appointments.map((appt) => (
                        <div key={appt.id} className="appointment-card">
                            <div className="appointment-info">
                                <h3>{appt.patient_name}</h3>
                                <div className="appointment-details">
                                    <span>📅 {new Date(appt.date).toLocaleDateString()}</span>
                                    <span>⏰ {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span>📝 {appt.reason || 'Sin motivo especificado'}</span>
                                </div>
                            </div>
                            
                            <div className="appointment-status">
                                <span className={`status-badge status-${appt.status}`}>
                                    {appt.status === 'pending' ? 'Pendiente' : 
                                     appt.status === 'accepted' ? 'Aceptada' : 
                                     appt.status === 'rejected' ? 'Rechazada' : 
                                     appt.status === 'proposed' ? 'Propuesta enviada' : appt.status}
                                </span>
                            </div>

                            <div className="appointment-actions">
                                {(appt.status === 'pending' || appt.status === 'proposed') && (
                                    <>
                                        <button className="action-btn btn-accept" onClick={() => handleAccept(appt.id)}>Aceptar</button>
                                        <button className="action-btn btn-reject" onClick={() => handleReject(appt.id)}>Rechazar</button>
                                        <button className="action-btn btn-modify" onClick={() => handleModifyClick(appt)}>Modificar</button>
                                    </>
                                )}
                                {appt.status === 'accepted' && (
                                    <button className="action-btn btn-reject" onClick={() => handleReject(appt.id)}>Cancelar</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modifyingAppt && (
                <div className="modify-modal-overlay">
                    <div className="modify-modal">
                        <h3>Modificar Cita</h3>
                        <p>Propón una nueva fecha y hora para {modifyingAppt.patient_name}:</p>
                        
                        <div className="modify-form">
                            <label>Nueva Fecha</label>
                            <input 
                                type="date" 
                                value={newDate} 
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                            <label>Nueva Hora</label>
                            <input 
                                type="time" 
                                value={newTime} 
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="action-btn" onClick={() => setModifyingAppt(null)}>Cancelar</button>
                            <button className="action-btn btn-modify" onClick={handleSaveModification}>Enviar Propuesta</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
