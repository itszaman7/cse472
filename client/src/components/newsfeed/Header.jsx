"use client";

import { useState } from 'react';
import { Bell, MapPin, Plus, User, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOut } from '../sign-out';
import { useRouter } from 'next/navigation';

export default function Header({ selectedCity, setSelectedCity, onAddReport, session }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
    const handleLogin = () => {
      router.push('/sign-in');
    }
  
  const cities = [
     'Dhaka', 'Chittagong',
  ];

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Shield className="w-7 h-7 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                CrimeShield
              </h1>
              <p className="text-sm text-gray-500 font-medium">Community Crime Reporting</p>
            </div>
          </div>

          {/* Search and Location */}
          <div className="flex items-center space-x-5 flex-1 max-w-2xl mx-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors duration-200" />
              <Input
                placeholder="Search crime reports, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-900 placeholder:text-gray-500 font-medium"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-52 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 font-medium">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-gray-200 rounded-xl shadow-xl backdrop-blur-sm bg-white/95">
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="hover:bg-blue-50 transition-colors duration-200 font-medium">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onAddReport}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report Incident
            </Button>

            {session?.user ? (
        <div className='flex gap-4 items-center'>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
            {session.user.email}
          </span>
         <SignOut />
          </div>
      ) : (
        <Button 
          onClick={handleLogin}
          variant="outline"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
        >
          Login
        </Button>
      )}
            
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-xl p-3 transition-all duration-200 hover:scale-105">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl p-3 transition-all duration-200 hover:scale-105">
                  <User className="w-6 h-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-2 border-gray-200 rounded-xl shadow-xl backdrop-blur-sm bg-white/95 p-2">
                <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200 font-medium rounded-lg">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200 font-medium rounded-lg">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-red-50 transition-colors duration-200 font-medium rounded-lg text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}