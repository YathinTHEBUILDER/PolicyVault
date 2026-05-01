'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit2, 
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';

export default function ClaimsView({ category }: { category: 'motor' | 'health' | 'others' }) {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchClaims();
  }, [searchTerm]);

  async function fetchClaims() {
    setIsLoading(true);
    let query = supabase
      .from('claims')
      .select('*')
      .eq('policy_type', category)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`insurer_claim_number.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setClaims(data);
    }
    setIsLoading(false);
  }

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
          <h1 className="text-2xl font-bold text-slate-900 capitalize">{category} Claims</h1>
          <p className="text-slate-500 mt-1">Manage and track {category} insurance claims.</p>
        </div>
        <Link 
          href={`/${category}/claims/new`}
          className={cn(
            "flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg",
            category === 'motor' ? "bg-blue-600 shadow-blue-600/20" :
            category === 'health' ? "bg-rose-600 shadow-rose-600/20" : "bg-indigo-600 shadow-indigo-600/20"
          )}
        >
          <Plus className="w-4 h-4" />
          Register New Claim
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by claim number or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Claim No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loss Date</th>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No {category} claims found.</td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{claim.insurer_claim_number || 'PENDING-ID'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(claim.date_of_loss), 'dd MMM yyyy')}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(claim.estimated_amount || 0)}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/claims/${claim.id}`}
                          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
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
