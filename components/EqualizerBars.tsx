'use client';

interface EqualizerBarsProps {
  isPlaying: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

export function EqualizerBars({ isPlaying, color = 'bg-sky-400', size = 'sm' }: EqualizerBarsProps) {
  const barHeights = ['h-3', 'h-4', 'h-2', 'h-5'];

  return (
    <div className={`flex items-end gap-[2px] ${size === 'sm' ? 'h-3' : 'h-4'}`}>
      <span
        className={`w-[2.5px] rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[bounce_0.6s_ease-in-out_infinite] h-3' : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite_0.15s] h-4' : 'h-1.5 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[bounce_0.5s_ease-in-out_infinite_0.3s] h-2.5' : 'h-1 opacity-50'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[bounce_0.7s_ease-in-out_infinite_0.45s] h-4' : 'h-2 opacity-50'
        }`}
      />
    </div>
  );
}