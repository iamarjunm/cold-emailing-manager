'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { CampaignsView } from '@/components/views/CampaignsView';
import { LeadsView } from '@/components/views/LeadsView';
import { TemplatesView } from '@/components/views/TemplatesView';
import { AccountsView } from '@/components/views/AccountsView';
import { SettingsView } from '@/components/views/SettingsView';
import { HelpSupportView } from '@/components/views/HelpSupportView';
import { AuthProvider } from '@/components/AuthProvider';

export type ViewState = 'dashboard' | 'campaigns' | 'leads' | 'templates' | 'accounts' | 'settings' | 'help';

export default function AppShell() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  return (
    <AuthProvider>
      <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'campaigns' && <CampaignsView />}
          {currentView === 'leads' && <LeadsView />}
          {currentView === 'templates' && <TemplatesView />}
          {currentView === 'accounts' && <AccountsView />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'help' && <HelpSupportView />}
        </main>
      </div>
    </AuthProvider>
  );
}
