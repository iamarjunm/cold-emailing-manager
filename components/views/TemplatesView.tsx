'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Copy, Trash2, LayoutTemplate, Loader2 } from 'lucide-react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/db';

export function TemplatesView() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const loadTemplates = React.useCallback(() => {
    setIsLoading(true);
    getTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const handleEdit = (tpl: any) => {
    setEditingTemplate(tpl);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate.id) {
        await updateTemplate(editingTemplate.id, {
          name: editingTemplate.name,
          category: editingTemplate.category,
          subject: editingTemplate.subject || '',
          body: editingTemplate.body || ''
        });
      } else {
        await createTemplate({
          name: editingTemplate.name,
          category: editingTemplate.category,
          subject: editingTemplate.subject || '',
          body: editingTemplate.body || ''
        });
      }
      setEditingTemplate(null);
      loadTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        await deleteTemplate(templateToDelete);
        setTemplateToDelete(null);
        loadTemplates();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      name: '',
      category: 'General',
      subject: '',
      body: ''
    });
  };

  if (editingTemplate) {
    return (
      <div className="p-8 h-full flex flex-col bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto w-full flex gap-8">
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setEditingTemplate(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">{editingTemplate.id ? 'Edit Template' : 'New Template'}</h2>
                <p className="text-sm text-gray-500">Design your standard email responses with dynamic variables.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 space-y-6 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      placeholder="e.g. Intro for VP Engineering"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input 
                      type="text" 
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                      placeholder="e.g. Follow-ups"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Subject Line</label>
                  <input 
                    type="text" 
                    value={editingTemplate.subject || ''}
                    onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                    placeholder="e.g. {% if position == 'CEO' %}Quick question{% else %}Intro to Acme Corp{% endif %}"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50/30">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                <textarea 
                  required
                  value={editingTemplate.body || ''}
                  onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                  className="w-full h-80 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono leading-relaxed resize-none"
                  placeholder="{% if name %}&#10;  Hi {{name}},&#10;{% else %}&#10;  Hi {{company}} team,&#10;{% endif %}&#10;&#10;I noticed you're scaling your {{position}} team..."
                />
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button type="button" onClick={() => setEditingTemplate(null)} className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Save Template
                </button>
              </div>
            </form>
          </div>

          <div className="w-80 mt-20">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-3">Logic & Variables Reference</h3>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-800 mb-1">Standard Variables</p>
                  <code className="text-xs bg-gray-100 text-pink-600 px-1 py-0.5 rounded">{"{{name}}"}</code>
                  <code className="text-xs bg-gray-100 text-pink-600 px-1 py-0.5 rounded ml-2">{"{{company}}"}</code>
                  <code className="text-xs bg-gray-100 text-pink-600 px-1 py-0.5 rounded ml-2">{"{{position}}"}</code>
                </div>

                <div>
                  <p className="font-medium text-gray-800 mb-1">Missing Name Fallback</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 overflow-x-auto">
                    {"{% if name %}\n  Dear {{name}},\n{% else %}\n  Dear {{company}} team,\n{% endif %}"}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-800 mb-1">Conditional by Position</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 overflow-x-auto">
                    {"{% if position == 'CTO' %}\n  As a technical leader...\n{% else %}\n  As a leader at {{company}}...\n{% endif %}"}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  You can use these logic tags in both the Subject Line and Email Body.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Email Templates</h2>
          <p className="text-sm text-gray-500">Create, edit, and organize your standard responses.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>All Categories</option>
            <option>Executive Outreach</option>
            <option>Startup</option>
            <option>Sequences</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 overflow-y-auto">
          {isLoading && (
            <div className="col-span-full flex justify-center items-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading templates...
            </div>
          )}
          {!isLoading && templates.map((tpl) => (
            <div key={tpl.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(tpl)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tpl.name}</h3>
              <p className="text-xs text-blue-600 font-medium mb-4">{tpl.category || 'Uncategorized'}</p>
              
              <div className="text-xs text-gray-500 flex justify-between items-center pt-4 border-t border-gray-100">
                <span>Variables: {"{{name}}"}, {"{{company}}"}</span>
                <span>Edited {tpl.createdAt?.toDate ? tpl.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
              </div>
            </div>
          ))}
          
          <button onClick={handleCreateNew} className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center min-h-[200px] text-gray-500 hover:text-blue-600">
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-medium">Create New Template</span>
          </button>
        </div>
      </div>

      {templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. Are you sure you want to permanently delete this template?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setTemplateToDelete(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
