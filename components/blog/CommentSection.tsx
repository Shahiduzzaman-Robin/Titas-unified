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
    likedBy?: any; // JSON array from Prisma
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
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    
    // Facebook-style input ref
    const inputRef = useRef<HTMLDivElement>(null);

    // Initialize Client ID and Name from Storage
    useEffect(() => {
        const storedId = localStorage.getItem('titas_comment_client_id');
        const storedName = localStorage.getItem('titas_comment_author_name');
        
        if (storedId) {
            setClientId(storedId);
        } else {
            const newId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem('titas_comment_client_id', newId);
            setClientId(newId);
        }

        if (storedName) {
            setName(storedName);
        }
    }, []);

    const handleSubmit = async () => {
        const text = inputRef.current?.innerText.trim();
        if (!text) return;

        const authorName = name.trim() || (locale === 'bn' ? 'একজন পাঠক' : 'A Reader');
        
        setSubmitting(true);
        try {
            const res = await fetch(`/api/blog/posts/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: authorName, 
                    text 
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                if (inputRef.current) inputRef.current.innerText = '';
                // Optional: Save name session
                localStorage.setItem('titas_comment_author_name', authorName);
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: number) => {
        if (!clientId) return;

        const commentIdx = comments.findIndex(c => c.id === commentId);
        if (commentIdx === -1) return;

        const comment = comments[commentIdx];
        const likedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
        const hasLiked = likedBy.includes(clientId);

        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c.id !== commentId) return c;
            let newLikedBy = [...likedBy];
            if (hasLiked) {
                newLikedBy = newLikedBy.filter(id => id !== clientId);
                return { ...c, likes: Math.max(0, c.likes - 1), likedBy: newLikedBy };
            } else {
                newLikedBy.push(clientId);
                return { ...c, likes: c.likes + 1, likedBy: newLikedBy };
            }
        }));

        try {
            await fetch(`/api/blog/posts/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like', commentId, clientId }),
            });
        } catch (error) {
            console.error('Failed to update like:', error);
            // Rollback on error? Usually better to just let it be or re-fetch
        }
    };

    const isCommentLiked = (comment: Comment) => {
        if (!clientId) return false;
        const likedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
        return likedBy.includes(clientId);
    }

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
                    <input 
                        type="text"
                        className="comment-name-input"
                        placeholder={locale === 'bn' ? "আপনার নাম..." : "Your name..."}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                    />
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
                             <p className="text-[10px] text-slate-300 font-medium italic">
                                {locale === 'bn' ? 'শিফট+এন্টার দিয়ে নতুন লাইন' : 'Shift+Enter for new line'}
                             </p>
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
                                    {(comment.likes > 0) && (
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
                                        className={`comment-action-btn ${isCommentLiked(comment) ? 'active' : ''}`}
                                        onClick={() => handleLike(comment.id)}
                                    >
                                        {locale === 'bn' ? (isCommentLiked(comment) ? 'পছন্দ হয়েছে' : 'পছন্দ') : (isCommentLiked(comment) ? 'Loved' : 'Love')}
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
