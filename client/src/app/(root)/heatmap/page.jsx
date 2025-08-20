"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FixedSidebar, { SidebarProvider, SidebarTrigger } from "@/components/newsfeed/FixedSidebar";
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

// Load Leaflet map only on client
const HeatmapMap = dynamic(() => import("@/components/newsfeed/HeatmapMap"), { ssr: false });

export default function HeatmapPage() {
  const { user, signOut } = useUser();
  const { notifications } = useNotifications();
  const [data, setData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const unread = notifications?.length || 0;

  useEffect(() => {
    console.log('HeatmapPage: Fetching data...');
    fetch("http://localhost:5000/posts?limit=1")
      .then((r) => r.json())
      .then((d) => {
        console.log('HeatmapPage: Received data:', d);
        console.log('HeatmapPage: Heatmap data:', d.heatmap);
        setData(d.heatmap || []);
        setHeatmap(d.heatmap || []);
        setLeaderboard(d.leaderboard || []);
      })
      .catch((error) => {
        console.error('HeatmapPage: Error fetching data:', error);
        setData([]);
      });
  }, []);

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
                  <span className="font-medium">Heatmap</span>
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
                <Link href="/">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
                    Home
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50">
                    Leaderboard
                  </Button>
                </Link>
                
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
            <h1 className="text-2xl font-bold mb-4">Crime Heatmap</h1>
            <HeatmapMap data={data} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}


