'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function EndorsementsView({ category }: { category: 'motor' | 'health' | 'others' }) {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEndorsements();
  }, []);

  async function fetchEndorsements() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('endorsements')
      .select('*')
      .eq('policy_type', category)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEndorsements(data);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">{category} Endorsements</h1>
          <p className="text-slate-500 mt-1">Track modifications and mid-term changes for {category} policies.</p>
        </div>
        <Link 
          href={`/${category}/endorsements/new`}
          className={cn(
            "flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg",
            category === 'motor' ? "bg-blue-600 shadow-blue-600/20" :
            category === 'health' ? "bg-rose-600 shadow-rose-600/20" : "bg-indigo-600 shadow-indigo-600/20"
          )}
        >
          <Plus className="w-4 h-4" />
          Add Endorsement
        </Link>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Change Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : endorsements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No {category} endorsements found.</td>
                </tr>
              ) : (
                endorsements.map((endorsement) => (
                  <tr key={endorsement.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{endorsement.change_type}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{endorsement.change_description}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-900">{format(new Date(endorsement.effective_date), 'dd MMM yyyy')}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
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
