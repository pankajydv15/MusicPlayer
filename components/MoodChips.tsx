'use client';

import { Sparkles } from 'lucide-react';

const QUICK_MOODS = [
  'Acoustic Unplugged',
  'Coke Studio Classics',
  'Bollywood Lofi',
  'Late Night Chill',
  'Sufi Vibes',
  'Indie Acoustic',
  'Punjabi Chill',
  'Retro Mashup',
];

interface MoodChipsProps {
  activeMood: string | null;
  onSelectMood: (mood: string) => void;
}

export function MoodChips({ activeMood, onSelectMood }: MoodChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
      <span className="flex items-center gap-1 text-zinc-500 flex-shrink-0 text-[11px] font-medium pr-1">
        <Sparkles size={12} className="text-sky-400" /> Quick Vibes:
      </span>
      {QUICK_MOODS.map((mood) => {
        const isCurrent = activeMood === mood;
        return (
          <button
            key={mood}
            onClick={() => onSelectMood(mood)}
            className={`px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
              isCurrent
                ? 'bg-sky-500 text-zinc-950 font-medium border-sky-400'
                : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            {mood}
          </button>
        );
      })}
    </div>
  );
}