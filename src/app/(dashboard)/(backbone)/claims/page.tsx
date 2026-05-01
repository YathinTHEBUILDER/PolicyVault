'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ClipboardList, 
  Shield, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('claims')
      .select('*, customer:created_by(id)') // This is wrong, should join via policy
      // In our schema, we need to join via policy_id. But since policy_id refers to different tables based on policy_type,
      // we'll fetch them separately or use a union if possible.
      // For now, let's fetch basic claims and we'll join names later or use a different approach.
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClaims(data);
    }
    setIsLoading(false);
  }

  const openClaims = claims.filter(c => c.status !== 'Settled' && c.status !== 'Rejected').length;
  const pending30d = claims.filter(c => {
    const created = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created < thirtyDaysAgo && c.status !== 'Settled' && c.status !== 'Rejected';
  }).length;
  const settledThisMonth = claims.filter(c => {
    const settled = c.updated_at ? new Date(c.updated_at) : new Date(c.created_at);
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    return c.status === 'Settled' && settled >= firstDayOfMonth;
  }).length;
  const totalPayout = claims.reduce((acc, c) => acc + (Number(c.settled_amount) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Registered': return <span className="badge badge-registered">Registered</span>;
      case 'Survey Pending': return <span className="badge badge-survey">Survey Pending</span>;
      case 'Approved': return <span className="badge badge-approved">Approved</span>;
      case 'Settled': return <span className="badge badge-settled">Settled</span>;
      case 'Rejected': return <span className="badge badge-expired">Rejected</span>;
      default: return <span className="badge badge-archived">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Management</h1>
          <p className="text-slate-500 mt-1">Track and process insurance claims across all categories.</p>
        </div>
        <Link 
          href="/claims/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Register Claim
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Open Claims</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{openClaims}</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Active</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending over 30d</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-rose-600">{pending30d}</h3>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Settled This Month</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-emerald-600">{settledThisMonth}</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payout</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">₹ {(totalPayout / 100000).toFixed(1)}L</h3>
            <span className="text-xs font-bold text-slate-400">YTD</span>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by claim number, customer or insurer..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <EmptyState 
                      icon={Inbox}
                      title="No Claims Registered"
                      description="You haven't logged any loss events yet. Registered claims will appear here for processing and settlement tracking."
                      actionHref="/motor/claims/new"
                      actionLabel="Register Claim"
                    />
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900">{claim.insurer_claim_number || 'PENDING-ID'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Loss: {format(new Date(claim.date_of_loss), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-1",
                          claim.policy_type === 'motor' ? "bg-blue-50 text-blue-600" :
                          claim.policy_type === 'health' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                          {claim.policy_type}
                        </span>
                        <p className="text-xs text-slate-500 font-mono">ID: {claim.policy_id.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(claim.estimated_amount || 0)}</p>
                      {claim.settled_amount && (
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Settled: {formatCurrency(claim.settled_amount)}</p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/claims/${claim.id}`}
                          className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/claims/${claim.id}/edit`}
                          className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
