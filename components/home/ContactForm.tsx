'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './ContactForm.css';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await axios.post('/api/contact', formData);
            if (res.data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="contact-form-glass">
            <div className="contact-form-header">
                <h3 className="bn-text">আমাদের লিখে জানান</h3>
                <p className="en-text text-sm opacity-80 mt-1">We'd love to hear from you!</p>
            </div>

            {status === 'success' ? (
                <div className="contact-form-success">
                    <CheckCircle size={48} className="success-icon text-green-500" />
                    <h4 className="bn-text mt-4">ধন্যবাদ!</h4>
                    <p className="bn-text mt-2 text-slate-400">আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো।</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="contact-form-body">
                    {status === 'error' && (
                        <div className="contact-form-alert error flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-lg mb-4">
                            <AlertCircle size={18} />
                            <span className="bn-text text-sm">{errorMessage}</span>
                        </div>
                    )}

                    <div className="form-group-modern">
                        <label htmlFor="name" className="bn-text">আপনার নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="যেমন: রাকিবুল হাসান"
                            className="bn-text input-modern"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className="form-group-modern">
                        <label htmlFor="email" className="bn-text">ইমেইল ঠিকানা <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@gmail.com"
                            className="en-text input-modern"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className="form-group-modern">
                        <label htmlFor="subject" className="bn-text">বিষয় <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="কী বিষয়ে জানতে চান?"
                            className="bn-text input-modern"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className="form-group-modern">
                        <label htmlFor="message" className="bn-text">বার্তা <span className="text-red-500">*</span></label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="আপনার মতামত বা প্রশ্ন বিস্তারিত লিখুন..."
                            className="bn-text input-modern"
                            disabled={status === 'loading'}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className={`btn-modern-submit bn-text py-3 px-6 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}`}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>পাঠানো হচ্ছে...</span>
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                <span>বার্তা পাঠান</span>
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ContactForm;
