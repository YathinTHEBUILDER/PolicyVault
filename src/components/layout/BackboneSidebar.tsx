'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  ClipboardCheck,
  RefreshCcw,
  History,
  PieChart,
  ArrowLeft,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UniversalSearch from './UniversalSearch';

import { useParams } from 'next/navigation';

const backboneItems = [
  { label: 'Global Customers', href: '/customers', icon: Users },
  { label: 'All Policies', href: '/policies', icon: ShieldCheck },
  { label: 'Claims Registry', href: '/claims', icon: ClipboardCheck },
  { label: 'Renewal Pipeline', href: '/renewals', icon: RefreshCcw },
  { label: 'Endorsements', href: '/endorsements', icon: History },
  { label: 'Document Vault', href: '/documents', icon: FileText },
  { label: 'Unified Reports', href: '/reports', icon: PieChart },
];

export function BackboneSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const workspace = params.workspace as string;
  const prefix = workspace ? `/${workspace}` : '';

  return (
    <aside className="w-72 h-screen bg-white text-slate-500 flex flex-col border-r border-slate-200 relative z-50 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] opacity-10 bg-emerald-600 pointer-events-none" />

      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[22px] flex items-center justify-center text-white bg-emerald-600 shadow-xl shadow-emerald-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Backbone</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500"></span>
              Infrastructure
            </p>
          </div>
        </div>
        <div className="mt-8">
          <UniversalSearch />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 space-y-10 py-4 custom-scrollbar">
        <div>
          <div className="flex items-center justify-between px-2 mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Management</p>
            <Link href="/" className="group flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-all">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Exit
            </Link>
          </div>
          <div className="space-y-1.5">
            {backboneItems.map((item) => {
              const fullHref = `${prefix}${item.href}`;
              const isActive = pathname === fullHref || (fullHref !== '/' && pathname.startsWith(fullHref));
              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-emerald-50 text-emerald-600 font-bold border border-emerald-100" 
                      : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500")} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-2">
        <Link href={`${prefix}/settings`} className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
