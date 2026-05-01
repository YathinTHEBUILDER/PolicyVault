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
  Download,
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function RenewalsView({ category }: { category: 'motor' | 'health' | 'others' }) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchRenewals();
  }, [daysFilter, searchTerm]);

  async function fetchRenewals() {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const maxExpiry = addDays(new Date(), daysFilter).toISOString().split('T')[0];

    let query: any;
    
    if (category === 'motor') {
      query = supabase
        .from('motor_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name), vehicle:vehicle_id(vehicle_category)')
        .eq('archived', false);
    } else if (category === 'health') {
      query = supabase
        .from('health_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name)')
        .eq('archived', false)
        .gte('expiry_date', today)
        .lte('expiry_date', maxExpiry);
    } else {
      query = supabase
        .from('others_policies')
        .select('*, customer:customer_id(full_name, phone_primary), insurer:insurer_id(name)')
        .eq('archived', false)
        .gte('expiry_date', today)
        .lte('expiry_date', maxExpiry);
    }

    const { data } = await query;
    
    if (data) {
      let processed = data;
      if (category === 'motor') {
        processed = data.filter((p: any) => {
          const odSoon = p.od_expiry_date && p.od_expiry_date >= today && p.od_expiry_date <= maxExpiry;
          const tpSoon = p.tp_expiry_date && p.tp_expiry_date >= today && p.tp_expiry_date <= maxExpiry;
          return odSoon || tpSoon;
        }).map((p: any) => ({ 
          ...p, 
          display_expiry: (p.od_expiry_date && p.od_expiry_date <= maxExpiry) ? p.od_expiry_date : p.tp_expiry_date
        }));
      } else {
        processed = data.map((p: any) => ({ ...p, display_expiry: p.expiry_date }));
      }

      if (searchTerm) {
        processed = processed.filter((p: any) => 
          p.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.policy_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPolicies(processed.sort((a: any, b: any) => new Date(a.display_expiry).getTime() - new Date(b.display_expiry).getTime()));
    }
    setIsLoading(false);
  }

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
          <h1 className="text-2xl font-bold text-slate-900 capitalize">{category} Renewals</h1>
          <p className="text-slate-500 mt-1">Operational pipeline for upcoming {category} expiries.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export List
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {[7, 15, 30, 60].map((d: number) => (
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
        
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by customer or policy number..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry & Urgency</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Remind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map((i: number) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-slate-500 font-medium">No renewals found in this period.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                policies.map((policy) => {
                  const daysLeft = differenceInDays(new Date(policy.display_expiry), new Date());
                  return (
                    <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{policy.customer?.full_name}</p>
                          <p className="text-xs text-slate-500">+91 {policy.customer?.phone_primary}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">{policy.insurer?.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{policy.policy_number}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-slate-900">
                            {category === 'motor' && policy.policy_type === 'first_party' 
                              ? `OD: ${format(new Date(policy.od_expiry_date), 'dd MMM')} / TP: ${format(new Date(policy.tp_expiry_date), 'dd MMM')}`
                              : format(new Date(policy.display_expiry), 'dd MMM yyyy')}
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
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toast.success('SMS Reminder Sent!')}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toast.success('Email Reminder Sent!')}
                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
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
