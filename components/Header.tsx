'use client';

import { Music2, Radio } from 'lucide-react';

interface HeaderProps {
  autoPlayRadio: boolean;
  onToggleAutoPlay: () => void;
}

export function Header({ autoPlayRadio, onToggleAutoPlay }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Music2 size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cloud Beats</h1>
          <p className="text-xs text-zinc-400">Lock screen & background streaming</p>
        </div>
      </div>

      <button
        onClick={onToggleAutoPlay}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          autoPlayRadio
            ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
        }`}
      >
        <Radio size={14} className={autoPlayRadio ? 'animate-pulse' : ''} />
        <span>Autoplay {autoPlayRadio ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
}