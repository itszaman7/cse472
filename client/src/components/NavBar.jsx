"use client";

import { useUser } from "@/context/UserContext";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Menu,
  Search,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const { user, signOut } = useUser();
  const { notifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unread = notifications?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // If user typed c/<category>, normalize to /c/<category>
    if (q.toLowerCase().startsWith("c/")) {
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
      const res = await fetch(
        `http://localhost:5000/posts?q=${encodeURIComponent(val)}&limit=1`
      );
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Hamburger menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </Button>
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center"
            >
              <span className="bg-blue-600 text-white px-2 py-1 rounded mr-2 text-sm">
                Crime
              </span>
              <span className="hidden sm:inline">Shield</span>
            </Link>
          </div>

          {/* Center - Search - Hidden on mobile when menu is open */}
          <div
            className={cn(
              "flex-1 max-w-2xl mx-4 hidden md:block",
              isMobileMenuOpen && "hidden"
            )}
          >
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search incidents, locations, categories..."
                  value={searchQuery}
                  onChange={onChangeSearch}
                  className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-50 focus:bg-white"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {/* Quick category links */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-2">Quick Categories:</div>
                      <div className="flex flex-wrap gap-1">
                        {['theft', 'violence', 'vandalism', 'fraud'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setSuggestions([]);
                              window.location.href = `/c/${cat}`;
                            }}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                          >
                            c/{cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Search suggestions */}
                    {suggestions.map((s, idx) => (
                      <button
                        key={`${s.type}-${idx}`}
                        type="button"
                        onClick={() => {
                          const next = s.value;
                          setSearchQuery(next);
                          setSuggestions([]);
                          if (next.toLowerCase().startsWith("c/")) {
                            window.location.href = `/c/${encodeURIComponent(
                              next.slice(2)
                            )}`;
                          } else {
                            window.location.href = `/search?q=${encodeURIComponent(
                              next
                            )}`;
                          }
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm transition-colors flex items-center"
                      >
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-3">
                          {s.type}
                        </span>
                        <span className="text-gray-800 truncate">
                          {s.value}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right side - Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Navigation Links */}
            <Link href="/heatmap">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Heatmap
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Leaderboard
              </Button>
            </Link>

            {/* Report Button with animation */}
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                <MapPin className="w-4 h-4 mr-2" />
                Report
              </Button>
            </Link>

            {user ? (
              <>
                {/* Notification Bell with pulse animation when unread */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notifications</span>
                      {unread > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {unread} new
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {unread === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n, i) => (
                        <DropdownMenuItem
                          key={i}
                          className="flex items-start gap-3 hover:bg-blue-50"
                        >
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Bell className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">{n.message}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                                {n.type}
                              </span>
                              {new Date(n.at).toLocaleTimeString()}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0"
                    >
                      <Avatar className="h-9 w-9 border-2 border-blue-100">
                        <AvatarImage
                          src={user.image || ""}
                          alt={user.name || user.email}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-white font-medium">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || "Anonymous User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center hover:bg-blue-50"
                      >
                        <User className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center hover:bg-blue-50"
                      >
                        <Settings className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile search and menu button - shown only on mobile */}
          <div className="flex items-center md:hidden space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Search className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            {!user && (
              <Link href="/sign-in">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search - Shows when search button is clicked */}
        {showSearch && (
          <div className="pb-3 px-4 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={onChangeSearch}
                  className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-50"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu - Shows when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 px-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 pt-3">
              <Link href="/heatmap">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-blue-50"
                >
                  Heatmap
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-blue-50"
                >
                  Leaderboard
                </Button>
              </Link>
              <Link href="/report">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <MapPin className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </Link>

              {user && (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-blue-50"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-blue-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </div>

                  {/* Mobile Notifications */}
                  <div className="pt-2 border-t border-gray-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:bg-blue-50"
                        >
                          <div className="relative mr-2">
                            <Bell className="w-4 h-4" />
                            {unread > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-4 h-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                                {unread > 9 ? "9+" : unread}
                              </span>
                            )}
                          </div>
                          Notifications
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-full mx-4"
                        align="start"
                      >
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {unread === 0 ? (
                          <div className="px-3 py-6 text-sm text-gray-500">
                            No new notifications
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n, i) => (
                            <DropdownMenuItem
                              key={i}
                              className="flex items-start"
                            >
                              <div className="text-xs text-gray-500 mr-2">
                                {new Date(n.at).toLocaleTimeString()}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm">{n.message}</div>
                                <div className="text-xs text-gray-500">
                                  Type: {n.type}
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
