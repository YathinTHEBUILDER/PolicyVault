'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Shield, 
  HeartPulse, 
  Package, 
  User, 
  ExternalLink,
  Plus,
  Loader2,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import FileUpload from '@/components/ui/FileUpload';

interface CustomerDocumentsProps {
  customerId: string;
}

export default function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  async function fetchDocuments() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setIsLoading(false);
  }

  const handleDownload = async (key: string) => {
    try {
      const res = await fetch(`/api/download?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Download failed');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('motor')) return <Shield className="w-5 h-5 text-blue-600" />;
    if (t.includes('health')) return <HeartPulse className="w-5 h-5 text-rose-600" />;
    if (t.includes('others') || t.includes('commercial')) return <Package className="w-5 h-5 text-indigo-600" />;
    if (t.includes('kyc')) return <User className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Document Vault</h3>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          <Plus className="w-4 h-4" />
          {showUpload ? 'Close' : 'Upload Document'}
        </button>
      </div>

      {showUpload && (
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload 
              label="Policy Document" 
              category="policies" 
              customerId={customerId}
              onUploadComplete={() => {
                fetchDocuments();
                toast.success('Document added to vault');
              }}
            />
            <FileUpload 
              label="KYC / Identity" 
              category="kyc" 
              customerId={customerId}
              onUploadComplete={() => {
                fetchDocuments();
                toast.success('KYC document added');
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-slate-200 animate-spin" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Scanning Vault...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-200" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">No Documents Found</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">Upload policy PDFs, RC copies, or KYC documents to this customer's vault.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                          {getIcon(doc.document_type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{doc.document_name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                        {doc.document_type?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                      {format(new Date(doc.created_at), 'dd MMM yy')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {doc.policy_id && (
                          <Link 
                            href={`/${doc.policy_type?.toLowerCase().split('_')[0]}/${doc.policy_id}`}
                            className="p-2.5 bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all"
                            title="Related Policy"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button 
                          onClick={() => handleDownload(doc.r2_object_key)}
                          className="p-2.5 bg-white border border-slate-100 hover:border-emerald-200 text-slate-400 hover:text-emerald-600 rounded-xl shadow-sm transition-all"
                          title="Secure Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2.5 bg-white border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm transition-all"
                          title="Archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
