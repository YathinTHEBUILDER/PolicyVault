import { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Bell, User, Activity, Search, Menu, X } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Absolute Workspace Progress/Accent Bar */}
      <div className={cn("fixed top-0 left-0 right-0 h-1 z-[70] transition-all duration-1000", accentBg)} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={cn(
        "fixed lg:sticky top-0 left-0 h-screen z-[60] transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-2 lg:gap-6">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 lg:hidden"
             >
               {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
             
             <div className="scale-90 lg:scale-100 origin-left">
               <WorkspaceSwitcher />
             </div>
             
             <div className="hidden lg:flex items-center gap-2 text-slate-400">
               <div className="h-4 w-px bg-slate-200 mx-2" />
               <Search className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Workspace Context Isolation Active</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-6">
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

            <button className="p-2 lg:p-3 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 rounded-xl lg:rounded-2xl text-slate-500 transition-all relative group">
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-2 right-2 lg:top-3 lg:right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-4 group cursor-pointer p-1 lg:p-1.5 lg:pr-4 hover:bg-slate-50 rounded-2xl transition-all">
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-all">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-black text-slate-900 leading-none">Gnaneshwar M</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Isolated Mode</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-10 max-w-[1800px] mx-auto w-full overflow-x-hidden">
          <div className="mb-6 lg:mb-10 flex items-center justify-between overflow-x-hidden">
            <div className="scale-75 lg:scale-100 origin-left">
              <Breadcrumbs />
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              Isolated Data Stream
            </div>
          </div>
          <div className="w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
