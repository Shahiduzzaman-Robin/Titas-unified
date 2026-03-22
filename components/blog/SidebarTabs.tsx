'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { optimizeImage } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface Post {
    id: number;
    title: string;
    slug: string;
    featuredImage: string | null;
    publishedAt: Date | string;
    category?: { name: string };
}

interface SidebarTabsProps {
    trending: Post[];
    latest: Post[];
}

export default function SidebarTabs({ trending, latest }: SidebarTabsProps) {
    const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');
    const locale = useLocale();

    const posts = activeTab === 'trending' ? trending : latest;

    return (
        <div className="bg-white p-1 rounded border border-slate-100 shadow-sm">
            <div className="grid grid-cols-2 text-center text-[10px] font-black uppercase tracking-widest overflow-hidden rounded-sm mb-2">
                <button 
                    onClick={() => setActiveTab('trending')}
                    className={`py-3 transition-all duration-200 ${
                        activeTab === 'trending' 
                        ? 'bg-slate-900 text-white shadow-inner' 
                        : 'bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                >
                    {locale === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
                </button>
                <button 
                    onClick={() => setActiveTab('latest')}
                    className={`py-3 transition-all duration-200 border-l border-slate-50 ${
                        activeTab === 'latest' 
                        ? 'bg-slate-900 text-white shadow-inner' 
                        : 'bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                >
                    {locale === 'bn' ? 'সর্বশেষ' : 'Latest'}
                </button>
            </div>
            
            <div className="p-4 space-y-6">
                {posts.map((post) => (
                    <Link 
                        key={post.id} 
                        href={`/${locale}/blog/${post.slug}`} 
                        className="flex gap-4 group items-start"
                    >
                        <div className="h-16 w-24 shrink-0 bg-slate-50 rounded-sm overflow-hidden relative border border-slate-100 shadow-sm">
                            <Image 
                                src={optimizeImage(post.featuredImage || '/blog-placeholder.jpg', 300)} 
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                alt="" 
                                fill
                            />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="text-[9px] font-black text-[#00827f] uppercase tracking-wider line-clamp-1">
                                {post.category?.name || 'Uncategorized'}
                            </div>
                            <h4 className="text-[12px] font-bold text-slate-800 leading-[1.4] line-clamp-2 group-hover:text-[#00827f] transition-colors bn-text h-[34px]">
                                {post.title}
                            </h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                {new Date(post.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
