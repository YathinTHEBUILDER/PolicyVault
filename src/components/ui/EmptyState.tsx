'use client';

import { LucideIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionHref, 
  actionLabel,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center space-y-6 animate-in fade-in zoom-in duration-700",
      className
    )}>
      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
        <Icon className="w-10 h-10" />
      </div>
      
      <div className="max-w-sm space-y-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actionHref && actionLabel && (
        <Link 
          href={actionHref}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200/50 border border-slate-200"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
