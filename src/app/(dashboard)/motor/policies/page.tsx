'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Car, 
  Shield, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  AlertCircle,
  Package
} from 'lucide-react';
import { MOTOR_VEHICLE_CATEGORIES } from '@/lib/constants';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';

export default function MotorDashboardPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>('All');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const supabase = createClient();

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    setIsLoading(true);
    
    // Fetch all policies for counts
    const { data: allData } = await supabase
      .from('motor_policies')
      .select('*, vehicle:vehicle_id(vehicle_category)')
      .eq('archived', false);

    if (allData) {
      const counts: Record<string, number> = {};
      Object.values(MOTOR_VEHICLE_CATEGORIES).forEach(cat => counts[cat] = 0);
      allData.forEach(p => {
        if (p.vehicle?.vehicle_category) {
          counts[p.vehicle.vehicle_category] = (counts[p.vehicle.vehicle_category] || 0) + 1;
        }
      });
      setCategoryCounts(counts);
    }

    let query = supabase
      .from('motor_policies')
      .select('*, customer:customer_id(full_name, phone_primary), vehicle:vehicle_id!inner(*), insurer:insurer_id(name)')
      .eq('archived', false);

    if (selectedCategory !== 'All') {
      query = query.eq('vehicle.vehicle_category', selectedCategory);
    }

    if (policyTypeFilter !== 'All') {
      query = query.eq('policy_type', policyTypeFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPolicies(data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPolicies();
  }, [selectedCategory, policyTypeFilter]);

  const getStatusBadge = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return <span className="badge badge-expired">Expired</span>;
    if (daysLeft <= 15) return <span className="badge badge-expiring">Expiring Soon</span>;
    return <span className="badge badge-active">Active</span>;
  };

  const filteredPolicies = policies.filter(policy => {
    const search = searchTerm.toLowerCase();
    return (
      policy.policy_number?.toLowerCase().includes(search) ||
      policy.vehicle?.registration_number?.toLowerCase().includes(search) ||
      policy.vehicle?.make?.toLowerCase().includes(search) ||
      policy.vehicle?.model?.toLowerCase().includes(search) ||
      policy.customer?.full_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Motor Policies</h1>
          <p className="text-slate-500 mt-1">Manage vehicle insurance policies and renewals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/renewals?category=motor"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Check Renewals
          </Link>
          <Link 
            href="/claims/new?category=motor"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Register Claim
          </Link>
          <Link 
            href="/motor/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Link>
        </div>
      </div>

      {/* Stats - Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(MOTOR_VEHICLE_CATEGORIES).map((cat) => (
          <div 
            key={cat} 
            onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
            className={cn(
              "bg-white p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md",
              selectedCategory === cat ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-slate-200"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
              selectedCategory === cat ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            )}>
              <Car className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{cat}</p>
            <h3 className="text-lg font-black text-slate-900 mt-1">{categoryCounts[cat] || 0}</h3>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by customer name, vehicle or policy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {Object.values(MOTOR_VEHICLE_CATEGORIES).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={policyTypeFilter}
          onChange={(e) => setPolicyTypeFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none"
        >
          <option value="All">All Policy Types</option>
          <option value="first_party">First Party (1P)</option>
          <option value="third_party">Third Party (3P)</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
          <Filter className="w-4 h-4" />
          More
        </button>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy No & Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Insurer & Type</th>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No motor policies found matching your search.</td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900">{policy.policy_number}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Car className="w-3 h-3" />
                          {policy.vehicle?.registration_number} • {policy.vehicle?.make} {policy.vehicle?.model}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{policy.customer?.full_name}</p>
                      <p className="text-xs text-slate-500">{policy.customer?.phone_primary}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{policy.insurer?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[10px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-tight",
                          policy.policy_type === 'first_party' ? "text-emerald-700 bg-emerald-50" : "text-blue-700 bg-blue-50"
                        )}>
                          {policy.policy_type === 'first_party' ? '1P' : '3P'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{policy.policy_type === 'first_party' ? 'Comprehensive' : 'Liability Only'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-bold text-slate-900">
                            {policy.policy_type === 'first_party' 
                              ? `OD: ${format(new Date(policy.od_expiry_date), 'dd MMM yy')}`
                              : `TP: ${format(new Date(policy.tp_expiry_date), 'dd MMM yy')}`
                            }
                          </span>
                        </div>
                        {policy.policy_type === 'first_party' && (
                          <div className="flex items-center gap-2">
                            <div className="w-3.5" />
                            <span className="text-[10px] font-medium text-slate-400">TP: {format(new Date(policy.tp_expiry_date), 'dd MMM yy')}</span>
                          </div>
                        )}
                        {getStatusBadge(policy.policy_type === 'first_party' ? policy.od_expiry_date : policy.tp_expiry_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/motor/${policy.id}`}
                          className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/motor/${policy.id}/edit`}
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
