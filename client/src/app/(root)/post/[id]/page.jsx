"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle,
  AlertTriangle,
  Shield,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AIAnalysisDisplay from '@/components/newsfeed/AIAnalysisDisplay';
import CommentSection from '@/components/newsfeed/CommentSection';
import Swal from 'sweetalert2';

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/posts/${id}`);
      setPost(response.data);
      setReactions(response.data.reactions || []);
    } catch (error) {
      console.error('Error fetching post:', error);
      Swal.fire({
        icon: 'error',
        title: 'Post Not Found',
        text: 'The post you are looking for does not exist.',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        router.push('/');
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Sign In Required',
        text: 'Please sign in to react to posts.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const userName = user.email;
    let newReactions = [...reactions];

    if (reactions.find(r => r.userName === userName)?.reactionType === reactionType) {
      // Remove reaction
      newReactions = reactions.filter(r => r.userName !== userName);
      setReactions(newReactions);
      try {
        await axios.delete(`http://localhost:5000/posts/${id}/reactions`, { 
          data: { userName } 
        });
      } catch (err) {
        console.error("Failed to remove reaction", err);
        setReactions(reactions);
      }
    } else {
      // Add/change reaction
      const otherReactions = reactions.filter(r => r.userName !== userName);
      const newReaction = { userName, reactionType, createdAt: new Date() };
      newReactions = [...otherReactions, newReaction];
      setReactions(newReactions);
      try {
        await axios.post(`http://localhost:5000/posts/${id}/reactions`, { 
          userName, 
          reactionType 
        });
      } catch (err) {
        console.error("Failed to add reaction", err);
        setReactions(reactions);
      }
    }
  };

  const handleDeletePost = async () => {
    if (!user || post.userEmail !== user.email) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You can only delete your own posts.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Post?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/posts/${id}`, {
          data: { userEmail: user.email }
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Post Deleted!',
          text: 'Your post has been successfully deleted.',
          confirmButtonColor: '#10b981'
        }).then(() => {
          router.push('/profile');
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Failed to delete post. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentUserReaction = reactions.find(r => r.userName === user?.email)?.reactionType;
  const likeCount = reactions.filter(r => r.reactionType === '❤️').length;
  const helpfulCount = reactions.filter(r => r.reactionType === '👍').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600">Loading post...</span>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Post Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className={getThreatLevelColor(post.threatLevel)}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {post.threatLevel?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <Badge variant="outline">
                    {post.category}
                  </Badge>
                  {post.aiAnalysis?.aiGeneratedBadges?.map((badge, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.userEmail || 'Anonymous'}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {post.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views || 0} views
                  </div>
                </div>
              </div>
              
              {user && post.userEmail === user.email && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/edit/${post._id}`)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeletePost}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {post.description}
            </p>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.attachments.map((attachment, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                      {attachment.file_type === 'image' ? (
                        <img 
                          src={attachment.url} 
                          alt={`Evidence ${index + 1}`} 
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : attachment.file_type === 'video' ? (
                        <video 
                          src={attachment.url} 
                          className="w-full h-auto max-h-96"
                          controls
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {post.aiAnalysis && (
              <div className="mb-6">
                <AIAnalysisDisplay aiAnalysis={post.aiAnalysis} />
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleReaction('❤️')}
                className={`${currentUserReaction === '❤️' ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
              >
                <Heart className={`w-5 h-5 mr-2 ${currentUserReaction === '❤️' ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleReaction('👍')}
                className={`${currentUserReaction === '👍' ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
              >
                <Shield className={`w-5 h-5 mr-2 ${currentUserReaction === '👍' ? 'fill-current' : ''}`} />
                {helpfulCount}
              </Button>
              
              <div className="flex items-center text-gray-500">
                <MessageCircle className="w-5 h-5 mr-2" />
                {post.comments?.length || 0} comments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommentSection reportId={post._id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 