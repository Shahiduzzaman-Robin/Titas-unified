"use client"

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Heart, BookOpen, Users, Music, Droplets, GraduationCap, 
    Calendar, HeartHandshake, Megaphone, ArrowRight, Star, 
    Target, Eye, Link2, ScrollText, MapPin, Mail, Quote, User 
} from 'lucide-react';
import Slider from '@/components/Slider';
import { PublicNav } from '@/components/PublicNav';
import Footer from '@/components/home/Footer';
import '@/styles/AboutUs.css';

/* ── Counter hook ── */
const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const startTimestamp = performance.now();
                    const step = (now: number) => {
                        const progress = Math.min((now - startTimestamp) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.3 }
        );
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [end, duration]);

    return { count, ref };
};

/* ── Stat Counter Component ── */
interface StatCounterProps {
    value: number;
    suffix: string;
    label: string;
    labelEn: string;
}

const StatCounter = ({ value, suffix, label, labelEn }: StatCounterProps) => {
    const { count, ref } = useCountUp(value, 2200);
    return (
        <div className="flex flex-col items-center justify-center text-center p-6 group" ref={ref}>
            <span className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tighter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                {count}{suffix}
            </span>
            <span className="text-xl font-bold text-blue-200 bn-text mb-1 group-hover:text-white transition-colors">
                {label}
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400 group-hover:text-blue-300 transition-colors">
                {labelEn}
            </span>
        </div>
    );
};

/* ── Section Animation Wrapper ── */
interface AnimatedSectionProps {
    children: React.ReactNode;
    className: string;
    id?: string;
}

const AnimatedSection = ({ children, className, id }: AnimatedSectionProps) => {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('about-visible');
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 }
        );
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <section ref={ref} className={className} id={id}>
            <div className="about-fade-up">
                {children}
            </div>
        </section>
    );
};

const MISSION_ITEMS = [
    { icon: Heart, title: 'ছাত্রকল্যাণ', titleEn: 'Student Welfare', desc: 'ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থীদের সার্বিক কল্যাণ নিশ্চিত করা।' },
    { icon: Music, title: 'সংস্কৃতি চর্চা', titleEn: 'Cultural Preservation', desc: 'ব্রাহ্মণবাড়িয়ার সমৃদ্ধ সাংস্কৃতিক ঐতিহ্য সংরক্ষণ ও চর্চা অব্যাহত রাখা।' },
    { icon: GraduationCap, title: 'শিক্ষা সহায়তা', titleEn: 'Academic Support', desc: 'পড়াশোনা সংক্রান্ত পরামর্শ, তথ্য আদান-প্রদান ও পারস্পরিক সহযোগিতা।' },
    { icon: Link2, title: 'ঐক্য ও ভ্রাতৃত্ব', titleEn: 'Unity & Brotherhood', desc: 'বিভিন্ন বিভাগ ও হলের শিক্ষার্থীদের মধ্যে সেতুবন্ধন তৈরি ও সম্প্রীতি বৃদ্ধি।' },
];

const ACTIVITIES = [
    { icon: Star, label: 'নবীনবরণ', labelEn: 'Freshers\' Welcome' },
    { icon: Music, label: 'সাংস্কৃতিক অনুষ্ঠান', labelEn: 'Cultural Events' },
    { icon: Droplets, label: 'রক্তদান কর্মসূচি', labelEn: 'Blood Donation' },
    { icon: GraduationCap, label: 'শিক্ষা সহায়তা', labelEn: 'Academic Aid' },
    { icon: HeartHandshake, label: 'সামাজিক কার্যক্রম', labelEn: 'Social Activities' },
    { icon: Calendar, label: 'ইভেন্ট আয়োজন', labelEn: 'Event Management' },
    { icon: Megaphone, label: 'সচেতনতা কার্যক্রম', labelEn: 'Awareness Campaigns' },
    { icon: BookOpen, label: 'প্রকাশনা ও ব্লগ', labelEn: 'Publications & Blog' },
];

