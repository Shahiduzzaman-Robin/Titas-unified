'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Post {
    id: number;
    title: string;
    slug: string;
    publishedAt: Date | string;
    category?: { name: string };
}

interface SidebarTabsProps {
    trending: Post[];
    latest: Post[];
}

export default function SidebarTabs({ trending = [], latest = [] }: SidebarTabsProps) {
    const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');
    const [mounted, setMounted] = useState(false);
    const locale = useLocale();

    useEffect(() => {
        setMounted(true);
    }, []);

    const posts = activeTab === 'trending' ? trending : latest;

    if (!mounted) {
        return <div className="bg-slate-900 h-[400px] w-full animate-pulse rounded-sm" />;
    }

    return (
        <div className="bg-[#0a0d14] rounded-sm overflow-hidden shadow-2xl border border-slate-800/50">
            {/* Dark Tabs Header */}
            <div className="flex text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('trending')}
                    className={`flex-1 py-4 transition-all duration-300 relative ${
                        activeTab === 'trending' 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-300 bg-slate-900/40'
                    }`}
                >
                    {locale === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
                    {activeTab === 'trending' && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
                <div className="w-[1px] bg-slate-800" />
                <button 
                    onClick={() => setActiveTab('latest')}
                    className={`flex-1 py-4 transition-all duration-300 relative ${
                        activeTab === 'latest' 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-300 bg-slate-900/40'
                    }`}
                >
                    {locale === 'bn' ? 'সর্বশেষ' : 'Latest'}
                    {activeTab === 'latest' && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    )}
                </button>
            </div>
            
            {/* Dark Posts List */}
            <div className="p-8 relative min-h-[300px]">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {!posts || posts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            {locale === 'bn' ? 'কোনো পোস্ট নেই' : 'No posts found'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 relative z-10">
                        {posts.map((post) => (
                            <Link 
                                key={post.id} 
                                href={`/${locale}/blog/${post.slug}`} 
                                className="group flex flex-col gap-3 border-b border-slate-800/80 pb-8 last:border-0 last:pb-0"
                            >
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {post.category?.name || 'Story'}
                                </div>
                                <h4 className="text-[16px] md:text-[18px] font-bold text-white leading-[1.5] bn-text group-hover:text-emerald-400 transition-colors duration-300">
                                    {post.title}
                                </h4>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                    {new Date(post.publishedAt || '').toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { 
                                        day: 'numeric',
                                        month: 'short', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
