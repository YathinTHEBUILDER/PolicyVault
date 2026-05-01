'use client';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
      {/* Subtle background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-rose-600 to-indigo-600 z-50" />
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="w-full max-w-[1400px] px-8 relative z-10">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="py-12 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          PolicyVault © 2026 • Advanced Insurance Operating System
        </p>
      </footer>
    </div>
  );
}
