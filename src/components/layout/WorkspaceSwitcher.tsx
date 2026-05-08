'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  Car, 
  HeartPulse, 
  Package, 
  ChevronDown, 
  Check,
  LayoutDashboard,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const workspaces = [
  {
    id: 'motor',
    label: 'Motor System',
    href: '/motor',
    icon: Car,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    id: 'health',
    label: 'Health System',
    href: '/health',
    icon: HeartPulse,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100'
  },
  {
    id: 'others',
    label: 'Commercial Hub',
    href: '/others',
    icon: Package,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100'
  },
  {
    id: 'backbone',
    label: 'Backbone Management',
    href: '/backbone/customers', // Default backbone entry
    icon: Layers,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  }
];

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const workspaceParam = params.workspace as string;

  // Determine current workspace based on URL params or pathname
  const currentWorkspace = workspaces.find(w => w.id === workspaceParam) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-4 py-2 rounded-2xl flex items-center gap-3 border transition-all duration-300 group",
          currentWorkspace.bg,
          currentWorkspace.border,
          isOpen ? "shadow-lg scale-[1.02]" : "hover:shadow-md"
        )}
      >
        <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-sm", currentWorkspace.color.replace('text', 'bg'))} />
        <currentWorkspace.icon className={cn("w-4 h-4", currentWorkspace.color)} />
        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", currentWorkspace.color)}>
          {currentWorkspace.label}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-300",
          currentWorkspace.color,
          isOpen ? "rotate-180" : ""
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Switch Workspace
            </p>
          </div>
          
          <div className="p-3">
            {workspaces.map((ws) => {
              const isActive = ws.id === currentWorkspace.id;
              return (
                <Link
                  key={ws.id}
                  href={ws.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group mb-1 last:mb-0",
                    isActive 
                      ? "bg-slate-50 cursor-default" 
                      : "hover:bg-slate-50/80 active:scale-95"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    ws.bg,
                    ws.color
                  )}>
                    <ws.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className={cn("text-sm font-bold", isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")}>
                      {ws.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Operational
                    </p>
                  </div>

                  {isActive && (
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", ws.bg, ws.color)}>
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link 
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
            >
              <LayoutDashboard className="w-3 h-3" />
              Exit to Portal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
