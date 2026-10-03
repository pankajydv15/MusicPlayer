'use client';

import { Moon, X } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  activeMinutes: number | null;
  remainingSeconds: number | null;
  onSelectTimer: (minutes: number | null) => void;
  onClose: () => void;
}

const TIMER_OPTIONS = [15, 30, 45, 60];

export function SleepTimerModal({
  isOpen,
  activeMinutes,
  remainingSeconds,
  onSelectTimer,
  onClose,
}: SleepTimerModalProps) {
  if (!isOpen) return null;

  const formatRemaining = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Moon size={18} className="text-sky-400" />
            <span>Sleep Timer</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <X size={16} />
          </button>
        </div>

        {remainingSeconds !== null && (
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-center">
            <p className="text-[11px] text-zinc-400">Audio will stop in</p>
            <p className="text-lg font-mono font-bold text-sky-400">
              {formatRemaining(remainingSeconds)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {TIMER_OPTIONS.map((mins) => {
            const isCurrent = activeMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => {
                  onSelectTimer(mins);
                  onClose();
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-zinc-950 font-semibold border-sky-400 shadow-sm'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                {mins} Minutes
              </button>
            );
          })}
        </div>

        {activeMinutes && (
          <button
            onClick={() => {
              onSelectTimer(null);
              onClose();
            }}
            className="w-full py-2 text-xs font-medium text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-rose-500/10 rounded-xl transition"
          >
            Turn Off Timer
          </button>
        )}
      </div>
    </div>
  );
}