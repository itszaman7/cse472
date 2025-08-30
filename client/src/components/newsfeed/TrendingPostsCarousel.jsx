"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Clock, AlertTriangle, Bot } from 'lucide-react';
import Link from 'next/link';

export default function TrendingPostsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending posts from API
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/posts?sort=hot&limit=10');
        const data = await response.json();
        
        if (data.reports && data.reports.length > 0) {
          // Filter posts with images and take first 5
          const postsWithImages = data.reports
            .filter(post => post.attachments && post.attachments.length > 0)
            .map(post => ({
              ...post,
              views: typeof post.views === 'number' ? post.views : (post.views?.length || 0),
              reactions: Array.isArray(post.reactions) ? post.reactions.length : (post.reactions || 0),
              comments: Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)
            }))
            .slice(0, 5);
          
          setTrendingPosts(postsWithImages);
        } else {
          // Fallback to mock data if API doesn't return data
          setTrendingPosts([
            {
              id: 1,
              title: "Suspicious Activity in Downtown Area",
              description: "Multiple reports of suspicious individuals loitering around the shopping district",
              category: "suspicious activity",
              location: "Downtown, Dhaka",
              views: 245,
              reactions: 18,
              comments: 12,
              createdAt: "2024-01-15T10:30:00Z",
              attachments: [{ url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop", file_type: "image" }]
            },
            {
              id: 2,
              title: "Traffic Violation at Central Intersection",
              description: "Reckless driving and traffic signal violations causing safety concerns",
              category: "traffic",
              location: "Central Intersection, Dhaka",
              views: 189,
              reactions: 15,
              comments: 8,
              createdAt: "2024-01-15T09:15:00Z",
              attachments: [{ url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop", file_type: "image" }]
            },
            {
              id: 3,
              title: "Vandalism at Public Park",
              description: "Graffiti and property damage reported at the community park",
              category: "vandalism",
              location: "Community Park, Dhaka",
              views: 156,
              reactions: 22,
              comments: 14,
              createdAt: "2024-01-15T08:45:00Z",
              attachments: [{ url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop", file_type: "image" }]
            },
            {
              id: 4,
              title: "Theft Attempt at Shopping Mall",
              description: "Security footage shows attempted theft at the main entrance",
              category: "theft",
              location: "City Mall, Dhaka",
              views: 203,
              reactions: 31,
              comments: 19,
              createdAt: "2024-01-15T07:20:00Z",
              attachments: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop", file_type: "image" }]
            },
            {
              id: 5,
              title: "Harassment Report Near University",
              description: "Students report verbal harassment near the university campus",
              category: "harassment",
              location: "University Area, Dhaka",
              views: 178,
              reactions: 27,
              comments: 16,
              createdAt: "2024-01-15T06:30:00Z",
              attachments: [{ url: "https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=400&h=200&fit=crop", file_type: "image" }]
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching trending posts:', error);
        // Use mock data as fallback
        setTrendingPosts([
          {
            id: 1,
            title: "Suspicious Activity in Downtown Area",
            description: "Multiple reports of suspicious individuals loitering around the shopping district",
            category: "suspicious activity",
            location: "Downtown, Dhaka",
            views: 245,
            reactions: 18,
            comments: 12,
            createdAt: "2024-01-15T10:30:00Z",
            attachments: [{ url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop", file_type: "image" }]
          },
          {
            id: 2,
            title: "Traffic Violation at Central Intersection",
            description: "Reckless driving and traffic signal violations causing safety concerns",
            category: "traffic",
            location: "Central Intersection, Dhaka",
            views: 189,
            reactions: 15,
            comments: 8,
            createdAt: "2024-01-15T09:15:00Z",
            attachments: [{ url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop", file_type: "image" }]
          },
          {
            id: 3,
            title: "Vandalism at Public Park",
            description: "Graffiti and property damage reported at the community park",
            category: "vandalism",
            location: "Community Park, Dhaka",
            views: 156,
            reactions: 22,
            comments: 14,
            createdAt: "2024-01-15T08:45:00Z",
            attachments: [{ url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop", file_type: "image" }]
          },
          {
            id: 4,
            title: "Theft Attempt at Shopping Mall",
            description: "Security footage shows attempted theft at the main entrance",
            category: "theft",
            location: "City Mall, Dhaka",
            views: 203,
            reactions: 31,
            comments: 19,
            createdAt: "2024-01-15T07:20:00Z",
            attachments: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop", file_type: "image" }]
          },
          {
            id: 5,
            title: "Harassment Report Near University",
            description: "Students report verbal harassment near the university campus",
            category: "harassment",
            location: "University Area, Dhaka",
            views: 178,
            reactions: 27,
            comments: 16,
            createdAt: "2024-01-15T06:30:00Z",
            attachments: [{ url: "https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=400&h=200&fit=crop", file_type: "image" }]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  // Auto-switch carousel every 5 seconds
  useEffect(() => {
    if (trendingPosts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === trendingPosts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingPosts.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === trendingPosts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? trendingPosts.length - 1 : prevIndex - 1
    );
  };

  const getCategoryColor = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('theft')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (categoryLower.includes('violence')) return 'bg-red-100 text-red-800 border-red-200';
    if (categoryLower.includes('vandalism')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (categoryLower.includes('fraud')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (categoryLower.includes('harassment')) return 'bg-pink-100 text-pink-800 border-pink-200';
    if (categoryLower.includes('traffic')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (categoryLower.includes('suspicious')) return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Home</h2>
          <div className="text-sm text-gray-500">Trending posts</div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (trendingPosts.length === 0) {
    return null;
  }

  const currentPost = trendingPosts[currentIndex];

  // Safety check for required post data
  if (!currentPost || !currentPost.attachments || !currentPost.attachments[0]) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Home</h2>
        <div className="text-sm text-gray-500">Trending posts</div>
      </div>
      
      <Card className="relative overflow-hidden group">
        <CardContent className="p-0">
          {/* Carousel Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={currentPost.attachments[0]?.url || ''}
              alt={currentPost.title || 'Post image'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`${getCategoryColor(currentPost.category || '')} text-white border-white/30`}>
                  {currentPost.category || 'Unknown'}
                </Badge>
                
                                 {/* Deepfake Detection Badge */}
                 {currentPost.aiAnalysis?.deepfake?.anyFlagged === true && (
                   <Badge variant="outline" className="bg-red-100/20 text-red-200 border-red-300/30">
                     <AlertTriangle className="w-3 h-3" />
                   </Badge>
                 )}
                 
                 {/* AI-Generated Content Badge */}
                 {currentPost.aiAnalysis?.aiDetection?.hasAIGeneratedContent === true && (
                   <Badge variant="outline" className="bg-orange-100/20 text-orange-200 border-orange-300/30">
                     <Bot className="w-3 h-3" />
                   </Badge>
                 )}
                
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(currentPost.createdAt || new Date())}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {currentPost.title || 'Untitled Post'}
              </h3>
              
              <p className="text-sm opacity-90 mb-3 line-clamp-2">
                {currentPost.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm opacity-80">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {typeof currentPost.views === 'number' ? currentPost.views : (currentPost.views?.length || 0)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {Array.isArray(currentPost.reactions) ? currentPost.reactions.length : (currentPost.reactions || 0)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {Array.isArray(currentPost.comments) ? currentPost.comments.length : (currentPost.comments || 0)}
                    </div>
                  </div>
                
                <Link href={`/post/${currentPost.id}`}>
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {trendingPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
