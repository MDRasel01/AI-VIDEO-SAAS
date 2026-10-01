'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface IdBadgeProps {
  id: string;
  className?: string;
  titlePrefix?: string;
}

export default function IdBadge({ id, className = '', titlePrefix = 'Click to copy ID' }: IdBadgeProps) {
  const [copied, setCopied] = useState(false);

  const cleanId = id.startsWith('#') ? id.slice(1) : id;
  const displayId = `#${cleanId}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(cleanId);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`${titlePrefix}: ${cleanId}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all duration-150 active:scale-95 cursor-pointer select-none group ${
        copied
          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
          : 'bg-pink-500/15 hover:bg-pink-500/25 text-pink-400 hover:text-pink-300 border border-pink-500/30 hover:border-pink-500/50'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-2.5 h-2.5 text-emerald-400 animate-in zoom-in-50" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>{displayId}</span>
          <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </button>
  );
}
