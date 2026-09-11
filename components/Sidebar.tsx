'use client';

import React from 'react';
import { ViewState } from '@/app/page';
import { LayoutDashboard, Mail, Users, FileText, Settings, HelpCircle, Send, Server, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { user, logOut } = useAuth();

  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Mail className="w-5 h-5" /> },
    { id: 'leads', label: 'Leads (CRM)', icon: <Users className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="w-5 h-5" /> },
    { id: 'accounts', label: 'Email Accounts', icon: <Server className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Send className="w-5 h-5" />
        </div>
        <h1 className="font-display font-semibold text-xl tracking-tight text-gray-900">OutreachPro</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              currentView === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="space-y-1">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              currentView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button 
            onClick={() => setCurrentView('help')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              currentView === 'help' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </button>
        </div>
        <div className="mt-6 flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600 text-sm overflow-hidden flex-shrink-0">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : (user?.displayName?.charAt(0) || 'U')}
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'My Workspace'}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email || 'Free Plan'}</span>
          </div>
          <button 
            onClick={logOut}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 flex-shrink-0 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
