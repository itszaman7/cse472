"use client";

import { useState } from 'react';
import AdminHeader from '../../../components/admin-ui/AdminHeader';
import AdminSidebar from '../../../components/admin-ui/AdminSidebar';
import CrimeManagement from '../../../components/admin-ui/CrimeManagement';
import UserManagement from '../../../components/admin-ui/UserManagement';
import AIModelManagement from '../../../components/admin-ui/AiModelManagement';
import Analytics from '../../../components/admin-ui/Analytics';
import SystemSettings from '../../../components/admin-ui/SystemSettings';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Analytics />;
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
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}