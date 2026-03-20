import React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const LeadershipSection = () => {
    const leaders = [
        {
            name: 'রাইয়ান কবির ঐশী',
            role: 'সভাপতি',
            department: 'সমাজবিজ্ঞান বিভাগ',
            session: '২০১৯-২০২০',
            photo: '/assets/president.png',
            message: 'তিতাস এমন একটি প্রাঙ্গণ যেখানে মেধা, মনন এবং ভ্রাতৃত্ববোধ একই সুতোয় গাঁথা। আমাদের এই পরিবার ঢাকা বিশ্ববিদ্যালয় অধ্যয়নরত ব্রাহ্মণবাড়িয়ার সকল শিক্ষার্থীর কল্যাণে কাজ করে যাচ্ছে।',
        },
        {
            name: 'রিফতি-আল-জাবেদ',
            role: 'সাধারণ সম্পাদক',
            department: 'কমিউনিকেশন ডিজঅর্ডারস বিভাগ',
            session: '২০২০-২০২১',
            photo: '/assets/gs.png',
            message: 'তিতাস শুধু একটি নাম নয়, এটি আমাদের আবেগ, ভালোবাসা এবং ঐক্যের প্রতীক। আসুন কাঁধে কাঁধ মিলিয়ে ব্রাহ্মণবাড়িয়ার মুখ উজ্জ্বল করি পৃথিবীর সবখানে।',
        },
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden" id="committee">
            {/* Background decorations */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E3A8A] bg-blue-50 px-4 py-2 rounded-full inline-block">
                        Leadership
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight bn-text">
                        কার্যনির্বাহী কমিটি ২০২৫-২৬
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {leaders.map((leader, index) => (
                        <div key={index} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col items-center text-center">
                            
                            {/* Photo Wrap */}
                            <div className="relative w-40 h-40 mb-8 rounded-full p-2 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                                <div className="w-full h-full rounded-full overflow-hidden relative border-4 border-white shadow-md bg-white">
                                    <Image 
                                        src={leader.photo} 
                                        alt={leader.name}
                                        fill
                                        sizes="160px"
                                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                                        className="transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                            
                            {/* Details */}
                            <h3 className="text-2xl font-black text-slate-900 bn-text mb-1">{leader.name}</h3>
                            <p className="text-sm font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full bn-text mb-4">
                                {leader.role}
                            </p>
                            
                            <div className="flex flex-col items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
                                <span className="bn-text">{leader.department}</span>
                                <span className="h-0.5 w-6 bg-slate-200 rounded-full my-1"></span>
                                <span>সেশন: {leader.session}</span>
                            </div>

                            {/* Quote Section */}
                            <div className="relative mt-auto pt-8 border-t border-slate-100 w-full">
                                <Quote className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-100 bg-white px-1" />
                                <p className="bn-text text-sm leading-relaxed text-slate-600 font-medium italic relative z-10">
                                    "{leader.message}"
                                </p>
                            </div>
                            
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LeadershipSection;
