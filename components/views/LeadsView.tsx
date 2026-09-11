'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, MoreVertical, Loader2 } from 'lucide-react';
import { getLeads } from '@/lib/db';

export function LeadsView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLeads()
      .then(data => setLeads(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Leads CRM</h2>
          <p className="text-sm text-gray-500">Manage contacts, sync with external CRMs, and track engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Sync CRM
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Import Leads
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or company..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 ml-auto">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Position</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading leads...
                  </td>
                </tr>
              )}
              {!isLoading && leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                    No leads found. Create a campaign and upload your CSV to see leads here.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">{lead.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{lead.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">{lead.company || '-'}</span>
                      <span className="text-xs text-gray-500">{lead.position || '-'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      lead.status === 'new' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                      lead.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      lead.status === 'replied' ? 'bg-green-50 text-green-700 border-green-200' :
                      lead.status === 'meeting_booked' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {(lead.status || 'new').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{lead.lastActive || 'Just now'}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing 1-5 of 1,240 leads</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded bg-white disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded bg-white hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
