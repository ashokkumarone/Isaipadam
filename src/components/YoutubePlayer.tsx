import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface YoutubePlayerProps {
  videoId: string;
  appMode: 'video' | 'audio';
  title: string;
}

export default function YoutubePlayer({ videoId, appMode, title }: YoutubePlayerProps) {
  const [loading, setLoading] = useState(true);

  // Reset loading whenever track changes
  useEffect(() => {
    setLoading(true);
  }, [videoId]);

  // Construct standard YouTube embed URL with optimal parameters:
  // autoplay=1 (starts playing immediately)
  // rel=0 (don't show related videos from other channels)
  // modestybranding=1 (hides YouTube logo)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`;

  return (
    <div
      className={`relative w-full ${
        appMode === 'video'
          ? 'aspect-video rounded-2xl overflow-hidden bg-black border border-[#272727] shadow-2xl'
          : 'w-1 h-1 opacity-0 pointer-events-none absolute -top-9999 left-0'
      }`}
    >
      {appMode === 'video' && loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] text-white z-10">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
          <p className="text-xs text-[#888] font-medium tracking-wide">Syncing stream...</p>
        </div>
      )}

      <iframe
        key={videoId}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setLoading(false)}
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
