'use client';

import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, 
  Shield, 
  FileText, 
  ClipboardList, 
  CreditCard, 
  MessageSquare, 
  Activity,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldAlert,
  Download,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import CustomerDocuments from '@/components/documents/CustomerDocuments';

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'claims', label: 'Claims', icon: ClipboardList },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'timeline', label: 'Timeline', icon: Activity },
];

export default function CustomerProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const [revealedData, setRevealedData] = useState<{ aadhaar_number?: string; pan_number?: string }>({});

  async function revealPII(field: 'aadhaar_number' | 'pan_number') {
    try {
      const { data, error } = await supabase.rpc('reveal_customer_pii', { 
        cust_id: id, 
        field_name: field 
      });
      if (error) throw error;
      
      setRevealedData(prev => ({ ...prev, [field]: data }));
      toast.success(`${field.split('_')[0].toUpperCase()} revealed for 30s`);

      setTimeout(() => {
        setRevealedData(prev => {
          const next = { ...prev };
          delete (next as any)[field];
          return next;
        });
      }, 30000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reveal data');
    }
  }

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id, 
        full_name, 
        dob, 
        gender, 
        phone_primary, 
        phone_alternate, 
        email, 
        address_permanent, 
        address_mailing, 
        occupation, 
        employer, 
        annual_income_bracket, 
        nominee_name, 
        nominee_relationship, 
        vip_flag, 
        blacklist_flag, 
        blacklist_reason, 
        preferred_contact_method, 
        best_time_to_call, 
        do_not_disturb, 
        lead_source,
        aadhaar_number,
        pan_number,
        referred_by:referred_by_customer_id(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Customer not found');
      router.push('/customers');
      return;
    }

    setCustomer(data);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        
        <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start text-center lg:text-left">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl lg:rounded-[32px] flex items-center justify-center text-2xl lg:text-3xl font-bold shadow-xl shadow-blue-600/20">
            {customer.full_name.charAt(0)}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{customer.full_name}</h1>
              <div className="flex justify-center lg:justify-start gap-2">
                {customer.vip_flag && (
                  <span className="badge bg-amber-50 text-amber-600 border border-amber-100 py-1 text-[10px]">
                    <ShieldAlert className="w-3 h-3 mr-1" /> VIP
                  </span>
                )}
                <span className={cn("badge py-1 text-[10px]", customer.blacklist_flag ? 'badge-expired' : 'badge-active')}>
                  {customer.blacklist_flag ? 'Blacklisted' : 'Active Account'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-8">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-xs lg:text-sm font-medium">+91 {customer.phone_primary}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-xs lg:text-sm font-medium truncate max-w-[200px]">{customer.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-xs lg:text-sm font-medium truncate max-w-[200px]">{customer.address_permanent}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <Link 
              href={`/customers/${id}/edit`}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Link>
            <button className="flex-1 lg:flex-none p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 lg:mx-0 lg:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 lg:px-6 py-3 text-xs lg:text-sm font-bold transition-all relative whitespace-nowrap",
              activeTab === tab.id 
                ? "text-blue-600" 
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Personal Details</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                    <p className="font-semibold text-slate-900">{customer.dob || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                    <p className="font-semibold text-slate-900">{customer.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</p>
                    <p className="font-semibold text-slate-900">{customer.occupation || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Income</p>
                    <p className="font-semibold text-slate-900">{customer.annual_income_bracket || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Nominee Information</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nominee Name</p>
                    <p className="font-semibold text-slate-900">{customer.nominee_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Relationship</p>
                    <p className="font-semibold text-slate-900">{customer.nominee_relationship || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">KYC Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/pii">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Aadhaar</p>
                      <p className="font-mono font-bold text-slate-900">
                        {revealedData.aadhaar_number 
                          ? revealedData.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
                          : `XXXX XXXX ${customer.aadhaar_number?.slice(-4) || '----'}`}
                      </p>
                    </div>
                    {!revealedData.aadhaar_number ? (
                      <button 
                        onClick={() => revealPII('aadhaar_number')}
                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                      >
                        Show Full
                      </button>
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                        <Shield className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/pii">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">PAN Card</p>
                      <p className="font-mono font-bold text-slate-900 uppercase">
                        {revealedData.pan_number 
                          ? revealedData.pan_number 
                          : `XXXXX ${customer.pan_number?.slice(-4) || '----'}`}
                      </p>
                    </div>
                    {!revealedData.pan_number ? (
                      <button 
                        onClick={() => revealPII('pan_number')}
                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                      >
                        Show Full
                      </button>
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                        <Shield className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-6 shadow-xl shadow-slate-900/20">
                <h3 className="text-lg font-bold">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-sm font-bold">
                    <Plus className="w-4 h-4 text-blue-400" />
                    New Motor Policy
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-sm font-bold">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    New Health Policy
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-sm font-bold">
                    <Download className="w-4 h-4 text-amber-400" />
                    Export Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <CustomerDocuments customerId={id as string} />
        )}
        
        {/* Placeholder for other tabs */}
        {activeTab !== 'overview' && activeTab !== 'documents' && (
          <div className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              {(() => {
                const ActiveTabIcon = tabs.find(t => t.id === activeTab)?.icon;
                return ActiveTabIcon ? <ActiveTabIcon className="w-8 h-8 text-slate-400" /> : null;
              })()}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Coming Soon</h3>
            <p className="text-slate-500 mt-2 max-w-xs">We are currently building the {activeTab} section for you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
