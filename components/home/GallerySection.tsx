'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowRight, Images } from 'lucide-react';
import { useLocale } from 'next-intl';
import { optimizeImage } from '@/lib/utils';

interface GalleryImage {
    id: number;
    url: string;
    title?: string;
    category: string;
}

const GallerySection = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const locale = useLocale();

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await axios.get('/api/gallery?limit=8');
                setImages(res.data || []);
            } catch (err) {
                console.error('Failed to fetch gallery', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    return (
        <section className="gallery-modern" id="gallery">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="section-header-center mb-12">
                    <div className="section-label">Moments</div>
                    <h2 className="section-title bn-text">ফটো গ্যালারি</h2>
                    <p className="section-subtitle">Glimpses of our vibrant community life</p>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-slate-400" size={40} />
                    </div>
                ) : images.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {/* First image larger - spans 2 cols and 2 rows */}
                            {images.map((img, idx) => (
                                <div
                                    key={img.id}
                                    className={`relative group overflow-hidden rounded-2xl bg-slate-100 ${
                                        idx === 0
                                            ? 'col-span-2 row-span-2 aspect-square'
                                            : 'aspect-[4/3]'
                                    }`}
                                    style={{ minHeight: idx === 0 ? '360px' : '180px' }}
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.title || 'Gallery Image'}
                                        fill
                                        sizes={
                                            idx === 0 
                                                ? "(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                                : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        }
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                            {img.title && (
                                                <span className="bn-text text-white font-bold block text-sm">{img.title}</span>
                                            )}
                                            {img.category && (
                                                <span className="en-text text-slate-300 text-xs">{img.category}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="flex justify-center mt-10">
                            <Link
                                href={`/${locale}/gallery`}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-all hover:scale-105 shadow-lg shadow-slate-200"
                            >
                                <Images size={18} />
                                {locale === 'bn' ? 'সব ছবি দেখুন' : 'View All Photos'}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center w-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                        <Images size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="bn-text text-slate-500 text-lg">গ্যালারিতে কোনো ছবি পাওয়া যায়নি।</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GallerySection;
