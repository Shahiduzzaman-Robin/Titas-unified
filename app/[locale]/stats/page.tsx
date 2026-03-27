'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Droplets, MapPin, Building2, GraduationCap, Calendar, PieChart, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import './Stats.css';

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
            <span>Analyzing our community...</span>
        </div>
    );

    if (!data || data.error) return (
        <div className="stats-error">
            <Users size={48} color="#94a3b8" />
            <h3>Transparency is coming</h3>
            <p>We're currently processing official records. Please check back shortly.</p>
        </div>
    );

    const renderCard = (title: string, items: StatItem[] = [], icon: React.ReactNode, total: number) => (
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
            <div className="stats-table-wrapper">
                <table className="stats-table">
                    <tbody>
                        {(items || []).slice(0, 15).map((item, i) => {
                            const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                            return (
                                <tr key={i}>
                                    <td className="td-label">{item.label}</td>
                                    <td className="td-count">
                                        <span className="count-num">{item.count}</span>
                                        <span className="count-unit">members</span>
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
                        Collective Impact <span>Dashboard</span>
                    </motion.h1>
                    <motion.div 
                        className="total-badge" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="growth-icon"><TrendingUp size={16} color="#16a34a" /></div>
                        <span>Total Members: <strong>{data.total}</strong> active students</span>
                    </motion.div>
                </header>

                <div className="stats-grid">
                    {/* By Session */}
                    {renderCard("Academic Sessions", data.sessions, <Calendar size={22} />, data.total)}
                    
                    {/* By Upazila */}
                    {renderCard("Roots & Origins", data.upazilas, <MapPin size={22} />, data.total)}

                    {/* By Hall */}
                    {renderCard("Shared Residence", data.halls, <Building2 size={22} />, data.total)}

                    {/* By Department */}
                    {renderCard("Knowledge Hub", data.departments, <GraduationCap size={22} />, data.total)}

                    {/* Gender Distribution */}
                    <motion.div 
                        className="stats-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="stats-card-header">
                            <div className="stats-card-icon-box"><PieChart size={22} /></div>
                            <h3>Gender Diversity</h3>
                        </div>
                        <div className="stats-table-wrapper">
                            <table className="stats-table">
                                <tbody>
                                    <tr style={{ height: '60px' }}>
                                        <td className="td-label">Male</td>
                                        <td className="td-count">
                                            <span className="count-num">{data.males}</span>
                                        </td>
                                        <td className="td-percent">
                                            <div className="percent-row">
                                                <div className="percent-bar-bg">
                                                    <motion.div 
                                                        className="percent-bar-fill male" 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: `${data.total > 0 ? (data.males / data.total) * 100 : 0}%` }} 
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                </div>
                                                <span className="percent-text">{data.total > 0 ? ((data.males / data.total) * 100).toFixed(1) : 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr style={{ height: '60px' }}>
                                        <td className="td-label">Female</td>
                                        <td className="td-count">
                                            <span className="count-num">{data.females}</span>
                                        </td>
                                        <td className="td-percent">
                                            <div className="percent-row">
                                                <div className="percent-bar-bg">
                                                    <motion.div 
                                                        className="percent-bar-fill female" 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: `${data.total > 0 ? (data.females / data.total) * 100 : 0}%` }} 
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                </div>
                                                <span className="percent-text">{data.total > 0 ? ((data.females / data.total) * 100).toFixed(1) : 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Blood Registry */}
                    {renderCard("Lifesaving Support", data.bloodGroups, <Droplets size={22} />, data.total)}
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
