"use client";

import NewsFeed from '../../components/newsfeed/NewsFeed';
import Sidebar from '../../components/newsfeed/Sidebar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AddReportModal from '../../components/newsfeed/AddReportModal';
import { useRouter } from 'next/navigation';

// Accept the 'session' object as a prop
export default function NewsfeedPage({ session }) {
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [heatmap, setHeatmap] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Sidebar 
              filterType={filterType}
              setFilterType={setFilterType}
              selectedCity={selectedCity}
              heatmapData={heatmap}
              leaderboardData={leaderboard}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Home</h2>
              <div className="flex items-center gap-2 text-sm">
                <a className="text-blue-600 hover:underline" href="/c/theft">c/theft</a>
                <a className="text-blue-600 hover:underline" href="/c/violence">c/violence</a>
                <a className="text-blue-600 hover:underline" href="/c/vandalism">c/vandalism</a>
              </div>
            </div>
            <NewsFeed selectedCity={selectedCity} filterType={filterType} />
          </div>
        </div>
      </div>

      <AddReportModal 
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
        selectedCity={selectedCity}
      />
    </div>
  );
}