"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import Link from 'next/link';
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
  Trash2,
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  ThumbsUp,
  ThumbsDown,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AIAnalysisDisplay from '@/components/newsfeed/AIAnalysisDisplay';
import CommentSection from '@/components/newsfeed/CommentSection';
import FixedSidebar, { SidebarProvider, SidebarTrigger } from '@/components/newsfeed/FixedSidebar';
import { useNotifications } from '@/context/NotificationsContext';
import Swal from 'sweetalert2';

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { notifications, unread } = useNotifications();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

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
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <FixedSidebar 
            selectedCity={selectedCity}
            heatmapData={heatmap}
            leaderboardData={leaderboard}
            onAddReport={() => {}}
          />
          <main className="flex-1 flex flex-col min-w-0 max-w-none">
            <div className="flex-1 p-6 min-w-0 w-full max-w-none flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading post...</span>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <FixedSidebar 
          selectedCity={selectedCity}
          heatmapData={heatmap}
          leaderboardData={leaderboard}
          onAddReport={() => {}}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 max-w-none">
          {/* Sticky Header - Complete Navigation */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
              {/* Left side - Logo, trigger, and breadcrumb */}
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  CrimeShield
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium">Post Details</span>
                </div>
              </div>

              {/* Center - Search bar */}
              <div className="flex-1 max-w-md mx-4">
                <form className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search incidents, locations, categories..."
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </form>
              </div>

              {/* Right side - Actions and User */}
              <div className="flex items-center space-x-3">
                <Link href="/heatmap">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
                    Heatmap
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
                    Leaderboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => router.push('/report')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
                
                {user ? (
                  <>
                    {/* Notification Bell */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-lg">
                          <Bell className="w-5 h-5 text-gray-600" />
                          {unread > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                              {unread}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-80" align="end">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {unread === 0 ? (
                          <div className="px-3 py-6 text-sm text-gray-500">No new notifications</div>
                        ) : (
                          notifications.slice(0, 10).map((n, i) => (
                            <DropdownMenuItem key={`notification-${i}`} className="flex items-start">
                              <div className="text-xs text-gray-500 mr-2">{new Date(n.at).toLocaleTimeString()}</div>
                              <div className="flex-1">
                                <div className="text-sm">{n.message}</div>
                                <div className="text-xs text-gray-500">Type: {n.type}</div>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Avatar */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ''} alt={user.name || user.email} />
                            <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name || 'Anonymous User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/api/auth/signout')} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Link href="/sign-in">
                    <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 min-w-0 w-full max-w-none">
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
                  
                                     {/* Deepfake Detection Badge */}
                   {post.aiAnalysis?.deepfake?.anyFlagged === true && (
                     <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                       <AlertTriangle className="w-3 h-3 mr-1" />
                       Deepfake Detected
                     </Badge>
                   )}
                   
                   {/* AI-Generated Content Badge */}
                   {post.aiAnalysis?.aiDetection?.hasAIGeneratedContent === true && (
                     <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                       <Bot className="w-3 h-3 mr-1" />
                       AI Generated
                     </Badge>
                   )}
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
             <div className="mb-6">
               <p className="text-gray-700 text-lg leading-relaxed">
                 {post.description}
               </p>
               
               {/* Description AI Detection Badges */}
               <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                 {/* AI-Generated Content Badge for Description */}
                 {post.aiAnalysis?.aiDetection?.hasAIGeneratedContent === true && (
                   <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                     <Bot className="w-3 h-3 mr-1" />
                     AI Generated Description
                   </Badge>
                 )}
                 
                 {/* Deepfake Detection Badge for Description */}
                 {post.aiAnalysis?.deepfake?.anyFlagged === true && (
                   <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                     <AlertTriangle className="w-3 h-3 mr-1" />
                     Deepfake in Description
                   </Badge>
                 )}
               </div>
             </div>

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
                 <ThumbsUp className={`w-5 h-5 mr-2 ${currentUserReaction === '❤️' ? 'fill-current' : ''}`} />
                 {likeCount}
               </Button>
               
               <Button
                 variant="ghost"
                 onClick={() => handleReaction('👍')}
                 className={`${currentUserReaction === '👍' ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
               >
                 <ThumbsDown className={`w-5 h-5 mr-2 ${currentUserReaction === '👍' ? 'fill-current' : ''}`} />
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
        </main>
      </div>
    </SidebarProvider>
  );
} 