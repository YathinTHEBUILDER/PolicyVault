'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Shield, 
  User, 
  Car,
  FileText, 
  Loader2,
  IndianRupee,
  Edit2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Package,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function MotorPolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      .from('motor_policies')
      .select('*, customer:customer_id(*), vehicle:vehicle_id(*), insurer:insurer_id(name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Policy not found');
      router.push('/motor/policies');
      return;
    }

    setPolicy(data);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Decoding Fleet Intelligence...</p>
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
          <Link href="/motor/policies" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{policy.policy_number}</h1>
              <span className={cn(
                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest bg-blue-50 text-blue-600"
              )}>
                Motor {policy.policy_type === 'first_party' ? '1P' : '3P'}
              </span>
            </div>
            <p className="text-slate-500 font-bold mt-1">{policy.insurer?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/motor/${policy.id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all"
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
                <Shield className="w-5 h-5 text-blue-600" />
                Coverage Intelligence
              </h2>
              {getStatusBadge(policy.policy_type === 'first_party' ? policy.od_expiry_date : policy.tp_expiry_date)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IDV</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(policy.idv || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NCB</p>
                <p className="text-lg font-black text-slate-900">{policy.ncb_percent}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium</p>
                <p className="text-lg font-black text-blue-600">{formatCurrency(policy.premium_amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(policy.gst_amount || 0)}</p>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Validity (OD)
                </p>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">
                    {policy.od_start_date ? format(new Date(policy.od_start_date), 'dd MMM yy') : 'N/A'} - {policy.od_expiry_date ? format(new Date(policy.od_expiry_date), 'dd MMM yy') : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-rose-500" />
                  Validity (TP)
                </p>
                <div className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                  <span className="text-sm font-bold text-slate-600">
                    {policy.tp_start_date ? format(new Date(policy.tp_start_date), 'dd MMM yy') : 'N/A'} - {policy.tp_expiry_date ? format(new Date(policy.tp_expiry_date), 'dd MMM yy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {(policy.addons || []).length > 0 && (
              <div className="pt-10 border-t border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {(policy.addons as string[]).map(addon => (
                    <span key={addon} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                      {addon}
                    </span>
                  ))}
                  {policy.ncb_protect && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                      NCB Protect
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Intel Card */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <Car className="w-5 h-5 text-blue-600" />
              Vehicle Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</p>
                <p className="text-lg font-black text-slate-900 mt-1 uppercase tracking-wider">{policy.vehicle?.registration_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Make / Model</p>
                <p className="text-lg font-black text-slate-900 mt-1">{policy.vehicle?.make} {policy.vehicle?.model}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                <p className="text-lg font-black text-slate-900 mt-1">{policy.vehicle?.vehicle_category}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</p>
                <p className="text-lg font-black text-slate-900 mt-1">{policy.vehicle?.year_of_manufacture}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Type</p>
                <p className="text-lg font-black text-slate-900 mt-1">{policy.vehicle?.fuel_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engine / Chassis</p>
                <p className="text-xs font-bold text-slate-400 mt-1 truncate">{policy.vehicle?.engine_number || 'N/A'} / {policy.vehicle?.chassis_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Snap Card */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-8 relative overflow-hidden shadow-2xl">
            <User className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Customer Profile</p>
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
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Address</p>
                  <p className="text-xs font-bold mt-1 text-white/60 line-clamp-2">{policy.customer?.address}</p>
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
              <FileText className="w-5 h-5 text-blue-600" />
              Document Vault
            </h3>
            <div className="space-y-3">
              {policy.policy_file_key ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Policy Copy</span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Policy Copy</p>
                </div>
              )}
              {policy.vehicle?.rc_copy_key && (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">RC Copy</span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
