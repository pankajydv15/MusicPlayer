'use client';

import { X, Music, Play, Trash2 } from 'lucide-react';
import { Song } from '@/types/song';

interface QueueDrawerProps {
  isOpen: boolean;
  queue: Song[];
  currentSong: Song | null;
  onSelectSong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onClose: () => void;
}

export function QueueDrawer({
  isOpen,
  queue,
  currentSong,
  onSelectSong,
  onRemoveFromQueue,
  onClearQueue,
  onClose,
}: QueueDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex flex-col justify-end">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-zinc-900 border-t border-zinc-800 w-full max-w-xl mx-auto rounded-t-3xl p-5 shadow-2xl max-h-[75vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-sky-400" />
            <h2 className="text-sm font-bold text-zinc-100">Playback Queue</h2>
            <span className="text-xs text-zinc-500 font-mono">({queue.length} tracks)</span>
          </div>

          <div className="flex items-center gap-3">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="text-xs text-zinc-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Queue Song List */}
        <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Queue is empty. Play any song or playlist!
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;

              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => onSelectSong(song)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-sky-500/10 border border-sky-500/30'
                      : 'bg-zinc-950/40 hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <span className="w-5 text-center text-[11px] font-mono text-zinc-500">
                    {isCurrent ? <Play size={12} className="text-sky-400 fill-sky-400 inline" /> : idx + 1}
                  </span>

                  <img
                    src={song.thumbnail || '/icon.svg'}
                    alt={song.title}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isCurrent ? 'text-sky-400' : 'text-zinc-200'}`}>
                      {song.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromQueue(idx);
                    }}
                    className="p-1.5 text-zinc-600 hover:text-rose-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}