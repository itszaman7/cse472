"use client";

import NewsFeed from '@/components/newsfeed/NewsFeed';
import FixedSidebar, { SidebarProvider, SidebarTrigger } from '@/components/newsfeed/FixedSidebar';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
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
      <div className="flex  bg-gradient-to-br from-slate-50 to-blue-50">
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
                  <span className="font-medium">All Reports</span>
                </div>
              </div>

              {/* Center - Search bar */}
              <div className="flex-1 max-w-md mx-4">
                <form onSubmit={handleSearch} className="relative">
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
                            <DropdownMenuItem key={i} className="flex items-start">
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Home</h2>
                <div className="text-sm text-gray-500">
                  Trending categories
                </div>
              </div>
              
              {/* Category Links */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { name: 'theft', icon: '🦹', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  { name: 'violence', icon: '⚔️', color: 'bg-red-100 text-red-800 border-red-200' },
                  { name: 'vandalism', icon: '🎨', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                  { name: 'fraud', icon: '💳', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { name: 'harassment', icon: '🚫', color: 'bg-pink-100 text-pink-800 border-pink-200' },
                  { name: 'traffic', icon: '🚗', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                ].map(cat => (
                  <a 
                    key={cat.name}
                    href={`/c/${cat.name}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:shadow-md transition-all duration-200 ${cat.color}`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>c/{cat.name}</span>
                  </a>
                ))}
              </div>
            </div>
            <NewsFeed selectedCity={selectedCity} filterType={filterType} />
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