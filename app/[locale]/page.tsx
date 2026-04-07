import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, Calendar, ArrowRight, MapPin, AlertCircle } from 'lucide-react';
import { PublicNav } from "@/components/PublicNav";
import Slider from "@/components/Slider";
import TrainAnimation from "@/components/home/TrainAnimation";
import NoticeBoard from "@/components/home/NoticeBoard";
import AlumniSpotlight from "@/components/home/AlumniSpotlight";
import StudentTestimonials from "@/components/home/StudentTestimonials";
import FAQSection from "@/components/home/FAQSection";
import ContactForm from "@/components/home/ContactForm";
import EventsSection from "@/components/home/EventsSection";
import GallerySection from "@/components/home/GallerySection";
import LeadershipSection from "@/components/home/LeadershipSection";
import LatestNews from "@/components/home/LatestNews";
import HomeStatistics from "@/components/home/HomeStatistics";
import Footer from "@/components/home/Footer";
import BrahmanbariaLogo from "@/components/home/BrahmanbariaLogo";

// Import Main CSS
import "@/styles/Home.css";

export default function Home() {
    return (
        <div className="home-page-modern min-h-screen">
            <PublicNav />

            <main>
                {/* 1. HERO SECTION */}
                <section className="hero-modern relative min-h-[90vh] flex items-center overflow-hidden" id="home">
                    <div className="hero-modern-overlay absolute inset-0 bg-slate-900/60 z-10"></div>
                    <Image
                        src="https://pub-91170e9e74d646aeb556b9262e82bbbf.r2.dev/assets/hero/Fruit_Fest.jpg"
                        alt="Titas Community"
                        className="hero-modern-bg object-cover"
                        fill
                        priority
                        sizes="100vw"
                    />

                    <div className="container relative z-20 mx-auto px-4 hero-modern-content text-white">
                        <div className="flex flex-col items-center md:items-start gap-4 mb-8">
                            <div className="hero-modern-badge glass-panel-dark inline-flex items-center gap-2 px-4 py-2 rounded-full">
                                <MapPin size={16} />
                                <span>Brahmanbaria to Dhaka University</span>
                            </div>

                            <TrainAnimation />
                        </div>

                        <h1 className="hero-modern-title bn-text text-5xl md:text-7xl font-bold mb-6">
                            <span className="title-line-1 block">তিতাস</span>
                            <span className="title-line-2 text-gradient block">কমিউনিটি হাব</span>
                        </h1>

                        <p className="hero-modern-mission bn-text text-lg md:text-xl max-w-2xl mb-12 opacity-90">
                            ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থীদের মেধা, মনন ও ঐক্যের প্রতীক। তিতাস মানেই একতা।
                        </p>

                        <div className="hero-modern-actions flex flex-wrap gap-4">
                            <Link href="/register" className="btn-modern-primary bn-text flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all">
                                <UserPlus size={18} />
                                <span>কমিউনিটিতে যোগ দিন</span>
                            </Link>
                            <a href="#events" className="btn-modern-secondary glass-panel bn-text flex items-center gap-2 border border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                                <Calendar size={18} />
                                <span>ইভেন্ট দেখুন</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* SLIDER SECTION */}
                <section className="slider-section py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <Slider />
                    </div>
                </section>

                {/* ACTIVE NOTICE BOARD */}
                <NoticeBoard />

                <section className="about-modern py-24 bg-white" id="about">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="about-modern-text">
                                <div className="section-label text-slate-500 font-bold uppercase tracking-wider mb-2">Our Mission</div>
                                <h2 className="section-title bn-text text-4xl font-bold mb-8">আমাদের সম্পর্কে</h2>
                                <p className="section-desc bn-text text-slate-600 mb-6 text-lg leading-relaxed">
                                    তিতাস – ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ। এটি শুধুমাত্র একটি সংগঠন নয়, বরং ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থীদের একটি পরিবার। আমাদের মূল লক্ষ্য শিক্ষার্থীদের মধ্যে ভ্রাতৃত্ববোধ, সহযোগিতা এবং নেতৃত্বের গুণাবলী বিকাশ করা।
                                </p>
                                <p className="section-desc bn-text text-slate-600 mb-8 text-lg leading-relaxed">
                                    আমরা নিয়মিত নবীন বরণ, কৃতি শিক্ষার্থী সংবর্ধনা, রক্তদান কর্মসূচী, শীতবস্ত্র বিতরণসহ নানাবিধ সামাজিক ও সাংস্কৃতিক অনুষ্ঠানের আয়োজন করে থাকি।
                                </p>

                                <div className="about-stats grid grid-cols-3 gap-8">
                                    <div className="stat-box">
                                        <h4 className="stat-number text-3xl font-bold text-slate-900">৫০০+</h4>
                                        <p className="stat-label text-slate-500">বর্তমান শিক্ষার্থী</p>
                                    </div>
                                    <div className="stat-box">
                                        <h4 className="stat-number text-3xl font-bold text-slate-900">৫০+</h4>
                                        <p className="stat-label text-slate-500">ইভেন্ট</p>
                                    </div>
                                    <div className="stat-box">
                                        <h4 className="stat-number text-3xl font-bold text-slate-900">২০২১</h4>
                                        <p className="stat-label text-slate-500">প্রতিষ্ঠিত</p>
                                    </div>
                                </div>
                            </div>
                            <div className="about-modern-image relative">
                                <div className="image-frame-glass bg-slate-100 p-4 rounded-3xl shadow-xl">
                                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                                        <Image 
                                            src="https://pub-91170e9e74d646aeb556b9262e82bbbf.r2.dev/assets/about/aboutus.jpg" 
                                            alt="About Titas" 
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2.5 LIVE STATS SECTION */}
                <HomeStatistics />

                {/* 3. EVENTS SECTION */}
                <EventsSection />

                {/* 4. LATEST NEWS SECTION */}
                <LatestNews />

                {/* 5. ALUMNI SPOTLIGHT */}
                <AlumniSpotlight />

                {/* 6. TESTIMONIALS */}
                <StudentTestimonials />

                {/* 7. PHOTO GALLERY */}
                <GallerySection />

                {/* 8. LEADERSHIP SECTION */}
                <LeadershipSection />

                {/* 9. FAQ SECTION */}
                <FAQSection />

                {/* QUICK FOOTER CTA & CONTACT */}
                <section className="home-contact-modern" id="contact" style={{ padding: '6rem 0', backgroundColor: '#f8fafc' }}>
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <div className="section-header-center mb-10">
                            <div className="section-label">Get In Touch</div>
                            <h2 className="section-title bn-text">আমাদের সাথে যোগাযোগ করুন</h2>
                            <p className="section-subtitle">তিতাস সম্পর্কিত যেকোনো তথ্য, পরামর্শ বা মতামতের জন্য বার্তা পাঠান।</p>
                        </div>

                        <div className="home-active-form">
                            <ContactForm />
                        </div>
                    </div>
                </section>

                <BrahmanbariaLogo />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
