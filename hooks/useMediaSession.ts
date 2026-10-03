import { useEffect } from 'react';
import { Song } from '@/types/song';

export function useMediaSession(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  currentTrack: Song | null,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
  }
) {
  const { onPlay, onPause, onNext, onPrev } = handlers;

  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: 'Personal Cloud Player',
      artwork: currentTrack.thumbnail
        ? [
            { src: currentTrack.thumbnail, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.thumbnail, sizes: '128x128', type: 'image/jpeg' },
            { src: currentTrack.thumbnail, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });

    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentTrack, audioRef, onPlay, onPause, onNext, onPrev]);
}
