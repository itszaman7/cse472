"use client";

import { useUser } from '@/context/UserContext';
import { User, LogOut, Settings, Bell, Menu, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { useNotifications } from '@/context/NotificationsContext';

const NavBar = () => {
  const { user, signOut } = useUser();
  const { notifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const unread = notifications?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // If user typed c/<category>, normalize to /c/<category>
    if (q.toLowerCase().startsWith('c/')) {
      window.location.href = `/c/${encodeURIComponent(q.slice(2))}`;
      return;
    }
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const onChangeSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val || val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/posts?q=${encodeURIComponent(val)}&limit=1`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Hamburger menu */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
          
          {/* Center - Logo and Search */}
          <div className="flex items-center flex-1 max-w-2xl mx-4">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mr-6">
              CrimeShield
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search incidents, locations, categories..."
                  value={searchQuery}
                  onChange={onChangeSearch}
                  className="pl-10 pr-4 py-2 w-full"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((s, idx) => (
                      <button
                        key={`${s.type}-${idx}`}
                        type="button"
                        onClick={() => {
                          const next = s.value;
                          setSearchQuery(next);
                          setSuggestions([]);
                          if (next.toLowerCase().startsWith('c/')) {
                            window.location.href = `/c/${encodeURIComponent(next.slice(2))}`;
                          } else {
                            window.location.href = `/search?q=${encodeURIComponent(next)}`;
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        <span className="text-gray-500 mr-2">{s.type}:</span>
                        <span className="text-gray-800">{s.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
          
          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-3">
            {/* Report Incident Button */}
            <Link href="/heatmap" className="hidden sm:block">
              <Button variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50">Heatmap</Button>
            </Link>
            <Link href="/leaderboard" className="hidden sm:block">
              <Button variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50">Leaderboard</Button>
            </Link>
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MapPin className="w-4 h-4 mr-2" />
                Report Incident
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

                {/* User Avatar - Only show when signed in */}
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
    </div>
  );
};

export default NavBar;