'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ThumbsUp, MessageSquare, MoreHorizontal, Send, Clock, User, Heart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import './CommentSection.css';

interface Comment {
    id: number;
    name: string;
    text: string;
    createdAt: string;
    likes: number;
    approved: boolean;
}

const timeAgo = (value: string, locale: string) => {
    if (!value) return '';
    try {
        const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
        if (seconds < 60) return locale === 'bn' ? `${seconds}সে` : `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return locale === 'bn' ? `${minutes}মি` : `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return locale === 'bn' ? `${hours}ঘ` : `${hours}h`;
        const days = Math.floor(hours / 24);
        return locale === 'bn' ? `${days}দি` : `${days}d`;
    } catch (e) {
        return '';
    }
};

export default function CommentSection({ slug, initialComments }: { slug: string; initialComments: Comment[] }) {
    const t = useTranslations('public.blog');
    const locale = useLocale();
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likedComments, setLikedComments] = useState<number[]>([]);
    
    // Facebook-style input ref
    const inputRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        const text = inputRef.current?.innerText.trim();
        if (!text) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/blog/posts/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: locale === 'bn' ? 'একজন পাঠকে' : 'A Reader', 
                    text 
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                if (inputRef.current) inputRef.current.innerText = '';
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: number) => {
        if (likedComments.includes(commentId)) return;
        
        // Optimistic update
        setLikedComments(prev => [...prev, commentId]);
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));

        try {
            await fetch(`/api/blog/posts/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like', commentId }),
            });
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    };

    return (
        <section className="comments-section bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mt-12 mb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                        {locale === 'bn' ? 'পাঠকের মন্তব্য' : 'Reader Comments'}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {comments.length} {locale === 'bn' ? 'টি মন্তব্য' : 'discussions'}
                    </p>
                </div>
            </div>

            {/* Comment Form - Facebook Style */}
            <div className="comment-form-fb mb-10 group">
                <div className="comment-avatar-ring">
                    <div className="comment-avatar-placeholder">
                        <User size={20} className="text-slate-400" />
                    </div>
                </div>
                <div className="comment-input-container">
                    <div 
                        ref={inputRef}
                        contentEditable 
                        className="comment-editable-input"
                        data-placeholder={locale === 'bn' ? "আপনার মতামত লিখুন..." : "Write a comment..."}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="comment-input-footer">
                        <div className="flex items-center gap-2 text-slate-400">
                             {/* Optional icons like image upload can go here */}
                        </div>
                        <button 
                            className={`comment-submit-btn ${submitting ? 'loading' : ''}`}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 bn-text">
                            {locale === 'bn' ? 'এখনো কোন মন্তব্য নেই। প্রথম মন্তব্যটি আপনার হোক!' : 'No comments yet. Be the first to share your thoughts!'}
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-row flex gap-4">
                            <div className="comment-avatar-small">
                                {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="comment-content-main">
                                <div className="comment-bubble">
                                    <span className="comment-author-name">{comment.name}</span>
                                    <p className="comment-text">{comment.text}</p>
                                    {(comment.likes > 0 || likedComments.includes(comment.id)) && (
                                        <div className="comment-likes-badge" onClick={() => handleLike(comment.id)}>
                                            <div className="flex -space-x-1">
                                                <div className="bg-red-500 rounded-full p-0.5 border border-white">
                                                    <Heart size={8} fill="white" color="white" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 ml-1">
                                                {comment.likes}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="comment-actions-footer">
                                    <button 
                                        className={`comment-action-btn ${likedComments.includes(comment.id) ? 'active' : ''}`}
                                        onClick={() => handleLike(comment.id)}
                                    >
                                        {locale === 'bn' ? (likedComments.includes(comment.id) ? 'পছন্দ হয়েছে' : 'পছন্দ') : (likedComments.includes(comment.id) ? 'Loved' : 'Love')}
                                    </button>
                                    <span className="dot-divider">•</span>
                                    <span className="comment-timestamp">
                                        <Clock size={10} className="inline mr-1 opacity-70" />
                                        {timeAgo(comment.createdAt, locale)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
