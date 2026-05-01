'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { claimSchema } from '@/lib/validations/claim';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  Package, 
  Shield, 
  Calendar,
  AlertCircle,
  FileText,
  Plus,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';

export default function NewOthersClaimPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      category: 'others',
      status: 'Registered',
      document_keys: [],
    }
  });

  const documentKeys = watch('document_keys');

  async function searchPolicies() {
    if (searchTerm.length < 3) return;
    
    const { data } = await supabase
      .from('others_policies')
      .select('*, customer:customer_id(full_name, phone_primary)')
      .ilike('policy_number', `%${searchTerm}%`)
      .limit(5);

    if (data) setPolicies(data);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('claims').insert({
        ...values,
        category: 'others',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast.success('Commercial claim registered successfully');
      router.push('/others/claims');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/others/claims" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              Register Commercial Claim
            </h1>
            <p className="text-slate-500 text-sm font-medium">Domain: Miscellaneous & Commercial System</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {!selectedPolicy ? (
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col items-center text-center max-w-md mx-auto gap-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/5">
                  <Shield className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Locate Commercial Risk</h2>
                <p className="text-slate-500 text-sm">Fetch policy details for Fire, Marine, CAR, or Liability placements.</p>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search Placements..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchPolicies();
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {policies.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setSelectedPolicy(p);
                      setValue('policy_id', p.id);
                      setValue('policy_type', 'others');
                    }}
                    className="w-full p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-xl transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-black text-slate-900 text-lg">{p.policy_number}</p>
                      <p className="text-sm text-slate-500 font-bold">{p.customer?.full_name}</p>
                      <p className="text-xs text-slate-400 mt-1">{p.policy_type} • Premium: ₹{(p.premium_amount / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Risk Incident Report
                </h2>
                <button 
                  onClick={() => setSelectedPolicy(null)}
                  className="text-xs font-black text-indigo-600 hover:underline"
                >
                  Change Placement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date of Incident *</label>
                  <input type="date" {...register('date_of_loss')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nature of Loss</label>
                  <input {...register('claim_type')} placeholder="e.g. Fire Damage, Burglary" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Est. Financial Impact</label>
                  <input type="number" {...register('estimated_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold" placeholder="₹" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assessor / Adjuster</label>
                  <input {...register('surveyor_name')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold" placeholder="Firm Name" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Loss Description & Asset Impact</label>
                  <textarea {...register('notes')} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 resize-none font-medium" placeholder="Technical details of the loss, affected assets, business interruption..." />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {selectedPolicy && (
            <>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Placement Papers</h3>
                <div className="space-y-4">
                  <FileUpload 
                    label="Loss Assessment Report"
                    category="claims"
                    customerId={selectedPolicy.customer_id}
                    onUploadComplete={(key) => {
                      const current = watch('document_keys') || [];
                      setValue('document_keys', [...current, key]);
                    }}
                  />
                  <FileUpload 
                    label="Internal Incident Log"
                    category="claims"
                    customerId={selectedPolicy.customer_id}
                    onUploadComplete={(key) => {
                      const current = watch('document_keys') || [];
                      setValue('document_keys', [...current, key]);
                    }}
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Log Incident</>}
              </button>
            </>
          )}

          {!selectedPolicy && (
            <div className="bg-indigo-600 p-10 rounded-[48px] text-white space-y-6 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
              <Package className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
              <h3 className="text-2xl font-black leading-tight">Commercial System<br/>Audit</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                Log technical incidents and financial impacts for corporate and commercial placements.
              </p>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                  <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-black">1</div>
                  <span className="text-sm font-bold">Pick Placement</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-sm opacity-50">
                  <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-black">2</div>
                  <span className="text-sm font-bold">Log Impact</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
