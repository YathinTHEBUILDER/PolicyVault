'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
      <Link 
        href="/"
        className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
      >
        <Home className="w-3.5 h-3.5" />
        Overview
      </Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {isLast ? (
              <span className="text-slate-900">{label}</span>
            ) : (
              <Link 
                href={href}
                className="hover:text-blue-600 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
