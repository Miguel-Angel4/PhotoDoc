import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './UserAppointments.css';

const UserAppointments = ({ googleAccount }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // New Appointment Request State
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmitRequest = async () => {
        if (!selectedDate || !selectedTime || !reason) return;
        
        setSubmitting(true);
        const [year, month, day] = selectedDate.split('-').map(Number);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const appointmentDate = new Date(year, month - 1, day, hours, minutes).toISOString();

        const { error } = await supabase
            .from('appointments')
            .insert([{
                user_id: googleAccount.id,
                patient_name: googleAccount.name || googleAccount.email.split('@')[0],
                date: appointmentDate,
                reason: reason,
                status: 'pending'
            }]);

        if (error) {
            console.error('Error submitting appointment:', error);
        } else {
            setShowModal(false);
            setStep(1);
            setSelectedDate(null);
            setSelectedTime('');
            setReason('');
            fetchUserAppointments();
        }
        setSubmitting(false);
    };

    // Calendar Helpers
    const generateDays = () => {
        const now = new Date();
        const days = [];
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Padding for the first week
        for (let i = 0; i < startOfMonth.getDay(); i++) {
            days.push({ day: null });
        }
        
        for (let i = 1; i <= endOfMonth.getDate(); i++) {
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isPast = new Date(now.getFullYear(), now.getMonth(), i) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            days.push({ day: i, dateStr, disabled: isPast });
        }
        return days;
    };

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
        "12:00", "12:30", "16:00", "16:30", "17:00", "17:30"
    ];

    if (!googleAccount) {
        return <div className="user-appointments-container">Inicia sesión para ver tus citas.</div>;
    }

    if (loading) return <div className="user-appointments-container">Cargando tus citas...</div>;

    return (
        <div className="user-appointments-container">
            <div className="request-btn-container">
                <button className="btn-new-appointment" onClick={() => setShowModal(true)}>
                    + Pedir Cita
                </button>
            </div>

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

            {/* Request Appointment Modal */}
            {showModal && (
                <div className="modify-modal-overlay">
                    <div className="modify-modal" style={{ maxWidth: '450px' }}>
                        <h3>Solicitar Nueva Cita</h3>
                        
                        {step === 1 ? (
                            <div className="step-selection">
                                <div className="calendar-header">
                                    <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="calendar-grid">
                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                                        <div key={d} className="weekday-header">{d}</div>
                                    ))}
                                    {generateDays().map((d, i) => (
                                        <div 
                                            key={i} 
                                            className={`calendar-day ${d.dateStr === selectedDate ? 'selected' : ''} ${d.disabled ? 'disabled' : ''}`}
                                            onClick={() => !d.disabled && d.day && setSelectedDate(d.dateStr)}
                                        >
                                            {d.day}
                                        </div>
                                    ))}
                                </div>
                                
                                <label style={{ color: '#78dede', fontSize: '0.9rem' }}>Selecciona una hora:</label>
                                <div className="time-slots">
                                    {timeSlots.map(time => (
                                        <div 
                                            key={time} 
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button className="action-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button 
                                        className="action-btn btn-modify" 
                                        disabled={!selectedDate || !selectedTime}
                                        onClick={() => setStep(2)}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="step-confirm">
                                <div className="summary-details">
                                    <p>📅 {new Date(selectedDate).toLocaleDateString()}</p>
                                    <p>⏰ {selectedTime}</p>
                                </div>
                                
                                <label style={{ color: '#78dede', fontSize: '0.9rem' }}>Motivo de la cita:</label>
                                <textarea 
                                    className="reason-textarea" 
                                    placeholder="Describe brevemente el motivo..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />

                                <div className="modal-actions">
                                    <button className="action-btn" onClick={() => setStep(1)}>Atrás</button>
                                    <button 
                                        className="action-btn btn-accept" 
                                        disabled={!reason || submitting}
                                        onClick={handleSubmitRequest}
                                    >
                                        {submitting ? 'Enviando...' : 'Confirmar Cita'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div style={{ marginTop: '32px', borderTop: '1px solid rgba(120, 222, 222, 0.1)', paddingTop: '20px' }}>
                <p style={{ color: '#78dede', fontSize: '0.9rem' }}>
                    * El administrador revisará tu solicitud y te confirmará por este medio.
                </p>
            </div>
        </div>
    );
};

export default UserAppointments;
