'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { othersPolicySchema } from '@/lib/validations/others';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  User, 
  Building2, 
  Shield, 
  CheckCircle2,
  MapPin,
  Construction,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';
import { POLICY_TYPES } from '@/lib/constants';

export default function NewOthersPolicyPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [policyDocId, setPolicyDocId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(othersPolicySchema)
  });

  const selectedPolicyType = watch('policy_type');

  useEffect(() => {
    fetchInsurers();
  }, []);

  async function fetchInsurers() {
    const { data } = await supabase.from('insurers').select('id, name');
    if (data) setInsurers(data);
  }

  async function searchCustomers() {
    if (searchTerm.length < 3) return;
    const { data } = await supabase
      .from('customers')
      .select('*')
      .ilike('full_name', `%${searchTerm}%`)
      .limit(5);
    if (data) setCustomers(data);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('others_policies').insert({
        ...values,
        customer_id: selectedCustomer.id,
      }).select().single();

      if (error) throw error;

      // Link document
      if (policyDocId) {
        await supabase
          .from('documents')
          .update({ policy_id: data.id, policy_type: 'others_policies' })
          .eq('id', policyDocId);
      }

      toast.success('Policy issued successfully');
      router.push('/others');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/others" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Policy (Others)</h1>
            <p className="text-slate-500 text-sm">Step {step} of 2 • {step === 1 ? 'Select Customer' : 'Policy Information'}</p>
          </div>
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/5">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select Client</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by company or owner name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchCustomers();
                }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg font-medium"
              />
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

      {/* Step 2: Policy Details */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Asset & Policy Info
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Policy Type *</label>
                  <select {...register('policy_type')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-blue-900">
                    <option value="">Select Category</option>
                    {POLICY_TYPES.others.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Insurer *</label>
                  <select {...register('insurer_id')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="">Select Insurer</option>
                    {insurers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Policy Number *</label>
                  <input {...register('policy_number')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>

                {/* Dynamic Fields based on Type */}
                {(selectedPolicyType?.includes('Fire') || selectedPolicyType?.includes('Shop') || selectedPolicyType?.includes('Office') || selectedPolicyType?.includes('Contractor')) && (
                  <>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Property Location / Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input {...register('location')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1 text-slate-500">Construction Type</label>
                      <div className="relative">
                        <Construction className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input {...register('construction_type')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3" />
                      </div>
                    </div>
                  </>
                )}

                {selectedPolicyType?.includes('Marine') && (
                  <>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Voyage / Route Details</label>
                      <input {...register('location')} placeholder="e.g. Mundra to Hamburg" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Incoterms / Basis</label>
                      <input {...register('construction_type')} placeholder="e.g. CIF + 10%" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                    </div>
                  </>
                )}

                {(selectedPolicyType?.includes('Liability') || selectedPolicyType?.includes('Directors')) && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Business / Profession Description</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input {...register('asset_description')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3" />
                    </div>
                  </div>
                )}

                {selectedPolicyType?.includes('Workmen') && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">No. of Employees Covered</label>
                    <input type="number" {...register('location')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Sum Insured *</label>
                  <input type="number" {...register('sum_insured')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Deductible / Excess</label>
                  <input type="number" {...register('deductible')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
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
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Premium Details</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Premium Amount</label>
                  <input type="number" {...register('premium_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xl text-indigo-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">GST</label>
                  <input type="number" {...register('gst_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Policy Document</h3>
              <FileUpload 
                label="Policy PDF"
                category="others-policies"
                customerId={selectedCustomer.id}
                onUploadComplete={(data) => {
                  setValue('policy_file_key', data.storage_object_key);
                  setPolicyDocId(data.id);
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-3xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Issue Policy</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
