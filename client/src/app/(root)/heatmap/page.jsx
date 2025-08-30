"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FixedSidebar, { SidebarProvider, SidebarTrigger } from "@/components/newsfeed/FixedSidebar";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddReportModal from '@/components/newsfeed/AddReportModal';

// Load Leaflet map only on client
const HeatmapMap = dynamic(() => import("@/components/newsfeed/HeatmapMap"), { ssr: false });

export default function HeatmapPage() {
  const [data, setData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  useEffect(() => {
    console.log('HeatmapPage: Fetching data...');
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts?limit=1`)
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
                <span className="font-medium">Heatmap</span>
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
            <h1 className="text-2xl font-bold mb-4">Crime Heatmap</h1>
            <HeatmapMap data={data} />
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


