'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { endorsementSchema } from '@/lib/validations/endorsement';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Search, 
  Shield, 
  Calendar,
  FileEdit,
  Plus,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/ui/FileUpload';

export default function NewEndorsementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [policyType, setPolicyType] = useState<'motor' | 'health' | 'others'>('motor');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat === 'motor' || cat === 'health' || cat === 'others') {
        setPolicyType(cat);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(endorsementSchema),
  });

  async function searchPolicies() {
    if (searchTerm.length < 3) return;
    
    let table = '';
    if (policyType === 'motor') table = 'motor_policies';
    else if (policyType === 'health') table = 'health_policies';
    else table = 'others_policies';

    const { data } = await supabase
      .from(table)
      .select('*, customer:customer_id(full_name, id)')
      .ilike('policy_number', `%${searchTerm}%`)
      .limit(5);

    if (data) setPolicies(data);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('endorsements').insert({
        ...values,
      });

      if (error) throw error;

      toast.success('Endorsement recorded successfully');
      router.push('/endorsements');
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
          <Link href="/endorsements" className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Endorsement</h1>
            <p className="text-slate-500 text-sm">Record a mid-term policy change.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {!selectedPolicy ? (
            <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/5">
                  <Search className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Find Policy</h2>
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                  {['motor', 'health', 'others'].map(t => (
                    <button 
                      key={t}
                      onClick={() => {
                        setPolicyType(t as any);
                        setPolicies([]);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${policyType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  placeholder="Policy Number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchPolicies();
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center font-bold text-lg"
                />
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
                    className="w-full p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.policy_number}</p>
                      <p className="text-sm text-slate-500">{p.customer?.full_name}</p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <FileEdit className="w-6 h-6 text-blue-600" />
                  Endorsement Details
                </h2>
                <button onClick={() => setSelectedPolicy(null)} className="text-xs font-bold text-blue-600">Change Policy</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Type of Change *</label>
                  <select {...register('change_type')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3">
                    <option value="">Select Type</option>
                    <option value="Address Change">Address Change</option>
                    <option value="Name Correction">Name Correction</option>
                    <option value="Nominee Addition">Nominee Addition/Change</option>
                    <option value="Vehicle Addition">Vehicle Details Correction</option>
                    <option value="Premium Correction">Premium / GST Correction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Effective Date *</label>
                  <input type="date" {...register('effective_date')} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Description of Change *</label>
                  <textarea {...register('change_description')} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 resize-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {selectedPolicy && (
            <>
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900">Endorsement Copy</h3>
                <FileUpload 
                  label="Upload Signed Endorsement"
                  category="endorsements"
                  customerId={selectedPolicy.customer_id}
                  onUploadComplete={(key) => setValue('document_key', key)}
                />
              </div>

              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-[32px] shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Save Endorsement</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
