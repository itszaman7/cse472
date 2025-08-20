"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Filter, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Clock,
  Home,
  BarChart3,
  Map,
  Users,
  Settings,
  Plus,
  ChevronRight,
  Bell,
  User,
  LogOut
} from 'lucide-react';

// Export the provider and trigger for use in layout
export { SidebarProvider, SidebarTrigger };

export default function FixedSidebar({ 
  selectedCity, 
  heatmapData = [], 
  leaderboardData = [],
  onAddReport 
}) {
  const pathname = usePathname();

  const filters = [
    { key: 'all', label: 'All Reports', count: 45, icon: Home },
    { key: 'theft', label: 'Theft', count: 18, icon: Shield },
    { key: 'violence', label: 'Violence', count: 12, icon: AlertTriangle },
    { key: 'vandalism', label: 'Vandalism', count: 8, icon: BarChart3 },
    { key: 'suspicious activity', label: 'Suspicious Activity', count: 7, icon: Users }
  ];

  const safetyStats = [
    { label: 'Safety Score', value: '7.2/10', trend: '+0.3' },
    { label: 'Active Reports', value: '45', trend: '-5' },
    { label: 'Resolved Today', value: '12', trend: '+8' }
  ];

  const trendingAlerts = [
    {
      title: 'Downtown Area',
      message: 'Increased theft reports in the last 24 hours',
      type: 'warning',
      icon: AlertTriangle
    },
    {
      title: 'Community Alert',
      message: 'Local patrol increased in residential areas',
      type: 'info',
      icon: Clock
    }
  ];

  const getCurrentFilter = () => {
    const path = pathname.split('/');
    if (path[1] === 'c' && path[2]) {
      return decodeURIComponent(path[2]);
    }
    return 'all';
  };

  const currentFilter = getCurrentFilter();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <span className="font-bold text-lg">CrimeShield</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Safety Overview */}
        <SidebarGroup>
          <SidebarGroupLabel>Safety Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{selectedCity}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                    Safe
                  </Badge>
                </div>
                
                {safetyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{stat.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">{stat.value}</span>
                      <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarRail />

        {/* Filter Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>Filter Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = currentFilter === filter.key;
                
                return (
                  <SidebarMenuItem key={filter.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={filter.label}
                      className={isActive ? "bg-red-50 text-red-700 border-red-200" : ""}
                    >
                      <Link href={filter.key === 'all' ? '/' : `/c/${encodeURIComponent(filter.key)}`}>
                        <Icon className="h-4 w-4" />
                        <span>c/{filter.key}</span>
                        <SidebarMenuBadge className={isActive ? "bg-red-100 text-red-700" : ""}>
                          {filter.count}
                        </SidebarMenuBadge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onAddReport}
                  tooltip="Add Report"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Report</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Trending Alerts */}
        <SidebarGroup>
          <SidebarGroupLabel>Trending</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {trendingAlerts.map((alert, index) => {
                const Icon = alert.icon;
                const bgColor = alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200';
                const textColor = alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600';
                
                return (
                  <div key={index} className={`p-3 rounded-lg border ${bgColor} hover:shadow-sm transition-shadow cursor-pointer`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{alert.title}</span>
                      <Icon className={`w-3 h-3 ${textColor}`} />
                    </div>
                    <p className="text-xs text-gray-600">
                      {alert.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 space-y-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              <span>Admin Panel</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
