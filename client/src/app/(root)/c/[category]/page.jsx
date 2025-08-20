"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FixedSidebar, { SidebarProvider, SidebarTrigger } from '@/components/newsfeed/FixedSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CrimeReportCard from '@/components/newsfeed/CrimeReport';
import AddReportModal from '@/components/newsfeed/AddReportModal';
import { 
  Plus, 
  Map, 
  BarChart3, 
  Bell, 
  ChevronRight,
  Search,
  User,
  LogOut,
  Settings,
  Eye,
  Heart,
  MessageCircle,
  ArrowUp,
  Clock,
  Flame,
  Star,
  TrendingUp,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function CategoryFeedPage() {
  const { category } = useParams();
  const { user, signOut } = useUser();
  const { notifications } = useNotifications();
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categoryStats, setCategoryStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('new');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const unread = notifications?.length || 0;

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: category,
        page: page.toString(),
        sort: sortBy,
        ...(searchQuery && { q: searchQuery })
      });

      console.log('Fetching category data with params:', params.toString());
      const response = await fetch(`http://localhost:5000/posts?${params}`);
      const data = await response.json();
      
      console.log('Category API response:', data);

      if (response.ok) {
        // Backend returns 'reports', not 'posts'
        const reports = data.reports || [];
        
        if (page === 1) {
          setReports(reports);
        } else {
          setReports(prev => [...prev, ...reports]);
        }
        
        setPagination(data.pagination);
        setCategoryStats({
          totalPosts: data.pagination?.totalReports || reports.length,
          totalViews: 0, // Backend doesn't provide this yet
          totalReactions: 0, // Backend doesn't provide this yet
          totalComments: 0 // Backend doesn't provide this yet
        });
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarData = async () => {
    try {
      const res = await fetch('http://localhost:5000/posts?limit=1');
      const data = await res.json();
      console.log('Sidebar data response:', data);
      setHeatmap(data.heatmap || []);
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error('Error fetching sidebar data:', e);
    }
  };

  // Test function to check if API is working
  const testAPI = async () => {
    try {
      console.log('Testing API without category filter...');
      const res = await fetch('http://localhost:5000/posts?limit=5');
      const data = await res.json();
      console.log('Test API response:', data);
      console.log('Total reports found:', data.reports?.length || 0);
      if (data.reports && data.reports.length > 0) {
        console.log('Sample report:', {
          title: data.reports[0].title,
          category: data.reports[0].category,
          location: data.reports[0].location
        });
      }
    } catch (e) {
      console.error('Test API failed:', e);
    }
  };

  useEffect(() => {
    console.log('Category page useEffect triggered with:', { category, page, searchQuery, sortBy });
    testAPI(); // Test API first
    fetchCategoryData();
    fetchSidebarData();
  }, [category, page, searchQuery, sortBy]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCategoryData();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const getSortIcon = (sort) => {
    switch (sort) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'hot': return <Flame className="w-4 h-4" />;
      case 'top': return <Star className="w-4 h-4" />;
      case 'rising': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sort) => {
    switch (sort) {
      case 'new': return 'New';
      case 'hot': return 'Hot';
      case 'top': return 'Top';
      case 'rising': return 'Rising';
      default: return 'New';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (q.toLowerCase().startsWith('c/')) {
      window.location.href = `/c/${encodeURIComponent(q.slice(2))}`;
      return;
    }
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <FixedSidebar 
          selectedCity={selectedCity}
          heatmapData={heatmap}
          leaderboardData={leaderboard}
          onAddReport={() => setIsAddReportOpen(true)}
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
                  <span className="font-medium">c/{category}</span>
                </div>
              </div>

              {/* Center - Search bar */}
              <div className="flex-1 max-w-md mx-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search incidents, locations, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => setIsAddReportOpen(true)}
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
                        <DropdownMenuItem onClick={signOut} className="text-red-600">
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
            {/* Category Header */}
            <div className="mb-8 w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    c/{category}
                  </h1>
                  <p className="text-gray-600">
                    Community-driven crime reports and incidents
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {categoryStats.totalPosts} posts
                  </Badge>
                </div>
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{categoryStats.totalViews.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold">{categoryStats.totalReactions}</p>
                        <p className="text-sm text-gray-600">Reactions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{categoryStats.totalComments}</p>
                        <p className="text-sm text-gray-600">Comments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <ArrowUp className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{categoryStats.totalPosts}</p>
                        <p className="text-sm text-gray-600">Reports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Sort Controls */}
              <Card className="mb-6 w-full">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search within category */}
                    <div className="flex-1">
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder={`Search in c/${category}...`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-20"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          {searchQuery && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearSearch}
                              className="h-6 px-2 text-xs"
                            >
                              Clear
                            </Button>
                          )}
                          <Button
                            type="submit"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            Search
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Sort options */}
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>New</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="hot">
                            <div className="flex items-center space-x-2">
                              <Flame className="w-4 h-4" />
                              <span>Hot</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="top">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4" />
                              <span>Top</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="rising">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>Rising</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Sort Display */}
            <div className="flex items-center justify-between mb-4 w-full">
              <div className="flex items-center space-x-2">
                {getSortIcon(sortBy)}
                <span className="font-medium text-gray-700">
                  {getSortLabel(sortBy)} posts in c/{category}
                </span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Searching: "{searchQuery}"
                  </Badge>
                )}
              </div>
              {pagination && (
                <p className="text-sm text-gray-500">
                  {pagination.totalReports} posts found
                </p>
              )}
            </div>

            {/* Reports List */}
            <div className="space-y-4 w-full">
              {error && (
                <Card>
                  <CardContent className="p-6 text-center text-red-600">
                    {error}
                  </CardContent>
                </Card>
              )}

              {loading && page === 1 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-3 text-gray-600">Loading posts...</span>
                </div>
              ) : reports.length > 0 ? (
                <>
                  {reports.map((report, index) => (
                    <CrimeReportCard key={report._id || report.id || `report-${index}`} report={report} />
                  ))}
                  
                  {pagination && pagination.hasNext && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        variant="outline"
                        className="w-full max-w-md"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Loading more...
                          </>
                        ) : (
                          'Load More Posts'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery ? 'No posts found' : 'No posts yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery 
                        ? `No posts in c/${category} match your search for "${searchQuery}"`
                        : `Be the first to post in c/${category}`
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setIsAddReportOpen(true)}>
                        Submit First Post
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <AddReportModal 
          isOpen={isAddReportOpen}
          onClose={() => setIsAddReportOpen(false)}
          selectedCity={selectedCity}
        />
      </div>
    </SidebarProvider>
  );
}


