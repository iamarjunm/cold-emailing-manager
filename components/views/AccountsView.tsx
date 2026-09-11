'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Plus, AlertCircle, CheckCircle2, Server, Loader2, X } from 'lucide-react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/db';

export function AccountsView() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('Google Workspace');
  const [dailyLimit, setDailyLimit] = useState(50);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAccounts = React.useCallback(() => {
    setIsLoading(true);
    getAccounts()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAccounts();
  }, [loadAccounts]);

  const handleAddNew = () => {
    setEditingAccount(null);
    setEmail('');
    setProvider('Google Workspace');
    setPassword('');
    setDailyLimit(50);
    setIsConnecting(true);
  };

  const handleConfigure = (acc: any) => {
    setEditingAccount(acc);
    setEmail(acc.email);
    setProvider(acc.provider);
    setPassword(acc.password || '');
    setDailyLimit(acc.dailyLimit || 50);
    setIsConnecting(true);
  };

  const handleDelete = async () => {
    if (editingAccount && confirm('Are you sure you want to remove this account?')) {
      await deleteAccount(editingAccount.id);
      setIsConnecting(false);
      loadAccounts();
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, { email, provider, password, dailyLimit });
      } else {
        await createAccount({ email, provider, password, dailyLimit });
      }
      setIsConnecting(false);
      loadAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isConnecting) {
    return (
      <div className="p-8 h-full flex flex-col bg-[#FAFAFA]">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">
                {editingAccount ? 'Configure Account' : 'Connect Account'}
              </h2>
              <p className="text-sm text-gray-500">Authorize and manage an email sending account.</p>
            </div>
            <button onClick={() => setIsConnecting(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleConnect} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sales@yourcompany.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Google Workspace">Google Workspace (Gmail)</option>
                <option value="Outlook">Microsoft Outlook</option>
                <option value="SMTP">Custom SMTP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter App Password (not your main password)"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" /> What is an App Password?
                </p>
                <p className="text-blue-700/90 text-xs mb-2 leading-relaxed">
                  An App Password is a 16-digit passcode that gives an app permission to access your Google Account. You must use this instead of your regular password.
                </p>
                <ol className="list-decimal list-inside text-xs text-blue-700/90 space-y-1">
                  <li>Go to your <strong>Google Account</strong> settings.</li>
                  <li>Select <strong>Security</strong> on the left panel.</li>
                  <li>Under &quot;How you sign in to Google,&quot; select <strong>2-Step Verification</strong>.</li>
                  <li>At the bottom, select <strong>App passwords</strong>.</li>
                  <li>Enter a name (e.g., &quot;OutreachPro&quot;) and click <strong>Create</strong>.</li>
                  <li>Copy the 16-digit code and paste it above.</li>
                </ol>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Sending Limit</label>
              <input 
                type="number" 
                required
                min="1"
                max="2000"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">We recommend starting with 20-30 for new accounts to warm them up.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              {editingAccount ? (
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              ) : <div></div>}
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsConnecting(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingAccount ? 'Save Changes' : 'Connect Account')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-1">Email Accounts</h2>
          <p className="text-sm text-gray-500">Connect and manage the email addresses you send campaigns from.</p>
        </div>
        <button onClick={() => setIsConnecting(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Connect Account
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3 text-blue-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Warm up your accounts!</p>
          <p className="text-blue-700/80">To avoid landing in spam, ensure your accounts are properly warmed up. New accounts should send a maximum of 20-30 emails per day, gradually increasing over 2-3 weeks.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage Today</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading accounts...
                  </td>
                </tr>
              )}
              {!isLoading && accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                    No accounts connected yet. Click &quot;Connect Account&quot; to start.
                  </td>
                </tr>
              )}
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{acc.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {acc.provider === 'SMTP' ? <Server className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      {acc.provider}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Connected
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 w-32">
                      <div className="flex justify-between text-xs text-gray-600 font-medium">
                        <span>{acc.sentToday}</span>
                        <span>/ {acc.dailyLimit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(acc.sentToday / acc.dailyLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleConfigure(acc)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Configure
                    </button>
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
