'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RenewalsPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat === 'motor' || cat === 'health' || cat === 'others') {
        setCategoryFilter(cat);
      }
    }
  }, []);

  useEffect(() => {
    fetchRenewals();
  }, [daysFilter, categoryFilter]);

  async function fetchRenewals() {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const maxExpiry = addDays(new Date(), daysFilter).toISOString().split('T')[0];

    let allRenewals: any[] = [];

    // Fetch Motor
    if (categoryFilter === 'all' || categoryFilter === 'motor') {
      const { data: motor } = await supabase
        .from('motor_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name), vehicle:vehicle_id(vehicle_category)')
        .eq('archived', false);
      
      if (motor) {
        const filtered = motor.filter(p => {
          const odSoon = p.od_expiry_date && p.od_expiry_date >= today && p.od_expiry_date <= maxExpiry;
          const tpSoon = p.tp_expiry_date && p.tp_expiry_date >= today && p.tp_expiry_date <= maxExpiry;
          return odSoon || tpSoon;
        });
        allRenewals = [...allRenewals, ...filtered.map(p => ({ 
          ...p, 
          category: 'Motor',
          display_expiry: (p.od_expiry_date && p.od_expiry_date <= maxExpiry) ? p.od_expiry_date : p.tp_expiry_date
        }))];
      }
    }

    // Fetch Health
    if (categoryFilter === 'all' || categoryFilter === 'health') {
      const { data: health } = await supabase
        .from('health_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name)')
        .gte('expiry_date', today)
        .lte('expiry_date', maxExpiry)
        .eq('archived', false);
      if (health) allRenewals = [...allRenewals, ...health.map(p => ({ ...p, category: 'Health', display_expiry: p.expiry_date }))];
    }

    // Fetch Others
    if (categoryFilter === 'all' || categoryFilter === 'others') {
      const { data: others } = await supabase
        .from('others_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name)')
        .gte('expiry_date', today)
        .lte('expiry_date', maxExpiry)
        .eq('archived', false);
      if (others) allRenewals = [...allRenewals, ...others.map(p => ({ ...p, category: 'Others', display_expiry: p.expiry_date }))];
    }

    setPolicies(allRenewals.sort((a, b) => new Date(a.display_expiry).getTime() - new Date(b.display_expiry).getTime()));
    setIsLoading(false);
  }

  const filteredRenewals = policies.filter(policy => {
    const search = searchTerm.toLowerCase();
    return (
      policy.customer?.full_name?.toLowerCase().includes(search) ||
      policy.customer?.phone_primary?.includes(searchTerm) ||
      policy.policy_number?.toLowerCase().includes(search) ||
      policy.vehicle?.registration_number?.toLowerCase().includes(search)
    );
  });

  const getUrgencyColor = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft <= 7) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (daysLeft <= 15) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tighter uppercase">Renewals Center</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Manage and follow up on policies expiring soon.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Selected
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, phone, policy or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {[7, 15, 30, 60].map(d => (
                <button 
                  key={d}
                  onClick={() => setDaysFilter(d)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                    daysFilter === d ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {d} Days
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {['all', 'motor', 'health', 'others'].map(c => (
                <button 
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    categoryFilter === c 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer & Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Cat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry & Urgency</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Remind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredRenewals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <EmptyState 
                      icon={CheckCircle2}
                      title="No matching renewals"
                      description="We couldn't find any policies expiring soon that match your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredRenewals.map((policy) => {
                  const daysLeft = differenceInDays(new Date(policy.display_expiry), new Date());
                  return (
                    <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                            {policy.customer?.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{policy.customer?.full_name}</p>
                            <p className="text-xs text-slate-500">+91 {policy.customer?.phone_primary}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit",
                            policy.category === 'Motor' ? "bg-blue-50 text-blue-600" :
                            policy.category === 'Health' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                          )}>
                            {policy.category}
                          </span>
                          <p className="text-sm font-medium text-slate-700 mt-1">{policy.insurer?.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{policy.policy_number}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{policy.vehicle?.vehicle_category || '-'}</p>
                      </td>
                      <td className="px-6 py-5">
                           <div className="flex flex-col gap-1">
                             <p className="text-sm font-bold text-slate-900">
                               {policy.category === 'Motor' && policy.policy_type === 'first_party' 
                                 ? `${policy.od_expiry_date ? 'OD: ' + format(new Date(policy.od_expiry_date), 'dd MMM') : ''}${policy.od_expiry_date && policy.tp_expiry_date ? ' / ' : ''}${policy.tp_expiry_date ? 'TP: ' + format(new Date(policy.tp_expiry_date), 'dd MMM') : ''}`
                                 : policy.display_expiry ? format(new Date(policy.display_expiry), 'dd MMM yyyy') : '-'}
                             </p>
                             <div className={cn(
                               "text-[10px] font-black px-2 py-0.5 rounded-full border w-fit flex items-center gap-1",
                               getUrgencyColor(policy.display_expiry)
                             )}>
                               <Clock className="w-3 h-3" />
                               {daysLeft} days left
                             </div>
                           </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(policy.premium_amount || 0)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Incl. GST</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toast.success('SMS Reminder Sent!')}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-200"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toast.success('Email Reminder Sent!')}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-200"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
