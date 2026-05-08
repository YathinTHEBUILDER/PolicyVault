'use client';

import { 
  Users, 
  ShieldCheck, 
  ClipboardCheck, 
  Activity, 
  FileText, 
  ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BackboneDashboard() {
  const params = useParams();
  const workspace = params.workspace as string;
  const baseUrl = `/${workspace}`;

  const stats = [
    { label: 'Global Customers', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: `${baseUrl}/customers` },
    { label: 'Total Policies', value: '3,492', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', link: `${baseUrl}/policies` },
    { label: 'Active Claims', value: '124', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50', link: `${baseUrl}/claims` },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', link: `${baseUrl}/reports` },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Infrastructure Console</h1>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Workspace: {workspace}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.link}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm h-96 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
            <Activity className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Unified System Activity</h2>
          <p className="text-slate-500 max-w-sm">Detailed logs and performance metrics across all domains are being consolidated.</p>
        </div>
        
        <div className="bg-emerald-600 p-10 rounded-[48px] text-white space-y-6 shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
          <FileText className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
          <h3 className="text-2xl font-black leading-tight uppercase tracking-tighter">Master Vault</h3>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed">
            All documents uploaded across workspaces are indexed here for centralized audit and retrieval.
          </p>
          <Link 
            href={`${baseUrl}/documents`}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl"
          >
            Open Vault
          </Link>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
