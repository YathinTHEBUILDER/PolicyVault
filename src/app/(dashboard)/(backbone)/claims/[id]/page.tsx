'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Shield, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Loader2,
  IndianRupee,
  MoreVertical,
  Edit2,
  Trash2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [claim, setClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  async function fetchClaimDetails() {
    setIsLoading(true);
    const { data: claimData, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !claimData) {
      toast.error('Claim not found');
      router.push('/claims');
      return;
    }

    // Fetch policy details based on type
    let policyData: any = null;
    if (claimData.policy_type === 'motor') {
      const { data } = await supabase.from('motor_policies').select('*, customer:customer_id(*), vehicle:vehicle_id(*)').eq('id', claimData.policy_id).single();
      policyData = data;
    } else if (claimData.policy_type === 'health') {
      const { data } = await supabase.from('health_policies').select('*, customer:customer_id(*)').eq('id', claimData.policy_id).single();
      policyData = data;
    } else {
      const { data } = await supabase.from('others_policies').select('*, customer:customer_id(*)').eq('id', claimData.policy_id).single();
      policyData = data;
    }

    setClaim({ ...claimData, policy: policyData });
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Claim Intel...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registered': return 'text-blue-600 bg-blue-50';
      case 'Survey Pending': return 'text-amber-600 bg-amber-50';
      case 'Approved': return 'text-indigo-600 bg-indigo-50';
      case 'Settled': return 'text-emerald-600 bg-emerald-50';
      case 'Rejected': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/claims" className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Claim Detail</h1>
              <span className={cn(
                "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                getStatusColor(claim.status)
              )}>
                {claim.status}
              </span>
            </div>
            <p className="text-slate-500 font-bold mt-1">ID: {claim.insurer_claim_number || 'PENDING'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm transition-all">
            <Download className="w-5 h-5" />
          </button>
          <Link 
            href={`/claims/${claim.id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Modify Claim
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-10 space-y-10">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Loss Summary
                  </p>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {claim.claim_type?.replace('_', ' ').toUpperCase() || 'GENERAL CLAIM'}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Loss</p>
                  <p className="text-lg font-black text-slate-900 mt-1">{format(new Date(claim.date_of_loss), 'dd MMMM yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Loss</p>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-slate-900" />
                    <span className="text-2xl font-black text-slate-900">{formatCurrency(claim.estimated_amount || 0)}</span>
                  </div>
                </div>
                {claim.settled_amount && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Settled Amount</p>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-emerald-600" />
                      <span className="text-2xl font-black text-emerald-600">{formatCurrency(claim.settled_amount)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loss Description & Notes</p>
                <div className="bg-slate-50 p-6 rounded-3xl text-slate-600 font-medium leading-relaxed italic border border-slate-100">
                  "{claim.notes || 'No description provided.'}"
                </div>
              </div>
            </div>
          </div>

          {/* Survey & Investigation */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              Investigation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surveyor Assigned</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{claim.surveyor_name || 'NOT ASSIGNED'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{format(new Date(claim.updated_at || claim.created_at), 'dd MMM yy, HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Policy Snap Card */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-8 relative overflow-hidden shadow-2xl">
            <Shield className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Policy Association</p>
              <h3 className="text-xl font-black tracking-tight">{claim.policy?.policy_number || 'N/A'}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Customer</p>
                  <p className="text-sm font-bold mt-1">{claim.policy?.customer?.full_name || 'Unknown'}</p>
                </div>
              </div>

              {claim.policy_type === 'motor' && claim.policy?.vehicle && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vehicle</p>
                    <p className="text-sm font-bold mt-1 uppercase tracking-wider">{claim.policy.vehicle.registration_number}</p>
                  </div>
                </div>
              )}
            </div>

            <Link 
              href={`/${claim.policy_type}/${claim.policy_id}`}
              className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              Inspect Source Policy
            </Link>
          </div>

          {/* Evidence Vault */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Evidence Vault
            </h3>
            <div className="space-y-3">
              {(claim.document_keys || []).length > 0 ? (
                (claim.document_keys as string[]).map((key, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">Doc #{i+1}</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Documents Uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
