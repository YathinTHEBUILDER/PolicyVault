'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motorPolicySchema } from '@/lib/validations/motor';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  User, 
  Car, 
  Shield, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  IndianRupee
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';

export default function EditMotorPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const policyForm = useForm({
    resolver: zodResolver(motorPolicySchema),
    defaultValues: {
      policy_type: 'first_party',
      ncb_percent: 0,
      ncb_protect: false,
      standalone_od_flag: false,
      addons: []
    }
  });

  const policyType = policyForm.watch('policy_type');
  const odPremium = Number(policyForm.watch('od_premium')) || 0;
  const tpPremium = Number(policyForm.watch('tp_premium')) || 0;
  const gstAmount = Number(policyForm.watch('gst_amount')) || 0;
  const totalPremium = odPremium + tpPremium + gstAmount;

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  async function fetchInitialData() {
    setIsLoading(true);
    try {
      // 1. Fetch Insurers
      const { data: insData } = await supabase.from('insurers').select('*').order('name');
      setInsurers(insData || []);

      // 2. Fetch Policy Data
      const { data: policy, error: pError } = await supabase
        .from('motor_policies')
        .select('*, customer:customer_id(*), vehicle:vehicle_id(*)')
        .eq('id', id)
        .single();

      if (pError || !policy) throw new Error('Policy not found');

      setSelectedCustomer(policy.customer);
      setSelectedVehicle(policy.vehicle);

      // 3. Pre-fill form
      policyForm.reset({
        policy_number: policy.policy_number,
        insurer_id: policy.insurer_id,
        policy_type: policy.policy_type,
        idv: policy.idv,
        ncb_percent: policy.ncb_percent,
        ncb_protect: policy.ncb_protect,
        od_start_date: policy.od_start_date,
        od_expiry_date: policy.od_expiry_date,
        tp_start_date: policy.tp_start_date,
        tp_expiry_date: policy.tp_expiry_date,
        od_premium: policy.od_premium,
        tp_premium: policy.tp_premium,
        gst_amount: policy.gst_amount,
        standalone_od_flag: policy.standalone_od_flag,
        addons: policy.addons || []
      });

    } catch (error: any) {
      toast.error(error.message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdatePolicy = async (values: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('motor_policies')
        .update({
          ...values,
          premium_amount: totalPremium,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Policy updated successfully');
      router.push('/motor/policies');
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Policy Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Edit Motor Policy</h1>
            <p className="text-slate-500 font-bold mt-1">Updating record for {selectedVehicle?.registration_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-black px-4 py-2 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">
          <Shield className="w-4 h-4" />
          Secure Record Edit
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer & Vehicle Summary */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Holder</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedCustomer?.full_name}</h3>
                <p className="text-sm text-slate-500 font-bold">{selectedCustomer?.phone_primary}</p>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insured Vehicle</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedVehicle?.registration_number}</h3>
                <p className="text-sm text-slate-500 font-bold">{selectedVehicle?.make} {selectedVehicle?.model}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Insurer *</label>
                <select {...policyForm.register('insurer_id')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold">
                  <option value="">Select Insurer</option>
                  {insurers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Policy Number *</label>
                <input {...policyForm.register('policy_number')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">IDV *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" {...policyForm.register('idv')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3 font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">NCB % *</label>
                <select {...policyForm.register('ncb_percent', { valueAsNumber: true })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold">
                  {[0, 20, 25, 35, 45, 50].map(v => <option key={v} value={v}>{v}%</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Own Damage Tenure</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Start Date</label>
                    <input type="date" {...policyForm.register('od_start_date')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Expiry Date</label>
                    <input type="date" {...policyForm.register('od_expiry_date')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Third Party Tenure</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Start Date</label>
                    <input type="date" {...policyForm.register('tp_start_date')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Expiry Date</label>
                    <input type="date" {...policyForm.register('tp_expiry_date')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Premium Breakdown</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">OD Premium</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" {...policyForm.register('od_premium')} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 font-bold text-blue-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">TP Premium</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" {...policyForm.register('tp_premium')} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 font-bold text-blue-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">GST Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" {...policyForm.register('gst_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 font-bold" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">Total Premium</p>
                  <p className="text-xl font-black text-blue-600">{formatCurrency(totalPremium)}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={policyForm.handleSubmit(handleUpdatePolicy)}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
