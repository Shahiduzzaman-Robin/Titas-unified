import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-modern bg-slate-900 pt-20 pb-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Info */}
                    <div className="footer-brand">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md shrink-0">
                                <Image
                                    src="https://res.cloudinary.com/dwybib7hh/image/upload/v1774173529/titas/brand/logo.png"
                                    alt="Titas Logo"
                                    width={44}
                                    height={44}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="bn-text text-white font-bold text-2xl tracking-tight">তিতাস (ঢাবি)</h3>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">Brahmanbaria to DU</span>
                            </div>
                        </div>
                        <p className="footer-desc bn-text text-slate-400 leading-relaxed mb-8">
                            ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থীদের মেধা, মনন ও ঐক্যের প্রতীক। তিতাস মানেই একতা, তিতাস মানেই পথচলা।
                        </p>
                        <div className="footer-socials flex gap-4">
                            <a href="https://www.facebook.com/share/1DpPpMwwBz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-link w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="social-link w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-300">
                                <Youtube size={18} />
                            </a>
                            <a href="#" className="social-link w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300">
                                <Globe size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:ml-auto">
                        <h4 className="footer-heading bn-text text-white font-bold mb-8 text-lg flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-blue-500 rounded-full"></span>
                            গুরুত্বপূর্ণ লিংক
                        </h4>
                        <ul className="footer-links space-y-4">
                            <li><Link href="/register" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">সদস্য রেজিস্ট্রেশন</Link></li>
                            <li><Link href="/students" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">সদস্য তালিকা</Link></li>
                            <li><Link href="/stats" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">শিক্ষার্থী পরিসংখ্যান ড্যাশবোর্ড</Link></li>
                            <li><Link href="/blog" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">আমাদের ব্লগ</Link></li>
                            <li><Link href="/contact" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">যোগাযোগ করুন</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="lg:ml-auto">
                        <h4 className="footer-heading bn-text text-white font-bold mb-8 text-lg flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-indigo-500 rounded-full"></span>
                            অন্যান্য
                        </h4>
                        <ul className="footer-links space-y-4">
                            <li><Link href="/constitution" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">গঠনতন্ত্র</Link></li>
                            <li><Link href="/gallery" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">ফটো গ্যালারি</Link></li>
                            <li><Link href="/#events" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">ইভেন্ট ক্যালেন্ডার</Link></li>
                            <li><Link href="/about" className="bn-text text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block">সংগঠন ও নেতৃত্ব</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:ml-auto">
                        <h4 className="footer-heading bn-text text-white font-bold mb-8 text-lg flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-purple-500 rounded-full"></span>
                            যোগাযোগ
                        </h4>
                        <ul className="footer-contact space-y-6">
                            <li className="flex items-start gap-4 text-slate-400 group">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all">
                                    <MapPin size={18} className="text-blue-400" />
                                </div>
                                <span className="bn-text text-sm leading-relaxed mt-1">টিএসসি (শিক্ষক-ছাত্র কেন্দ্র),<br />ঢাকা বিশ্ববিদ্যালয়</span>
                            </li>
                            <li className="flex items-center gap-4 text-slate-400 group">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-green-600/20 group-hover:border-green-500/30 transition-all">
                                    <Phone size={18} className="text-green-400" />
                                </div>
                                <span className="en-text text-sm font-medium">+880 1700-000000</span>
                            </li>
                            <li className="flex items-center gap-4 text-slate-400 group">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all">
                                    <Mail size={18} className="text-purple-400" />
                                </div>
                                <span className="en-text text-sm font-medium">info@titaas.vercel.app</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="en-text text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} <span className="text-slate-300 font-bold">Titas (DU)</span>. All rights reserved.
                    </p>
                    <p className="dev-credit en-text text-slate-600 text-[10px] tracking-wider opacity-80">
                        Developed by <a href="https://joynalbokhsho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">Joynal Bokhsho</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
