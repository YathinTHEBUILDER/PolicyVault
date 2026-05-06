'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Lock,
  ChevronRight,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const categories = [
  { id: 'profile', label: 'Account Profile', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'security', label: 'Security & Access', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'database', label: 'Data Management', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'regional', label: 'Regional Settings', icon: Globe, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function WorkspaceSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings updated successfully');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">System Settings</h1>
        <p className="text-slate-500 font-bold mt-1.5 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          Configure your PolicyVault instance and personal preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                activeTab === cat.id 
                  ? "bg-white shadow-md border border-slate-100 scale-[1.02]" 
                  : "hover:bg-white/50 text-slate-500 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                activeTab === cat.id ? cat.bg : "bg-slate-100 text-slate-400 group-hover:bg-white"
              )}>
                <cat.icon className={cn("w-5 h-5", activeTab === cat.id ? cat.color : "")} />
              </div>
              <span className={cn("text-sm font-bold", activeTab === cat.id ? "text-slate-900" : "")}>
                {cat.label}
              </span>
              {activeTab === cat.id && <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-10 flex-1 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Settings</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Manage your {activeTab} information and preferences.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" placeholder="Yathin Gnaneshwar" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" placeholder="yathin@policyvault.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Organization</label>
                    <input type="text" placeholder="PolicyVault Insurance Brokers" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                    <input type="text" placeholder="Administrator" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                  </div>
                </div>
              )}

              {activeTab !== 'profile' && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <SettingsIcon className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Module Under Maintenance</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">This settings module is being optimized for the latest enterprise-grade security standards.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Finalize Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
