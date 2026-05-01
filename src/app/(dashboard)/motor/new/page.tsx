'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motorPolicySchema, vehicleSchema } from '@/lib/validations/motor';
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
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';
import { 
  MOTOR_VEHICLE_CATEGORIES, 
  MOTOR_VEHICLE_SUB_TYPES, 
  MOTOR_POLICY_TYPES 
} from '@/lib/constants';

export default function NewMotorPolicyPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [policyDocId, setPolicyDocId] = useState<string | null>(null);
  const [rcDocId, setRcDocId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const policyForm = useForm<z.infer<typeof motorPolicySchema>>({
    resolver: zodResolver(motorPolicySchema) as any,
    defaultValues: {
      ncb_percent: 0,
      ncb_protect: false,
      addons: [],
      policy_type: 'first_party',
      standalone_od_flag: false,
      tp_premium: 0,
      od_premium: 0,
      gst_amount: 0,
    }
  });

  const vehicleForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema) as any
  });

  const selectedCategory = vehicleForm.watch('vehicle_category');
  const policyType = policyForm.watch('policy_type');
  const standaloneOd = policyForm.watch('standalone_od_flag');
  const odPremium = Number(policyForm.watch('od_premium') || 0);
  const tpPremium = Number(policyForm.watch('tp_premium') || 0);
  const gstAmount = Number(policyForm.watch('gst_amount') || 0);
  
  const totalPremium = odPremium + tpPremium + gstAmount;

  useEffect(() => {
    policyForm.setValue('premium_amount', totalPremium);
  }, [totalPremium, policyForm]);

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

  const handleCreateVehicle = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...values, customer_id: selectedCustomer.id })
        .select()
        .single();
      
      if (error) throw error;

      // Link RC document to vehicle
      if (rcDocId) {
        await supabase
          .from('documents')
          .update({ vehicle_id: data.id })
          .eq('id', rcDocId);
      }

      setSelectedVehicle(data);
      setStep(3);
      toast.success('Vehicle added successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePolicy = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('motor_policies').insert({
        ...values,
        customer_id: selectedCustomer.id,
        vehicle_id: selectedVehicle.id,
      }).select().single();

      if (error) throw error;

      // Link document to policy
      if (policyDocId) {
        await supabase
          .from('documents')
          .update({ policy_id: data.id, policy_type: 'motor_policies' })
          .eq('id', policyDocId);
      }

      toast.success('Motor policy issued successfully');
      router.push('/motor');
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
          <Link href="/motor" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Motor Policy</h1>
            <p className="text-slate-500 text-sm">Step {step} of 3 • {step === 1 ? 'Select Customer' : step === 2 ? 'Vehicle Details' : 'Policy Information'}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Which customer is this for?</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or phone..."
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
                  setStep(2);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-600/5 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 border border-slate-100 group-hover:border-blue-100">
                  {c.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{c.full_name}</p>
                  <p className="text-sm text-slate-500">+91 {c.phone_primary}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
            <Link 
              href="/customers/new"
              className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-600">Add New Customer</p>
                <p className="text-sm text-slate-400">If they don't exist yet</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle Details */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Car className="w-6 h-6 text-blue-600" />
                Vehicle Information
              </h2>
              <form onSubmit={vehicleForm.handleSubmit(handleCreateVehicle)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Registration Number *</label>
                  <input 
                    {...vehicleForm.register('registration_number')}
                    placeholder="e.g. DL 01 AB 1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase font-bold tracking-widest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Vehicle Category *</label>
                  <select {...vehicleForm.register('vehicle_category')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="">Select Category</option>
                    {Object.values(MOTOR_VEHICLE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {vehicleForm.formState.errors.vehicle_category && <p className="text-xs text-rose-500 font-bold mt-1">{vehicleForm.formState.errors.vehicle_category.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Vehicle Sub-type *</label>
                  <select 
                    {...vehicleForm.register('vehicle_sub_type')} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3"
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Sub-type</option>
                    {selectedCategory && (MOTOR_VEHICLE_SUB_TYPES as any)[selectedCategory]?.map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {vehicleForm.formState.errors.vehicle_sub_type && <p className="text-xs text-rose-500 font-bold mt-1">{vehicleForm.formState.errors.vehicle_sub_type.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Year of Manufacture *</label>
                  <input type="number" {...vehicleForm.register('year_of_manufacture')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Make *</label>
                  <input {...vehicleForm.register('make')} placeholder="e.g. Maruti Suzuki" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Model *</label>
                  <input {...vehicleForm.register('model')} placeholder="e.g. Swift" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Fuel Type</label>
                  <select {...vehicleForm.register('fuel_type')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900">RC Upload</h3>
              <FileUpload 
                label="Scan Copy of RC"
                category="vehicles"
                customerId={selectedCustomer.id}
                onUploadComplete={(data) => {
                  vehicleForm.setValue('rc_copy_key' as any, data.storage_object_key);
                  setRcDocId(data.id);
                }}
              />
            </div>
            <button 
              onClick={vehicleForm.handleSubmit(handleCreateVehicle)}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next: Policy Details <ArrowLeft className="w-4 h-4 rotate-180" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Policy Details */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Policy Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Policy Type *</label>
                  <select {...policyForm.register('policy_type')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-blue-900">
                    <option value="first_party">First Party (Comprehensive / Package)</option>
                    <option value="third_party">Third Party (Liability Only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Insurer *</label>
                  <select {...policyForm.register('insurer_id')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="">Select Insurer</option>
                    {insurers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Policy Number *</label>
                  <input {...policyForm.register('policy_number')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>

                {policyType === 'first_party' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">IDV (Insured Declared Value) *</label>
                      <input type="number" {...policyForm.register('idv')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">NCB Percentage *</label>
                      <select {...policyForm.register('ncb_percent')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                        {[0, 20, 25, 35, 45, 50].map(v => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">OD Start Date *</label>
                      <input type="date" {...policyForm.register('od_start_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">OD Expiry Date *</label>
                      <input type="date" {...policyForm.register('od_expiry_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">TP Start Date *</label>
                  <input type="date" {...policyForm.register('tp_start_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">TP Expiry Date *</label>
                  <input type="date" {...policyForm.register('tp_expiry_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>

                {policyType === 'first_party' && (
                  <div className="flex items-center gap-3 md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input type="checkbox" {...policyForm.register('standalone_od_flag')} id="standalone" className="w-5 h-5 rounded text-blue-600" />
                    <label htmlFor="standalone" className="text-sm font-bold text-slate-700 cursor-pointer">
                      Standalone OD Policy (TP is with another insurer)
                    </label>
                  </div>
                )}
              </div>

              {policyType === 'first_party' && (
                <div className="border-t border-slate-100 pt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Add-ons</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                      <input type="checkbox" {...policyForm.register('ncb_protect')} id="ncb_protect" className="w-4 h-4" />
                      <label htmlFor="ncb_protect" className="text-xs font-bold cursor-pointer">NCB Protect</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Zero Dep', 'Engine Protection', 'RSA', 'Return to Invoice', 'Key Replacement', 'Consumables', 'Loss of Personal Belongings'].map(addon => (
                      <label key={addon} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                        <input type="checkbox" value={addon} {...policyForm.register('addons')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-xs font-bold text-slate-700">{addon}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Premium Breakdown</h3>
              <div className="space-y-4">
                {policyType === 'first_party' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">OD Premium</label>
                    <input type="number" {...policyForm.register('od_premium')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">TP Premium</label>
                  <input type="number" {...policyForm.register('tp_premium')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">GST Amount</label>
                  <input type="number" {...policyForm.register('gst_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Total Premium</p>
                    <p className="text-xl font-black text-blue-600">₹ {totalPremium.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900">Policy Document</h3>
              <FileUpload 
                label="Policy PDF"
                category="motor-policies"
                customerId={selectedCustomer.id}
                onUploadComplete={(data) => {
                  policyForm.setValue('policy_file_key', data.storage_object_key);
                  setPolicyDocId(data.id);
                }}
              />
            </div>

            <button 
              onClick={policyForm.handleSubmit(handleCreatePolicy)}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Issue Policy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
