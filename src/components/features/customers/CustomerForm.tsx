'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormValues } from '@/lib/validations/customer';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export function CustomerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const workspace = params.workspace as string;
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      vip_flag: false,
    }
  });

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting customer creation...', values);

      // Duplicate detection
      const { data: existing, error: checkError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_primary', values.phone_primary)
        .maybeSingle();

      if (checkError) {
        console.error('Check Error:', checkError);
        throw new Error(`Database check failed: ${checkError.message}`);
      }

      if (existing) {
        toast.error('A customer with this phone number already exists');
        setIsLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) console.warn('Auth check failed:', userError);
      
      // Sanitize values: convert empty strings to null for optional fields
      const sanitizedValues = Object.entries(values).reduce((acc: any, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {});

      const newCustomerId = crypto.randomUUID();

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...sanitizedValues,
          id: newCustomerId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw new Error(`[${error.code}] ${error.message}`);
      }

      console.log('✅ Customer created successfully:', data);
      toast.success('Customer added successfully');
      
      const baseUrl = workspace ? `/${workspace}/customers` : '/customers';
      router.push(baseUrl);
      router.refresh();
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.message || 'Failed to add customer');
    } finally {
      setIsLoading(false);
    }
  };

  const baseUrl = workspace ? `/${workspace}/customers` : '/customers';

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href={baseUrl}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all text-slate-500 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Onboard Client</h1>
            <p className="text-slate-500 font-medium mt-1">Initialize a new master profile in the global registry.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Finalize & Persist
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              Identity Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                <input 
                  {...register('full_name')}
                  placeholder="e.g. Yathin Gnaneshwar"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                />
                {errors.full_name && <p className="text-xs text-rose-500 font-black ml-1 uppercase tracking-tighter">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    {...register('dob')}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender Identification</label>
                <select 
                  {...register('gender')}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Primary Mobile *</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    {...register('phone_primary')}
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
                {errors.phone_primary && <p className="text-xs text-rose-500 font-black ml-1 uppercase tracking-tighter">{errors.phone_primary.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    {...register('email')}
                    placeholder="email@vault.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Acquisition Source</label>
                <select 
                  {...register('lead_source')}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                >
                  <option value="">Select Source</option>
                  <option value="Walk-in">Direct Walk-in</option>
                  <option value="Referral">Network Referral</option>
                  <option value="Digital">Digital Platform</option>
                  <option value="Cold Call">Outreach</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <MapPin className="w-5 h-5" />
              </div>
              Location Intelligence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Residence</label>
                <textarea 
                  {...register('address_permanent')}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 resize-none"
                  placeholder="Full structural address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operational Mailing Address</label>
                <textarea 
                  {...register('address_mailing')}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 resize-none"
                  placeholder="Leave empty if same as permanent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              Risk Controls
            </h2>
            
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900">VIP Designation</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Priority Handling</p>
              </div>
              <input 
                type="checkbox"
                {...register('vip_flag')}
                className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar (PII)</label>
              <input 
                {...register('aadhaar_number')}
                maxLength={12}
                placeholder="0000 0000 0000"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-black text-slate-900 tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">PAN Card (PII)</label>
              <input 
                {...register('pan_number')}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-black text-slate-900 tracking-widest uppercase"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Briefcase className="w-5 h-5" />
              </div>
              Socio-Economic
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Primary Occupation</label>
                <input 
                  {...register('occupation')}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Employer Name</label>
                <input 
                  {...register('employer')}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Income Bracket</label>
                <select 
                  {...register('annual_income_bracket')}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                >
                  <option value="">Select Range</option>
                  <option value="Under 5L">Under 5L</option>
                  <option value="5L - 10L">5L - 10L</option>
                  <option value="10L - 25L">10L - 25L</option>
                  <option value="Above 25L">Above 25L</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
