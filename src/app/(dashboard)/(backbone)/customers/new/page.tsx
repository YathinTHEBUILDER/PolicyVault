'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormValues } from '@/lib/validations/customer';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
import FileUpload from '@/components/ui/FileUpload';

export default function NewCustomerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [customerId] = useState(crypto.randomUUID());
  const router = useRouter();
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
      // Duplicate detection
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_primary', values.phone_primary)
        .single();

      if (existing) {
        toast.error('A customer with this phone number already exists');
        setIsLoading(false);
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;
      
      // Sanitize values: convert empty strings to null for optional fields
      const sanitizedValues = Object.entries(values).reduce((acc: any, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {});

      const { error } = await supabase.from('customers').insert({
        ...sanitizedValues,
        id: customerId,
        created_by: user?.id,
      });

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw new Error(`[${error.code}] ${error.message}`);
      }

      toast.success('Customer added successfully');
      router.push('/customers');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/customers"
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Customer</h1>
            <p className="text-slate-500 text-sm">Create a new customer profile in the system.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Customer
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name *</label>
                <input 
                  {...register('full_name')}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                {errors.full_name && <p className="text-xs text-rose-500 font-medium ml-1">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    {...register('dob')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                <select 
                  {...register('gender')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Primary Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    {...register('phone_primary')}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
                {errors.phone_primary && <p className="text-xs text-rose-500 font-medium ml-1">{errors.phone_primary.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    {...register('email')}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 font-medium ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Lead Source</label>
                <select 
                  {...register('lead_source')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Source</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Digital">Digital</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Address Details
            </h2>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Permanent Address</label>
                <textarea 
                  {...register('address_permanent')}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                  placeholder="Full permanent address"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Mailing Address</label>
                <textarea 
                  {...register('address_mailing')}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                  placeholder="Full mailing address (if different)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              CRM Controls
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-blue-900">VIP Customer</p>
                <p className="text-[10px] text-blue-600 font-medium">Prioritize this customer</p>
              </div>
              <input 
                type="checkbox"
                {...register('vip_flag')}
                className="w-5 h-5 rounded-lg border-blue-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Aadhaar Number</label>
              <input 
                {...register('aadhaar_number')}
                maxLength={12}
                placeholder="12-digit Aadhaar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest"
              />
              {errors.aadhaar_number && <p className="text-xs text-rose-500 font-medium ml-1">{errors.aadhaar_number.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">PAN Card Number</label>
              <input 
                {...register('pan_number')}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest uppercase"
              />
              {errors.pan_number && <p className="text-xs text-rose-500 font-medium ml-1">{errors.pan_number.message}</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Professional Info
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Occupation</label>
                <input 
                  {...register('occupation')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Employer</label>
                <input 
                  {...register('employer')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Income Bracket</label>
                <select 
                  {...register('annual_income_bracket')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Bracket</option>
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
