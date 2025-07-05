"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Shield,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Analytics() {
  const stats = [
    {
      title: 'Total Reports',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '8,432',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Verified Reports',
      value: '892',
      change: '+15%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-purple-600'
    },
    {
      title: 'AI Accuracy',
      value: '94.2%',
      change: '+2%',
      trend: 'up',
      icon: Shield,
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'report',
      message: 'New high-priority report submitted in Manhattan',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'user',
      message: 'User verification completed for John Smith',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'ai',
      message: 'AI model updated with new training data',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'report',
      message: 'Report flagged for manual review',
      time: '23 minutes ago',
      status: 'review'
    }
  ];

  const cityStats = [
    { city: 'New York', reports: 342, safety: 7.2 },
    { city: 'Los Angeles', reports: 289, safety: 6.8 },
    { city: 'Chicago', reports: 234, safety: 6.5 },
    { city: 'Houston', reports: 187, safety: 7.1 },
    { city: 'Phoenix', reports: 156, safety: 7.4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your crime reporting platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* City Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              City Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityStats.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{city.city}</p>
                    <p className="text-sm text-gray-600">{city.reports} reports</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{city.safety}/10</p>
                    <p className="text-xs text-gray-500">Safety Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crime Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Pie chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}