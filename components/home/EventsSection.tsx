'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ArrowRight, Users, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Event {
    id: number;
    title: string;
    date: string;
    location: string;
    description: string;
    rsvpEnabled: boolean;
    capacity?: number;
    _count?: { rsvps: number };
    rsvpSummary?: {
        going: number;
        capacity: number;
        seatsLeft: number | null;
    };
}

const EventsSection = () => {
    const { data: session } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
    const [rsvpMessage, setRsvpMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('/api/events');
                if (res.data.success) {
                    const mappedEvents = res.data.data.map((e: any) => ({
                        ...e,
                        rsvpSummary: {
                            going: e._count?.rsvps || 0,
                            capacity: e.capacity || 0,
                            seatsLeft: e.capacity > 0 ? e.capacity - (e._count?.rsvps || 0) : null
                        }
                    }));
                    setEvents(mappedEvents);
                }
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const openRsvpModal = (event: Event) => {
        setSelectedEvent(event);
        setRsvpMessage({ type: '', text: '' });
        setRsvpModalOpen(true);
    };

    const handleRsvpSubmit = async () => {
        if (!selectedEvent) return;
        if (!session) {
            setRsvpMessage({ type: 'error', text: 'রেজিস্টার করতে আগে লগইন করুন।' });
            return;
        }

        setRsvpSubmitting(true);
        setRsvpMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`/api/events/${selectedEvent.id}/rsvp`, { response: 'going' });
            if (res.data.success) {
                setRsvpMessage({ type: 'success', text: res.data.message });
                // Manually update local event summary
                setEvents(prev => prev.map(e => {
                    if (e.id === selectedEvent.id) {
                        // For updates, we should theoretically not increment if they were already going,
                        // but the endpoint returns 201 for new, 200 for update. 
                        const isUpdate = res.status === 200;
                        const newGoing = isUpdate ? (e.rsvpSummary?.going || 0) : (e.rsvpSummary?.going || 0) + 1;
                        return { 
                            ...e, 
                            rsvpSummary: { 
                                going: newGoing,
                                capacity: e.capacity || 0,
                                seatsLeft: (e.capacity || 0) > 0 ? (e.capacity || 0) - newGoing : null
                            } 
                        };
                    }
                    return e;
                }));
            }
        } catch (err: any) {
            setRsvpMessage({ type: 'error', text: err.response?.data?.message || 'Unable to submit registration.' });
        } finally {
            setRsvpSubmitting(false);
        }
    };

    return (
        <section className="events-modern section-bg-light" id="events">
            <div className="container">
                <div className="section-header-center">
                    <div className="section-label">Updates</div>
                    <h2 className="section-title bn-text">ইভেন্ট ও নোটিশ</h2>
                    <p className="section-subtitle">Stay updated with the latest community happenings</p>
                </div>

                <div className="events-grid">
                    {loading ? (
                        <div className="loading-state col-span-2 flex justify-center py-10">
                            <Loader2 className="animate-spin text-slate-400" size={32} />
                        </div>
                    ) : events.length > 0 ? (
                        events.map(event => (
                            <div key={event.id} className="event-modern-card glass-panel">
                                <div className="event-date">
                                    <span className="day">{new Date(event.date).getDate()}</span>
                                    <span className="month">{new Date(event.date).toLocaleDateString('bn-BD', { month: 'short' })}</span>
                                </div>
                                <div className="event-content">
                                    <h3 className="bn-text">{event.title}</h3>
                                    <p className="event-meta flex items-center gap-1"><MapPin size={14} /> {event.location}</p>
                                    <p className="event-desc line-clamp-2">{event.description}</p>
                                    {event.rsvpEnabled && (
                                        <>
                                            <div className="event-rsvp-stats en-text flex gap-3 text-teal-600 text-sm font-bold mb-2">
                                                <span>Going: {event.rsvpSummary?.going || 0}</span>
                                                {event.rsvpSummary?.capacity ? (
                                                    <span>Seats left: {event.rsvpSummary.seatsLeft}</span>
                                                ) : null}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-rsvp px-4 py-2 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-colors"
                                                onClick={() => openRsvpModal(event)}
                                            >
                                                {session ? 'Register' : 'Register Now'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                           <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                           <h3 className="text-xl font-bold text-slate-400 bn-text">আপাতত কোনো ইভেন্ট নেই</h3>
                           <p className="text-slate-400 mt-2">নতুন ইভেন্টের জন্য আমাদের সাথেই থাকুন।</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RSVP Modal */}
            {rsvpModalOpen && selectedEvent && (
                <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="modal-content bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="modal-header flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Event Registration</h3>
                            <button onClick={() => setRsvpModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="rsvp-details mb-6 p-4 bg-slate-50 rounded-xl">
                            <h4 className="font-bold text-slate-900">{selectedEvent.title}</h4>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <Calendar size={14} /> {new Date(selectedEvent.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin size={14} /> {selectedEvent.location}
                            </p>
                        </div>

                        {rsvpMessage.text && (
                            <div className={`rsvp-flash p-4 rounded-xl mb-6 flex items-center gap-2 ${rsvpMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {rsvpMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <p className="text-sm font-medium">{rsvpMessage.text}</p>
                            </div>
                        )}

                        {!session ? (
                            <div className="text-center py-4">
                                <p className="text-slate-600 mb-4">Please login to your student account to register for this event.</p>
                                <Link href="/login" className="btn-modern-primary inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <div className="rsvp-actions flex flex-col gap-3">
                                <button
                                    onClick={handleRsvpSubmit}
                                    disabled={rsvpSubmitting || rsvpMessage.type === 'success'}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${rsvpMessage.type === 'success' ? 'bg-green-500 text-white cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {rsvpSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : rsvpMessage.type === 'success' ? (
                                        <>Registered Successfully</>
                                    ) : (
                                        <>Confirm Registration</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setRsvpModalOpen(false)}
                                    className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default EventsSection;
