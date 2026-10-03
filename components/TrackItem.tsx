'use client';

import { Heart, Plus } from 'lucide-react';
import { Song } from '@/types/song';
import { EqualizerBars } from './EqualizerBars';

interface TrackItemProps {
  song: Song;
  isSelected: boolean;
  isPlaying: boolean; // Ye missing tha TypeScript interface me
  isFav: boolean;
  onPlay: (song: Song) => void;
  onToggleFav: (e: React.MouseEvent, song: Song) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export function TrackItem({
  song,
  isSelected,
  isPlaying,
  isFav,
  onPlay,
  onToggleFav,
  onOpenPlaylistModal,
}: TrackItemProps) {
  return (
    <div
      onClick={() => onPlay(song)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-zinc-800/90 border border-sky-500/40 shadow-sm'
          : 'bg-zinc-900/60 hover:bg-zinc-800/50 border border-transparent'
      }`}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <img
          src={song.thumbnail || '/icon.svg'}
          alt={song.title}
          className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
            <EqualizerBars isPlaying={isPlaying} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className={`text-sm font-medium truncate ${isSelected ? 'text-sky-400' : 'text-zinc-200'}`}>
          {song.title}
        </h2>
        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenPlaylistModal(song);
        }}
        title="Add to playlist"
        className="p-2 text-zinc-500 hover:text-sky-400 transition"
      >
        <Plus size={18} />
      </button>

      <button
        onClick={(e) => onToggleFav(e, song)}
        className="p-2 text-zinc-500 hover:text-rose-500 transition"
      >
        <Heart
          size={18}
          className={isFav ? 'fill-rose-500 text-rose-500' : ''}
        />
      </button>
    </div>
  );
}