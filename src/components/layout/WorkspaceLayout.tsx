'use client';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Bell, User, Activity, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  themeColor: string;
  softBg: string;
  label: string;
  accentBg: string;
  borderColor: string;
}

export function WorkspaceLayout({ 
  children, 
  sidebar, 
  themeColor, 
  softBg, 
  label,
  accentBg,
  borderColor
}: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Absolute Workspace Progress/Accent Bar */}
      <div className={cn("fixed top-0 left-0 right-0 h-1 z-[60] transition-all duration-1000", accentBg)} />

      {sidebar}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
             <WorkspaceSwitcher />
             
             <div className="hidden lg:flex items-center gap-2 text-slate-400">
               <div className="h-4 w-px bg-slate-200 mx-2" />
               <Search className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Workspace Context Isolation Active</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-8 mr-8">
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
                 <span className="text-sm font-black text-emerald-600">12ms</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety</span>
                 <span className="text-sm font-black text-slate-900">Encrypted</span>
               </div>
            </div>

            <button className="p-3 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 rounded-2xl text-slate-500 transition-all relative group">
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-4 group cursor-pointer p-1.5 pr-4 hover:bg-slate-50 rounded-2xl transition-all">
              <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-all">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-black text-slate-900 leading-none">Solo Admin</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Isolated Mode</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 max-w-[1800px] mx-auto w-full">
          <div className="mb-10 flex items-center justify-between">
            <Breadcrumbs />
            <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              Isolated Data Stream
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
