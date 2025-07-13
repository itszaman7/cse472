"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, MessageSquare, ExternalLink, User, Clock, Eye } from 'lucide-react';

// A single comment component with dark red/black theme
function Comment({ comment }) {
    return (
        <div className="ml-6 mt-3 relative">
            <div className="absolute -left-3 top-0 w-0.5 h-full bg-gradient-to-b from-red-500 to-transparent"></div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:bg-gray-800 hover:border-red-500/30 transition-all duration-200">
                <p className="text-gray-100 leading-relaxed">{comment.body}</p>
                <div className="flex items-center mt-3 text-xs text-gray-400 space-x-3">
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span className="font-medium text-red-400">u/{comment.author}</span>
                    </div>
                    <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1 text-red-500" />
                        <span>{comment.score} points</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Enhanced single post component with dark red/black theme
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
        <div className="bg-black rounded-2xl shadow-xl border border-gray-800 overflow-hidden hover:shadow-2xl hover:border-red-500/50 transition-all duration-300 group">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <User className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-400">u/{post.author}</span>
                        <span className="text-gray-600">•</span>
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-red-400">r/{subreddit}</span>
                    </div>
                    <a 
                        href={post.permalink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                
                <h3 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-red-400 transition-colors">
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                        {post.title}
                    </a>
                </h3>
            </div>

            {/* Media Display Section */}
            {post.media.url && (
                <div className="px-6 pb-4">
                    <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-red-500/30 transition-colors">
                        {post.media.type === 'image' && (
                            <img 
                                src={post.media.url} 
                                alt={post.title} 
                                className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300" 
                            />
                        )}
                        {post.media.type === 'video' && (
                            <video 
                                src={post.media.url} 
                                className="w-full max-h-96 object-cover" 
                                controls 
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="px-6 py-4 bg-gray-950 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-red-500">
                            <div className="p-2 rounded-full bg-red-950 hover:bg-red-900 transition-colors border border-red-800">
                                <ThumbsUp className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-white">{post.score}</span>
                        </div>
                        
                        <button 
                            onClick={fetchComments} 
                            disabled={loadingComments}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 border ${
                                showComments 
                                    ? 'bg-red-600 text-white shadow-lg border-red-500' 
                                    : 'bg-red-950 text-red-400 hover:bg-red-900 border-red-800 hover:border-red-600'
                            }`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-medium">
                                {loadingComments ? 'Loading...' : `${post.numComments} Comments`}
                            </span>
                        </button>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>View post</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-6 py-4 bg-black border-t border-gray-800">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Comments</h4>
                        <div className="h-px bg-gradient-to-r from-red-500 to-transparent"></div>
                    </div>
                    
                    {comments.length > 0 ? (
                        <div className="space-y-1">
                            {comments.map(comment => (
                                <Comment key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                            <p className="text-gray-400 font-medium">No comments yet</p>
                            <p className="text-sm text-gray-600">Be the first to join the discussion!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Enhanced main feed component with dark red/black theme
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
            <div className="flex items-center justify-center py-12 bg-gray-950 min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 font-medium">Loading amazing posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-gray-950 min-h-screen">
                <div className="bg-red-950 border border-red-800 rounded-xl p-6 max-w-md mx-auto">
                    <div className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</div>
                    <p className="text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-6 bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="mb-8 text-center pt-8">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-full shadow-xl border border-red-500">
                    <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">r/</span>
                    </div>
                    <h1 className="text-xl font-bold">{subreddit}</h1>
                </div>
                <p className="text-gray-400 mt-2">Discover the hottest posts from the community</p>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6 pb-8">
                {posts.map(post => (
                    <RedditPost key={post.id} post={post} subreddit={subreddit} />
                ))}
            </div>

            {/* Footer */}
            {posts.length > 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                        Showing {posts.length} posts from r/{subreddit}
                    </div>
                </div>
            )}
        </div>
    );
}