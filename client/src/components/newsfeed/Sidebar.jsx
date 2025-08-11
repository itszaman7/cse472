"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Heatmap from './Heatmap';
import Leaderboard from './Leaderboard';
import { 
  Filter, 
  Shield, 
  AlertTriangle, 
  MapPin, 
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Sidebar({ filterType, setFilterType, selectedCity, heatmapData = [], leaderboardData = [] }) {
  const filters = [
    { key: 'all', label: 'All Reports', count: 45 },
    { key: 'theft', label: 'Theft', count: 18 },
    { key: 'violence', label: 'Violence', count: 12 },
    { key: 'vandalism', label: 'Vandalism', count: 8 },
    { key: 'suspicious activity', label: 'Suspicious Activity', count: 7 }
  ];

  const safetyStats = [
    { label: 'Safety Score', value: '7.2/10', trend: '+0.3' },
    { label: 'Active Reports', value: '45', trend: '-5' },
    { label: 'Resolved Today', value: '12', trend: '+8' }
  ];

  return (
    <div className="space-y-6">
      {/* Safety Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shield className="w-5 h-5 mr-2" />
            Safety Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium">{selectedCity}</span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Safe
            </Badge>
          </div>
          
          {safetyStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{stat.value}</span>
                <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filters.map((filter) => (
            <Link key={filter.key} href={`/c/${encodeURIComponent(filter.key)}`}>
              <Button
                variant={filterType === filter.key ? "default" : "ghost"}
                className="w-full justify-between"
              >
                <span>c/{filter.key}</span>
                <Badge variant="secondary">{filter.count}</Badge>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Trending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Downtown Area</span>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-600">
              Increased theft reports in the last 24 hours
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Community Alert</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">
              Local patrol increased in residential areas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap summary */}
      <Heatmap data={heatmapData} />

      {/* Leaderboard */}
      <Leaderboard data={leaderboardData} />
    </div>
  );
}