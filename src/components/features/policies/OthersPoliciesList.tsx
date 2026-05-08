'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Building2, 
  Shield, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  HardHat
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function OthersPoliciesList() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();
  const params = useParams();
  const workspace = params.workspace as string;

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('others_policies')
      .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name)')
      .eq('archived', false)
      .order('expiry_date', { ascending: true });

    if (!error && data) {
      setPolicies(data);
    }
    setIsLoading(false);
  }

  const filteredPolicies = policies.filter(policy => {
    const search = searchTerm.toLowerCase();
    return (
      policy.policy_number?.toLowerCase().includes(search) ||
      policy.customer?.full_name?.toLowerCase().includes(search) ||
      policy.policy_type?.toLowerCase().includes(search) ||
      policy.insurer?.name?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-tight">Expired</span>;
    if (daysLeft <= 15) return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tight">Expiring Soon</span>;
    return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tight">Active</span>;
  };

  const baseUrl = `/${workspace}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commercial Policies</h1>
          <p className="text-slate-500 mt-1">Manage miscellaneous, business, and liability insurance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`${baseUrl}/renewals`}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Check Renewals
          </Link>
          <Link 
            href={`${baseUrl}/claims/new`}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Register Claim
          </Link>
          <Link 
            href={`${baseUrl}/new`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Assets Covered</p>
            <h3 className="text-xl font-bold text-slate-900">124</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Liability Cover</p>
            <h3 className="text-xl font-bold text-slate-900">₹ 42 Cr</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Premium</p>
            <h3 className="text-xl font-bold text-slate-900">{formatCurrency(7850000)}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by customer name, type or policy number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy & Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Insurer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No policies found matching "{searchTerm}".</td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900">{policy.policy_number}</p>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-tight mt-0.5">{policy.policy_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{policy.customer?.full_name}</p>
                      <p className="text-xs text-slate-500">SI: {formatCurrency(policy.sum_insured)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{policy.insurer?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-900">
                          {format(new Date(policy.expiry_date), 'dd MMM yyyy')}
                        </span>
                        {getStatusBadge(policy.expiry_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`${baseUrl}/${policy.id}`}
                          className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`${baseUrl}/${policy.id}/edit`}
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
