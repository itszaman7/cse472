"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FixedSidebar, { SidebarProvider, SidebarTrigger } from '@/components/newsfeed/FixedSidebar';
import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CrimeReportCard from '@/components/newsfeed/CrimeReport';
import AddReportModal from '@/components/newsfeed/AddReportModal';
import { 
  Plus, 
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

export default function CategoryFeedPage() {
  const { category } = useParams();
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
  const [sortBy, setSortBy] = useState('new');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: category,
        page: page.toString(),
        sort: sortBy
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
    console.log('Category page useEffect triggered with:', { category, page, sortBy });
    testAPI(); // Test API first
    fetchCategoryData();
    fetchSidebarData();
  }, [category, page, sortBy]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const clearSearch = () => {
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



  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ paddingTop: '64px' }}>
        <FixedSidebar 
          selectedCity={selectedCity}
          heatmapData={heatmap}
          leaderboardData={leaderboard}
          onAddReport={() => setIsAddReportOpen(true)}
        />
        
                  {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 max-w-none">
            {/* Page Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                {/* Left side - Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">c/{category}</span>
                </div>

                {/* Right side - Add Report Button */}
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => setIsAddReportOpen(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Report Incident
                  </Button>
                </div>
              </div>
            </div>

          {/* Main Content */}
          <div className="flex-1 p-6 min-w-0 w-full max-w-none">
            {/* Category Stats */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">{categoryStats.totalPosts}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">{categoryStats.totalViews}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Reactions</p>
                        <p className="text-2xl font-bold text-gray-900">{categoryStats.totalReactions}</p>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Comments</p>
                        <p className="text-2xl font-bold text-gray-900">{categoryStats.totalComments}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ArrowUp className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sort Controls */}
            <Card className="mb-6 w-full">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
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

            {/* Current Sort Display */}
            <div className="flex items-center justify-between mb-4 w-full">
              <div className="flex items-center space-x-2">
                {getSortIcon(sortBy)}
                <span className="font-medium text-gray-700">
                  {getSortLabel(sortBy)} posts in c/{category}
                </span>
              </div>
              {pagination && (
                <p className="text-sm text-gray-500">
                  {pagination.totalReports} posts found
                </p>
              )}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {loading && page === 1 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchCategoryData} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No posts found in this category.</p>
                </div>
              ) : (
                <>
                  {reports.map((report) => (
                    <CrimeReportCard key={report._id} report={report} />
                  ))}
                  
                  {/* Load More Button */}
                  {pagination && pagination.hasNextPage && (
                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleLoadMore}
                        variant="outline"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More Posts'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Report Modal */}
      <AddReportModal 
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
      />
    </SidebarProvider>
  );
}