const LEADERS = [
    {
        name: 'রাইয়ান কবির ঐশী',
        nameEn: 'Raiyan Kabir Oishi',
        role: 'সভাপতি',
        roleEn: 'President',
        department: 'সমাজবিজ্ঞান বিভাগ',
        session: '২০১৯-২০২০',
        email: 'oishykabir681@gmail.com',
        photo: '/assets/president.png',
        message: 'তিতাস শুধু একটি সংগঠন নয়, এটি আমাদের পরিবার। ঢাকা বিশ্ববিদ্যালয়ে ব্রাহ্মণবাড়িয়ার প্রতিটি শিক্ষার্থীর পাশে দাঁড়ানোই আমাদের অঙ্গীকার। আমরা বিশ্বাস করি, ঐক্যবদ্ধভাবে আমরা আরও অনেক দূর এগিয়ে যেতে পারি।',
    },
    {
        name: 'রিফতি-আল-জাবেদ',
        nameEn: 'Rifty Al Zabed',
        role: 'সাধারণ সম্পাদক',
        roleEn: 'General Secretary',
        department: 'কমিউনিকেশন ডিজঅর্ডারস বিভাগ',
        session: '২০২০-২০২১',
        email: 'riftyzabed003@gmail.com',
        photo: '/assets/gs.png',
        message: 'ব্রাহ্মণবাড়িয়ার সমৃদ্ধ সংস্কৃতি ও ঐতিহ্যকে ধারণ করে তিতাস এগিয়ে চলেছে। প্রতিটি কার্যক্রমে স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করা আমাদের প্রধান লক্ষ্য। আপনাদের সকলের সহযোগিতায় তিতাসকে আরও উচ্চতায় নিয়ে যেতে চাই।',
    },
];

const STATS = [
    { value: 500, suffix: '+', label: 'বর্তমান শিক্ষার্থী', labelEn: 'Current Students' },
    { value: 50, suffix: '+', label: 'ইভেন্ট আয়োজিত', labelEn: 'Events Organized' },
    { value: 6, suffix: '+', label: 'বছর সক্রিয়', labelEn: 'Years Active' },
    { value: 800, suffix: '+', label: 'রক্তদান', labelEn: 'Blood Donations' },
];

const TIMELINE = [
    { year: '২০২০', title: 'ফেসবুক কমিউনিটি', desc: '"তিতাস—ঢাবিতে একখণ্ড ব্রাহ্মণবাড়িয়া" ফেসবুক গ্রুপ চালুর মাধ্যমে যাত্রা শুরু।' },
    { year: '২০২১', title: 'আনুষ্ঠানিক প্রতিষ্ঠা', desc: 'একটি সম্পূর্ণ অরাজনৈতিক, ভ্রাতৃত্বমূলক, অলাভজনক ও সেবাধর্মী সংগঠন হিসেবে তিতাসের আনুষ্ঠানিক যাত্রা।' },
    { year: '২০২২', title: 'প্রথম নবীনবরণ', desc: 'ঢাকা বিশ্ববিদ্যালয়ের ব্রাহ্মণবাড়িয়ার নবাগত শিক্ষার্থীদের জন্য প্রথম নবীনবরণ অনুষ্ঠান।' },
    { year: '২০২৩', title: 'সাংস্কৃতিক বিপ্লব', desc: 'বিভিন্ন সাংস্কৃতিক অনুষ্ঠান, রক্তদান ক্যাম্পেইন ও সামাজিক কর্মসূচি সম্প্রসারণ।' },
    { year: '২০২৪', title: 'গণতান্ত্রিক নির্বাচন', desc: 'জুলাই গণঅভ্যুত্থান-পরবর্তী সময়ে ঢাবিতে তিতাসই প্রথম গণতান্ত্রিক দৃষ্টান্ত স্থাপন করে নির্বাচনের মাধ্যমে।' },
    { year: '২০২৫', title: 'ডিজিটাল সম্প্রসারণ', desc: 'তিতাসের নিজস্ব ওয়েবসাইট, ডিজিটাল সদস্যপদ ব্যবস্থাপনা ও অনলাইন উপস্থিতি জোরদার।' },
];

