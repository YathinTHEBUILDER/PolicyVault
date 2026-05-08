'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthPolicySchema } from '@/lib/validations/health';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  User, 
  HeartPulse, 
  Shield, 
  Plus,
  Trash2,
  Users,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';
import { POLICY_TYPES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/format';

export default function HealthPolicyForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [tpas, setTpas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [policyDocId, setPolicyDocId] = useState<string | null>(null);
  const [tpaDocId, setTpaDocId] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const workspace = params.workspace as string;
  const supabase = createClient();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(healthPolicySchema),
    defaultValues: {
      floater_flag: false,
      members: [{ name: '', age: '', gender: 'Male', relationship: 'Self' }],
      maternity_flag: false,
      opd_flag: false,
      critical_illness_flag: false,
      pa_rider_flag: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members' as any
  });

  useEffect(() => {
    fetchData();
    fetchRecentCustomers();
  }, []);

  async function fetchRecentCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setCustomers(data);
  }

  async function fetchData() {
    const { data: ins } = await supabase.from('insurers').select('id, name');
    const { data: tpa } = await supabase.from('tpas').select('id, name');
    if (ins) setInsurers(ins);
    if (tpa) setTpas(tpa);
  }

  async function searchCustomers(term: string) {
    if (term.length === 0) {
      fetchRecentCustomers();
      return;
    }
    if (term.length < 2) return;
    
    setIsSearching(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .or(`full_name.ilike.%${term}%,phone_primary.ilike.%${term}%`)
      .limit(5);
    
    if (data) setCustomers(data);
    setIsSearching(false);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('health_policies').insert({
        ...values,
        customer_id: selectedCustomer.id,
      }).select().single();

      if (error) throw error;

      if (policyDocId) {
        await supabase
          .from('documents')
          .update({ policy_id: data.id, policy_type: 'health_policies' })
          .eq('id', policyDocId);
      }
      if (tpaDocId) {
        await supabase
          .from('documents')
          .update({ policy_id: data.id, policy_type: 'health_policies', document_type: 'tpa-card' })
          .eq('id', tpaDocId);
      }

      toast.success('Health policy added successfully');
      router.push(`/${workspace}/policies`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const baseUrl = `/${workspace}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`${baseUrl}/policies`} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Health Policy</h1>
            <p className="text-slate-500 text-sm">Step {step} of 2 • {step === 1 ? 'Select Customer' : 'Policy & Member Details'}</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-600/5">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select Customer</h2>
            <p className="text-slate-500">Search for an existing customer to link this policy.</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  searchCustomers(val);
                }}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg font-medium"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {customers.map((c) => (
              <button 
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c);
                  setValue('customer_id', c.id);
                  setStep(2);
                }}
                className="flex items-center gap-4 p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-600/5 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 border border-slate-100 group-hover:border-blue-100">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{c.full_name}</p>
                  <p className="text-sm text-slate-500 font-medium">+91 {c.phone_primary}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Policy Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Insurer *</label>
                  <select {...register('insurer_id')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="">Select Insurer</option>
                    {insurers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Plan Name *</label>
                  <input {...register('plan_name')} placeholder="e.g. Optima Secure" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1 text-blue-600 uppercase text-[10px] tracking-widest">TPA (Administrator)</label>
                  <select {...register('tpa_id')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-medium">
                    <option value="">No TPA (Direct)</option>
                    {tpas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Policy Number *</label>
                  <input {...register('policy_number')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Sum Insured *</label>
                  <input type="number" {...register('sum_insured')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Start Date *</label>
                  <input type="date" {...register('start_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Expiry Date *</label>
                  <input type="date" {...register('expiry_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Covered Members
                </h2>
                <button 
                  type="button"
                  onClick={() => append({ name: '', age: '', gender: 'Male', relationship: 'Other' })}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                        <input {...register(`members.${index}.name` as any)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
                        <input type="number" {...register(`members.${index}.age` as any)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                        <select {...register(`members.${index}.gender` as any)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Premium & Extras</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gross Premium</label>
                  <input type="number" {...register('premium_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xl text-blue-600" />
                </div>
                
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                    <input type="checkbox" {...register('floater_flag')} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Floater Plan</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                    <input type="checkbox" {...register('maternity_flag')} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Maternity Cover</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                    <input type="checkbox" {...register('opd_flag')} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">OPD Benefit</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <FileUpload 
                label="Policy PDF"
                category="health-policies"
                customerId={selectedCustomer.id}
                onUploadComplete={(data) => {
                  setValue('policy_file_key', data.storage_object_key);
                  setPolicyDocId(data.id);
                }}
              />
              <FileUpload 
                label="TPA Card"
                category="health-policies"
                customerId={selectedCustomer.id}
                onUploadComplete={(data) => {
                  setValue('tpa_card_key', data.storage_object_key);
                  setTpaDocId(data.id);
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-3xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Issue Health Policy</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
