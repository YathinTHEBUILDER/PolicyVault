'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  HeartPulse, 
  Shield, 
  Activity, 
  TrendingUp, 
  Users, 
  Plus, 
  ArrowRight,
  Clock,
  UserPlus,
  Stethoscope,
  ShieldAlert,
  Calendar,
  Loader2,
  Inbox
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HealthDashboard() {
  const [stats, setStats] = useState<any>({
    totalPolicies: 0,
    totalLives: 0,
    activeClaims: 0,
    renewals30Days: 0,
    totalSI: 0,
    mixData: [],
    recentExpiries: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchHealthStats();
  }, []);

  async function fetchHealthStats() {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const [policies, claims, renewals] = await Promise.all([
        supabase.from('health_policies').select('*', { count: 'exact' }).eq('archived', false),
        supabase.from('claims').select('*', { count: 'exact' }).eq('category', 'health').eq('status', 'pending'),
        supabase.from('health_policies')
          .select('*, customer:customer_id(full_name)')
          .lte('expiry_date', next30Days)
          .gte('expiry_date', today)
          .limit(5)
      ]);

      const data = policies.data || [];
      const totalLives = data.reduce((acc, p) => acc + (p.members?.length || 0), 0);
      const totalSI = data.reduce((acc, p) => acc + (Number(p.sum_insured) || 0), 0);
      const floater = data.filter(p => p.floater_flag).length;
      const individual = data.filter(p => !p.floater_flag).length;

      setStats({
        totalPolicies: policies.count || 0,
        totalLives,
        activeClaims: claims.count || 0,
        renewals30Days: renewals.data?.length || 0,
        totalSI,
        mixData: data.length > 0 ? [
          { name: 'Floater Plans', value: floater, color: '#f43f5e' },
          { name: 'Individual Plans', value: individual, color: '#fda4af' }
        ] : [],
        recentExpiries: renewals.data || []
      });
    } catch (error) {
      console.error('Failed to fetch health stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-rose-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving Clinical Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <HeartPulse className="w-10 h-10 text-rose-600" />
            Health & Life Console
          </h1>
          <p className="text-slate-500 font-bold mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            Health Management System Active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/health/claims/new"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-[20px] font-black text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Stethoscope className="w-4 h-4" />
            New Admission
          </Link>
          <Link 
            href="/health/new"
            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-[20px] font-black text-sm shadow-xl shadow-rose-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Issue Policy
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Lives Covered', value: stats.totalLives, sub: 'Total Individuals', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Active Policies', value: stats.totalPolicies, sub: 'Health Portfolio', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ongoing Claims', value: stats.activeClaims, sub: 'Pending Settlement', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Sum Insured', value: `₹${(stats.totalSI / 10000000).toFixed(1)}Cr`, sub: 'Total Risk Managed', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
            <p className="text-xs text-slate-400 font-bold mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Operational Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Retention Pipeline */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-600" />
              Health Expiry Pipeline
            </h3>
            <Link href="/health/renewals" className="text-xs font-black text-rose-600 hover:underline uppercase tracking-widest">Manage Renewals</Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentExpiries.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-rose-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-rose-600 transition-colors">
                    {r.customer?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{r.customer?.full_name}</p>
                    <p className="text-xs text-slate-500 font-medium">Policy: {r.policy_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{format(new Date(r.expiry_date), 'dd MMM yy')}</p>
                  <p className="text-[10px] font-black text-rose-500 uppercase">Renewal Due</p>
                </div>
              </div>
            ))}
            {stats.recentExpiries.length === 0 && (
              <EmptyState 
                icon={Inbox}
                title="Pipeline Clean"
                description="No health policies are due for renewal in the next 30 days. Your clinical portfolio is currently stable."
              />
            )}
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            Plan Distribution
          </h3>
          
          {stats.totalPolicies > 0 ? (
            <>
              <div className="flex-1 h-[250px] relative mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.mixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={12}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.mixData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{color: '#0f172a', fontWeight: 'bold'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900">{stats.totalPolicies}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plans</span>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                {stats.mixData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12">
               <EmptyState 
                 icon={HeartPulse}
                 title="No Health Data"
                 description="Protect your first life. Add a health policy to start tracking Sum Insured and plan mix."
                 actionHref="/health/new"
                 actionLabel="Issue Policy"
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
