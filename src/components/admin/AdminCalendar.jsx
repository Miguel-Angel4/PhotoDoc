import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './AdminCalendar.css';

const AdminCalendar = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAcceptedAppointments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('status', 'accepted')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching calendar appointments:', error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAcceptedAppointments();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) return <div className="calendar-container">Cargando calendario...</div>;

    return (
        <div className="calendar-container">
            <header className="admin-header" style={{ marginBottom: '24px' }}>
                <h2>Calendario de Citas</h2>
                <p>Visualización de todas las citas confirmadas.</p>
            </header>

            <div className="calendar-agenda">
                {appointments.length === 0 ? (
                    <div className="no-appointments">
                        <p>No hay citas aceptadas para mostrar.</p>
                    </div>
                ) : (
                    appointments.map(appt => {
                        const { day, month, year, time } = formatDate(appt.date);
                        return (
                            <div key={appt.id} className="agenda-item">
                                <div className="agenda-date">
                                    <span className="day">{day}</span>
                                    <span className="month">{month} {year}</span>
                                </div>
                                <div className="agenda-info">
                                    <h4>{appt.patient_name}</h4>
                                    <p>{appt.reason || 'Consulta general'}</p>
                                </div>
                                <div className="agenda-time">
                                    {time}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div style={{ marginTop: '40px', color: '#64748b', fontSize: '0.85rem' }}>
                * Solo se muestran las citas con estado "Aceptada". Para ver solicitudes pendientes, ve a la sección de Citas.
            </div>
        </div>
    );
};

export default AdminCalendar;
