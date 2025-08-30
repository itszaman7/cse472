"use client";

import { useState } from 'react';
import AdminHeader from '../../../components/admin-ui/AdminHeader';
import AdminSidebar from '../../../components/admin-ui/AdminSidebar';
import CrimeManagement from '../../../components/admin-ui/CrimeManagement';
import UserManagement from '../../../components/admin-ui/UserManagement';
import AIModelManagement from '../../../components/admin-ui/AiModelManagement';
import Analytics from '../../../components/admin-ui/Analytics';
import SystemSettings from '../../../components/admin-ui/SystemSettings';
import NewsCrawler from '../../../components/admin-ui/NewsCrawler';
import CrawlerPostManagement from '../../../components/admin-ui/CrawlerPostManagement';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Analytics />;
      case 'news-crawler':
        return <NewsCrawler />;
      case 'crawler-posts':
        return <CrawlerPostManagement />;
      case 'crime-management':
        return <CrimeManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'ai-models':
        return <AIModelManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex">
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
        />
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-0 sm:ml-64' : 'ml-0 sm:ml-16'
        }`}>
          <div className="p-4 sm:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}