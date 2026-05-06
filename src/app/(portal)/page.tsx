'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Car, 
  HeartPulse, 
  Package, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  Activity,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function WorkspacePortal() {
  const [greeting, setGreeting] = useState('Welcome back');
  const [stats, setStats] = useState({
    motor: 0,
    health: 0,
    others: 0,
    isLoading: true
  });
  
  const supabase = createClient();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchGlobalStats();

    // Subscribe to changes on all policy tables to keep the portal stats in sync
    const channels = ['motor_policies', 'health_policies', 'others_policies'].map(table => 
      supabase.channel(`${table}-changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => fetchGlobalStats())
        .subscribe()
    );

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  async function fetchGlobalStats() {
    try {
      const [motor, health, others] = await Promise.all([
        supabase.from('motor_policies').select('id', { count: 'exact', head: true }),
        supabase.from('health_policies').select('id', { count: 'exact', head: true }),
        supabase.from('others_policies').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        motor: motor.count || 0,
        health: health.count || 0,
        others: others.count || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch portal stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }

  const workspaces = [
    {
      id: 'motor',
      title: 'Motor System',
      description: 'Fleet management, vehicle insurance, and settlement pipeline.',
      icon: Car,
      color: 'blue',
      stats: stats.isLoading ? '...' : `${stats.motor} Policies`,
      accent: 'bg-blue-50 text-blue-600',
      shadow: 'shadow-blue-200/20',
      hover: 'hover:border-blue-200'
    },
    {
      id: 'health',
      title: 'Health System',
      description: 'Life covered, clinical admissions, and medical portfolio.',
      icon: HeartPulse,
      color: 'rose',
      stats: stats.isLoading ? '...' : `${stats.health} Policies`,
      accent: 'bg-rose-50 text-rose-600',
      shadow: 'shadow-rose-200/20',
      hover: 'hover:border-rose-200'
    },
    {
      id: 'others',
      title: 'Commercial Hub',
      description: 'Corporate risks, marine, fire, and miscellaneous placements.',
      icon: Package,
      color: 'indigo',
      stats: stats.isLoading ? '...' : `${stats.others} Placements`,
      accent: 'bg-indigo-50 text-indigo-600',
      shadow: 'shadow-indigo-200/20',
      hover: 'hover:border-indigo-200'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center space-y-16 py-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <Sparkles className="w-3 h-3" />
          System Operational
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
          {greeting}, <span className="text-blue-600">Admin.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed">
          Select a dedicated operational workspace to begin your workflow.
          Each domain is isolated for maximum solo-operator efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        {workspaces.map((ws, i) => (
          <Link 
            key={ws.id} 
            href={`/${ws.id}`}
            className={cn(
              "group relative bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 flex flex-col",
              ws.shadow,
              ws.hover
            )}
          >
            {/* Domain Indicator */}
            <div className={cn(
              "w-20 h-20 rounded-[32px] flex items-center justify-center text-white mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500",
              ws.accent
            )}>
              <ws.icon className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{ws.title}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
              {ws.description}
            </p>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {stats.isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {ws.stats}
              </span>
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:w-16 border border-transparent group-hover:border-current",
                ws.accent.split(' ')[0], // Get the bg-XX-50
                ws.accent.split(' ')[1]  // Get the text-XX-600
              )}>
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className={cn(
              "absolute -inset-2 rounded-[60px] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity pointer-events-none",
              ws.accent
            )} />
          </Link>
        ))}
      </div>
    </div>
  );
}
