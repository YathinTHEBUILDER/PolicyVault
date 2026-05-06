'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  MoreVertical,
  Shield,
  HeartPulse,
  Package,
  User,
  Trash2,
  Loader2,
  ExternalLink,
  Inbox,
  AlertCircle,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{id: string, storageKey: string} | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*, customer:customer_id(full_name)')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    } else if (error) {
      toast.error('Failed to load documents');
    }
    setIsLoading(false);
  }

  const getCategoryIcon = (docType: string) => {
    const type = docType?.toLowerCase() || '';
    if (type.includes('motor')) return <Shield className="w-5 h-5 text-blue-600" />;
    if (type.includes('health')) return <HeartPulse className="w-5 h-5 text-rose-600" />;
    if (type.includes('others') || type.includes('commercial')) return <Package className="w-5 h-5 text-indigo-600" />;
    if (type.includes('kyc')) return <User className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const handleDownload = async (key: string, filename: string) => {
    try {
      const res = await fetch(`/api/download?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Download failed');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteClick = (id: string, storageKey: string) => {
    setSelectedDoc({ id, storageKey });
    setIsDeleteModalOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!selectedDoc) return;
    const { id, storageKey } = selectedDoc;
    
    try {
      // 1. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('policy-vault')
        .remove([storageKey]);

      if (storageError) {
        console.error('Storage deletion failed:', storageError);
      }

      // 2. Delete from Database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Document permanently deleted');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' 
      ? true 
      : doc.document_type?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesSearch = searchQuery === '' 
      ? true 
      : doc.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <FileText className="w-10 h-10 text-slate-900" />
            Central Document Vault
          </h1>
          <p className="text-slate-500 font-bold mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Supabase High-Speed Storage Active • Secure Zero-Trust Access
          </p>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'Universal Vault', icon: Layers, color: 'bg-slate-100 text-slate-600' },
          { id: 'motor', label: 'Motor Docs', icon: Shield, color: 'bg-blue-50 text-blue-600' },
          { id: 'health', label: 'Health Docs', icon: HeartPulse, color: 'bg-rose-50 text-rose-600' },
          { id: 'others', label: 'Commercial Docs', icon: Package, color: 'bg-indigo-50 text-indigo-600' },
        ].map(cat => (
          <button 
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              "p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 group",
              filter === cat.id 
                ? "bg-white border-slate-900 shadow-2xl shadow-slate-900/5 ring-4 ring-slate-50" 
                : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
            )}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Vault Interface */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search documents, customers, or policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-white border border-slate-100 rounded-full">
            <Shield className="w-3 h-3 text-emerald-500" />
            Verified Documents: {documents.filter(d => d.verified_flag).length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">No Documents Found</h3>
                        <p className="text-sm text-slate-500">All uploaded policy and KYC files will appear here automatically.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          {getCategoryIcon(doc.document_type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate max-w-[240px] group-hover:text-blue-600 transition-colors">
                            {doc.document_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                              {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {doc.verified_flag && (
                              <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-600 uppercase">
                                <Shield className="w-2 h-2" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{doc.customer?.full_name}</span>
                        <Link 
                          href={`/customers/${doc.customer_id}`}
                          className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest mt-1 flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-2 h-2" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-full shadow-sm">
                        {doc.document_type?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-600">{format(new Date(doc.created_at), 'dd MMM yyyy')}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{format(new Date(doc.created_at), 'hh:mm a')}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {doc.policy_id && (
                          <Link
                            href={`/${doc.policy_type?.toLowerCase().split('_')[0]}/${doc.policy_id}`}
                            className="p-3 bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm"
                            title="Related Policy"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button 
                          onClick={() => handleDownload(doc.storage_object_key, doc.document_name)}
                          className="p-3 bg-white border border-slate-100 hover:border-emerald-200 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all shadow-sm"
                          title="Secure Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(doc.id, doc.storage_object_key)}
                          className="p-3 bg-white border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete?"
        description="This action is critical and irreversible. The document will be purged from the database and storage permanently."
        confirmText="Purge Document"
        variant="danger"
      />
    </div>
  );
}
