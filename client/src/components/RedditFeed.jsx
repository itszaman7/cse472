"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, MessageSquare, ExternalLink, User, Clock, Eye } from 'lucide-react';

// A single comment component with modern dark theme
function Comment({ comment }) {
    return (
        <div className="ml-6 mt-3 relative">
            <div className="absolute -left-3 top-0 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-transparent"></div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/70 hover:border-emerald-400/30 transition-all duration-300">
                <p className="text-slate-100 leading-relaxed">{comment.body}</p>
                <div className="flex items-center mt-3 text-xs text-slate-400 space-x-3">
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span className="font-medium text-emerald-400">u/{comment.author}</span>
                    </div>
                    <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1 text-emerald-500" />
                        <span>{comment.score} points</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Enhanced single post component with modern dark theme
function RedditPost({ post, subreddit }) {
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }

        setLoadingComments(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/reddit/comments/${subreddit}/${post.id}`);
            setComments(response.data);
            setShowComments(true);
        } catch (error) {
            console.error("Could not load comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden hover:shadow-emerald-500/10 hover:border-emerald-400/30 transition-all duration-500 group">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-900" />
                        </div>
                        <span className="font-medium text-emerald-400">u/{post.author}</span>
                        <span className="text-slate-600">•</span>
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-400 font-medium">r/{subreddit}</span>
                    </div>
                    <a 
                        href={post.permalink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-slate-800/50"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                
                <h3 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-emerald-300 transition-colors">
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                        {post.title}
                    </a>
                </h3>
            </div>

            {/* Media Display Section */}
            {post.media.url && (
                <div className="px-6 pb-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/50 hover:border-emerald-400/30 transition-all duration-300 shadow-lg flex justify-center" >
                        {post.media.type === 'image' && (
                            <img 
                                src={post.media.url} 
                                alt={post.title} 
                                className="max-w-[1000px] max-h-[700px] object-center hover:scale-105 transition-transform duration-500" 
                            />
                        )}
                        {post.media.type === 'video' && (
                            <video 
                                src={post.media.url} 
                                className="max-w-[1000px] max-h-[700px] object-cover" 
                                controls 
                                autoPlay 

                                loop
                                
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all duration-200 shadow-lg">
                                <ThumbsUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white text-lg">{post.score}</span>
                        </div>
                        
                        <button 
                            onClick={fetchComments} 
                            disabled={loadingComments}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                                showComments 
                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg scale-105' 
                                    : 'bg-slate-800/50 text-emerald-400 hover:bg-slate-700/50 border border-slate-600/50 hover:border-emerald-400/50'
                            }`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>
                                {loadingComments ? 'Loading...' : `${post.numComments} Comments`}
                            </span>
                        </button>
                    </div>
                    
                    <div className="flex items-center text-slate-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>View post</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Comments</h4>
                        <div className="h-px bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent"></div>
                    </div>
                    
                    {comments.length > 0 ? (
                        <div className="space-y-1">
                            {comments.map(comment => (
                                <Comment key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-slate-900" />
                            </div>
                            <p className="text-slate-300 font-medium">No comments yet</p>
                            <p className="text-sm text-slate-500">Be the first to join the discussion!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Enhanced main feed component with modern dark theme
export default function RedditFeed({ subreddit }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!subreddit) return;
        const fetchRedditPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/reddit/${subreddit}?limit=10`);
                setPosts(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Could not load posts.");
            } finally {
                setLoading(false);
            }
        };
        fetchRedditPosts();
    }, [subreddit]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 bg-slate-950 min-h-screen">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-800 border-t-emerald-400 mx-auto mb-4"></div>
                        <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-emerald-400/20 mx-auto mb-4"></div>
                    </div>
                    <p className="text-slate-300 font-medium text-lg">Loading amazing posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-slate-950 min-h-screen">
                <div className="bg-slate-900/50 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-sm">
                    <div className="text-red-400 text-xl font-semibold mb-3">Oops! Something went wrong</div>
                    <p className="text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-11/12 mx-auto px-6 bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="mb-8 text-center pt-8">
                <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl border border-emerald-400/30 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold">r/</span>
                    </div>
                    <h1 className="text-2xl font-bold">{subreddit}</h1>
                </div>
                <p className="text-slate-400 mt-3 text-lg">Discover the hottest posts from the community</p>
            </div>

            {/* Posts Grid */}
            <div className="space-y-8 pb-8">
                {posts.map(post => (
                    <RedditPost key={post.id} post={post} subreddit={subreddit} />
                ))}
            </div>

            {/* Footer */}
            {posts.length > 0 && (
                <div className="text-center py-8">
                    <div className="text-slate-500 text-sm">
                        Showing {posts.length} posts from r/{subreddit}
                    </div>
                </div>
            )}
        </div>
    );
}