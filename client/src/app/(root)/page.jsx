"use client";

import { useState } from 'react';
import Header from '../../components/newsfeed/Header';
import NewsFeed from '../../components/newsfeed/NewsFeed';
import Sidebar from '../../components/newsfeed/Sidebar';
import AddReportModal from '../../components/newsfeed/AddReportModal';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('New York');
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onAddReport={() => setIsAddReportOpen(true)}
      />

      <h1>hello</h1>

      <button className='btn'>Login </button>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Sidebar 
              filterType={filterType}
              setFilterType={setFilterType}
              selectedCity={selectedCity}
            />
          </div>
          
          <div className="lg:col-span-3">
            <NewsFeed 
              selectedCity={selectedCity}
              filterType={filterType}
            />
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