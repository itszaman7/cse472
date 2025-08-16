"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  Star, 
  Search, 
  Filter,
  ArrowUp,
  MessageCircle,
  Eye,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CrimeReportCard from "@/components/newsfeed/CrimeReport";
import axios from 'axios';

export default function CategoryFeedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const category = useMemo(() => {
    const raw = Array.isArray(params?.category) ? params.category[0] : params?.category;
    return raw ? decodeURIComponent(raw) : '';
  }, [params]);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'new');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryStats, setCategoryStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0
  });

  // Update URL when sort or search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'new') params.set('sort', sortBy);
    if (searchQuery) params.set('q', searchQuery);
    
    const newUrl = `/c/${encodeURIComponent(category)}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [sortBy, searchQuery, category, router]);

  // Fetch reports when category, sort, search, or page changes
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          category: category,
          page: page,
          limit: 10,
          sort: sortBy
        };

        // Add search query if provided
        if (searchQuery.trim()) {
          params.q = searchQuery.trim();
        }

        const response = await axios.get('http://localhost:5000/posts', { params });
        
        const { reports: fetchedReports, pagination: paginationData } = response.data;
        
        const formattedReports = fetchedReports.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          location: report.location,
          timestamp: report.createdAt,
          category: report.category,
          threatLevel: report.threatLevel,
          authenticityScore: report.authenticityLevel || 0,
          reportedBy: report.userEmail,
          comments: report.comments?.length || 0,
          verified: report.status === 'verified',
          attachments: report.attachments || [],
          reactions: report.reactions || [],
          sentiment: report.sentiment || { overall: 'neutral' },
          aiAnalysis: report.aiAnalysis || null,
          views: report.views || 0
        }));

        // Apply client-side sorting
        let sortedReports = [...formattedReports];
        if (sortBy === 'hot' || sortBy === 'top') {
          sortedReports.sort((a, b) => {
            const aEngagement = (a.reactions?.length || 0) + (a.comments || 0);
            const bEngagement = (b.reactions?.length || 0) + (b.comments || 0);
            if (aEngagement !== bEngagement) {
              return bEngagement - aEngagement;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
        } else if (sortBy === 'rising') {
          // Sort by recent activity (posts with recent comments or reactions)
          sortedReports.sort((a, b) => {
            const aActivity = a.reactions?.length || 0;
            const bActivity = b.reactions?.length || 0;
            if (aActivity !== bActivity) {
              return bActivity - aActivity;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
        }

        setReports(prev => page === 1 ? sortedReports : [...prev, ...sortedReports]);
        setPagination(paginationData);

        // Calculate category stats
        if (page === 1) {
          const totalViews = fetchedReports.reduce((sum, post) => sum + (post.views || 0), 0);
          const totalReactions = fetchedReports.reduce((sum, post) => sum + (post.reactions?.length || 0), 0);
          const totalComments = fetchedReports.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
          
          setCategoryStats({
            totalPosts: paginationData?.totalReports || 0,
            totalViews,
            totalReactions,
            totalComments
          });
        }

      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Could not load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchReports();
    }
  }, [category, sortBy, searchQuery, page]);

  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setReports([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    setReports([]);
  };

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case 'hot': return <Flame className="w-4 h-4" />;
      case 'new': return <Clock className="w-4 h-4" />;
      case 'top': return <Star className="w-4 h-4" />;
      case 'rising': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sortType) => {
    switch (sortType) {
      case 'hot': return 'Hot';
      case 'new': return 'New';
      case 'top': return 'Top';
      case 'rising': return 'Rising';
      default: return 'New';
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          <Card className="mb-6">
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
        <div className="flex items-center justify-between mb-4">
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
        <div className="space-y-4">
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
              {reports.map((report) => (
                <CrimeReportCard key={report.id} report={report} />
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
                  <Button onClick={() => router.push('/')}>
                    Submit First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


