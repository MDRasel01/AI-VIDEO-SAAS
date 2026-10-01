'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Info } from 'lucide-react';
import { ConfirmModalConfig } from '@/types';

interface ConfirmationModalProps {
  config: ConfirmModalConfig;
  onClose: () => void;
}

export default function ConfirmationModal({ config, onClose }: ConfirmationModalProps) {
  const {
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm Delete',
    cancelLabel = 'Cancel',
    severity = 'danger',
    onConfirm,
  } = config;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) return null;

  const Icon = severity === 'danger' ? Trash2 : severity === 'warning' ? AlertTriangle : Info;
  const accentColorClass =
    severity === 'danger'
      ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
      : severity === 'warning'
      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
      : 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';

  const confirmBtnClass =
    severity === 'danger'
      ? 'bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] shadow-red-500/25'
      : severity === 'warning'
      ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] shadow-amber-500/25'
      : 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-blue-500/25';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#11141A] border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${accentColorClass}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">Destructive action confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="bg-[#080B11] border border-white/[0.06] rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition active:scale-95 ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
