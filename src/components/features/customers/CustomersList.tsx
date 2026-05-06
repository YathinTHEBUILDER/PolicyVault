'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  User, 
  Phone, 
  MapPin,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { useParams } from 'next/navigation';

export function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const params = useParams();
  const workspace = params.workspace as string;

  useEffect(() => {
    fetchCustomers();

    const channel = supabase
      .channel('customers-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => fetchCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchCustomers() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) setCustomers(data);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_primary?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const baseUrl = workspace ? `/${workspace}/customers` : '/customers';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Global CRM</h1>
          <p className="text-slate-500 font-medium mt-1">Unified customer directory across all operational domains.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link 
            href={`${baseUrl}/new`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-black">System Sync Failure</p>
            <p className="text-xs font-bold opacity-80">{error}</p>
          </div>
          <button onClick={() => fetchCustomers()} className="text-xs font-black uppercase tracking-widest hover:underline">Re-Sync</button>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Connectivity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarded</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded-lg w-40"></div></td>
                    <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded-lg w-48"></div></td>
                    <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded-lg w-20"></div></td>
                    <td className="px-8 py-6"><div className="h-5 bg-slate-100 rounded-lg w-32"></div></td>
                    <td className="px-8 py-6"></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20">
                    <EmptyState 
                      icon={User}
                      title="Registry Empty"
                      description="No customer records found. Initialize your database by adding your first client profile."
                      actionHref={`${baseUrl}/new`}
                      actionLabel="Add Customer"
                    />
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                          {customer.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                            {customer.full_name}
                            {customer.vip_flag && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="VIP Account"></span>}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {customer.occupation || 'Private Sector'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-300" />
                          +91 {customer.phone_primary}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{customer.email || 'no-email@vault.com'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        customer.blacklist_flag ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {customer.blacklist_flag ? 'Blacklisted' : 'Clear'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">
                      {format(new Date(customer.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <Link 
                          href={`${baseUrl}/${customer.id}`}
                          className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100"
                          title="Detailed Audit"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`${baseUrl}/${customer.id}/edit`}
                          className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100"
                          title="Modify Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100"
                          title="Archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
