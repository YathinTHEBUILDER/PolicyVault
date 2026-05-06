'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Shield, 
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    setIsLoading(true);
    const { data } = await supabase
      .from('policies')
      .select(`
        *,
        customers (full_name),
        insurers (name)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    setPolicies(data || []);
    setIsLoading(false);
  }

  const filteredPolicies = policies.filter(policy => {
    const search = searchTerm.toLowerCase();
    return (
      policy.policy_number?.toLowerCase().includes(search) ||
      policy.customers?.full_name?.toLowerCase().includes(search) ||
      policy.insurers?.name?.toLowerCase().includes(search)
    );
  });

  const totalPremium = (policies || []).reduce((acc, p) => acc + (Number(p.premium_amount) || 0), 0);
  const activeCount = (policies || []).filter(p => p.status === 'active').length;
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const pendingRenewals = (policies || []).filter(p => {
    const expiry = new Date(p.expiry_date);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">All Policies</h1>
          <p className="text-slate-500 font-bold mt-1 text-sm lg:text-base">Consolidated view of all active and expired insurance policies.</p>
        </div>
        <Link 
          href="/policies/new"
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </Link>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: 'Total Premium', value: formatCurrency(totalPremium), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Policies', value: activeCount, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Upcoming Renewals', value: pendingRenewals, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl lg:rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl lg:text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by policy number, customer or insurer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-3.5 lg:py-4 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 shadow-sm text-sm"
        />
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{policy.policy_number}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{policy.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                      {policy.customers?.full_name || 'Unknown'}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">
                      {policy.insurers?.name || 'Unknown'}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(policy.premium_amount)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Exp: {new Date(policy.expiry_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                        policy.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        policy.status === 'expired' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-50 text-slate-400'
                      )}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Shield className="w-16 h-16 opacity-20" />
                      <p className="font-bold">No policies found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
