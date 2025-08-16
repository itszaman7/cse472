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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Home</h2>
                <div className="text-sm text-gray-500">
                  Trending categories
                </div>
              </div>
              
              {/* Category Links */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { name: 'theft', icon: '🦹', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  { name: 'violence', icon: '⚔️', color: 'bg-red-100 text-red-800 border-red-200' },
                  { name: 'vandalism', icon: '🎨', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                  { name: 'fraud', icon: '💳', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { name: 'harassment', icon: '🚫', color: 'bg-pink-100 text-pink-800 border-pink-200' },
                  { name: 'traffic', icon: '🚗', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                ].map(cat => (
                  <a 
                    key={cat.name}
                    href={`/c/${cat.name}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:shadow-md transition-all duration-200 ${cat.color}`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>c/{cat.name}</span>
                  </a>
                ))}
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