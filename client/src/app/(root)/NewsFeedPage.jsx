"use client";

import NewsFeed from '@/components/newsfeed/NewsFeed';
import FixedSidebar, { SidebarProvider, SidebarTrigger } from '@/components/newsfeed/FixedSidebar';
import TrendingPostsCarousel from '@/components/newsfeed/TrendingPostsCarousel';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AddReportModal from '@/components/newsfeed/AddReportModal';
import { useRouter } from 'next/navigation';
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
import { 
  Plus, 
  Map, 
  BarChart3, 
  Bell, 
  ChevronRight,
  Search,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import Link from 'next/link';

// Accept the 'session' object as a prop
export default function NewsfeedPage({ session }) {
  const { user, signOut } = useUser();
  const { notifications } = useNotifications();
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const unread = notifications?.length || 0;

  // Fetch sidebar aggregates once
  useEffect(() => {
    const fetchAggs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/posts', { params: { city: selectedCity, limit: 1 } });
        setHeatmap(res.data.heatmap || []);
        setLeaderboard(res.data.leaderboard || []);
      } catch (e) {
        // ignore
      }
    };
    fetchAggs();
  }, [selectedCity]);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex bg-gradient-to-br from-slate-50 to-blue-50" style={{ paddingTop: '64px' }}>
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
                <span className="font-medium">All Reports</span>
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

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Trending Posts Carousel */}
              <div className="p-4">
                <TrendingPostsCarousel />
              </div>

              {/* News Feed */}
              <div className="flex-1 overflow-y-auto">
                <NewsFeed 
                  session={session}
                  filterType={filterType}
                  selectedCity={selectedCity}
                />
              </div>
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