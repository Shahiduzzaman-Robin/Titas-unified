'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import '@/styles/Stats.css';

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
        <section className="home-stats-section py-20 bg-slate-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    
                    {/* Left: Content (35%) */}
                    <div className="lg:w-[35%]">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="section-label text-blue-600 font-bold uppercase tracking-widest text-xs mb-3">Live Statistics</div>
                            <h2 className="section-title bn-text text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                একনজরে <span className="text-blue-600">তিতাস</span>
                            </h2>
                            <p className="section-desc bn-text text-lg text-slate-600 mb-8 leading-relaxed">
                                ব্রাহ্মণবাড়িয়ার ৯টি উপজেলা থেকে আসা ঢাকা বিশ্ববিদ্যালয়ের মেধাবী শিক্ষার্থীদের এই সুবিশাল নেটওয়ার্ক। আমাদের এই একতা কেবল মেধার মিলনমেলা নয়, বরং এটি আগামীর উন্নত ও সমৃদ্ধ ব্রাহ্মণবাড়িয়া বিনির্মাণে আমাদের সম্মিলিত অঙ্গীকারের প্রতীক।
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <TrendingUp size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-slate-900">{data.total}</h4>
                                        <p className="text-[11px] text-slate-500 font-bold bn-text">সক্রিয় সদস্য</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-slate-900">৯টি</h4>
                                        <p className="text-[11px] text-slate-500 font-bold bn-text">উপজেলা</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Interactive Map (65%) */}
                    <div className="lg:w-[65%] w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="glass-panel p-6 md:p-8 rounded-[40px] border border-white/80 shadow-2xl shadow-blue-900/5 bg-white/40 backdrop-blur-md home-compact-map"
                        >
                            <BrahmanbariaMap upazilas={data.upazilas} total={data.total} />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Center Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex justify-center mt-12"
                >
                    <Link href="/stats" className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-600 transition-all group shadow-2xl shadow-slate-900/20">
                        <span className="bn-text text-lg">বিস্তারিত পরিসংখ্যান দেখুন</span>
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