export default function AboutUsPage() {
    return (
        <div className="about-page min-h-screen">
            <PublicNav />

            {/* ═══════ 1. HERO ═══════ */}
            <AnimatedSection className="about-hero">
                <div className="about-hero-overlay" />
                <div className="max-w-7xl mx-auto px-4 about-hero-content flex flex-col items-center">
                    <Image 
                        src="/assets/logo.png" 
                        alt="তিতাস লোগো" 
                        className="about-hero-logo" 
                        width={90} 
                        height={90} 
                    />
                    <h1 className="about-hero-title bn-text text-white">তিতাস</h1>
                    <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-4 mt-8 mb-10">
                        {['শিক্ষা', 'সহযোগিতা', 'সংস্কৃতি', 'ভ্রাতৃত্ব'].map((label, idx) => (
                            <div key={label} className="flex items-center gap-3 md:gap-6">
                                <span className="bn-text text-xl md:text-4xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all hover:scale-105">
                                    {label}
                                </span>
                                {idx < 3 && (
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,1),0_0_30px_rgba(250,204,21,0.6)]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="about-hero-subtitle bn-text">
                        ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ
                    </p>
                    <p className="about-hero-desc bn-text">
                        প্রাচ্যের অক্সফোর্ড খ্যাত ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার
                        সকল শিক্ষার্থীদের ঐক্য, কল্যাণ ও সংস্কৃতি চর্চার মঞ্চ।
                    </p>
                </div>
            </AnimatedSection>

            {/* ═══════ 1.5. SLIDER ═══════ */}
            <section className="about-slider-section py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <Slider />
                </div>
            </section>

            {/* ═══════ 2. WHO WE ARE ═══════ */}
            <AnimatedSection className="about-section about-who py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="about-section-header text-center mb-16">
                        <span className="about-label">WHO WE ARE</span>
                        <h2 className="about-section-title bn-text">আমাদের পরিচয়</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="about-who-text space-y-6">
                            <p className="bn-text text-lg text-slate-700 leading-relaxed">
                                <strong>তিতাস</strong> হলো ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার
                                শিক্ষার্থীদের একটি সম্পূর্ণ <strong>অরাজনৈতিক, ভ্রাতৃত্বমূলক, অলাভজনক ও সেবাধর্মী</strong> সংগঠন।
                            </p>
                            <p className="bn-text text-lg text-slate-700 leading-relaxed">
                                ২০২১ সালে প্রতিষ্ঠিত এই সংগঠন ব্রাহ্মণবাড়িয়া জেলার বিভিন্ন উপজেলা থেকে আসা
                                শিক্ষার্থীদের মধ্যে পারস্পরিক পরিচিতি, যোগাযোগ ও সহযোগিতা গড়ে তোলার লক্ষ্যে কাজ করে।
                            </p>
                            <p className="bn-text text-lg text-slate-700 leading-relaxed">
                                ঢাকা বিশ্ববিদ্যালয়ের বিভিন্ন বিভাগ ও হলে ছড়িয়ে থাকা ব্রাহ্মণবাড়িয়ার সন্তানদের
                                একটি পরিবারের মতো বন্ধনে আবদ্ধ করাই তিতাসের মূল উদ্দেশ্য। সাংস্কৃতিক রাজধানী হিসেবে
                                পরিচিত ব্রাহ্মণবাড়িয়ার গর্ব ও ঐতিহ্য ধারণ করে তিতাস এগিয়ে চলেছে।
                            </p>
                        </div>
                        <div className="about-who-highlights flex flex-col gap-4">
                            <div className="about-highlight-card">
                                <Target className="text-primary" size={28} />
                                <div>
                                    <h4 className="bn-text font-bold">অরাজনৈতিক</h4>
                                    <p className="bn-text text-sm">সম্পূর্ণ রাজনীতিমুক্ত সেবাধর্মী সংগঠন</p>
                                </div>
                            </div>
                            <div className="about-highlight-card">
                                <Eye className="text-primary" size={28} />
                                <div>
                                    <h4 className="bn-text font-bold">স্বচ্ছতা</h4>
                                    <p className="bn-text text-sm">গণতান্ত্রিক প্রক্রিয়া ও আর্থিক স্বচ্ছতা</p>
                                </div>
                            </div>
                            <div className="about-highlight-card">
                                <Users className="text-primary" size={28} />
                                <div>
                                    <h4 className="bn-text font-bold">সর্বজনীন</h4>
                                    <p className="bn-text text-sm">সকল শিক্ষার্থীর জন্য উন্মুক্ত</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 3. MISSION & VISION ═══════ */}
            <AnimatedSection className="about-section about-mission py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="about-section-header text-center mb-16">
                        <span className="about-label">MISSION & VISION</span>
                        <h2 className="about-section-title bn-text">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
                        <p className="about-section-subtitle bn-text">
                            শিক্ষার্থীদের কল্যাণে তিতাসের চারটি মূল স্তম্ভ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {MISSION_ITEMS.map((item, i) => (
                            <div key={i} className="about-mission-card">
                                <div className="about-mission-icon mb-6">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="bn-text font-bold text-xl mb-1">{item.title}</h3>
                                <span className="about-mission-en">{item.titleEn}</span>
                                <p className="bn-text text-slate-600 mt-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 4. ACTIVITIES ═══════ */}
            <AnimatedSection className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 pt-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E3A8A] bg-blue-50 px-6 py-2 rounded-full inline-block">
                            What We Do
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight bn-text">
                            আমাদের কার্যক্রম
                        </h2>
                        <p className="text-lg text-slate-500 font-medium bn-text">
                            তিতাস নিয়মিতভাবে বিভিন্ন কার্যক্রম পরিচালনা করে থাকে
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {ACTIVITIES.map((item, i) => (
                            <div key={i} className="group relative bg-white border border-slate-100/60 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 text-center flex flex-col items-center justify-center overflow-hidden z-10">
                                {/* Subtle background hover gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                
                                <div className="relative w-16 h-16 mb-6">
                                    {/* Icon glow effect */}
                                    <div className="absolute inset-0 bg-blue-400 blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                                    <div className="relative w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#1E3A8A] group-hover:bg-white group-hover:shadow-lg shadow-blue-900/5 transition-all duration-500 border border-slate-100 group-hover:border-blue-100 group-hover:scale-110">
                                        <item.icon size={28} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <h4 className="bn-text font-black text-slate-800 text-[1.1rem] mb-2 group-hover:text-[#1E3A8A] transition-colors">{item.label}</h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">{item.labelEn}</span>
                                
                                {/* Bottom expanding gradient border */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 5. COMMITTEE ═══════ */}
            <AnimatedSection className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4 pt-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E3A8A] bg-blue-50 px-6 py-2 rounded-full inline-block">
                            Leadership
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight bn-text">
                            কমিটি / নেতৃত্ব
                        </h2>
                        <p className="text-lg text-slate-500 font-medium bn-text">
                            তিতাসের কার্যনির্বাহী কমিটির প্রধান নেতৃবৃন্দ
                        </p>
                    </div>

                    <div className="space-y-16 max-w-5xl mx-auto">
                        {LEADERS.map((leader, i) => (
                            <div key={i} className={`group relative bg-slate-50 rounded-[3rem] transition-all duration-500 flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-8 md:pt-0 pr-8 md:pr-12 pb-8 md:pb-12 pl-8 md:pl-0 ${i % 2 !== 0 ? 'md:flex-row-reverse md:pl-12 md:pr-0' : ''}`}>
                                
                                {/* Cutout Image Section */}
                                <div className="relative w-full md:w-[45%] h-[400px] md:h-[500px] flex items-end justify-center rounded-[3rem] overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                                    {/* Decorative background blob/glow for the cutout */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-blue-100 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 -z-10"></div>
                                    <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-slate-200/50 to-transparent -z-10"></div>
                                    
                                    <Image 
                                        src={leader.photo} 
                                        alt={leader.nameEn} 
                                        fill
                                        sizes="(max-width: 768px) 100vw, 45vw"
                                        style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
                                        className="transition-transform duration-700 group-hover:scale-105 origin-bottom drop-shadow-2xl"
                                    />
                                </div>
                                
                                {/* Content Section */}
                                <div className="w-full md:w-[55%] space-y-8 relative z-10 pt-4 md:pt-12">
                                    <div>
                                        <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-4 shadow-md group-hover:bg-[#1E3A8A] transition-colors">
                                            {leader.roleEn}
                                        </span>
                                        <h3 className="bn-text font-black text-3xl md:text-5xl text-slate-900 mb-2 group-hover:text-[#1E3A8A] transition-colors">
                                            {leader.name}
                                        </h3>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest inline-block px-3 py-1 rounded-md">
                                            {leader.nameEn}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-4 text-slate-600 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><GraduationCap size={16} strokeWidth={2.5} /></div>
                                            <span className="bn-text font-bold text-[15px]">{leader.department}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Calendar size={16} strokeWidth={2.5} /></div>
                                            <span className="bn-text font-bold text-[15px]">সেশন: {leader.session}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Mail size={16} strokeWidth={2.5} /></div>
                                            <span className="font-bold text-[15px]">{leader.email}</span>
                                        </div>
                                    </div>

                                    <div className="relative pt-6">
                                        <div className="absolute top-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                                        <Quote size={48} className="absolute top-4 right-0 text-white drop-shadow-sm -z-10 rotate-180 scale-150 group-hover:text-blue-50 transition-colors duration-500" />
                                        <p className="bn-text text-lg leading-relaxed text-slate-600 font-medium italic relative z-10 w-[95%]">
                                            "{leader.message}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 6. STATS ═══════ */}
            <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 bg-blue-900/50 px-4 py-2 rounded-full inline-block border border-blue-800">
                            By The Numbers
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight bn-text drop-shadow-md">
                            সংখ্যায় তিতাস
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-blue-800/50">
                        {STATS.map((stat, i) => (
                            <div key={i} className={i >= 2 ? "pt-8 lg:pt-0" : ""}>
                                <StatCounter {...stat} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ 7. TIMELINE ═══════ */}
            <AnimatedSection className="about-section about-timeline py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="about-section-header text-center mb-16">
                        <span className="about-label">OUR JOURNEY</span>
                        <h2 className="about-section-title bn-text">আমাদের ইতিহাস</h2>
                        <p className="about-section-subtitle bn-text">
                            একটি ফেসবুক গ্রুপ থেকে পূর্ণাঙ্গ সংগঠনে রূপান্তরের যাত্রা
                        </p>
                    </div>
                    <div className="max-w-3xl mx-auto about-timeline-wrapper">
                        {TIMELINE.map((item, i) => (
                            <div key={i} className={`about-timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                                <div className="about-timeline-dot" />
                                <div className="about-timeline-card bg-slate-50 border border-slate-100 p-6 rounded-xl">
                                    <span className="about-timeline-year bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">{item.year}</span>
                                    <h4 className="bn-text font-bold text-lg mb-2">{item.title}</h4>
                                    <p className="bn-text text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                        <div className="about-timeline-line" />
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 8. CONSTITUTION ═══════ */}
            <AnimatedSection className="about-section about-constitution py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="max-w-2xl mx-auto about-constitution-box bg-white p-12 rounded-3xl shadow-sm border-2 border-slate-100 text-center">
                        <div className="about-constitution-content">
                            <ScrollText size={48} className="text-primary mx-auto mb-6" />
                            <h3 className="bn-text font-bold text-2xl mb-4">গঠনতন্ত্র</h3>
                            <p className="bn-text text-slate-600 mb-8 leading-relaxed">
                                তিতাসের গঠনতন্ত্রে সংগঠনের কাঠামো, নিয়মাবলী ও গণতান্ত্রিক প্রক্রিয়া বিস্তারিত
                                আলোচনা করা হয়েছে। সংগঠনের সকল কার্যক্রম এই গঠনতন্ত্র অনুযায়ী পরিচালিত হয়।
                            </p>
                            <Link href="/constitution" className="about-constitution-btn inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold transition-transform hover:scale-105 active:scale-95">
                                <ScrollText size={18} />
                                <span className="bn-text">গঠনতন্ত্র দেখুন</span>
                                <span className="text-slate-500 font-normal mx-1">|</span>
                                <span>View Constitution</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════ 9. CONTACT CTA ═══════ */}
            <AnimatedSection className="about-section about-cta py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="bn-text font-bold text-3xl mb-4">আমাদের সাথে যুক্ত হোন</h2>
                        <p className="bn-text text-lg text-slate-600 mb-8">
                            আপনি যদি ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থী হন,
                            তাহলে আজই তিতাসে যোগ দিন এবং আমাদের কার্যক্রমে অংশগ্রহণ করুন।
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/register" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform active:scale-95">
                                <Users size={18} />
                                <span className="bn-text">সদস্য হোন</span>
                                <span>Register</span>
                            </Link>
                            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors">
                                <Mail size={18} />
                                <span className="bn-text">যোগাযোগ করুন</span>
                                <span>Contact</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
            <Footer />
        </div>
    );
}
