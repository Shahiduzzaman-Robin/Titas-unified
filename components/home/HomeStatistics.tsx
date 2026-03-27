'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const BrahmanbariaMap = dynamic(() => import('@/components/BrahmanbariaMap'), { ssr: false });

interface StatItem { label: string; count: number; }
interface StatsData { total: number; upazilas: StatItem[]; }

export default function HomeStatistics() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/public/stats')
            .then(res => res.json())
            .then(stats => {
                setData(stats);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) return null;

    return (
        <section className="home-stats-section py-24 bg-slate-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    
                    {/* Left: Content */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="section-label text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Live Statistics</div>
                            <h2 className="section-title bn-text text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                একনজরে <span className="text-blue-600">তিতাস</span>
                            </h2>
                            <p className="section-desc bn-text text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                                ব্রাহ্মণবাড়িয়ার ৯টি উপজেলা থেকে আসা ঢাকা বিশ্ববিদ্যালয়ের মেধাবী শিক্ষার্থীদের এই সুবিশাল নেটওয়ার্ক। আমাদের বৈচিত্র্যই আমাদের শক্তি।
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h4 className="text-3xl font-extrabold text-slate-900 mb-1">{data.total}</h4>
                                    <p className="text-slate-500 font-semibold bn-text">সক্রিয় সদস্য</p>
                                </div>
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                        <MapPin size={24} />
                                    </div>
                                    <h4 className="text-3xl font-extrabold text-slate-900 mb-1">৯টি</h4>
                                    <p className="text-slate-500 font-semibold bn-text">উপজেলা</p>
                                </div>
                            </div>

                            <Link href="/stats" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all group scale-100 hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10">
                                <span className="bn-text">বিস্তারিত পরিসংখ্যান দেখুন</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right: Interactive Map */}
                    <div className="lg:w-1/2 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="glass-panel p-6 md:p-10 rounded-[40px] border border-white/80 shadow-2xl shadow-blue-900/5 bg-white/40 backdrop-blur-md"
                        >
                            <BrahmanbariaMap upazilas={data.upazilas} total={data.total} />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
