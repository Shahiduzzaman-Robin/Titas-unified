'use client';

import React, { useEffect, useState } from 'react';
import { Users, Droplets, Building2, GraduationCap, Calendar, PieChart, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PublicNav } from '@/components/PublicNav';
import Footer from '@/components/home/Footer';
import '@/styles/Stats.css';

const BrahmanbariaMap = dynamic(() => import('@/components/BrahmanbariaMap'), { ssr: false });
const GenderDist = dynamic(() => import('@/components/GenderDist'), { ssr: false });

interface StatItem {
    label: string;
    count: number;
}

interface StatsData {
    total: number;
    males: number;
    females: number;
    bloodGroups: StatItem[];
    upazilas: StatItem[];
    halls: StatItem[];
    departments: StatItem[];
    sessions: StatItem[];
    error?: string;
    status?: number;
}

const StatsPage = () => {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetch('/api/public/stats')
            .then(res => {
                if (!res.ok) throw new Error('API request failed');
                return res.json();
            })
            .then(stats => {
                if (stats.error) throw new Error(stats.error);
                setData(stats);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (!mounted || loading) return (
        <div className="stats-loading">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Activity size={40} color="#2563eb" />
            </motion.div>
            <span>তথ্য বিশ্লেষণ করা হচ্ছে...</span>
        </div>
    );

    if (!data || data.error) return (
        <div className="stats-error">
            <Users size={48} color="#94a3b8" />
            <h3>তথ্য হালনাগাদ করা হচ্ছে</h3>
            <p>আমরা বর্তমানে প্রয়োজনীয় তথ্য যাচাই করছি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
        </div>
    );

    const renderCard = (title: string, items: StatItem[] = [], icon: React.ReactNode, total: number, noScroll: boolean = false) => (
        <motion.div 
            className="stats-card" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="stats-card-header">
                <div className="stats-card-icon-box">{icon}</div>
                <h3>{title}</h3>
            </div>
            <div className={`stats-table-wrapper ${noScroll ? 'no-scroll-wrapper' : ''}`}>
                <table className="stats-table">
                    <tbody>
                        {(items || []).map((item, i) => {
                            const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                            return (
                                <tr key={i}>
                                    <td className="td-label">{item.label}</td>
                                    <td className="td-count">
                                        <span className="count-num">{item.count}</span>
                                        <span className="count-unit">জন</span>
                                    </td>
                                    <td className="td-percent">
                                        <div className="percent-row">
                                            <div className="percent-bar-bg">
                                                <motion.div 
                                                    className="percent-bar-fill" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                                />
                                            </div>
                                            <span className="percent-text">{percent}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    return (
        <>
            <PublicNav />
            <div className="public-stats-page">
            <div 
                className="stats-container"
            >
                <header className="stats-header">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        শিক্ষার্থীদের <span>পরিসংখ্যান ড্যাশবোর্ড</span>
                    </motion.h1>
                    <motion.div 
                        className="total-badge" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="growth-icon"><TrendingUp size={16} color="#16a34a" /></div>
                        <span>মোট সদস্য: <strong>{data.total}</strong> জন সক্রিয় শিক্ষার্থী</span>
                    </motion.div>
                </header>

                <div className="stats-grid">
                    {/* By Session */}
                    {renderCard("একাডেমিক সেশন", data.sessions, <Calendar size={22} />, data.total)}
                    
                    {/* By Upazila - Interactive Map */}
                    <motion.div
                        className="stats-card bb-map-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="stats-card-header">
                            <div className="stats-card-icon-box" style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                            </div>
                            <h3>জন্মস্থান ও এলাকা</h3>
                        </div>
                        <BrahmanbariaMap upazilas={data.upazilas} total={data.total} />
                    </motion.div>

                    {/* By Hall */}
                    {renderCard("আবাসিক হলসমূহ", data.halls, <Building2 size={22} />, data.total)}

                    {/* By Department */}
                    {renderCard("বিভাগ ও অনুষদ", data.departments, <GraduationCap size={22} />, data.total)}

                    <motion.div 
                        className="stats-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="stats-card-header">
                            <div className="stats-card-icon-box"><PieChart size={22} /></div>
                            <h3>লিঙ্গভিত্তিক বিভাজন</h3>
                        </div>
                        <GenderDist males={data.males} females={data.females} total={data.total} />
                    </motion.div>

                    {/* Blood Registry */}
                    {renderCard("রক্তের গ্রুপ", data.bloodGroups, <Droplets size={22} />, data.total, true)}
                </div>
            </div>
            </div>
            <Footer />
        </>
    );
};

export default StatsPage;
