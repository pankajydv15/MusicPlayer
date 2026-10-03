'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Heart, ListMusic, FolderPlus, Trash2, ArrowLeft } from 'lucide-react';
import { Song } from '@/types/song';
import { Header } from '@/components/Header';
import { MoodChips } from '@/components/MoodChips';
import { TrackItem } from '@/components/TrackItem';
import { BottomPlayer } from '@/components/BottomPlayer';
import { SleepTimerModal } from '@/components/SleepTimerModal';
import { QueueDrawer } from '@/components/QueueDrawer';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type RepeatMode = 'off' | 'all' | 'one';

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'playlists'>('search');
  const [query, setQuery] = useState('');
  const [activeMood, setActiveMood] = useState<string | null>('Acoustic Unplugged');
  const [results, setResults] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);

  // Queue State
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playbackQueue, setPlaybackQueue] = useState<Song[]>([]);

  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [autoPlayRadio, setAutoPlayRadio] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Sleep Timer
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [remainingTimerSeconds, setRemainingTimerSeconds] = useState<number | null>(null);

  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSongRef = useRef<Song | null>(null);
  const activeTabRef = useRef<'search' | 'favorites' | 'playlists'>('search');
  const playbackQueueRef = useRef<Song[]>([]);
  const autoPlayRef = useRef<boolean>(true);
  const isShuffleRef = useRef<boolean>(false);
  const repeatModeRef = useRef<RepeatMode>('off');

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { playbackQueueRef.current = playbackQueue; }, [playbackQueue]);
  useEffect(() => { autoPlayRef.current = autoPlayRadio; }, [autoPlayRadio]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  // Initial Load: Auto-fetch default songs so landing page is never empty
  useEffect(() => {
    executeSearch('Acoustic Unplugged');
  }, []);

  // Sleep Timer Countdown
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
      setRemainingTimerSeconds(null);
      return;
    }

    setRemainingTimerSeconds(sleepTimerMinutes * 60);

    sleepTimerIntervalRef.current = setInterval(() => {
      setRemainingTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          playerRef.current?.pauseVideo();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    };
  }, [sleepTimerMinutes]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('cb_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch {}
    }
    const savedPlaylists = localStorage.getItem('cb_playlists');
    if (savedPlaylists) {
      try { setPlaylists(JSON.parse(savedPlaylists)); } catch {}
    }
  }, []);

  const savePlaylists = (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem('cb_playlists', JSON.stringify(updated));
  };

  const createPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    savePlaylists([{ id: Date.now().toString(), name: newPlaylistName.trim(), songs: [] }, ...playlists]);
    setNewPlaylistName('');
  };

  const deletePlaylist = (e: React.MouseEvent, plId: string) => {
    e.stopPropagation();
    const updated = playlists.filter((p) => p.id !== plId);
    savePlaylists(updated);
    if (activePlaylist?.id === plId) setActivePlaylist(null);
  };

  const addSongToPlaylist = (plId: string) => {
    if (!selectedSongForPlaylist) return;
    const updated = playlists.map((pl) => {
      if (pl.id === plId && !pl.songs.some((s) => s.id === selectedSongForPlaylist.id)) {
        return { ...pl, songs: [selectedSongForPlaylist, ...pl.songs] };
      }
      return pl;
    });
    savePlaylists(updated);
    setSelectedSongForPlaylist(null);
  };

  const toggleFavorite = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const updated = favorites.some((f) => f.id === song.id)
      ? favorites.filter((f) => f.id !== song.id)
      : [song, ...favorites];
    setFavorites(updated);
    localStorage.setItem('cb_favorites', JSON.stringify(updated));
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => initPlayer();
    } else {
      initPlayer();
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player('hidden-yt-player', {
      height: '0',
      width: '0',
      playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
      events: {
        onStateChange: (event: any) => {
          if (event.data === 1) {
            setIsPlaying(true);
            setDuration(playerRef.current?.getDuration() || 0);
            startTimer();
          } else if (event.data === 2) {
            setIsPlaying(false);
            stopTimer();
          } else if (event.data === 0) {
            stopTimer();
            handleSongEnd();
          }
        },
      },
    });
  };

  const startTimer = () => {
    stopTimer();
    progressTimerRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  };

  const stopTimer = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setResults(data.songs || []);
      setPlaybackQueue(data.songs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    playerRef.current?.loadVideoById(song.id);
    setIsPlaying(true);

    setPlaybackQueue((prev) => {
      if (!prev.some((s) => s.id === song.id)) {
        return [song, ...prev];
      }
      return prev;
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        artwork: [{ src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', () => playerRef.current?.playVideo());
      navigator.mediaSession.setActionHandler('pause', () => playerRef.current?.pauseVideo());
      navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevTrack);
    }
  };

  const handleSongEnd = () => {
    if (repeatModeRef.current === 'one' && currentSongRef.current) {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      return;
    }
    playNextTrack();
  };

  const playNextTrack = () => {
    const list = playbackQueueRef.current;
    if (list.length === 0) return;
    const current = currentSongRef.current;
    const currentIndex = current ? list.findIndex((s) => s.id === current.id) : -1;

    if (isShuffleRef.current && list.length > 1) {
      let randomIndex = Math.floor(Math.random() * list.length);
      while (randomIndex === currentIndex) randomIndex = Math.floor(Math.random() * list.length);
      playSong(list[randomIndex]);
      return;
    }

    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      playSong(list[currentIndex + 1]);
      return;
    }

    if (repeatModeRef.current === 'all' || autoPlayRef.current) {
      playSong(list[0]);
    }
  };

  const playPrevTrack = () => {
    const list = playbackQueueRef.current;
    if (!currentSong || list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) playSong(list[currentIndex - 1]);
  };

  const currentList =
    activeTab === 'search' ? results : activeTab === 'favorites' ? favorites : activePlaylist ? activePlaylist.songs : [];

  return (
    <main className="max-w-xl mx-auto px-4 py-8 pb-44">
      <div id="hidden-yt-player" className="hidden" />

      {/* Header */}
      <Header
        autoPlayRadio={autoPlayRadio}
        onToggleAutoPlay={() => setAutoPlayRadio(!autoPlayRadio)}
      />

      {/* Navigation Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => { setActiveTab('search'); setActivePlaylist(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'search' ? 'bg-zinc-800 text-sky-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search size={14} /> Search
        </button>
        <button
          onClick={() => { 
            setActiveTab('favorites'); 
            setActivePlaylist(null);
            setPlaybackQueue(favorites);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'favorites' ? 'bg-zinc-800 text-sky-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart size={14} className={favorites.length > 0 ? 'fill-sky-400' : ''} />
          Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'playlists' ? 'bg-zinc-800 text-sky-400' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListMusic size={14} /> Playlists ({playlists.length})
        </button>
      </div>

      {/* Search Bar & Mood Chips */}
      {activeTab === 'search' && (
        <div className="space-y-3 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveMood(null);
              executeSearch(query);
            }}
            className="relative"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search unplugged, lofi, artist, songs..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          </form>

          <MoodChips
            activeMood={activeMood}
            onSelectMood={(mood) => {
              setActiveMood(mood);
              setQuery(mood);
              executeSearch(mood);
            }}
          />
        </div>
      )}

      {/* Playlists Management Section */}
      {activeTab === 'playlists' && !activePlaylist && (
        <div className="space-y-4 mb-6">
          <form onSubmit={createPlaylist} className="flex gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Create Playlist (e.g. Gym Vibes)..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-zinc-950 font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition"
            >
              <FolderPlus size={16} /> Create
            </button>
          </form>

          {playlists.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <FolderPlus size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No playlists yet. Create one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setActivePlaylist(pl);
                    setPlaybackQueue(pl.songs);
                  }}
                  className="bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 p-4 rounded-xl flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{pl.name}</h3>
                    <p className="text-xs text-zinc-500">{pl.songs.length} tracks</p>
                  </div>
                  <button
                    onClick={(e) => deletePlaylist(e, pl.id)}
                    className="p-2 text-zinc-600 hover:text-rose-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'playlists' && activePlaylist && (
        <div className="mb-4">
          <button
            onClick={() => setActivePlaylist(null)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-sky-400 mb-4 transition"
          >
            <ArrowLeft size={14} /> Back to all playlists
          </button>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-sky-400">{activePlaylist.name}</h2>
            <span className="text-xs text-zinc-500">{activePlaylist.songs.length} songs</span>
          </div>
        </div>
      )}

      {/* Song List */}
      {activeTab === 'search' && loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
          <Loader2 className="animate-spin text-sky-400" size={24} />
          <span className="text-xs">Finding tracks...</span>
        </div>
      ) : currentList.length === 0 && (activeTab !== 'playlists' || activePlaylist) ? (
        <div className="text-center py-20 text-zinc-500">
          <ListMusic size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">
            {activeTab === 'search' ? 'Search or pick a vibe above to play' : 'No songs in this list yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentList.map((song) => (
            <TrackItem
              key={song.id}
              song={song}
              isSelected={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isFav={favorites.some((f) => f.id === song.id)}
              onPlay={playSong}
              onToggleFav={toggleFavorite}
              onOpenPlaylistModal={setSelectedSongForPlaylist}
            />
          ))}
        </div>
      )}

      {/* Add to Playlist Modal */}
      {selectedSongForPlaylist && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100">Add to Playlist</h3>
            <p className="text-xs text-zinc-400 truncate">{selectedSongForPlaylist.title}</p>
            {playlists.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No playlists created yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => addSongToPlaylist(pl.id)}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 hover:text-sky-400 flex items-center justify-between transition"
                  >
                    <span>{pl.name}</span>
                    <span className="text-[10px] text-zinc-500">{pl.songs.length} songs</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedSongForPlaylist(null)}
              className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isTimerModalOpen}
        activeMinutes={sleepTimerMinutes}
        remainingSeconds={remainingTimerSeconds}
        onSelectTimer={(mins) => setSleepTimerMinutes(mins)}
        onClose={() => setIsTimerModalOpen(false)}
      />

      {/* Queue Drawer (Up Next) */}
      <QueueDrawer
        isOpen={isQueueOpen}
        queue={playbackQueue}
        currentSong={currentSong}
        onSelectSong={(song) => playSong(song)}
        onRemoveFromQueue={(idx) => {
          setPlaybackQueue((prev) => prev.filter((_, i) => i !== idx));
        }}
        onClearQueue={() => setPlaybackQueue([])}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* Bottom Player */}
      {currentSong && (
        <BottomPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          isTimerActive={sleepTimerMinutes !== null}
          onTogglePlay={() => {
            if (isPlaying) playerRef.current?.pauseVideo();
            else playerRef.current?.playVideo();
          }}
          onNext={playNextTrack}
          onPrev={playPrevTrack}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onToggleRepeat={() => {
            if (repeatMode === 'off') setRepeatMode('all');
            else if (repeatMode === 'all') setRepeatMode('one');
            else setRepeatMode('off');
          }}
          onOpenTimerModal={() => setIsTimerModalOpen(true)}
          onOpenQueueDrawer={() => setIsQueueOpen(true)}
          onSeek={(e) => {
            const target = Number(e.target.value);
            playerRef.current?.seekTo(target, true);
            setCurrentTime(target);
          }}
        />
      )}
    </main>
  );
}