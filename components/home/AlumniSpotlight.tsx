import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const AlumniSpotlight = () => {
    const t = useTranslations('home.spotlight');

    return (
        <section className="spotlight-modern section-bg-dark" id="alumni">
            <div className="container">
                    <div className="spotlight-content !max-w-3xl mx-auto text-center animate-in">
                        <div className="section-label light mx-auto">Alumni Spotlight</div>
                        <h2 className="section-title text-white bn-text text-center">আমাদের গর্ব</h2>
                        <p className="section-desc spotlight-desc bn-text text-center mx-auto !max-w-2xl">
                            ঢাকা বিশ্ববিদ্যালয় থেকে পড়াশোনা শেষে আমাদের ব্রাহ্মণবাড়িয়ার সন্তানেরা আজ দেশ-বিদেশের বিভিন্ন গুরুত্বপূর্ণ স্থানে নেতৃত্ব দিচ্ছেন। তাদের এই অভাবনীয় সাফল্য আজ আমাদের জন্য পরম গর্বের এবং নতুন প্রজন্মের শিক্ষার্থীদের জন্য এক সোনালী অনুপ্রেরণা। তারা কেবল ব্রাহ্মণবাড়িয়ার নাম উজ্জ্বল করছেন না, বরং আর্তমানবতার সেবায় ও সমাজ গঠনে রাখছেন অনন্য অবদান।
                        </p>
                        <div className="spotlight-stats justify-center">
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
                        <Link href="/students" className="btn-modern-primary white mx-auto mt-8">
                            <Award size={18} /> Explore Alumni Directory
                        </Link>
                    </div>
            </div>
        </section>
    );
};

export default AlumniSpotlight;
