import { createClient } from '@/lib/supabase/server';
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

export default async function PoliciesPage() {
  const supabase = await createClient();
  const { data: policies, error } = await supabase
    .from('policies')
    .select(`
      *,
      customers (full_name),
      insurers (name)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  const totalPremium = (policies || []).reduce((acc, p) => acc + (Number(p.premium_amount) || 0), 0);
  const activeCount = (policies || []).filter(p => p.status === 'active').length;
  
  // Simple renewal count for now (within next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const pendingRenewals = (policies || []).filter(p => {
    const expiry = new Date(p.expiry_date);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Policies</h1>
          <p className="text-slate-500 mt-1">Consolidated view of all active and expired insurance policies.</p>
        </div>
        <Link 
          href="/policies/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-blue-200 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </Link>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Premium', value: `₹${(totalPremium / 100000).toFixed(1)}L`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Policies', value: activeCount, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Upcoming Renewals', value: pendingRenewals, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies && policies.length > 0 ? (
                policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{policy.policy_number}</p>
                          <p className="text-xs text-slate-500 capitalize">{policy.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {(policy.customers as any)?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {(policy.insurers as any)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">₹{policy.premium_amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Exp: {new Date(policy.expiry_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "badge",
                        policy.status === 'active' ? 'badge-active' :
                        policy.status === 'expired' ? 'badge-expired' :
                        'badge-pending'
                      )}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Shield className="w-12 h-12 opacity-20" />
                      <p>No policies found</p>
                      <Link href="/policies/new" className="text-blue-600 text-sm font-medium hover:underline">
                        Create your first policy
                      </Link>
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
