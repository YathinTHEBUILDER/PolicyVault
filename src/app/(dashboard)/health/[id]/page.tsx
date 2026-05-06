'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Shield, 
  User, 
  HeartPulse,
  FileText, 
  Loader2,
  IndianRupee,
  Edit2,
  Download,
  Activity,
  Package,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function HealthPolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [policy, setPolicy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPolicyDetails();
  }, [id]);

  async function fetchPolicyDetails() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('health_policies')
      .select('*, customer:customer_id(*), insurer:insurer_id(name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Policy not found');
      router.push('/health/policies');
      return;
    }

    setPolicy(data);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-rose-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Vital Signs...</p>
      </div>
    );
  }

  const getStatusBadge = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return <span className="badge badge-expired">Expired</span>;
    if (daysLeft <= 15) return <span className="badge badge-expiring">Expiring Soon</span>;
    return <span className="badge badge-active">Active</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/health/policies" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{policy.policy_number}</h1>
              <span className={cn(
                "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest bg-rose-50 text-rose-600"
              )}>
                Health Care
              </span>
            </div>
            <p className="text-slate-500 font-bold mt-1">{policy.insurer?.name} • {policy.plan_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/health/${policy.id}/edit`}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/20 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit Policy
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Policy Overview */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Medical Coverage Data
              </h2>
              {getStatusBadge(policy.expiry_date)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sum Insured</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(policy.sum_insured || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium</p>
                <p className="text-lg font-black text-rose-600">{formatCurrency(policy.premium_amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{policy.policy_type || 'Individual'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Included</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(policy.gst_amount || 0)}</p>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Policy Tenure
                </p>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">
                    {format(new Date(policy.start_date), 'dd MMM yyyy')} - {format(new Date(policy.expiry_date), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  Risk Protection
                </p>
                <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                  <span className="text-sm font-bold text-emerald-700">Comprehensive Health Cover</span>
                </div>
              </div>
            </div>

            {(policy.covered_members || []).length > 0 && (
              <div className="pt-10 border-t border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Covered Beneficiaries</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(policy.covered_members as any[]).map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-sm font-bold text-slate-700">{member.name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{member.relation || 'Dependent'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Snap Card */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-8 relative overflow-hidden shadow-2xl">
            <User className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Primary Insured</p>
              <h3 className="text-xl font-black tracking-tight">{policy.customer?.full_name}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mobile</p>
                  <p className="text-sm font-bold mt-1">+91 {policy.customer?.phone_primary}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold mt-1 lowercase truncate">{policy.customer?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Link 
              href={`/customers/${policy.customer_id}`}
              className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              View Full Profile
            </Link>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-600" />
              Document Vault
            </h3>
            <div className="space-y-3">
              {policy.policy_file_key ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-rose-600 group-hover:border-rose-100 transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Policy Copy</span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Policy Copy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
