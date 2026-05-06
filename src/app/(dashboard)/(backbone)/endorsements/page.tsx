'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Shield, 
  Calendar,
  Eye,
  Edit2,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function EndorsementsPage() {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchEndorsements();
  }, []);

  async function fetchEndorsements() {
    const { data } = await supabase.from('endorsements').select('*');
    if (data) setEndorsements(data);
    setIsLoading(false);
  }

  const filteredEndorsements = endorsements.filter(e => {
    const search = searchTerm.toLowerCase();
    return (
      e.change_type?.toLowerCase().includes(search) ||
      e.change_description?.toLowerCase().includes(search) ||
      e.policy_id?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Endorsements</h1>
          <p className="text-slate-500 mt-1">Track modifications and mid-term changes to policies.</p>
        </div>
        <Link 
          href="/endorsements/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Endorsement
        </Link>
      </div>

      {/* Endorsements Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search endorsements by type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy & Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Change Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Added On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredEndorsements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No endorsements found matching "{searchTerm}".</td>
                </tr>
              ) : (
                filteredEndorsements.map((endorsement) => (
                  <tr key={endorsement.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-1",
                          endorsement.policy_type === 'motor' ? "bg-blue-50 text-blue-600" :
                          endorsement.policy_type === 'health' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                          {endorsement.policy_type}
                        </span>
                        <p className="text-xs text-slate-500 font-mono">ID: {endorsement.policy_id.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900">{endorsement.change_type}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{endorsement.change_description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{format(new Date(endorsement.effective_date), 'dd MMM yyyy')}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {format(new Date(endorsement.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
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
    </div>
  );
}
