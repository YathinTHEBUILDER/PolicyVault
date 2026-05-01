'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, User, Shield, HeartPulse, Package, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = useCallback(async (val: string) => {
    if (val.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);

    const [customers, motor, health, others] = await Promise.all([
      supabase.from('customers').select('id, full_name, phone_primary').ilike('full_name', `%${val}%`).limit(3),
      supabase.from('motor_policies').select('id, policy_number, vehicle_id').ilike('policy_number', `%${val}%`).limit(2),
      supabase.from('health_policies').select('id, policy_number, plan_name').ilike('policy_number', `%${val}%`).limit(2),
      supabase.from('others_policies').select('id, policy_number, policy_type').ilike('policy_number', `%${val}%`).limit(2),
    ]);

    const allResults = [
      ...(customers.data || []).map(r => ({ ...r, type: 'customer', title: r.full_name, sub: r.phone_primary, icon: User, link: `/customers/${r.id}` })),
      ...(motor.data || []).map(r => ({ ...r, type: 'motor', title: r.policy_number, sub: 'Motor Policy', icon: Shield, link: `/motor/${r.id}` })),
      ...(health.data || []).map(r => ({ ...r, type: 'health', title: r.policy_number, sub: r.plan_name, icon: HeartPulse, link: `/health/${r.id}` })),
      ...(others.data || []).map(r => ({ ...r, type: 'others', title: r.policy_number, sub: r.policy_type, icon: Package, link: `/others/${r.id}` })),
    ];

    setResults(allResults);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const navigate = (link: string) => {
    router.push(link);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 transition-all w-64 text-sm"
    >
      <Search className="w-4 h-4" />
      <span>Search anything...</span>
      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-slate-400/20 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search className="w-6 h-6 text-blue-600" />
          <input 
            autoFocus
            type="text"
            placeholder="Type to search policies, customers or documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-xl font-medium text-slate-900 placeholder:text-slate-300"
          />
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.length < 3 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">Search for policies, clients or claims</p>
              <p className="text-xs text-slate-400">Type at least 3 characters to see results</p>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-300">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-400">Try a different keyword or policy number</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((res, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(res.link)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                    <res.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-all">{res.title}</p>
                    <p className="text-xs text-slate-400 font-medium">{res.sub}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-sm">↵</kbd> Select
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-sm">↑↓</kbd> Navigate
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">PolicyVault Search v2.0</span>
        </div>
      </div>
    </div>
  );
}
