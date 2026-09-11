'use client';

import React from 'react';
import { HelpCircle, FileText, Code2, AlertTriangle, MessageSquare, ChevronRight } from 'lucide-react';

export function HelpSupportView() {
  return (
    <div className="p-8 h-full flex flex-col bg-[#FAFAFA] overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Help & Support</h2>
          <p className="text-sm text-gray-500">Find formats, documentation, and troubleshooting guides.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formats Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Lead CSV Formatting</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              When uploading leads to a campaign, your CSV or Excel file must follow this exact header format.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <code className="text-sm font-semibold text-blue-700">email</code>
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <code className="text-sm font-medium text-gray-700">name</code>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Optional</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <code className="text-sm font-medium text-gray-700">company</code>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Optional</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <code className="text-sm font-medium text-gray-700">position</code>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Optional</span>
              </div>
            </div>

            <a 
              href={`data:text/csv;charset=utf-8,${encodeURIComponent('email,name,company,position\njohn@example.com,John Doe,Acme Corp,CEO')}`} 
              download="outreach_template.csv" 
              className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              Download Sample CSV Template <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Variables & Logic Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Templating & Logic</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use Liquid-style conditionals in your subject lines and email body to create highly personalized outreach at scale.
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Standard Variables</p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded font-mono text-xs">
                  {"Hi {{name}},\nI saw that {{company}} is hiring a {{position}}."}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-1">Missing Name Fallbacks</p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre">
                  {"{% if name %}\n  Dear {{name}},\n{% else %}\n  Dear {{company}} team,\n{% endif %}"}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-1">Conditional by Position</p>
                <div className="bg-gray-800 text-gray-200 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre">
                  {"{% if position == 'CTO' %}\n  As a technical leader...\n{% else %}\n  As a leader at {{company}}...\n{% endif %}"}
                </div>
              </div>
            </div>
          </div>

          {/* Anti-Spam Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Anti-Spam & Delivery Guidelines</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Warming up new accounts</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  If you just connected a new email address, <strong>do not send hundreds of emails on day one.</strong> Your account will be flagged as spam by Google/Microsoft.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                  <li>Week 1: Max 20 emails per day</li>
                  <li>Week 2: Max 40 emails per day</li>
                  <li>Week 3: Max 75 emails per day</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Throttling (Delay Between Emails)</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Always use the &quot;Delay Between Emails&quot; setting in Step 1 of the Campaign Builder. We recommend <strong>3 to 5 minutes</strong> between each email. This staggers your sends to mimic a human typing and pressing send, rather than a robot blasting a list.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto">
            Our support team is available 24/7 to help you configure your campaigns, review your templates, or troubleshoot deliverability issues.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Contact Support Team
          </button>
        </div>
      </div>
    </div>
  );
}
