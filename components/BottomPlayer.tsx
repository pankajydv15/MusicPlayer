'use client';

import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Moon, ListMusic } from 'lucide-react';
import { Song } from '@/types/song';
import { EqualizerBars } from './EqualizerBars';

type RepeatMode = 'off' | 'all' | 'one';

interface BottomPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isTimerActive: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenTimerModal: () => void;
  onOpenQueueDrawer: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BottomPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  isTimerActive,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onOpenTimerModal,
  onOpenQueueDrawer,
  onSeek,
}: BottomPlayerProps) {
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-800/90 p-4 rounded-2xl shadow-2xl z-40 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="relative flex-shrink-0">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-11 h-11 rounded-lg object-cover bg-zinc-800"
            />
            {isPlaying && (
              <div className="absolute -top-1 -right-1 bg-sky-500 text-zinc-950 p-1 rounded-full shadow-lg">
                <EqualizerBars isPlaying={isPlaying} color="bg-zinc-950" size="sm" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">{currentSong.title}</p>
            <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 1. Queue Drawer Icon (Feature 7) */}
          <button
            onClick={onOpenQueueDrawer}
            title="Up Next Queue"
            className="p-2 text-zinc-400 hover:text-sky-400 transition"
          >
            <ListMusic size={18} />
          </button>

          {/* 2. Sleep Timer */}
          <button
            onClick={onOpenTimerModal}
            title="Sleep Timer"
            className={`p-2 transition ${isTimerActive ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Moon size={16} />
          </button>

          {/* 3. Shuffle */}
          <button
            onClick={onToggleShuffle}
            title="Shuffle"
            className={`p-2 transition ${isShuffle ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Shuffle size={16} />
          </button>

          {/* 4. Previous */}
          <button onClick={onPrev} className="p-2 text-zinc-400 hover:text-white transition">
            <SkipBack size={18} />
          </button>

          {/* 5. Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-full bg-sky-500 text-zinc-950 hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* 6. Next */}
          <button onClick={onNext} className="p-2 text-zinc-400 hover:text-white transition">
            <SkipForward size={18} />
          </button>

          {/* 7. Repeat */}
          <button
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
            className={`p-2 transition ${repeatMode !== 'off' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={onSeek}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}