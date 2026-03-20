import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const AlumniSpotlight = () => {
    const t = useTranslations('home.spotlight');

    return (
        <section className="spotlight-modern section-bg-dark" id="alumni">
            <div className="container">
                <div className="spotlight-layout">
                    <div className="spotlight-content animate-in">
                        <div className="section-label light">Alumni Spotlight</div>
                        <h2 className="section-title text-white bn-text">আমাদের গর্ব</h2>
                        <p className="section-desc spotlight-desc bn-text">
                            ঢাকা বিশ্ববিদ্যালয় থেকে পড়াশোনা শেষে আমাদের ব্রাহ্মণবাড়িয়ার সন্তানেরা আজ দেশ-বিদেশের বিভিন্ন গুরুত্বপূর্ণ স্থানে নেতৃত্ব দিচ্ছেন। তাদের সাফল্য আমাদের অনুপ্রেরণা।
                        </p>
                        <div className="spotlight-stats">
                            <div className="spotlight-stat-item" style={{ animationDelay: '0.1s' }}>
                                <Users size={20} className="text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="value">1200+</span>
                                    <span className="label">Active Alumni</span>
                                </div>
                            </div>
                            <div className="spotlight-stat-item" style={{ animationDelay: '0.2s' }}>
                                <Award size={20} className="text-cyan-400" />
                                <div className="flex flex-col">
                                    <span className="value">25+</span>
                                    <span className="label">Public Leaders</span>
                                </div>
                            </div>
                            <div className="spotlight-stat-item" style={{ animationDelay: '0.3s' }}>
                                <BookOpen size={20} className="text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="value">40+</span>
                                    <span className="label">Mentors</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/students" className="btn-modern-primary white">
                            <Award size={18} /> Explore Alumni Directory
                        </Link>
                    </div>
                    <div className="spotlight-cards">
                        <div className="spotlight-card animate-in" style={{ animationDelay: '0.4s' }}>
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80" alt="Alumni Placeholder" className="avatar" />
                            <div className="info">
                                <div className="spotlight-meta-top">
                                    <h4>Dr. Abul Kalam</h4>
                                    <span className="spotlight-pill">Mentor</span>
                                </div>
                                <p className="role">Professor, Dept of Physics</p>
                                <p className="batch">Batch: '98</p>
                                <p className="summary">Leading research initiatives and mentoring first-generation university students.</p>
                            </div>
                        </div>
                        <div className="spotlight-card animate-in" style={{ animationDelay: '0.6s' }}>
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" alt="Alumni Placeholder" className="avatar" />
                            <div className="info">
                                <div className="spotlight-meta-top">
                                    <h4>Farhana Yesmin</h4>
                                    <span className="spotlight-pill">Leader</span>
                                </div>
                                <p className="role">Joint Secretary, GoB</p>
                                <p className="batch">Batch: '01</p>
                                <p className="summary">Working on policy reform and supporting women-focused education programs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AlumniSpotlight;
