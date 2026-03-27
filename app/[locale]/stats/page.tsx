'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Droplets, MapPin, Building2, GraduationCap, Calendar, PieChart } from 'lucide-react';
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
}

const StatsPage = () => {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return <div className="stats-loading">Loading Statistics...</div>;
    if (!data || data.error) return <div className="stats-error">Failed to load statistics. Please ensure you have approved students in the system.</div>;

    const renderTable = (title: string, items: StatItem[] = [], icon: React.ReactNode, total: number) => (
        <div className="stats-card">
            <div className="stats-card-header">
                {icon}
                <h3>{title}</h3>
            </div>
            <div className="stats-table-wrapper">
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th className="th-label">{title.split(' ').pop()}</th>
                            <th className="th-count">Count</th>
                            <th className="th-percent">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(items || []).map((item, i) => {
                            const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                            return (
                                <tr key={i}>
                                    <td className="td-label">{item.label}</td>
                                    <td className="td-count">{item.count}</td>
                                    <td className="td-percent">
                                        <div className="percent-cell">
                                            <span>{percent}%</span>
                                            <div className="percent-bar-bg">
                                                <div 
                                                    className="percent-bar-fill" 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="public-stats-page">
            <div className="stats-container">
                <header className="stats-header">
                    <h1>Students Statistics Dashboard</h1>
                    <div className="total-badge">
                        <Users size={20} />
                        <span>Total Approved Students: <strong>{data.total}</strong></span>
                    </div>
                </header>

                <div className="stats-grid">
                    {/* By Session */}
                    {renderTable("By Session", data.sessions, <Calendar size={18} />, data.total)}
                    
                    {/* By Upazila */}
                    {renderTable("By Upazila", data.upazilas, <MapPin size={18} />, data.total)}

                    {/* By Hall */}
                    {renderTable("By Hall", data.halls, <Building2 size={18} />, data.total)}

                    {/* By Department */}
                    {renderTable("By Department", data.departments, <GraduationCap size={18} />, data.total)}

                    {/* Gender Distribution */}
                    <div className="stats-card">
                        <div className="stats-card-header">
                            <PieChart size={18} />
                            <h3>Gender Distribution</h3>
                        </div>
                        <div className="stats-table-wrapper">
                            <table className="stats-table">
                                <thead>
                                    <tr>
                                        <th className="th-label">Gender</th>
                                        <th className="th-count">Count</th>
                                        <th className="th-percent">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="td-label">Male</td>
                                        <td className="td-count">{data.males}</td>
                                        <td className="td-percent">
                                            <div className="percent-cell">
                                                <span>{data.total > 0 ? ((data.males / data.total) * 100).toFixed(1) : 0}%</span>
                                                <div className="percent-bar-bg"><div className="percent-bar-fill male" style={{ width: `${(data.males/data.total)*100}%` }} /></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="td-label">Female</td>
                                        <td className="td-count">{data.females}</td>
                                        <td className="td-percent">
                                            <div className="percent-cell">
                                                <span>{data.total > 0 ? ((data.females / data.total) * 100).toFixed(1) : 0}%</span>
                                                <div className="percent-bar-bg"><div className="percent-bar-fill female" style={{ width: `${(data.females/data.total)*100}%` }} /></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Blood Registry */}
                    {renderTable("Blood Registry", data.bloodGroups, <Droplets size={18} />, data.total)}
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
