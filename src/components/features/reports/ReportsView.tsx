'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Activity,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export function ReportsView() {
  const [stats, setStats] = useState<any>({
    motor: 0,
    health: 0,
    others: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    setIsLoading(true);
    const [m, h, o] = await Promise.all([
      supabase.from('motor_policies').select('*', { count: 'exact', head: true }),
      supabase.from('health_policies').select('*', { count: 'exact', head: true }),
      supabase.from('others_policies').select('*', { count: 'exact', head: true }),
    ]);

    const mCount = m.count || 0;
    const hCount = h.count || 0;
    const oCount = o.count || 0;

    setStats({
      motor: mCount,
      health: hCount,
      others: oCount,
      total: mCount + hCount + oCount
    });
    setIsLoading(false);
  }

  const distributionData = [
    { name: 'Motor', value: stats.motor, color: '#3b82f6' },
    { name: 'Health', value: stats.health, color: '#f43f5e' },
    { name: 'Others', value: stats.others, color: '#6366f1' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Unified Insights</h1>
          <p className="text-slate-500 font-medium">Detailed performance metrics across all operational domains.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Growth Rate', value: '0%', trend: 'No data', up: true, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Retention', value: '0%', trend: 'No data', up: true, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Loss Ratio', value: '0%', trend: 'No data', up: false, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg Premium', value: '₹ 0', trend: 'No data', up: true, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5", stat.bg, stat.color)}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Issuance Trend by Category
              </h3>
            </div>
            <div className="h-[400px]">
              <div className="h-full flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting Trend Data Aggregation</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-600" />
              Portfolio Mix
            </h3>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{stats.total}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Policies</span>
              </div>
            </div>
            <div className="space-y-3">
              {distributionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{((item.value / (stats.total || 1)) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[60px] border border-slate-200 shadow-sm">
           <EmptyState 
             icon={Shield}
             title="No Portfolio Data"
             description="Comprehensive reports and trend analytics will be generated automatically once policies are issued across any workspace."
             actionHref="/"
             actionLabel="Enter a Workspace"
           />
        </div>
      )}
    </div>
  );
}
