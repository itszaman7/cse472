"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  User, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Eye,
  Shield,
  Activity,
  TrendingUp,
  MessageCircle,
  Heart,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Swal from 'sweetalert2';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function UserProfile() {
  const { user, status } = useUser();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0
  });

  useEffect(() => {
    console.log('Profile page useEffect - status:', status, 'user:', user);
    
    // Wait for authentication status to be determined
    if (status === 'loading') {
      console.log('Still loading authentication status...');
      return; // Still loading, don't do anything yet
    }
    
    if (status === 'unauthenticated' || !user) {
      console.log('User not authenticated, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }
    
    if (status === 'authenticated' && user) {
      console.log('User authenticated, fetching posts');
      fetchUserPosts();
    }
  }, [user, status, router]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/posts/user/${user.email}`);
      setUserPosts(response.data.posts || []);
      
      // Calculate stats
      const totalViews = response.data.posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
      const totalReactions = response.data.posts?.reduce((sum, post) => sum + (post.reactions?.length || 0), 0) || 0;
      const totalComments = response.data.posts?.reduce((sum, post) => sum + (post.comments?.length || 0), 0) || 0;
      
      setStats({
        totalPosts: response.data.posts?.length || 0,
        totalViews,
        totalReactions,
        totalComments
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
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
        await axios.delete(`http://localhost:5000/posts/${postId}`, {
          data: { userEmail: user.email }
        });
        
        // Remove from local state
        setUserPosts(prev => prev.filter(post => post._id !== postId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts - 1
        }));

        Swal.fire({
          icon: 'success',
          title: 'Post Deleted!',
          text: 'Your post has been successfully deleted.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#1f2937',
          color: '#f3f4f6',
          iconColor: '#10b981'
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Failed to delete post. Please try again.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#1f2937',
          color: '#f3f4f6',
          iconColor: '#ef4444'
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state while authentication is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-red-500 to-red-600 text-white">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.name || 'Anonymous User'}
                </h1>
                <p className="text-gray-600 mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {formatDate(user.createdAt || new Date())}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Community Member
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  <p className="text-sm text-gray-600">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-100">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-red-100">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReactions}</p>
                  <p className="text-sm text-gray-600">Total Reactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-purple-100">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
                  <p className="text-sm text-gray-600">Total Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2" />
              My Reports
            </h2>
            {userPosts.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {userPosts.length} {userPosts.length === 1 ? 'Report' : 'Reports'}
              </Badge>
            )}
          </div>

          {userPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                <p className="text-gray-600 mb-6">You haven't submitted any crime reports yet.</p>
                <Button 
                  onClick={() => router.push('/')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Submit Your First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
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

                        {/* Title and Media Preview */}
                        <div className="flex gap-4">
                          {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                              {post.title}
                            </h3>
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {post.description}
                            </p>

                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="truncate max-w-[14rem]">{post.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(post.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {post.views || 0} views
                              </div>
                              <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {post.reactions?.length || 0} reactions
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comments?.length || 0} comments
                              </div>
                            </div>

                            {/* AI Analysis Summary */}
                            {post.aiAnalysis && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="text-blue-700">
                                    Certainty: <span className="font-semibold">{post.aiAnalysis.overallCertainty}%</span>
                                  </span>
                                  <span className="text-blue-700">
                                    Threat: <span className="font-semibold">{post.aiAnalysis.aiThreatLevel}</span>
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Media Preview (like Reddit thumbnail) */}
                          {post.attachments && post.attachments.length > 0 && (
                            <div className="w-28 h-28 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center flex-shrink-0">
                              {post.attachments[0].file_type === 'image' ? (
                                <img
                                  src={post.attachments[0].url}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : post.attachments[0].file_type === 'video' ? (
                                <video
                                  src={post.attachments[0].url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              ) : (
                                <div className="text-xs text-gray-500">No preview</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions: 3-dots menu */}
                      <div className="ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/post/${post._id}`)}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/edit/${post._id}`)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePost(post._id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 