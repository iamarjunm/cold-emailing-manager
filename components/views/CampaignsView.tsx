'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Play, Pause, BarChart2 } from 'lucide-react';
import { CampaignBuilder } from './CampaignBuilder';
import { getCampaigns } from '@/lib/db';

export function CampaignsView() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (!isBuilding) {
      getCampaigns().then(setCampaigns).catch(console.error);
    }
  }, [isBuilding]);

  if (isBuilding) {
    return <CampaignBuilder onCancel={() => setIsBuilding(false)} />;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Campaigns</h2>
          <p className="text-sm text-gray-500">Manage and track your cold email outreach</p>
        </div>
        <button 
          onClick={() => setIsBuilding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Rate</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reply Rate</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No campaigns found. Create your first one!</td>
                </tr>
              )}
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      c.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      c.status === 'paused' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        c.status === 'active' ? 'bg-green-500' :
                        c.status === 'paused' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                      {(c.status || 'draft').charAt(0).toUpperCase() + (c.status || 'draft').slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{(c.sent || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{c.opens || '0%'}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{c.replies || '0%'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                        {c.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
