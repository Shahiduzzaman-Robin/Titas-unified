import React from 'react';
import { Quote } from 'lucide-react';

const StudentTestimonials = () => {
    return (
        <section className="testimonials-modern">
            <div className="container">
                <div className="section-header-center">
                    <div className="section-label">Community Voices</div>
                    <h2 className="section-title bn-text">শিক্ষার্থীদের মতামত</h2>
                    <p className="section-subtitle">আমাদের পরিবারের সদস্যদের কিছু কথা</p>
                </div>

                <div className="testimonials-grid">
                    <div className="testimonial-card animate-in" style={{ animationDelay: '0.1s' }}>
                        <div className="quote-icon"><Quote size={20} /></div>
                        <p className="testimonial-text bn-text">
                            "ভর্তি পরীক্ষার সময় ঢাকায় এসে থাকার জায়গা নিয়ে খুব চিন্তায় ছিলাম। তিতাসের বড় ভাইয়েরা নিজ দায়িত্বে মেসে থাকার ব্যবস্থা করে দিয়েছিলেন। এই ঋণ কখনো শোধ করার মতো নয়।"
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"><img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=100&q=80" alt="Student" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
                            <div className="author-info">
                                <h4 className="bn-text">আহমেদ ফয়সাল</h4>
                                <p className="bn-text">ম্যানেজমেন্ট স্টাডিজ (২য় বর্ষ), বাঞ্ছারামপুর</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card animate-in" style={{ animationDelay: '0.2s' }}>
                        <div className="quote-icon"><Quote size={20} /></div>
                        <p className="testimonial-text bn-text">
                            "নতুন পরিবেশে মানিয়ে নেওয়া সহজ ছিল না। কিন্তু তিতাসের ইভেন্টগুলো এবং বড় আপুদের গাইডলাইন আমাকে অনেক সাহসী করেছে। মনেই হয়নি যে আমি বাড়ির বাইরে আছি।"
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Student" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
                            <div className="author-info">
                                <h4 className="bn-text">সাদিয়া আফরিন</h4>
                                <p className="bn-text">রাষ্ট্রবিজ্ঞান (৩য় বর্ষ), কসবা</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card animate-in" style={{ animationDelay: '0.3s' }}>
                        <div className="quote-icon"><Quote size={20} /></div>
                        <p className="testimonial-text bn-text">
                            "পরীক্ষার আগে নোটস জোগাড় করা থেকে শুরু করে যেকোনো দরকারে এই প্ল্যাটফর্মটিকে পাশে পেয়েছি সবসময়। তিতাস শুধু সংগঠন নয়, একটা ভরসার জায়গা।"
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"><img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="Student" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
                            <div className="author-info">
                                <h4 className="bn-text">মোহাম্মদ তরিকুল</h4>
                                <p className="bn-text">আইন বিভাগ (৪র্থ বর্ষ), নবীনগর</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentTestimonials;
