import { getTranslations } from 'next-intl/server';
import TrainAnimation from '@/components/home/TrainAnimation';
import Link from 'next/link';
import { Mail, UserCircle, LogIn, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ComingSoonPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale });

    return (
        <div className="min-h-screen bg-[#051C2C] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-[#0a2e4a]/50 to-transparent pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#008a7b]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-[#e63946]/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col items-center z-10 px-4 text-center max-w-3xl w-full">
                {/* Notice Badge */}
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-white/80 text-sm font-medium tracking-wide update-font">
                        {locale === 'bn' ? 'তিতাস ওয়েবসাইট উদ্বোধন' : 'Titas Website Inauguration'}
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 uppercase tracking-wider bn-text hero-title text-glow">
                    {locale === 'bn' ? 'আসছে নতুন তিতাস' : 'Titas is Coming Soon'}
                </h1>
                
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
                    {locale === 'bn' 
                        ? 'আমাদের ওয়েবসাইটটির আনুষ্ঠানিক উদ্বোধনের প্রস্তুতি চলছে। উদ্বোধনের পর সকল ফিচার ও তথ্য সবার জন্য উন্মুক্ত করে দেওয়া হবে।' 
                        : 'We are preparing for the official inauguration of our website. All features and information will be available to the public shortly after the launch.'}
                </p>

                {/* Train Animation */}
                <div className="mb-14 w-full flex justify-center">
                    <TrainAnimation className="scale-110 sm:scale-125" />
                </div>

                {/* Divider */}
                <div className="w-full max-w-xl h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-10"></div>

                {/* Access Buttons */}
                <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-md mb-12">
                    <h3 className="text-white text-lg font-bold mb-6 flex items-center justify-center gap-2">
                        <UserCircle className="w-5 h-5 text-emerald-400" />
                        {locale === 'bn' ? 'শিক্ষার্থী অ্যাক্সেস' : 'Student Access'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <Link href={`/${locale}/student/profile`} className="w-full">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_15px_rgba(5,150,105,0.3)] gap-2 h-12 px-6 rounded-lg text-[15px] transition-all font-semibold uppercase tracking-wide">
                                <UserCircle className="w-5 h-5" />
                                {locale === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/students`} className="w-full">
                            <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12 px-6 rounded-lg text-[15px] transition-all font-semibold uppercase tracking-wide gap-2">
                                <Users className="w-5 h-5" />
                                {locale === 'bn' ? 'শিক্ষার্থী তালিকা' : 'Students'}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/login`} className="w-full">
                            <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-6 rounded-lg text-[15px] transition-all font-semibold uppercase tracking-wide gap-2">
                                <LogIn className="w-5 h-5" />
                                {locale === 'bn' ? 'লগইন করুন' : 'Login'}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/register`} className="w-full">
                            <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-6 rounded-lg text-[15px] transition-all font-semibold uppercase tracking-wide gap-2">
                                <UserPlus className="w-5 h-5" />
                                {locale === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Contact Email */}
                <div className="mt-auto pt-8 flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center border border-white/5 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <a href="mailto:mds.zamanrobin@gmail.com" className="font-medium tracking-wide">
                        mds.zamanrobin@gmail.com
                    </a>
                </div>
                
            </div>
        </div>
    );
}
