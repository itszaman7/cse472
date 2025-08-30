"use client";

import { useEffect, useState } from "react";
import FixedSidebar, { SidebarProvider, SidebarTrigger } from "@/components/newsfeed/FixedSidebar";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddReportModal from '@/components/newsfeed/AddReportModal';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/posts?limit=1")
      .then((r) => r.json())
      .then((d) => {
        setData(d.leaderboard || []);
        setHeatmap(d.heatmap || []);
        setLeaderboard(d.leaderboard || []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ paddingTop: '64px' }}>
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
                <span className="font-medium">Leaderboard</span>
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

          {/* Main Content */}
          <div className="flex-1 p-6 min-w-0 w-full max-w-none">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight">Top Contributors</h1>
              <p className="text-gray-500">Most active reporters and helpers this week</p>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
                    <th className="text-left px-5 py-3">Rank</th>
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-right px-5 py-3">Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-700">#{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${idx===0?'bg-yellow-500':idx===1?'bg-gray-400':idx===2?'bg-amber-700':'bg-blue-600'}`}>
                            {(u._id || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{u._id || 'anonymous'}</div>
                            <div className="text-xs text-gray-500">Reporter</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">{u.posts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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


