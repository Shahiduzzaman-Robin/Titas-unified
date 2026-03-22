"use client"

import React from 'react';
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import ContactForm from '@/components/home/ContactForm';
import { PublicNav } from '@/components/PublicNav';
import Footer from '@/components/home/Footer';
import { useTranslations } from 'next-intl';
import '@/styles/Contact.css';

export default function ContactPage() {
    const t = useTranslations('public.contact');

    return (
        <div className="contact-page-modern min-h-screen">
            <PublicNav />
            
            {/* HERO SECTION */}
            <section className="contact-hero">
                <div className="contact-overlay"></div>
                <img
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80"
                    alt="Contact Titas"
                    className="contact-bg-img"
                />

                <div className="container contact-hero-content px-4 relative mx-auto">
                    <div className="contact-badge glass-panel-dark inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
                        <Globe size={16} />
                        <span>{t('heroBadge')}</span>
                    </div>

                    <h1 className="contact-title bn-text text-white leading-tight mb-6">
                        {t('heroTitleMain')} <br />
                        <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent italic">
                            {t('heroTitleAccent')}
                        </span>
                    </h1>

                    <p className="contact-subtitle bn-text text-slate-300 max-w-2xl mx-auto text-lg">
                        {t('description')}
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT SECTION */}
            <section className="contact-main py-20 px-4">
                <div className="container max-w-7xl mx-auto">
                    <div className="contact-layout grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* LEFT PANE: Contact Information */}
                        <div className="contact-info-panel space-y-8">
                            <div className="space-y-4">
                                <h2 className="bn-text text-4xl font-extrabold text-slate-900">{t('officeTitle')}</h2>
                                <p className="text-slate-500 bn-text text-lg italic">
                                    ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলার ছাত্র-ছাত্রীদের কল্যাণে আমরা সবসময় অঙ্গীকারবদ্ধ।
                                </p>
                            </div>

                            <div className="info-cards grid gap-6">
                                <div className="info-card flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="icon-wrap w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="bn-text text-xl font-bold text-slate-900">{t('officeTitle')}</h4>
                                        <p className="bn-text text-slate-500">{t('officeAddress')}</p>
                                    </div>
                                </div>

                                <div className="info-card flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="icon-wrap w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="bn-text text-xl font-bold text-slate-900">{t('hotlineTitle')}</h4>
                                        <p className="text-slate-500 font-bold">+88 015 2126 1069</p>
                                    </div>
                                </div>

                                <div className="info-card flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="icon-wrap w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="bn-text text-xl font-bold text-slate-900">{t('emailTitle')}</h4>
                                        <p className="text-slate-500 font-bold">rakibulhasan.du7480@gmail.com</p>
                                    </div>
                                </div>

                                <div className="info-card flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="icon-wrap w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="bn-text text-xl font-bold text-slate-900">{t('officeHoursTitle')}</h4>
                                        <p className="bn-text text-slate-500">{t('officeHoursValue')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANE: The Reusable Form Component */}
                        <div className="contact-form-wrapper">
                            <ContactForm />
                        </div>

                    </div>
                </div>
            </section>

            {/* MAP SECTION */}
            <section className="contact-map">
                <div className="map-placeholder">
                    <iframe
                        title="Titas Location Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.5414800366624!2d90.39294277632616!3d23.728091192953293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8e90a449e4f%3A0xb7092a9c25197fa4!2sTeacher-Student%20Centre%20(TSC)!5e0!3m2!1sen!2sbd!4v1715016254013!5m2!1sen!2sbd"
                        width="100%"
                        height="450"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>

            <Footer />
        </div>
    );
}
