"use client";

import { 
  BarChart3, 
  AlertTriangle, 
  Users, 
  Brain, 
  Settings,
  Home,
  FileText,
  Shield,
  Globe,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminSidebar({ activeTab, setActiveTab, isOpen }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null
    },
    {
      id: 'news-crawler',
      label: 'News Crawler',
      icon: Globe,
      badge: 'NEW'
    },
    {
      id: 'crawler-posts',
      label: 'Crawler Posts',
      icon: Database,
      badge: null
    },
    {
      id: 'crime-management',
      label: 'Crime Reports',
      icon: AlertTriangle,
      badge: '45'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      badge: '1.2k'
    },
    {
      id: 'ai-models',
      label: 'AI Models',
      icon: Brain,
      badge: 'NEW'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    } ${!isOpen ? 'hidden sm:block' : 'block'}`}>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${!isOpen && 'px-2'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}