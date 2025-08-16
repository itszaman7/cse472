"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import CrimeReportCard from "@/components/newsfeed/CrimeReport";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Hash, 
  TrendingUp, 
  Users, 
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const sp = useSearchParams();
  const query = sp.get("q") || "";
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!query) {
        // Load popular categories when no search query
        loadPopularCategories();
        return;
      }
      
      setLoading(true);
      setError("");
      try {
        const categoryMatch = query.toLowerCase().startsWith("c/") ? query.slice(2) : null;
        const params = categoryMatch ? { category: categoryMatch } : { q: query };
        params.limit = 50;
        const res = await axios.get("http://localhost:5000/posts", { params });
        const fetched = res.data.reports || [];
        const formatted = fetched.map((report) => ({
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
          verified: report.status === 'verified' || report.verified === true,
          attachments: report.attachments || [],
          reactions: report.reactions || [],
          sentiment: report.sentiment || { overall: 'neutral' },
          aiAnalysis: report.aiAnalysis || null,
        }));
        setReports(formatted);
        setSuggestions(res.data.suggestions || []);
      } catch (e) {
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const loadPopularCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/posts", { 
        params: { limit: 1 } 
      });
      
      // Get unique categories from recent posts
      const categoryCounts = {};
      if (res.data.reports) {
        res.data.reports.forEach(report => {
          if (report.category) {
            categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
          }
        });
      }
      
      const popularCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([category, count]) => ({ category, count }));
      
      setCategories(popularCategories);
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('theft')) return '🦹';
    if (categoryLower.includes('violence')) return '⚔️';
    if (categoryLower.includes('vandalism')) return '🎨';
    if (categoryLower.includes('fraud')) return '💳';
    if (categoryLower.includes('harassment')) return '🚫';
    if (categoryLower.includes('traffic')) return '🚗';
    if (categoryLower.includes('drug')) return '💊';
    return '🚨';
  };

  const getCategoryColor = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('theft')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (categoryLower.includes('violence')) return 'bg-red-100 text-red-800 border-red-200';
    if (categoryLower.includes('vandalism')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (categoryLower.includes('fraud')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (categoryLower.includes('harassment')) return 'bg-pink-100 text-pink-800 border-pink-200';
    if (categoryLower.includes('traffic')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (categoryLower.includes('drug')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!query) {
    return (
      <main className="mx-auto p-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Crime Reports
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find incidents, explore categories, or discover trending topics
          </p>
        </div>

        {/* Popular Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(({ category, count }) => (
                <Link key={category} href={`/c/${encodeURIComponent(category)}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">c/{category}</h3>
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {count} posts
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Search Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  Categories
                </h4>
                <div className="space-y-2">
                  {['theft', 'violence', 'vandalism', 'fraud'].map(cat => (
                    <Link key={cat} href={`/c/${cat}`}>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>c/{cat}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Locations
                </h4>
                <div className="space-y-2">
                  {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'].map(location => (
                    <Link key={location} href={`/search?q=${encodeURIComponent(location)}`}>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>{location}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Search Results for: <span className="text-blue-600">{query}</span>
        </h1>
        
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Suggestions:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Link 
                  key={`${suggestion.type}-${index}`} 
                  href={suggestion.type === 'category' 
                    ? `/c/${encodeURIComponent(suggestion.value)}`
                    : `/search?q=${encodeURIComponent(suggestion.value)}`
                  }
                >
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  >
                    {suggestion.type === 'category' ? 'c/' : ''}{suggestion.value}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Match */}
        {query.toLowerCase().startsWith("c/") && (
          <div className="mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Category: c/{query.slice(2)}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      View all posts in this category
                    </p>
                  </div>
                  <Link href={`/c/${encodeURIComponent(query.slice(2))}`}>
                    <Button variant="outline" className="border-blue-300 text-blue-700">
                      View Category
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && query && (
        reports.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Found {reports.length} result{reports.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Sorted by relevance</span>
              </div>
            </div>
            {reports.map((r) => (
              <CrimeReportCard key={r.id} report={r} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                No posts matched your search for "{query}"
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link href="/search">
                    <Button variant="outline" size="sm">
                      Browse all posts
                    </Button>
                  </Link>
                  {query.toLowerCase().startsWith("c/") && (
                    <Link href={`/c/${encodeURIComponent(query.slice(2))}`}>
                      <Button variant="outline" size="sm">
                        View category
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </main>
  );
}