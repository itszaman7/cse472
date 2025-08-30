"use client";

import { useState } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  Search, 
  Shield,
  LogOut,
  Settings,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">CrimeShield Admin</h1>
              <p className="text-xs text-gray-500">Control Panel</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-900">Admin</h1>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reports, users, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Home Button */}
          <Button variant="ghost" size="sm" asChild className="p-2">
            <Link href="/">
              <Home className="w-5 h-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className="relative p-2 hidden sm:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              5
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Admin User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}