'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle2, ChevronRight, File, X, Mail, Plus, Play, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { createCampaign, createMultipleLeads } from '@/lib/db';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

type BuilderStep = 'setup' | 'audience' | 'sequence' | 'review';

export function CampaignBuilder({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState<BuilderStep>('setup');
  
  // State for campaign
  const [campaignName, setCampaignName] = useState('');
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [subjectA, setSubjectA] = useState('');
  const [subjectB, setSubjectB] = useState('');
  
  // Audience
  const [leads, setLeads] = useState<any[]>([]);
  
  // Sequence
  const [sequence, setSequence] = useState<any[]>([{ id: 1, type: 'initial', delay: 0, body: '', attachment: null }]);
  const [isLaunching, setIsLaunching] = useState(false);
  
  // Delivery Settings
  const [sendDelayMinutes, setSendDelayMinutes] = useState(5);
  const [maxPerDay, setMaxPerDay] = useState(50);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      // 0. Convert attachments to Base64 to bypass Firebase Storage CORS issues
      const processedSequence = await Promise.all(sequence.map(async (seq) => {
        // Robust check for File object
        if (seq.attachment && typeof seq.attachment === 'object' && 'name' in seq.attachment && 'size' in seq.attachment && typeof (seq.attachment as any).arrayBuffer === 'function') {
          const file = seq.attachment as File;
          
          // Convert file to Base64 using FileReader (Browser native)
          const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
          
          return {
            ...seq,
            attachment: {
              name: file.name,
              url: base64Url,
              type: file.type,
              size: file.size
            }
          };
        }
        return seq;
      }));

      // 1. Save campaign
      const campaignId = await createCampaign({
        name: campaignName || 'Untitled Campaign',
        subjectA,
        subjectB: abTestEnabled ? subjectB : null,
        sequence: processedSequence,
        leadCount: leads.length,
        deliverySettings: {
          sendDelayMinutes,
          maxPerDay
        }
      });

      // 2. Save leads (attach campaignId to them)
      if (leads.length > 0) {
        const leadsToSave = leads.map(l => ({ ...l, campaignId }));
        await createMultipleLeads(leadsToSave);
      }
      
      onCancel(); // go back to main screen
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  // Upload File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processData = (data: any[]) => {
      const parsedLeads = data
        .filter((r: any) => r.email)
        .map((r: any) => {
          let role_type = r.role_type?.trim().toLowerCase();
          if (!role_type && r.position) {
            const pos = r.position.toLowerCase();
            if (pos.includes('react native') || pos.includes('react_native')) role_type = 'react_native';
            else if (pos.includes('front') || pos.includes('ui') || pos.includes('web')) role_type = 'frontend';
            else if (pos.includes('fullstack') || pos.includes('full stack') || pos.includes('full-stack')) role_type = 'fullstack';
            else role_type = 'software';
          }
          return { ...r, role_type: role_type || 'software' };
        });
      setLeads(parsedLeads);
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => processData(results.data)
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      try {
        const xlsx = await import('xlsx');
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
          processData(excelData);
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        alert("Please install the 'xlsx' package to parse Excel files: npm install xlsx");
      }
    }
  };

  const handleAttachment = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newSeq = [...sequence];
      newSeq[index] = { ...newSeq[index], attachment: file };
      setSequence(newSeq);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-display font-semibold text-gray-900">
            {campaignName || 'New Campaign'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Draft</span>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Save as Draft
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Steps */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
          {[
            { id: 'setup', label: '1. Setup & Subjects' },
            { id: 'audience', label: '2. Audience' },
            { id: 'sequence', label: '3. Sequences' },
            { id: 'review', label: '4. Review & Launch' },
          ].map((s) => (
            <div 
              key={s.id}
              className={`flex items-center gap-3 cursor-pointer ${
                step === s.id ? 'text-blue-600 font-semibold' : 'text-gray-500 font-medium'
              }`}
              onClick={() => setStep(s.id as BuilderStep)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                step === s.id ? 'bg-blue-50 border-blue-600' : 'border-gray-300'
              }`}>
                {s.id === 'review' ? <CheckCircle2 className="w-4 h-4" /> : s.label.split('.')[0]}
              </div>
              <span className="text-sm">{s.label.split('. ')[1]}</span>
            </div>
          ))}
        </div>

        {/* Builder Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {step === 'setup' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-display font-semibold mb-1">Campaign Details</h3>
                  <p className="text-sm text-gray-500 mb-4">Give your campaign a name for internal tracking.</p>
                  <input 
                    type="text" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Q3 Startup Founders"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h3 className="text-lg font-display font-semibold">Subject Lines</h3>
                    <p className="text-sm text-gray-500">Enable A/B testing to optimize open rates.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line {abTestEnabled && 'A'}</label>
                      <input 
                        type="text" 
                        value={subjectA}
                        onChange={(e) => setSubjectA(e.target.value)}
                        placeholder="e.g. Quick question regarding {{company}}"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {abTestEnabled && (
                      <div className="pt-2 animate-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line B</label>
                        <input 
                          type="text" 
                          value={subjectB}
                          onChange={(e) => setSubjectB(e.target.value)}
                          placeholder="e.g. Exploring synergies between us and {{company}}"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        onClick={() => setAbTestEnabled(!abTestEnabled)}
                        className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2"
                      >
                        {abTestEnabled ? 'Disable A/B Testing' : '+ Add A/B Test Variant'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h3 className="text-lg font-display font-semibold">Delivery & Anti-Spam</h3>
                    <p className="text-sm text-gray-500">Protect your sender reputation by throttling your outreach.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Emails (Minutes)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={sendDelayMinutes}
                        onChange={(e) => setSendDelayMinutes(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">Staggers sending to mimic human behavior.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Emails Per Day</label>
                      <input 
                        type="number" 
                        min="1"
                        value={maxPerDay}
                        onChange={(e) => setMaxPerDay(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pauses campaign if limit is reached.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setStep('audience')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    Next: Audience <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'audience' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-display font-semibold mb-1">Upload Leads</h3>
                  <p className="text-sm text-gray-500 mb-6">Upload a CSV containing your leads. Need a specific format? <a href={`data:text/csv;charset=utf-8,${encodeURIComponent('email,name,company,position,role_type,company_hook\njohn@example.com,John Doe,Acme Corp,CEO,software,"Loved your recent product launch"')}`} download="outreach_template.csv" className="text-blue-600 hover:underline">Download our template here</a>.</p>
                  
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Columns Format</h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 font-mono rounded">email</span>
                      <span className="px-2 py-1 bg-white border border-gray-300 text-gray-600 font-mono rounded">name (optional)</span>
                      <span className="px-2 py-1 bg-white border border-gray-300 text-gray-600 font-mono rounded">company (optional)</span>
                      <span className="px-2 py-1 bg-white border border-gray-300 text-gray-600 font-mono rounded">position (optional)</span>
                      <span className="px-2 py-1 bg-white border border-gray-300 text-gray-600 font-mono rounded">role_type (optional)</span>
                      <span className="px-2 py-1 bg-white border border-gray-300 text-gray-600 font-mono rounded">company_hook (optional)</span>
                    </div>
                  </div>

                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                      <p className="mb-2 text-sm text-gray-700 font-medium"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">CSV or Excel format (MAX. 10,000 rows)</p>
                    </div>
                    <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                {leads.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-medium text-sm text-gray-900">Preview ({leads.length} leads loaded)</h4>
                      <button onClick={() => setLeads([])} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-100 sticky top-0">
                          <tr>
                            {Object.keys(leads[0] || {}).map(key => (
                              <th key={key} className="py-2 px-4 font-semibold text-gray-600">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {leads.slice(0, 10).map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val: any, j) => (
                                <td key={j} className="py-2 px-4 text-gray-600 truncate max-w-[150px]">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {leads.length > 10 && (
                        <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                          Showing 10 of {leads.length} leads
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep('setup')} className="text-gray-600 hover:bg-gray-100 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep('sequence')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    Next: Sequences <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'sequence' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-display font-semibold mb-1">Outreach Sequence</h3>
                  <p className="text-sm text-gray-500">Design your initial email and automated follow-ups.</p>
                </div>

                {sequence.map((seq, index) => (
                  <div key={seq.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
                    {index > 0 && (
                      <div className="absolute -top-6 left-8 w-px h-6 bg-gray-300" />
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          {seq.type === 'initial' ? 'Initial Email' : `Follow-up ${index}`}
                        </h4>
                      </div>
                      {seq.type !== 'initial' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Wait</span>
                          <input type="number" defaultValue={3} className="w-16 px-2 py-1 border border-gray-200 rounded-md text-center" />
                          <span>days</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <textarea 
                        className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-sans"
                        placeholder={`Hi {{name}},\n\nI noticed {{company}} is expanding their engineering team...`}
                      />
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">{"{{name}}"}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">{"{{company}}"}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">{"{{position}}"}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">{"{{role_type}}"}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">{"{{company_hook}}"}</span>
                        </div>
                        <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                          <File className="w-4 h-4" />
                          {seq.attachment ? seq.attachment.name : 'Attach Resume'}
                          <input type="file" className="hidden" onChange={(e) => handleAttachment(index, e)} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setSequence([...sequence, { id: Date.now(), type: 'followup', delay: 3, body: '' }])}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Follow-up Step
                </button>

                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep('audience')} className="text-gray-600 hover:bg-gray-100 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep('review')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    Next: Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-2">Ready to launch?</h3>
                  <p className="text-gray-500">Your campaign looks good. Review the summary below.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Campaign Name</span>
                    <span className="font-semibold text-gray-900">{campaignName || 'Untitled Campaign'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Audience</span>
                    <span className="font-semibold text-gray-900">{leads.length} contacts</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">A/B Testing</span>
                    <span className="font-semibold text-gray-900">{abTestEnabled ? 'Enabled (50/50 split)' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Sequence Steps</span>
                    <span className="font-semibold text-gray-900">{sequence.length} emails</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-500 font-medium">Attachments</span>
                    <span className="font-semibold text-gray-900">
                      {sequence.filter(s => s.attachment).length > 0 
                        ? `${sequence.filter(s => s.attachment).length} file(s) attached` 
                        : 'None'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep('sequence')} className="text-gray-600 hover:bg-gray-100 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Back
                  </button>
                  <button onClick={handleLaunch} disabled={isLaunching} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
                    {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Campaign'}
                    {!isLaunching && <Play className="w-4 h-4 fill-current" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
