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
  ClipboardList, 
  Shield, 
  Calendar,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';

export default function NewClaimPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [policyType, setPolicyType] = useState<'motor' | 'health' | 'others'>('motor');
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>([]);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat === 'motor' || cat === 'health' || cat === 'others') {
        setPolicyType(cat);
        fetchRecentPolicies(cat);
      } else {
        fetchRecentPolicies('motor');
      }
    }
  }, []);

  async function fetchRecentPolicies(type: string) {
    let table = '';
    if (type === 'motor') table = 'motor_policies';
    else if (type === 'health') table = 'health_policies';
    else table = 'others_policies';

    const { data } = await supabase
      .from(table)
      .select('*, customer:customer_id(full_name, phone_primary)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setPolicies(data);
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      status: 'Registered',
      document_keys: [],
    }
  });

  const documentKeys = watch('document_keys');

  async function searchPolicies(term: string) {
    if (term.length === 0) {
      fetchRecentPolicies(policyType);
      return;
    }
    if (term.length < 3) return;
    
    setIsSearching(true);
    let table = '';
    if (policyType === 'motor') table = 'motor_policies';
    else if (policyType === 'health') table = 'health_policies';
    else table = 'others_policies';

    const { data } = await supabase
      .from(table)
      .select('*, customer:customer_id(full_name, phone_primary)')
      .ilike('policy_number', `%${term}%`)
      .limit(5);

    if (data) setPolicies(data);
    setIsSearching(false);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('claims').insert({
        ...values,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }).select().single();

      if (error) throw error;

      // Link documents
      if (uploadedDocIds.length > 0) {
        await supabase
          .from('documents')
          .update({ claim_id: data.id })
          .in('id', uploadedDocIds);
      }

      toast.success('Claim registered successfully');
      router.push('/claims');
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
          <Link href="/claims" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Register New Claim</h1>
            <p className="text-slate-500 text-sm">Log a new loss event against an active policy.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Policy Search */}
          {!selectedPolicy ? (
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col items-center text-center max-w-md mx-auto gap-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/5">
                  <Shield className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Find the Policy</h2>
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                  {['motor', 'health', 'others'].map(t => (
                    <button 
                      key={t}
                      onClick={() => {
                        const newType = t as any;
                        setPolicyType(newType);
                        setPolicies([]);
                        setSearchTerm('');
                        fetchRecentPolicies(newType);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${policyType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Enter Policy Number..."
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      searchPolicies(val);
                    }}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg font-bold"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {policies.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setSelectedPolicy(p);
                      setValue('policy_id', p.id);
                      setValue('policy_type', policyType);
                    }}
                    className="w-full p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{p.policy_number}</p>
                      <p className="text-sm text-slate-500 font-medium">{p.customer?.full_name} • {p.customer?.phone_primary}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                  Claim Information
                </h2>
                <button 
                  onClick={() => setSelectedPolicy(null)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Change Policy
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Date of Loss *</label>
                  <input type="date" {...register('date_of_loss')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Claim Type</label>
                  <input {...register('claim_type')} placeholder="e.g. Accidental Damage" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Estimated Amount</label>
                  <input type="number" {...register('estimated_amount')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Surveyor Name</label>
                  <input {...register('surveyor_name')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Internal Notes</label>
                  <textarea {...register('notes')} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 resize-none" placeholder="Initial findings, customer version of event, etc." />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {selectedPolicy && (
            <>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900">Claim Documents</h3>
                <div className="space-y-4">
                  <FileUpload 
                    label="Loss Event Evidence (Photos/Videos)"
                    category="claims"
                    customerId={selectedPolicy.customer_id}
                    onUploadComplete={(data) => {
                      const current = watch('document_keys') || [];
                      setValue('document_keys', [...current, data.storage_object_key]);
                      setUploadedDocIds(prev => [...prev, data.id]);
                    }}
                  />
                  <FileUpload 
                    label="Estimate / Initial Bill"
                    category="claims"
                    customerId={selectedPolicy.customer_id}
                    onUploadComplete={(data) => {
                      const current = watch('document_keys') || [];
                      setValue('document_keys', [...current, data.storage_object_key]);
                      setUploadedDocIds(prev => [...prev, data.id]);
                    }}
                  />
                </div>
                
                {(documentKeys?.length || 0) > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Attached Files ({documentKeys?.length || 0})</p>
                    <div className="space-y-2">
                      {documentKeys?.map((k: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span className="truncate flex-1">{k.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-[32px] shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ClipboardList className="w-6 h-6" /> Register Claim</>}
              </button>
            </>
          )}

          {!selectedPolicy && (
            <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-4 shadow-2xl shadow-blue-600/20">
              <h3 className="text-xl font-bold">Important Note</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Claims can only be registered against active policies. If a policy is expired, you may need to check the grace period or contact the insurer.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">1</div>
                  <span className="text-xs font-bold">Search Policy Number</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl opacity-50">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">2</div>
                  <span className="text-xs font-bold">Fill Loss Details</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
