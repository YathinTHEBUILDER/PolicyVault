'use client';

import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
              variant === 'danger' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 py-4 px-6 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg transition-all active:scale-95",
              variant === 'danger' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-slate-900 hover:bg-black shadow-slate-200"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
