'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShieldCheck, 
  ClipboardCheck, 
  RefreshCcw, 
  History,
  ArrowLeft,
  Settings,
  LogOut,
  Users,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UniversalSearch from './UniversalSearch';

export function OthersSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const workspace = params.workspace as string || 'others';

  const baseUrl = `/${workspace}`;

  const othersItems = [
    { label: 'Dashboard', href: baseUrl, icon: LayoutDashboard },
    { label: 'Placements', href: `${baseUrl}/policies`, icon: ShieldCheck },
    { label: 'Renewals Center', href: `${baseUrl}/renewals`, icon: RefreshCcw },
    { label: 'Commercial Claims', href: `${baseUrl}/claims`, icon: ClipboardCheck },
    { label: 'Endorsements', href: `${baseUrl}/endorsements`, icon: History },
  ];

  return (
    <aside className="w-72 h-screen bg-white text-slate-500 flex flex-col border-r border-slate-200 relative z-50 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[120px] opacity-10 bg-indigo-600 pointer-events-none" />

      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[22px] flex items-center justify-center text-white bg-indigo-600 shadow-xl shadow-indigo-600/20">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Commercial</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-indigo-500"></span>
              Operational
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commercial Console</p>
            <Link href="/" className="group flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Exit
            </Link>
          </div>
          <div className="space-y-1.5">
            {othersItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100" 
                      : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Infrastructure</p>
          <div className="space-y-1">
            <Link href={`${baseUrl}/customers`} className={cn(
              "flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors",
              pathname.includes('/customers') ? "text-indigo-600 bg-indigo-50 rounded-xl" : "text-slate-500 hover:text-indigo-600"
            )}>
              <Users className="w-4 h-4" /> Global CRM
            </Link>
            <Link href={`${baseUrl}/documents`} className={cn(
              "flex items-center gap-3 px-4 py-2 text-xs font-bold transition-colors",
              pathname.includes('/documents') ? "text-indigo-600 bg-indigo-50 rounded-xl" : "text-slate-500 hover:text-indigo-600"
            )}>
              <FileText className="w-4 h-4" /> Master Vault
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-2">
        <Link href={`${baseUrl}/settings`} className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
