'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/5 rounded-full blur-[128px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/20">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">PolicyVault</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Insurance CRM</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-300"
                placeholder="admin@policyvault.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-widest transition-colors">
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 group mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign Into Vault
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Secured by <span className="text-slate-900">Supabase Auth</span>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-xs leading-relaxed opacity-50">
        Authorized personnel only • Access is monitored
      </p>
    </div>
  );
}
