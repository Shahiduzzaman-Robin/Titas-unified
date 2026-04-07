'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Notice {
    id: number;
    text: string;
    link?: string;
    priority: string;
}

const NoticeBoard = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('/api/notices');
                if (res.data.success) {
                    setNotices(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching notices:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (loading) return null;

    return (
        <div className="notice-board-modern">
            <div className="notice-label bn-text">
                <Bell size={18} />
                নোটিশ বোর্ড
            </div>
            <div className="notice-ticker">
                {notices.length > 0 ? notices.map((notice) => (
                    <div key={notice.id} className="notice-item bn-text">
                        {notice.priority === 'new' && <span className="badge-new">New</span>}
                        {notice.priority === 'urgent' && <AlertCircle size={14} className="text-red-500" />}
                        {notice.priority === 'normal' && <Calendar size={14} />}
                        {notice.link ? (
                            <a href={notice.link} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{notice.text}</a>
                        ) : notice.text}
                    </div>
                )) : (
                    <div className="notice-item bn-text">তিতাস পরিবারে আপনাকে স্বাগতম! নিয়মিত আপডেটের জন্য আমাদের সাথেই থাকুন।</div>
                )}
                {/* Duplicate for seamless loop if needed, but the animation here uses transform: -100% */}
                {notices.length > 0 && notices.map((notice) => (
                    <div key={`dup-${notice.id}`} className="notice-item bn-text">
                        {notice.priority === 'new' && <span className="badge-new">New</span>}
                        {notice.priority === 'urgent' && <AlertCircle size={14} className="text-red-500" />}
                        {notice.priority === 'normal' && <Calendar size={14} />}
                        {notice.link ? (
                            <a href={notice.link} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{notice.text}</a>
                        ) : notice.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticeBoard;
