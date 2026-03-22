import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './UserAppointments.css';

const UserAppointments = ({ googleAccount }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserAppointments = async () => {
        if (!googleAccount?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', googleAccount.id)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching user appointments:', error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserAppointments();
    }, [googleAccount]);

    const handleConfirmProposal = async (id) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'accepted' })
            .eq('id', id);

        if (error) console.error('Error confirming proposal:', error);
        else fetchUserAppointments();
    };

    const handleDeclineProposal = async (id) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) console.error('Error declining proposal:', error);
        else fetchUserAppointments();
    };

    if (!googleAccount) {
        return <div className="user-appointments-container">Inicia sesión para ver tus citas.</div>;
    }

    if (loading) return <div className="user-appointments-container">Cargando tus citas...</div>;

    return (
        <div className="user-appointments-container">
            <h2>Mis Citas</h2>
            <div className="user-appointments-list">
                {appointments.length === 0 ? (
                    <p>No tienes citas programadas.</p>
                ) : (
                    appointments.map(appt => (
                        <div key={appt.id} className="user-appointment-card">
                            <div className="appt-main-info">
                                <strong>{new Date(appt.date).toLocaleDateString()} a las {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                <span className={`status-badge status-${appt.status}`} style={{ marginLeft: '12px' }}>
                                    {appt.status === 'pending' ? 'Pendiente' : 
                                     appt.status === 'accepted' ? 'Confirmada' : 
                                     appt.status === 'rejected' ? 'Cancelada' : 
                                     appt.status === 'proposed' ? 'Nueva propuesta' : appt.status}
                                </span>
                            </div>
                            
                            {appt.status === 'proposed' && (
                                <div className="proposal-alert">
                                    <p>El administrador ha propuesto este nuevo horario.</p>
                                    <div className="proposal-actions">
                                        <button className="user-action-btn btn-confirm" onClick={() => handleConfirmProposal(appt.id)}>Aceptar Cambio</button>
                                        <button className="user-action-btn btn-decline" onClick={() => handleDeclineProposal(appt.id)}>Rechazar</button>
                                    </div>
                                </div>
                            )}

                            <div className="appt-meta" style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                                Motivo: {appt.reason || 'Sin especificar'}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(120, 222, 222, 0.1)', paddingTop: '20px' }}>
                <p style={{ color: '#78dede', fontSize: '0.9rem' }}>
                    * Para solicitar una nueva cita, por favor contacta directamente con el centro.
                </p>
            </div>
        </div>
    );
};

export default UserAppointments;
