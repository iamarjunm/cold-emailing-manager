'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, MailCheck, MousePointerClick, Loader2 } from 'lucide-react';
import { getCampaigns } from '@/lib/db';

export function DashboardView() {
  const [totalSent, setTotalSent] = useState(0);
  const [avgOpenRate, setAvgOpenRate] = useState(0);
  const [avgReplyRate, setAvgReplyRate] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCampaigns().then(campaigns => {
      let sent = 0;
      let opens = 0;
      let replies = 0;

      // Ensure we limit to some reasonable number of campaigns for the chart
      const chartMap = new Map();

      campaigns.forEach(c => {
        const cSent = (c.sent || 0) + (c.leadCount || 0);
        const cOpens = c.opens || 0;
        const cReplies = c.replies || 0;
        
        sent += cSent;
        opens += cOpens;
        replies += cReplies;

        // Group by day for the chart (using dummy day if date parsing fails for simple demo)
        const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date();
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!chartMap.has(day)) {
          chartMap.set(day, { name: day, opens: 0, replies: 0 });
        }
        
        const dayData = chartMap.get(day);
        dayData.opens += cOpens;
        dayData.replies += cReplies;
      });

      setTotalSent(sent);
      if (sent > 0) {
        setAvgOpenRate((opens / sent) * 100);
        setAvgReplyRate((replies / sent) * 100);
      }

      // Convert map to array (Mon, Tue, etc.)
      const finalChartData = Array.from(chartMap.values()).reverse();
      // If empty, show some zeros for structure
      if (finalChartData.length === 0) {
        finalChartData.push({ name: 'Today', opens: 0, replies: 0 });
      }
      setChartData(finalChartData);

    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">Track your outreach performance across all campaigns.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Sent / Processing</p>
          </div>
          <h3 className="text-3xl font-display font-semibold text-gray-900 mb-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalSent.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MailCheck className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Average Open Rate</p>
          </div>
          <h3 className="text-3xl font-display font-semibold text-gray-900 mb-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${avgOpenRate.toFixed(1)}%`}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Average Reply Rate</p>
          </div>
          <h3 className="text-3xl font-display font-semibold text-gray-900 mb-2">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${avgReplyRate.toFixed(1)}%`}
          </h3>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '14px', fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="opens" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" name="Opens" />
              <Area type="monotone" dataKey="replies" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorReplies)" name="Replies" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
