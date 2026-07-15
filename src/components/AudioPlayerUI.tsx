import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Music, Youtube, MessageSquare, Sparkles, Volume2, List, ArrowLeft, X, ChevronDown, Download } from 'lucide-react';
import { Track } from '../types';

interface AudioPlayerUIProps {
  track: Track;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  upNext: Track[];
  onSelectTrack: (trackId: string) => void;
  appMode?: 'video' | 'audio';
  setAppMode?: (mode: 'video' | 'audio') => void;
  onClose?: () => void;
  onDownload?: () => void;
  isDownloaded?: boolean;
  isPremium?: boolean;
  onPremiumClick?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function AudioPlayerUI({
  track,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrev,
  upNext,
  onSelectTrack,
  appMode,
  setAppMode,
  onClose,
  onDownload,
  isDownloaded,
  isPremium = false,
  onPremiumClick,
  onLike,
  isLiked = false,
  onSave,
  isSaved = false,
}: AudioPlayerUIProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Convert track duration string e.g., "4:21" to seconds
  const parseDurationToSeconds = (durationStr: string): number => {
    if (durationStr === 'LIVE' || durationStr.includes('STREAM')) return 300; // default 5 mins for live
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 180;
  };

  const totalSeconds = parseDurationToSeconds(track.duration);

  // Sync / Increment local timer & Reset Queue/Lyrics on track change
  useEffect(() => {
    setCurrentTime(0);
    setShowQueue(false);
  }, [track.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            onNext(); // Auto play next track when finished
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalSeconds, onNext]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Find active lyric line based on current local timer
  const currentLyricIndex = track.lyrics
    ? track.lyrics.findIndex((line, index) => {
        const nextLine = track.lyrics?.[index + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
      })
    : -1;

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll lyrics
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
      const activeLineElement = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeLineElement) {
        lyricsContainerRef.current.scrollTo({
          top: activeLineElement.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeLineElement.clientHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [currentLyricIndex, isLyricsExpanded]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickedPercentage = clickX / width;
    setCurrentTime(Math.floor(clickedPercentage * totalSeconds));
  };

  return (
    <div className="audio-layout w-full max-w-md mx-auto flex flex-col items-center justify-center select-none">
      {/* Centered Main Player Card */}
      <div className="w-full flex flex-col items-center p-4 sm:p-5 md:p-6 rounded-3xl bg-theme-card border border-theme-border shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-radial from-indigo-500/5 to-transparent pointer-events-none"></div>

        {/* Absolute Close X button in top right corner */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 text-theme-text-muted hover:text-theme-text transition cursor-pointer p-1.5 rounded-full bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border"
            title="Close Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Absolute Download button in top left corner */}
        {onDownload && (
          <button
            onClick={onDownload}
            className={`absolute top-4 left-4 z-30 transition cursor-pointer p-1.5 rounded-full bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border ${isDownloaded ? 'text-theme-highlight' : 'text-theme-text-muted hover:text-theme-text'}`}
            title={isDownloaded ? "Downloaded" : "Download Audio"}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {isLyricsExpanded ? (
          /* ==================== EXPANDED FULL LYRICS SCROLL STAGE ==================== */
          <div className="w-full flex flex-col z-10 animate-fade-in min-h-[360px] sm:min-h-[400px] justify-between">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setIsLyricsExpanded(false)}
                className="text-[9px] uppercase tracking-wider font-extrabold text-theme-highlight hover:text-theme-highlight-hover transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Hide Lyrics</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Dynamic Interactive lyrics indicator */}
              <div 
                className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none"
              >
                <span>✨ Click Line to Seek</span>
              </div>
            </div>

            {/* Expanded scrolling lyrics container */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide text-center py-4 flex flex-col justify-start"
              style={{ maxHeight: '280px' }}
            >
              {track.lyrics && track.lyrics.length > 0 ? (
                track.lyrics.map((line, idx) => {
                  const isCurrent = idx === currentLyricIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isPremium) {
                          setCurrentTime(line.time);
                        } else {
                          if (onPremiumClick) onPremiumClick();
                        }
                      }}
                      className={`w-full text-center py-1 px-3 transition-all duration-300 block text-xs sm:text-sm font-extrabold cursor-pointer hover:scale-102 ${
                        isCurrent
                          ? 'text-theme-highlight font-black scale-105 drop-shadow-[0_0_8px_var(--highlight-border-alpha)]'
                          : 'text-theme-text-muted hover:text-theme-text'
                      }`}
                      title={isPremium ? `Jump to ${Math.floor(line.time / 60)}:${line.time % 60 < 10 ? '0' : ''}${line.time % 60}` : 'Premium Time-Seek'}
                    >
                      {line.text}
                    </div>
                  );
                })
              ) : (
                <div className="text-theme-text-muted text-xs py-10 font-bold flex flex-col items-center justify-center gap-2">
                  <span>🎙️</span>
                  <span>Instrumental or Lyrics not synced</span>
                </div>
              )}
            </div>
            <div className="h-6"></div>
          </div>
        ) : (
          /* ==================== STANDARD AUDIO PLAYER OR INTEGRATED QUEUE VIEW ==================== */
          <>
            {showQueue ? (
              /* ==================== INTEGRATED QUEUE PANEL ==================== */
              <div className="w-full flex flex-col z-10 animate-fade-in min-h-[280px] sm:min-h-[300px] justify-between mb-4">
                <div className="flex items-center justify-between border-b border-theme-border pb-2.5 mb-3">
                  <span className="text-xs font-black text-theme-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <span>📋</span> Up Next Queue
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide" style={{ maxHeight: '250px' }}>
                  {/* Current Playing Segment */}
                  <div className="flex items-center gap-3 p-2 rounded-2xl bg-[var(--highlight-bg-alpha)] border border-[var(--highlight-border-alpha)]">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[#0f0f0f] relative overflow-hidden shrink-0"
                      style={{ background: track.audioBgGradient }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white bg-black/40 font-bold select-none text-xs">
                        ▶
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] sm:text-xs font-bold text-theme-text truncate leading-tight">{track.title}</h5>
                      <p className="text-[9px] sm:text-[10px] text-theme-text-muted font-semibold mt-0.5 truncate">{track.artist}</p>
                    </div>
                    <span className="text-[11px] font-mono text-theme-highlight font-semibold shrink-0">{track.duration}</span>
                  </div>

                  <div className="border-t border-theme-border my-2"></div>

                  {/* Up Next List */}
                  {upNext.map((upTrack, idx) => (
                    <div
                      key={upTrack.id}
                      onClick={() => onSelectTrack(upTrack.id)}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-theme-sidebar-hover transition cursor-pointer group border border-transparent hover:border-theme-border"
                    >
                      <span className="text-[10px] sm:text-xs font-bold font-mono text-theme-text-muted group-hover:text-theme-highlight w-4 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 relative overflow-hidden"
                        style={{ background: upTrack.audioBgGradient }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${upTrack.id}/hqdefault.jpg`}
                          alt={upTrack.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/10 text-white font-bold text-xs select-none">
                          {upTrack.title.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[11px] sm:text-xs font-bold text-theme-text group-hover:text-theme-highlight transition truncate leading-tight">
                          {upTrack.title}
                        </h5>
                        <p className="text-[9px] sm:text-[10px] text-theme-text-muted mt-0.5 truncate">{upTrack.artist}</p>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono text-theme-text-muted group-hover:text-theme-text shrink-0">
                        {upTrack.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ==================== VINYL PLAYER SCREEN ==================== */
              <>
                {/* Spinning Vinyl Vinyl disc with custom gradient glow */}
                <div className="relative flex justify-center items-center my-4 z-10">
                  <div
                    className="absolute inset-0 rounded-full blur-[35px] opacity-30 transition-all duration-1000 scale-110"
                    style={{ background: track.audioBgGradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                  ></div>

                  <div
                    className={`w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full border-4 border-theme-border shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
                      isPlaying ? 'animate-spin-slow' : 'scale-95'
                    }`}
                    style={{
                      background: `radial-gradient(circle, rgba(0,0,0,1) 20%, rgba(30,30,30,1) 60%, rgba(10,10,10,1) 100%)`,
                    }}
                  >
                    {/* Grooves on vinyl */}
                    <div className="absolute inset-1.5 rounded-full border border-white/5 pointer-events-none"></div>
                    <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none"></div>
                    <div className="absolute inset-7 rounded-full border border-white/5 pointer-events-none"></div>
                    <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none"></div>
                    <div className="absolute inset-14 rounded-full border border-white/5 pointer-events-none"></div>

                    {/* Glowing real album art in center */}
                    <div
                      className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center overflow-hidden relative z-10 border-4 border-[#0d0d0d]"
                      style={{ background: track.audioBgGradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-3xl select-none z-0">
                        {track.title.charAt(0)}
                      </span>
                    </div>

                    {/* Hole in middle of record */}
                    <div className="w-3.5 h-3.5 bg-theme-card border border-theme-border rounded-full z-20 absolute"></div>
                  </div>
                </div>

                {/* Title, Artist, and Album info */}
                <div className="text-center w-full mt-2.5 z-10">
                  <h2 className="text-base sm:text-lg font-extrabold text-theme-text tracking-tight line-clamp-1">
                    {track.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold text-theme-text-secondary mt-0.5 line-clamp-1">
                    {track.artist}
                  </p>
                  <span className="inline-block mt-1.5 text-[8px] sm:text-[9px] bg-theme-sidebar border border-theme-border text-theme-text-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    {track.channel}
                  </span>

                  {/* Actions bar: Likes and Save */}
                  <div className="flex items-center justify-center gap-3 mt-3 w-full">
                    {onLike && (
                      <button
                        onClick={onLike}
                        className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl border transition duration-300 cursor-pointer ${
                          isLiked
                            ? 'text-theme-highlight bg-[var(--highlight-bg-alpha)] border-[var(--highlight-border-alpha)]'
                            : 'text-theme-text-muted hover:text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border-theme-border'
                        }`}
                      >
                        <span>{isLiked ? '❤️' : '👍'}</span>
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>
                    )}
                    {onSave && (
                      <button
                        onClick={onSave}
                        className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl border transition duration-300 cursor-pointer ${
                          isSaved
                            ? 'text-theme-highlight bg-[var(--highlight-bg-alpha)] border-[var(--highlight-border-alpha)]'
                            : 'text-theme-text-muted hover:text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border-theme-border'
                        }`}
                      >
                        <span>{isSaved ? '📂 Saved' : '➕ Save'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact Synced Lyrics Strip */}
                {track.lyrics && track.lyrics.length > 0 ? (
                  <div className="w-full my-3 sm:my-4 z-10 relative">
                    <div
                      onClick={() => {
                        setIsLyricsExpanded(true);
                        setShowQueue(false);
                      }}
                      className="bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border rounded-2xl p-2.5 sm:p-3 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-lg"
                    >
                      {/* 3-line sliding window of lyrics */}
                      <div className="flex flex-col gap-0.5 justify-center items-center h-12 sm:h-14">
                        {/* Previous line */}
                        {currentLyricIndex > 0 && track.lyrics[currentLyricIndex - 1] && (
                          <span className="text-[8px] sm:text-[9px] text-theme-text-muted font-extrabold truncate max-w-[90%] leading-none">
                            {track.lyrics[currentLyricIndex - 1].text}
                          </span>
                        )}

                        {/* Current line */}
                        <span className="text-xs font-black text-theme-highlight truncate max-w-[95%] drop-shadow-[0_0_8px_var(--highlight-border-alpha)] leading-tight">
                          {track.lyrics[currentLyricIndex]?.text || "Enjoy the music!"}
                        </span>

                        {/* Next line */}
                        {currentLyricIndex < track.lyrics.length - 1 && track.lyrics[currentLyricIndex + 1] && (
                          <span className="text-[8px] sm:text-[9px] text-theme-text-muted font-extrabold truncate max-w-[90%] leading-none">
                            {track.lyrics[currentLyricIndex + 1].text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-3 sm:my-4 h-12 sm:h-14 flex items-center justify-center text-[9px] sm:text-[10px] text-theme-text-muted font-bold tracking-wider uppercase bg-theme-sidebar/30 rounded-xl border border-dashed border-theme-border px-4 w-full">
                    Instrumental / No Synced Lyrics
                  </div>
                )}
              </>
            )}

            {/* Progress scrub bar */}
            <div className="w-full mt-1 z-10">
              <div
                onClick={handleProgressBarClick}
                className="w-full h-1.5 bg-theme-sidebar border border-theme-border rounded-full cursor-pointer relative group overflow-hidden"
              >
                <div
                  className="h-full bg-indigo-500 rounded-full relative group-hover:bg-indigo-400 transition-colors"
                  style={{
                    width: `${(currentTime / totalSeconds) * 100}%`,
                    backgroundColor: track.isLive ? 'var(--highlight-color)' : undefined,
                  }}
                >
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md border-2 border-indigo-500 scale-0 group-hover:scale-100 transition-transform"
                    style={{ borderColor: track.isLive ? 'var(--highlight-color)' : undefined }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] sm:text-[11px] font-bold text-theme-text-muted font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{track.isLive ? 'LIVE STREAM' : track.duration}</span>
              </div>
            </div>

            {/* Audio control buttons */}
            <div className="flex items-center justify-between w-full max-w-[280px] mt-3.5 z-10">
              <button className="text-theme-text-muted hover:text-theme-text transition cursor-pointer">
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onPrev}
                className="text-theme-text-secondary hover:text-theme-text transition p-1.5 rounded-full hover:bg-theme-sidebar-hover active:scale-95 cursor-pointer"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer transition-all duration-300"
                style={{ backgroundColor: track.isLive ? 'var(--highlight-color)' : undefined }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                )}
              </button>
              <button
                onClick={onNext}
                className="text-theme-text-secondary hover:text-theme-text transition p-1.5 rounded-full hover:bg-theme-sidebar-hover active:scale-95 cursor-pointer"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
              <button className="text-theme-text-muted hover:text-theme-text transition cursor-pointer">
                <Repeat className="w-3.5 h-3.5" />
              </button>
              {/* Queue toggler next to Repeat button */}
              <button
                onClick={() => {
                  setShowQueue(!showQueue);
                  setIsLyricsExpanded(false);
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  showQueue ? 'text-theme-highlight bg-[var(--highlight-bg-alpha)]' : 'text-theme-text-muted hover:text-theme-text'
                }`}
                title="Queue"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
