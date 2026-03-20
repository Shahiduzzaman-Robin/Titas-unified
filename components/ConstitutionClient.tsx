'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
    { id: 'preamble', title: 'প্রস্তাবনা' },
    { id: 'article-1', title: 'অনুচ্ছেদ ১: নামকরণ' },
    { id: 'article-2', title: 'অনুচ্ছেদ ২: কার্য্যালয়' },
    { id: 'article-3', title: 'অনুচ্ছেদ ৩: মনোগ্রাম' },
    { id: 'article-4', title: 'অনুচ্ছেদ ৪: সংগঠনের ধরণ' },
    { id: 'article-5', title: 'অনুচ্ছেদ ৫: সংগঠনের লক্ষ্য' },
    { id: 'article-6', title: 'অনুচ্ছেদ ৬: সদস্য' },
    { id: 'article-7', title: 'অনুচ্ছেদ ৭: কার্যনির্বাহী কমিটি' },
    { id: 'article-8', title: 'অনুচ্ছেদ ৮: কমিটির কাঠামো' },
    { id: 'article-9', title: 'অনুচ্ছেদ ৯: কমিটির কার্যাবলী' },
    { id: 'article-10', title: 'অনুচ্ছেদ ১০: পদ রহিতকরণ' },
    { id: 'article-11', title: 'অনুচ্ছেদ ১১: আর্থিক স্বচ্ছতা' },
    { id: 'article-12', title: 'অনুচ্ছেদ ১২: গঠনতন্ত্র সংশোধন' },
    { id: 'article-13', title: 'অনুচ্ছেদ ১৩: নির্বাচন' },
];

export default function ConstitutionClient() {
    const [activeSection, setActiveSection] = useState('preamble');

    useEffect(() => {
        const handleScroll = () => {
            const offsets = SECTIONS.map(s => {
                const el = document.getElementById(s.id);
                if (!el) return { id: s.id, top: Infinity };
                return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
            });
            const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
            setActiveSection(closest.id);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className="constitution-toc">
            <h3 className="bn-text">সূচিপত্র</h3>
            <ul className="toc-list">
                {SECTIONS.map(s => (
                    <li key={s.id}>
                        <a
                            href={`#${s.id}`}
                            className={activeSection === s.id ? 'active bn-text' : 'bn-text'}
                            onClick={(e) => scrollToSection(e, s.id)}
                        >
                            {s.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
