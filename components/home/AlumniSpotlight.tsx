'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const AlumniSpotlight = () => {
    // We'll use hardcoded values based on the user's reference photo for a perfect match
    const stats = [
        { value: '500+', bn: 'বর্তমান শিক্ষার্থী', en: 'CURRENT STUDENTS' },
        { value: '50+', bn: 'ইভেন্ট আয়োজিত', en: 'EVENTS ORGANIZED' },
        { value: '6+', bn: 'বছর সক্রিয়', en: 'YEARS ACTIVE' },
        { value: '800+', bn: 'রক্তদান', en: 'BLOOD DONATIONS' }
    ];

    return (
        <section className="alumni-impact-section" id="alumni">
            <div className="container mx-auto px-4 text-center">
                {/* Badge Label */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="impact-badge"
                >
                    BY THE NUMBERS
                </motion.div>

                {/* Main Title */}
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="impact-title bn-text"
                >
                    সংখ্যায় তিতাস
                </motion.h2>

                {/* Stats Grid */}
                <div className="impact-grid">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="impact-item"
                        >
                            <div className="impact-value">{stat.value}</div>
                            <div className="impact-label-bn bn-text">{stat.bn}</div>
                            <div className="impact-label-en">{stat.en}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AlumniSpotlight;
