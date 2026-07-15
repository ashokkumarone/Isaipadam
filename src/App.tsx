import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Youtube,
  Music,
  Menu,
  X,
  Tv,
  Play,
  Pause,
  Flame,
  Radio,
  Clock,
  Heart,
  CornerDownRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ListMusic,
  Settings,
  User,
  ArrowLeft,
  MessageSquare,
  Send,
  Trash2,
  Film,
  Database,
  Download,
  Mic,
  SkipForward,
  SkipBack
} from 'lucide-react';

import { Track, AppMode, ActiveTab, Playlist } from './types';
import { CURATED_TRACKS, PLAYLISTS } from './data/musicData';
import Sidebar from './components/Sidebar';
import YoutubePlayer from './components/YoutubePlayer';
import AudioPlayerUI from './components/AudioPlayerUI';
import ActiveAudience from './components/ActiveAudience';

export default function App() {
  // Global States
  const [appMode, setAppMode] = useState<AppMode>('video');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [audioSubTab, setAudioSubTab] = useState<'music' | 'podcasts' | 'library'>('music');
  const [downloadsSubTab, setDownloadsSubTab] = useState<'video' | 'audio'>('video');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('JGwWNGJdvx8'); // Shape of You by default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isWatchPageOpen, setIsWatchPageOpen] = useState<boolean>(false); // Start on home feed instead of directly on player!
  const [isAudioOnlyWatch, setIsAudioOnlyWatch] = useState<boolean>(false);
  
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const expandedSearchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceSearchStatus, setVoiceSearchStatus] = useState<string>('Listening... Speak now.');

  const runVoiceSimulation = () => {
    const popularSearches = [
      'Shape of You',
      'Blinding Lights',
      'Justin Bieber Stay',
      'Harry Styles',
      'Miley Cyrus Flowers',
      'Coldplay Music',
      'Adele Easy On Me',
      'Lofi hip hop beats'
    ];
    const randomQuery = popularSearches[Math.floor(Math.random() * popularSearches.length)];
    
    // Simulate typing effect
    let currentText = '';
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < randomQuery.length) {
        currentText += randomQuery[index];
        setVoiceTranscript(currentText);
        index++;
      } else {
        clearInterval(interval);
        setVoiceSearchStatus(`Voice recognized: "${randomQuery}"`);
        
        setTimeout(() => {
          setSearchQuery(randomQuery);
          setIsWatchPageOpen(false);
          setActiveTab('home');
          setSelectedPlaylistId(null);
          setIsListening(false);
          setIsSearchExpanded(false);
        }, 1200);
      }
    }, 80);
  };

  const startVoiceSearch = () => {
    setIsListening(true);
    setVoiceTranscript('');
    setVoiceSearchStatus('Listening... Speak now.');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setVoiceSearchStatus('Listening... Speak now.');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceTranscript(transcript);
          setVoiceSearchStatus(`Searching for: "${transcript}"`);
          
          setTimeout(() => {
            setSearchQuery(transcript);
            setIsWatchPageOpen(false);
            setActiveTab('home');
            setSelectedPlaylistId(null);
            setIsListening(false);
            setIsSearchExpanded(false);
          }, 1200);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          setVoiceSearchStatus('Could not understand. Simulating voice search...');
          runVoiceSimulation();
        };

        recognition.start();
      } catch (e) {
        console.error(e);
        runVoiceSimulation();
      }
    } else {
      runVoiceSimulation();
    }
  };
  
  // Settings States
  const [videoQuality, setVideoQuality] = useState<'Auto' | '4K' | '1080p' | '720p'>('Auto');
  const [videoDownloadQuality, setVideoDownloadQuality] = useState<'4K' | '1080p' | '720p' | '360p'>('1080p');
  const [audioDownloadQuality, setAudioDownloadQuality] = useState<'320kbps' | '256kbps' | '128kbps'>('320kbps');
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(false);
  const [restrictedMode, setRestrictedMode] = useState<boolean>(false);
  const [statsForNerds, setStatsForNerds] = useState<boolean>(false);

  const [audioQuality, setAudioQuality] = useState<'Lossless' | 'High' | 'Normal'>('High');
  const [equalizerEnabled, setEqualizerEnabled] = useState<boolean>(true);
  const [gaplessPlayback, setGaplessPlayback] = useState<boolean>(true);
  const [autoLyrics, setAutoLyrics] = useState<boolean>(true);
  const [smartDownloads, setSmartDownloads] = useState<boolean>(false);

  // Downloads state
  const [downloadedVideos, setDownloadedVideos] = useState<string[]>(['JGwWNGJdvx8', '4NRXx6U8ABQ']);
  const [downloadedAudios, setDownloadedAudios] = useState<string[]>(['JGwWNGJdvx8', 'U3ASj1L6_sY']);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, 'video' | 'audio'>>({});

  const toggleDownload = (trackId: string, type: 'video' | 'audio') => {
    if (type === 'video') {
      if (downloadedVideos.includes(trackId)) {
        setDownloadedVideos((prev) => prev.filter((id) => id !== trackId));
      } else {
        setDownloadingIds((prev) => ({ ...prev, [trackId]: 'video' }));
        setTimeout(() => {
          setDownloadedVideos((prev) => [...prev, trackId]);
          setDownloadingIds((prev) => {
            const next = { ...prev };
            delete next[trackId];
            return next;
          });
        }, 1500);
      }
    } else {
      if (downloadedAudios.includes(trackId)) {
        setDownloadedAudios((prev) => prev.filter((id) => id !== trackId));
      } else {
        setDownloadingIds((prev) => ({ ...prev, [trackId]: 'audio' }));
        setTimeout(() => {
          setDownloadedAudios((prev) => [...prev, trackId]);
          setDownloadingIds((prev) => {
            const next = { ...prev };
            delete next[trackId];
            return next;
          });
        }, 1500);
      }
    }
  };

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('User');
  const [loginInput, setLoginInput] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Dynamic collections for interactive history, likes, and playlists
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(['JGwWNGJdvx8', '4NRXx6U8ABQ']);
  const [likedAudioIds, setLikedAudioIds] = useState<string[]>(['JGwWNGJdvx8', 'U3ASj1L6_sY']);
  const [watchHistoryIds, setWatchHistoryIds] = useState<string[]>(['JGwWNGJdvx8', '4NRXx6U8ABQ', 'U3ASj1L6_sY']);
  const [libraryTrackIds, setLibraryTrackIds] = useState<string[]>(['JGwWNGJdvx8', '4NRXx6U8ABQ']);
  const [playlistTrackIds, setPlaylistTrackIds] = useState<string[]>(['JGwWNGJdvx8', 'U3ASj1L6_sY']);

  const toggleLike = (trackId: string) => {
    if (appMode === 'video') {
      setLikedVideoIds((prev) =>
        prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
      );
    } else {
      setLikedAudioIds((prev) =>
        prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
      );
    }
  };

  const toggleSave = (trackId: string) => {
    if (appMode === 'video') {
      setLibraryTrackIds((prev) =>
        prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
      );
    } else {
      setPlaylistTrackIds((prev) =>
        prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
      );
    }
  };

  // Automatically add current track to history when selected
  useEffect(() => {
    if (selectedTrackId) {
      setWatchHistoryIds((prev) => {
        const filtered = prev.filter((id) => id !== selectedTrackId);
        return [selectedTrackId, ...filtered];
      });
    }
  }, [selectedTrackId]);

  // Premium & Accent Color states
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>('sky');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  // Sync theme class with HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // Sync Accent Theme Variables dynamically
  useEffect(() => {
    // Sky blue is default highlight
    let highlight = '#0ea5e9';
    let hover = '#38bdf8';
    let bgAlpha = 'rgba(14, 165, 233, 0.1)';
    let borderAlpha = 'rgba(14, 165, 233, 0.2)';

    if (accentColor === 'emerald') {
      highlight = '#34d399'; // Very soft/light mint green ("romba liteta")
      hover = '#6ee7b7';
      bgAlpha = 'rgba(52, 211, 153, 0.1)';
      borderAlpha = 'rgba(52, 211, 153, 0.2)';
    } else if (accentColor === 'purple') {
      highlight = '#8b5cf6';
      hover = '#a78bfa';
      bgAlpha = 'rgba(139, 92, 246, 0.1)';
      borderAlpha = 'rgba(139, 92, 246, 0.2)';
    } else if (accentColor === 'rose') {
      highlight = '#f43f5e';
      hover = '#fb7185';
      bgAlpha = 'rgba(244, 63, 94, 0.1)';
      borderAlpha = 'rgba(244, 63, 94, 0.2)';
    } else if (accentColor === 'blue') {
      highlight = '#3b82f6';
      hover = '#60a5fa';
      bgAlpha = 'rgba(59, 130, 246, 0.1)';
      borderAlpha = 'rgba(59, 130, 246, 0.2)';
    } else if (accentColor === 'gold') {
      highlight = '#f59e0b';
      hover = '#fbbf24';
      bgAlpha = 'rgba(245, 158, 11, 0.1)';
      borderAlpha = 'rgba(245, 158, 11, 0.2)';
    }

    document.documentElement.style.setProperty('--highlight-color', highlight);
    document.documentElement.style.setProperty('--highlight-hover', hover);
    document.documentElement.style.setProperty('--highlight-bg-alpha', bgAlpha);
    document.documentElement.style.setProperty('--highlight-border-alpha', borderAlpha);
  }, [accentColor]);

  // Mobile UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [urlPasteError, setUrlPasteError] = useState<string>('');
  const [pastedUrl, setPastedUrl] = useState<string>('');

  // Fetch the active track object
  const activeTrack = useMemo(() => {
    return CURATED_TRACKS.find((t) => t.id === selectedTrackId) || CURATED_TRACKS[0];
  }, [selectedTrackId]);

  // Comments System States
  const [customComments, setCustomComments] = useState<Record<string, Array<{ id: string; author: string; avatar: string; text: string; likes: string; time: string }>>>({});
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState<boolean>(false);
  const [activeCommentIdx, setActiveCommentIdx] = useState<number>(0);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Compute active track's full comments list (custom ones at the top)
  const activeTrackComments = useMemo(() => {
    const baseComments = activeTrack.comments || [];
    const addedComments = customComments[activeTrack.id] || [];
    return [...addedComments, ...baseComments];
  }, [activeTrack, customComments]);

  // Reset active comment index on track change
  useEffect(() => {
    setActiveCommentIdx(0);
  }, [selectedTrackId]);

  // Handle auto-rotating/cycling comments preview every 4 seconds
  useEffect(() => {
    if (activeTrackComments.length <= 1) return;
    const interval = setInterval(() => {
      setActiveCommentIdx((prev) => (prev + 1) % activeTrackComments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTrackComments]);

  // Handle auto-updating up next recommendations list
  const upNextList = useMemo(() => {
    return CURATED_TRACKS.filter((t) => t.id !== selectedTrackId).slice(0, 5);
  }, [selectedTrackId]);

  // Handle custom playlist track lookups
  const activePlaylist = useMemo(() => {
    if (!selectedPlaylistId) return null;
    return PLAYLISTS.find((p) => p.id === selectedPlaylistId) || null;
  }, [selectedPlaylistId]);

  // Search and filter tracks based on tab, playlist, selectedTag, and search queries
  const filteredTracks = useMemo(() => {
    let list = [...CURATED_TRACKS];

    // Filter by Custom Playlist
    if (activePlaylist) {
      list = list.filter((t) => activePlaylist.trackIds.includes(t.id));
    }

    // Filter by Sidebar Active Tab
    if (!activePlaylist) {
      if (activeTab === 'live') {
        list = list.filter((t) => t.category === 'live' || t.isLive);
      } else if (activeTab === 'explore') {
        list = list.filter((t) => t.category === 'music');
      } else if (activeTab === 'library') {
        if (appMode === 'video') {
          list = list.filter((t) => libraryTrackIds.includes(t.id));
        } else {
          list = list.filter((t) => playlistTrackIds.includes(t.id));
        }
      } else if (activeTab === 'history') {
        list = watchHistoryIds
          .map((id) => list.find((t) => t.id === id))
          .filter((t): t is NonNullable<typeof t> => !!t);
      } else if (activeTab === 'liked') {
        if (appMode === 'video') {
          list = list.filter((t) => likedVideoIds.includes(t.id));
        } else {
          list = list.filter((t) => likedAudioIds.includes(t.id));
        }
      }
    }

    // Filter by YouTube style filter tags
    if (selectedTag !== 'All') {
      if (selectedTag === 'Trending') {
        list = list.filter((t) => t.category === 'music' || t.views.includes('B') || t.views.includes('M'));
      } else if (selectedTag === 'Music') {
        list = list.filter((t) => t.category === 'music');
      }
    }

    // Filter by text search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          t.channel.toLowerCase().includes(query)
      );
    }

    return list;
  }, [activeTab, activePlaylist, searchQuery, selectedTag, selectedTrackId]);

  // Parse custom YouTube URL paste
  const handleUrlPasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlPasteError('');

    if (!pastedUrl.trim()) return;

    try {
      let videoId = '';
      const url = pastedUrl.trim();

      // Handle standard youtu.be/ID
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      // Handle standard youtube.com/watch?v=ID
      else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      }
      // Handle embed URL youtube.com/embed/ID
      else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }
      // Handle short IDs directly
      else if (url.length === 11) {
        videoId = url;
      }

      if (videoId && videoId.length === 11) {
        // Create dynamic temporary track wrapper to support instant playback
        const isExist = CURATED_TRACKS.find((t) => t.id === videoId);
        if (!isExist) {
          const newTrack: Track = {
            id: videoId,
            title: 'Loaded Custom Stream Video',
            artist: 'YouTube Broadcast',
            duration: 'Auto duration',
            category: 'video',
            views: '1 view',
            likes: '1 like',
            channel: 'Dynamic Stream Link',
            channelAvatar: 'D',
            subscribers: 'External source',
            publishedAt: 'just now',
            audioBgGradient: 'linear-gradient(135deg, #FF416C, #8A2387)',
            lyrics: [{ time: 0, text: 'Custom dynamic video playing via TuneTube player' }],
            comments: [
              {
                id: 'custom_c1',
                author: 'System',
                avatar: 'S',
                text: 'Dynamically injected external stream loaded successfully!',
                likes: '1',
                time: 'now',
              },
            ],
          };
          CURATED_TRACKS.unshift(newTrack);
        }
        setSelectedTrackId(videoId);
        setIsPlaying(true);
        setIsAudioOnlyWatch(false);
        setIsWatchPageOpen(true);
        setPastedUrl('');
      } else {
        setUrlPasteError('Invalid YouTube Link or video ID. Please use 11-char ID or standard watch link.');
      }
    } catch (err) {
      setUrlPasteError('Failed to parse link. Please check formatting.');
    }
  };

  const selectTrackAndPlay = (trackId: string) => {
    setSelectedTrackId(trackId);
    setIsPlaying(true);
    setIsAudioOnlyWatch(false);
    // Maintain active mode (audio stays audio, video stays video)
    setIsWatchPageOpen(true);
    // Auto scroll top in mobile to see active player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextTrack = () => {
    const validTracks = CURATED_TRACKS;
    if (validTracks.length === 0) return;
    const currentIndex = validTracks.findIndex((t) => t.id === selectedTrackId);
    if (currentIndex !== -1 && currentIndex < validTracks.length - 1) {
      setSelectedTrackId(validTracks[currentIndex + 1].id);
    } else {
      setSelectedTrackId(validTracks[0].id); // Loop back
    }
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const validTracks = CURATED_TRACKS;
    if (validTracks.length === 0) return;
    const currentIndex = validTracks.findIndex((t) => t.id === selectedTrackId);
    if (currentIndex > 0) {
      setSelectedTrackId(validTracks[currentIndex - 1].id);
    } else {
      setSelectedTrackId(validTracks[validTracks.length - 1].id); // Go to end
    }
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col font-sans overflow-x-hidden antialiased transition-colors duration-300">
      {/* Dynamic Top Navigation Header */}
      <header className="sticky top-0 bg-theme-header border-b border-theme-border px-6 py-3 flex items-center justify-between gap-4 z-50 shadow-md transition-colors duration-300">
        {isSearchExpanded ? (
          <div className="flex items-center gap-3 w-full animate-fade-in">
            {/* Collapse Search button */}
            <button
              type="button"
              onClick={() => {
                setIsSearchExpanded(false);
              }}
              className="text-theme-text-secondary hover:text-theme-text p-2 rounded-full hover:bg-theme-active-bg transition shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Expanded Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsWatchPageOpen(false);
                  setActiveTab('home');
                  setSelectedPlaylistId(null);
                  setIsSearchExpanded(false);
                }
              }}
              className="flex-1 flex items-center gap-2"
            >
              <div className="flex-1 bg-theme-input border border-theme-input-border rounded-full pl-4 pr-3.5 py-2 flex items-center gap-2.5 focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 transition duration-300">
                <Search className="w-4 h-4 text-theme-text-muted shrink-0" />
                <input
                  ref={expandedSearchInputRef}
                  type="text"
                  placeholder="Search songs, artists, videos..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      setIsWatchPageOpen(false);
                      setActiveTab('home');
                      setSelectedPlaylistId(null);
                    }
                  }}
                  className="bg-transparent border-none text-[13px] text-theme-text placeholder-gray-500 focus:outline-none w-full py-0"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="text-theme-text-muted hover:text-theme-text p-1 rounded-full hover:bg-theme-active-bg shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* Voice Search Mic button inside the bar at the end */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startVoiceSearch();
                  }}
                  className="p-1.5 rounded-full hover:bg-theme-active-bg text-indigo-400 hover:text-indigo-300 transition duration-200 shrink-0 cursor-pointer"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-theme-text-secondary hover:text-theme-text p-1 rounded-lg shrink-0"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Combined Title: Isaipadam / Isaipadam Music */}
              <div
                onClick={() => {
                  setSelectedPlaylistId(null);
                  setSelectedTag('All');
                  setActiveTab('home');
                  setIsWatchPageOpen(false); // return to browse feed!
                }}
                className="flex items-center cursor-pointer group select-none shrink-0"
              >
                <h1 className="text-sm sm:text-base font-black tracking-tight text-theme-text flex items-center leading-none shrink-0">
                  <span>{appMode === 'video' ? 'Isaipadam' : 'Isaipadam Music'}</span>
                </h1>
              </div>
            </div>

            {/* Combined Search & Switcher on the Right */}
            <div className="flex items-center gap-2 flex-1 justify-end ml-auto">
              {/* Desktop Search Pill (hidden on mobile) */}
              <div
                onClick={() => {
                  setIsSearchExpanded(true);
                  setTimeout(() => {
                    expandedSearchInputRef.current?.focus();
                  }, 80);
                }}
                className="hidden sm:flex items-center flex-1 max-w-[200px] md:max-w-xs bg-theme-input border border-theme-input-border rounded-full pl-4 pr-3.5 py-1.5 gap-2.5 hover:border-theme-border-hover transition duration-300 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 text-theme-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search Isaipadam"
                  value={searchQuery}
                  readOnly
                  className="bg-transparent border-none text-[12px] text-theme-text placeholder-gray-500 focus:outline-none w-full py-0 cursor-pointer"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="text-theme-text-muted hover:text-theme-text p-1 rounded-full hover:bg-theme-active-bg shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchExpanded(true);
                    setTimeout(() => {
                      startVoiceSearch();
                    }, 120);
                  }}
                  className="p-1.5 rounded-full hover:bg-theme-active-bg text-indigo-400 hover:text-indigo-300 transition duration-200 shrink-0 cursor-pointer"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Compact Search & Mic buttons */}
              <div className="flex sm:hidden items-center gap-1 shrink-0">
                {/* Mobile Search Icon Button */}
                <button
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => {
                      expandedSearchInputRef.current?.focus();
                    }, 80);
                  }}
                  className="w-9 h-9 rounded-full bg-theme-input border border-theme-input-border flex items-center justify-center text-theme-text-secondary hover:text-theme-text hover:bg-theme-active-bg transition cursor-pointer shrink-0"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Mobile Voice Search Mic Button */}
                <button
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => {
                      startVoiceSearch();
                    }, 120);
                  }}
                  className="w-9 h-9 rounded-full bg-theme-input border border-theme-input-border flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-theme-active-bg transition cursor-pointer shrink-0"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Modern Custom Premium Mode Toggle Switch */}
              <button
                onClick={() => {
                  const targetMode = appMode === 'video' ? 'audio' : 'video';
                  setAppMode(targetMode);
                  setIsWatchPageOpen(false);
                }}
                className="relative flex items-center bg-theme-input border border-theme-input-border h-9 rounded-full p-1 w-18 sm:w-28 cursor-pointer group select-none shrink-0 transition duration-300 hover:border-theme-highlight/40"
                title={`Switch to ${appMode === 'video' ? 'Audio Mode' : 'Video Mode'}`}
              >
                {/* Active Slider Background */}
                <div
                  className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out ${
                    appMode === 'video' 
                      ? 'left-1 w-[28px] sm:w-[50px]' 
                      : 'left-[34px] sm:left-[56px] w-[28px] sm:w-[50px]'
                  }`}
                  style={{ 
                    backgroundColor: 'var(--highlight-color)',
                    boxShadow: '0 2px 10px var(--highlight-border-alpha)'
                  }}
                />
                
                {/* Icons & Text */}
                <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3 text-[10px] font-black uppercase tracking-wider text-theme-text-muted">
                  <div className={`flex items-center gap-1 transition duration-300 z-10 ${appMode === 'video' ? 'text-black font-black' : 'text-theme-text-muted group-hover:text-theme-text'}`}>
                    <span>📺</span>
                    <span className="hidden sm:inline text-[9px]">Video</span>
                  </div>
                  <div className={`flex items-center gap-1 transition duration-300 z-10 ${appMode === 'audio' ? 'text-black font-black' : 'text-theme-text-muted group-hover:text-theme-text'}`}>
                    <span>🎵</span>
                    <span className="hidden sm:inline text-[9px]">Audio</span>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsWatchPageOpen(false); // Close watch screen to browse collections
            }}
            appMode={appMode}
            setAppMode={(mode) => {
              setAppMode(mode);
              if (mode === 'audio') {
                setIsWatchPageOpen(true); // Open watch screen for MP3 player
              }
            }}
            selectedPlaylistId={selectedPlaylistId}
            setSelectedPlaylistId={(id) => {
              setSelectedPlaylistId(id);
              setIsWatchPageOpen(false); // Close watch screen to browse playlist
            }}
            onSelectTrack={selectTrackAndPlay}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isSignedIn={isSignedIn}
            username={username}
            isPremium={isPremium}
            onPremiumClick={() => setIsPremiumModalOpen(true)}
          />
        </div>

        {/* Mobile Sidebar overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl"
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsWatchPageOpen(false);
                  setIsSidebarOpen(false);
                }}
                appMode={appMode}
                setAppMode={(mode) => {
                  setAppMode(mode);
                  if (mode === 'audio') {
                    setIsWatchPageOpen(true);
                  }
                  setIsSidebarOpen(false);
                }}
                selectedPlaylistId={selectedPlaylistId}
                setSelectedPlaylistId={(id) => {
                  setSelectedPlaylistId(id);
                  setIsWatchPageOpen(false);
                  setIsSidebarOpen(false);
                }}
                onSelectTrack={(id) => {
                  selectTrackAndPlay(id);
                  setIsSidebarOpen(false);
                }}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isSignedIn={isSignedIn}
                username={username}
                isPremium={isPremium}
                onPremiumClick={() => setIsPremiumModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dark overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          ></div>
        )}

        {/* Primary Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
          {activeTab === 'settings' ? (
            /* ==================== PREMIUM SETTINGS & PROFILE PAGE ==================== */
            <div className="max-w-2xl mx-auto text-theme-text space-y-6 animate-fade-in pb-16">
              <div className="p-6 md:p-8 bg-theme-card border border-theme-border rounded-3xl shadow-xl space-y-8 transition-colors duration-300 relative">
                {/* Close Button top-right */}
                <button
                  onClick={() => setActiveTab('home')}
                  className="absolute top-6 right-6 md:top-8 md:right-8 p-1.5 rounded-full hover:bg-theme-sidebar-hover text-theme-text-muted hover:text-theme-text transition duration-200 cursor-pointer"
                  title="Close Settings"
                  aria-label="Close Settings"
                  id="settings-close-button"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-theme-text flex items-center gap-2.5">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    <span>Isaipadam Settings</span>
                  </h2>
                  <p className="text-xs text-theme-text-muted mt-1">Configure your video, audio, and account preferences</p>
                </div>

                {/* 1. VIDEO PREFERENCES SECTION (5 Options) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 border-b border-theme-border pb-2">Video Preferences</h3>
                  <div className="space-y-3.5">
                    {/* Option 1: Quality */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Video Playback Quality</h4>
                        <p className="text-[10px] text-theme-text-muted">Configure default video streaming resolution</p>
                      </div>
                      <select 
                        value={videoQuality}
                        onChange={(e) => {
                          const val = e.target.value;
                          if ((val === '8K' || val === '4K') && !isPremium) {
                            setIsPremiumModalOpen(true);
                          } else {
                            setVideoQuality(val as any);
                          }
                        }}
                        className="bg-theme-sidebar text-xs font-bold text-theme-text border border-theme-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Auto">Auto (Smart)</option>
                        <option value="8K">Cinematic (8K Ultra HD) 👑</option>
                        <option value="4K">Ultra HD (4K) 👑</option>
                        <option value="1080p">Full HD (1080p)</option>
                        <option value="720p">HD (720p)</option>
                      </select>
                    </div>

                    {/* Option: Video Download Quality */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Video Download Quality</h4>
                        <p className="text-[10px] text-theme-text-muted">Set offline video download resolution limit</p>
                      </div>
                      <select 
                        value={videoDownloadQuality}
                        onChange={(e) => {
                          const val = e.target.value;
                          if ((val === '8K' || val === '4K') && !isPremium) {
                            setIsPremiumModalOpen(true);
                          } else {
                            setVideoDownloadQuality(val as any);
                          }
                        }}
                        className="bg-theme-sidebar text-xs font-bold text-theme-text border border-theme-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="8K">Cinematic (8K Ultra HD) 👑</option>
                        <option value="4K">Ultra HD (4K) 👑</option>
                        <option value="1080p">Full HD (1080p)</option>
                        <option value="720p">HD (720p)</option>
                        <option value="360p">SD (360p - Light)</option>
                      </select>
                    </div>

                    {/* Option 2: Autoplay next */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Autoplay Next Video</h4>
                        <p className="text-[10px] text-theme-text-muted">Automatically play recommendations when finished</p>
                      </div>
                      <button 
                        onClick={() => setAutoplayNext(!autoplayNext)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${autoplayNext ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${autoplayNext ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 3: Captions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Captions & Subtitles</h4>
                        <p className="text-[10px] text-theme-text-muted">Always show subtitles if available</p>
                      </div>
                      <button 
                        onClick={() => setCaptionsEnabled(!captionsEnabled)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${captionsEnabled ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${captionsEnabled ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 4: Restricted Mode */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Restricted Mode</h4>
                        <p className="text-[10px] text-theme-text-muted">Hide mature or sensitive video feeds</p>
                      </div>
                      <button 
                        onClick={() => setRestrictedMode(!restrictedMode)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${restrictedMode ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${restrictedMode ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 5: Stats for nerds */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Stats for Nerds</h4>
                        <p className="text-[10px] text-theme-text-muted">Overlay debug bandwidth & frame statistics</p>
                      </div>
                      <button 
                        onClick={() => setStatsForNerds(!statsForNerds)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${statsForNerds ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${statsForNerds ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. MUSIC PREFERENCES SECTION (5 Options) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 border-b border-theme-border pb-2">Music Preferences</h3>
                  <div className="space-y-3.5">
                    {/* Option 1: Audio Quality */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Audio Quality</h4>
                        <p className="text-[10px] text-theme-text-muted">Hi-Fi audio bitrate streaming setting</p>
                      </div>
                      <select 
                        value={audioQuality}
                        onChange={(e) => setAudioQuality(e.target.value as any)}
                        className="bg-theme-sidebar text-xs font-bold text-theme-text border border-theme-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Lossless">Lossless (Dolby Atmos)</option>
                        <option value="High">High (320kbps)</option>
                        <option value="Normal">Normal (192kbps)</option>
                      </select>
                    </div>

                    {/* Option: Audio Download Quality */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Audio Download Quality</h4>
                        <p className="text-[10px] text-theme-text-muted">Set bitrate for downloaded audio tracks</p>
                      </div>
                      <select 
                        value={audioDownloadQuality}
                        onChange={(e) => setAudioDownloadQuality(e.target.value as any)}
                        className="bg-theme-sidebar text-xs font-bold text-theme-text border border-theme-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="320kbps">Extreme (320kbps Hi-Fi)</option>
                        <option value="256kbps">High (256kbps)</option>
                        <option value="128kbps">Normal (128kbps)</option>
                      </select>
                    </div>

                    {/* Option 2: Equalizer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Audio Equalizer</h4>
                        <p className="text-[10px] text-theme-text-muted">Enable advanced acoustic correction & bass boost</p>
                      </div>
                      <button 
                        onClick={() => setEqualizerEnabled(!equalizerEnabled)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${equalizerEnabled ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${equalizerEnabled ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 3: Gapless */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Gapless Playback</h4>
                        <p className="text-[10px] text-theme-text-muted">No silence intervals between songs</p>
                      </div>
                      <button 
                        onClick={() => setGaplessPlayback(!gaplessPlayback)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${gaplessPlayback ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${gaplessPlayback ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 4: Auto lyrics */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Show Lyrics Automatically</h4>
                        <p className="text-[10px] text-theme-text-muted">Instantly render lyrics on the active audio deck</p>
                      </div>
                      <button 
                        onClick={() => setAutoLyrics(!autoLyrics)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${autoLyrics ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${autoLyrics ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>

                    {/* Option 5: Smart downloads */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">Smart Offline Downloads</h4>
                        <p className="text-[10px] text-theme-text-muted">Automatically cache Liked Tracks on Wi-Fi</p>
                      </div>
                      <button 
                        onClick={() => setSmartDownloads(!smartDownloads)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${smartDownloads ? 'bg-indigo-500' : 'bg-theme-sidebar border border-theme-border'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${smartDownloads ? 'bg-white left-[18px]' : 'bg-theme-text-muted left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. ACCOUNT SECTION & DARK MODE */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 border-b border-theme-border pb-2">Account & Theme</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    {/* Account card */}
                    <div className="p-4 bg-theme-card border border-theme-border rounded-2xl flex flex-col justify-between min-h-[9rem] h-auto">
                      {isSignedIn ? (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow uppercase">
                              {username.substring(0, 2) || 'AK'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-theme-text">{username}</h4>
                              <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">Active Member</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setIsSignedIn(false);
                              setLoginInput('');
                            }}
                            className="w-full text-xs font-black py-2 mt-4 rounded-xl transition-all cursor-pointer bg-theme-active-bg hover:bg-theme-sidebar-hover text-theme-text border border-theme-border"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2.5 w-full">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-theme-sidebar border border-theme-border flex items-center justify-center font-bold text-theme-text-muted text-sm shrink-0">
                              👤
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-theme-text">Login Required</h4>
                              <p className="text-[10px] text-theme-text-muted mt-0.5">Enter details to sign in</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              placeholder="Your Name"
                              value={loginInput}
                              onChange={(e) => setLoginInput(e.target.value)}
                              className="flex-1 text-xs font-bold bg-theme-sidebar border border-theme-border rounded-xl px-3 py-2 text-theme-text focus:outline-none focus:border-indigo-500 placeholder:text-theme-text-muted"
                            />
                            <button
                              onClick={() => {
                                const finalName = loginInput.trim() || 'User';
                                setUsername(finalName);
                                setIsSignedIn(true);
                              }}
                              className="text-xs font-black px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow shadow-indigo-600/20 transition cursor-pointer shrink-0"
                            >
                              Login
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dark mode half moon style card */}
                    <div className="p-4 bg-theme-card border border-theme-border rounded-2xl flex flex-col justify-between h-36 font-sans">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-base shrink-0">
                          🌙
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-theme-text">Theme Selection</h4>
                          <p className="text-[10px] text-theme-text-muted mt-0.5">Toggle between ambient modes</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="w-full flex items-center justify-between bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-3.5 py-2.5 rounded-xl text-xs font-bold text-theme-text transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌓</span>
                          <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-zinc-400'}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    </div>

                    {/* Premium Accent Colors block */}
                    <div className="p-4 bg-theme-card border border-theme-border rounded-2xl flex flex-col justify-between h-auto col-span-1 md:col-span-2 font-sans">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-base shrink-0">
                            🎨
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                              <span>System Accent Colors</span>
                            </h4>
                            <p className="text-[10px] text-theme-text-muted mt-0.5">Customize your app highlights and active buttons</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {[
                          { id: 'sky', label: 'Sky Blue 🌟', bg: 'bg-[#0ea5e9]' },
                          { id: 'emerald', label: 'Mint Emerald', bg: 'bg-[#34d399]' },
                          { id: 'purple', label: 'Neon Purple', bg: 'bg-[#8b5cf6]' },
                          { id: 'rose', label: 'Sunset Rose', bg: 'bg-[#f43f5e]' },
                          { id: 'blue', label: 'Electric Blue', bg: 'bg-[#3b82f6]' },
                          { id: 'gold', label: 'Gold Amber', bg: 'bg-[#f59e0b]' },
                        ].map((c) => {
                          const isActive = accentColor === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setAccentColor(c.id);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition ${
                                isActive 
                                  ? 'bg-theme-sidebar border-theme-highlight text-theme-text font-black scale-102 shadow' 
                                  : 'bg-theme-sidebar/50 hover:bg-theme-sidebar border-theme-border text-theme-text-muted hover:text-theme-text'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`} />
                              <span>{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'downloads' ? (
            /* ==================== OFFLINE DOWNLOADS MANAGER ==================== */
            <div className="max-w-4xl mx-auto text-theme-text space-y-6 animate-fade-in pb-16">
              {/* Header and close button */}
              <div className="p-6 md:p-8 bg-theme-card border border-theme-border rounded-3xl shadow-xl space-y-6 transition-colors duration-300 relative">
                <button
                  onClick={() => setActiveTab('home')}
                  className="absolute top-6 right-6 md:top-8 md:right-8 p-1.5 rounded-full hover:bg-theme-sidebar-hover text-theme-text-muted hover:text-theme-text transition duration-200 cursor-pointer"
                  title="Close Downloads"
                  aria-label="Close Downloads"
                  id="downloads-close-button"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-theme-text flex items-center gap-2.5">
                    <Download className="w-5 h-5 text-indigo-400" />
                    <span>Downloads Manager</span>
                  </h2>
                  <p className="text-xs text-theme-text-muted mt-1">Manage and playback your offline videos and high-fidelity audio tracks</p>
                </div>

                {/* Storage Info Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-theme-sidebar/60 border border-theme-border p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-theme-text">Offline Storage Used</h4>
                      <p className="text-[11px] font-semibold text-theme-text-muted mt-0.5">
                        {((downloadedVideos.length * 142) + (downloadedAudios.length * 9.4)).toFixed(1)} MB • Available: 112.5 GB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-theme-border pt-3 sm:pt-0 sm:pl-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <h4 className="text-xs font-bold text-theme-text">System Status</h4>
                      <p className="text-[11px] font-semibold text-theme-text-muted mt-0.5">
                        4K Playback and High-Fi 320kbps Audio fully cached
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Mode-specific Header for Separated Downloads */}
                <div className="border-b border-theme-border pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                    {appMode === 'video' ? '🎬 Saved Offline Videos' : '🎵 Saved Offline Songs'}
                  </span>
                </div>

                {/* Downloads Content Lists */}
                <div className="pt-2">
                  {appMode === 'video' ? (
                    /* Video Downloads List */
                    downloadedVideos.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                        <span className="text-3xl">🎬</span>
                        <h4 className="text-sm font-extrabold text-theme-text">No downloaded videos</h4>
                        <p className="text-xs text-theme-text-muted max-w-sm">
                          Browse our homepage feed or watch pages and tap the <strong>Download</strong> button to save videos offline up to 4K resolution.
                        </p>
                        <button
                          onClick={() => setActiveTab('home')}
                          className="text-xs font-black px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow"
                        >
                          Explore Home Feed
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CURATED_TRACKS.filter((t) => downloadedVideos.includes(t.id)).map((track) => (
                          <div
                            key={track.id}
                            className="flex gap-3 p-3 bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border rounded-2xl group transition relative"
                          >
                            <div
                              onClick={() => {
                                setAppMode('video');
                                selectTrackAndPlay(track.id);
                              }}
                              className="w-28 sm:w-32 h-16 sm:h-20 bg-black rounded-xl overflow-hidden relative shrink-0 cursor-pointer shadow border border-theme-border"
                            >
                              <img
                                src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const attempt = parseInt(target.getAttribute('data-attempt') || '0', 10);
                                  if (attempt === 0) {
                                    target.setAttribute('data-attempt', '1');
                                    target.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                                  } else if (attempt === 1) {
                                    target.setAttribute('data-attempt', '2');
                                    target.src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-white text-lg">▶️</span>
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                                {track.duration}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                              <div
                                onClick={() => {
                                  setAppMode('video');
                                  selectTrackAndPlay(track.id);
                                }}
                                className="cursor-pointer"
                              >
                                <h4 className="text-xs font-black text-theme-text group-hover:text-indigo-400 transition truncate leading-snug">
                                  {track.title}
                                </h4>
                                <p className="text-[10px] text-theme-text-muted mt-1 font-semibold truncate">{track.artist}</p>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md">
                                  {videoDownloadQuality === '4K' ? '4K Ultra HD' : videoDownloadQuality === '1080p' ? '1080p Full HD' : `${videoDownloadQuality}`}
                                </span>
                                <button
                                  onClick={() => toggleDownload(track.id, 'video')}
                                  className="p-1.5 rounded-lg text-theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                                  title="Delete download"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    /* Audio Downloads List */
                    downloadedAudios.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                        <span className="text-3xl">🎵</span>
                        <h4 className="text-sm font-extrabold text-theme-text">No downloaded audio tracks</h4>
                        <p className="text-xs text-theme-text-muted max-w-sm">
                          Switch to Audio mode in the player and tap the <strong>Download</strong> icon to save songs offline with full 320kbps fidelity.
                        </p>
                        <button
                          onClick={() => setActiveTab('home')}
                          className="text-xs font-black px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow"
                        >
                          Explore Home Feed
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                         {CURATED_TRACKS.filter((t) => downloadedAudios.includes(t.id)).map((track, index) => (
                          <div
                            key={track.id}
                            className="flex items-center justify-between p-3 bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border rounded-2xl group transition"
                          >
                            <div
                              onClick={() => {
                                setAppMode('audio');
                                selectTrackAndPlay(track.id);
                              }}
                              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                            >
                              <span className="text-xs font-bold font-mono text-theme-text-muted w-4 text-center shrink-0">
                                {index + 1}
                              </span>
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden shadow border border-theme-border"
                                style={{ background: track.audioBgGradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
                                  alt={track.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    const attempt = parseInt(target.getAttribute('data-attempt') || '0', 10);
                                    if (attempt === 0) {
                                      target.setAttribute('data-attempt', '1');
                                      target.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                                    } else if (attempt === 1) {
                                      target.setAttribute('data-attempt', '2');
                                      target.src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <span className="text-white text-xs">▶️</span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-theme-text group-hover:text-indigo-400 transition truncate leading-snug">
                                  {track.title}
                                </h4>
                                <p className="text-[10px] text-theme-text-muted mt-0.5 font-semibold truncate">{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pl-3 shrink-0">
                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-md">
                                {audioDownloadQuality === '320kbps' ? '320kbps Hi-Fi' : audioDownloadQuality}
                              </span>
                              <span className="text-[10px] font-bold font-mono text-theme-text-muted">
                                {track.duration}
                              </span>
                              <button
                                onClick={() => toggleDownload(track.id, 'audio')}
                                className="p-1.5 rounded-lg text-theme-text-muted hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                                title="Delete download"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : isWatchPageOpen ? (
            /* ==================== ACTIVE WATCH PAGE SCREEN ==================== */
            <div className="max-w-6xl mx-auto">
              {/* Player views toggle */}
              <div className="mb-8">
                {appMode === 'video' ? (
                  /* --- CLASSIC YOUTUBE VIDEO WATCH PAGE --- */
                  <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
                    <div className="flex-1 w-full relative group">
                      {/* Corner Close X Button */}
                      <button
                        onClick={() => setIsWatchPageOpen(false)}
                        className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/95 text-white flex items-center justify-center transition cursor-pointer shadow-lg border border-white/10"
                        title="Close Player"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Real responsive YouTube stream iframe or custom Vinyl Audio Screen */}
                      {isAudioOnlyWatch ? (
                        /* --- WATCH PAGE AUDIO ONLY PLAYER COVER ART SCREEN --- */
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-theme-border shadow-2xl flex flex-col items-center justify-center select-none animate-fade-in">
                          {/* Ambient background glow of the track */}
                          <div
                            className="absolute inset-0 blur-[60px] opacity-25 transition-all duration-1000 scale-125 pointer-events-none"
                            style={{ background: activeTrack.audioBgGradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                          ></div>

                          {/* Top audio mode badge */}
                          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            <span>Audio Stream</span>
                          </div>

                          {/* Spinning Vinyl disk or CD */}
                          <div className="relative flex items-center justify-center z-10 mt-[-16px]">
                            <div
                              className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
                                isPlaying ? 'animate-spin-slow' : 'scale-95'
                              }`}
                              style={{
                                background: `radial-gradient(circle, rgba(10,10,10,1) 30%, rgba(30,30,30,1) 70%, rgba(0,0,0,1) 100%)`,
                              }}
                            >
                              {/* Vinyl Grooves */}
                              <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none"></div>
                              <div className="absolute inset-3 rounded-full border border-white/5 pointer-events-none"></div>
                              <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none"></div>
                              <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none"></div>
                              <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none"></div>

                              {/* Glowing real album art in center */}
                              <div
                                className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden relative z-10 border-2 border-[#090909]"
                                style={{ background: activeTrack.audioBgGradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${activeTrack.id}/hqdefault.jpg`}
                                  alt={activeTrack.title}
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full object-cover rounded-full z-10"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-base select-none z-0">
                                  {activeTrack.title.charAt(0)}
                                </span>
                              </div>

                              {/* Spindle hole */}
                              <div className="w-2.5 h-2.5 bg-black rounded-full z-20 absolute"></div>
                            </div>
                          </div>

                          {/* Dynamic visualizer simulation overlay at bottom */}
                          <div className="absolute bottom-16 inset-x-0 flex items-center justify-center gap-1.5 h-8">
                            {[...Array(16)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-indigo-500 rounded-full"
                                animate={isPlaying ? {
                                  height: [8, Math.floor(Math.random() * 24) + 10, 8],
                                } : {
                                  height: 6
                                }}
                                transition={isPlaying ? {
                                  duration: 0.6 + (i * 0.05) % 0.4,
                                  repeat: Infinity,
                                  repeatType: 'reverse',
                                  ease: 'easeInOut',
                                } : {}}
                              />
                            ))}
                          </div>

                          {/* Playback Controls on Audio Only Card */}
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              🎧 Audio Stream
                            </span>
                            
                            <div className="flex items-center gap-4">
                              <button
                                onClick={handlePrevTrack}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                                title="Previous Track"
                              >
                                <SkipBack className="w-4 h-4 fill-white text-white" />
                              </button>
                              
                              <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition active:scale-95 cursor-pointer shadow-md"
                                title={isPlaying ? "Pause" : "Play"}
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 fill-black text-black stroke-[3]" />
                                ) : (
                                  <Play className="w-4 h-4 fill-black text-black ml-0.5 stroke-[3]" />
                                )}
                              </button>
                              
                              <button
                                onClick={handleNextTrack}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                                title="Next Track"
                              >
                                <SkipForward className="w-4 h-4 fill-white text-white" />
                              </button>
                            </div>

                            <span className="text-[10px] font-bold text-indigo-400 font-mono">
                              {activeTrack.duration}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* --- CLASSIC VISIBLE VIDEO PLAYER --- */
                        <YoutubePlayer
                          videoId={selectedTrackId}
                          appMode={appMode}
                          title={activeTrack.title}
                        />
                      )}

                      {/* Real hidden YouTube player running in the background to play the audio */}
                      {isAudioOnlyWatch && (
                        <div className="hidden pointer-events-none">
                          <YoutubePlayer
                            videoId={selectedTrackId}
                            appMode="audio"
                            title={activeTrack.title}
                          />
                        </div>
                      )}

                      {/* Active Track Title & Metadata info */}
                      <div className="mt-5 p-6 bg-theme-card border border-theme-border rounded-3xl">
                        <div className="pb-4 border-b border-theme-border">
                          <h2 className="text-lg font-black text-theme-text leading-tight">
                            {activeTrack.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-theme-text-muted font-semibold">{activeTrack.views}</span>
                            <span className="text-theme-text-muted/40 text-xs">•</span>
                            <span className="text-xs text-theme-text-muted font-semibold">{activeTrack.publishedAt}</span>
                          </div>
                        </div>

                        {/* Actions bar: Likes, Dislikes, Share, Save, and Audio Switch in a single horizontal scroll line */}
                        <div className="flex items-center justify-between gap-3 mt-5 pb-5 border-b border-theme-border overflow-x-auto scrollbar-hide w-full flex-nowrap">
                          <div className="flex items-center gap-2 shrink-0 flex-nowrap">
                            {/* Like button */}
                            <button
                              onClick={() => toggleLike(activeTrack.id)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0"
                            >
                              <span>{likedVideoIds.includes(activeTrack.id) ? '❤️' : '👍'}</span>
                              <span>{likedVideoIds.includes(activeTrack.id) ? 'Liked' : (activeTrack.likes || '5.2M')}</span>
                            </button>
                            {/* Dislike button */}
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0">
                              <span>👎</span>
                              <span>Dislike</span>
                            </button>
                            {/* Share button */}
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0">
                              <span>↗️</span>
                              <span>Share</span>
                            </button>
                            {/* Save button */}
                            <button
                              onClick={() => toggleSave(activeTrack.id)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0"
                            >
                              <span>{libraryTrackIds.includes(activeTrack.id) ? '📂 Saved' : '➕ Save'}</span>
                            </button>
                            {/* Download video button */}
                            <button
                              onClick={() => toggleDownload(activeTrack.id, 'video')}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border border-theme-border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0"
                            >
                              <span className={downloadingIds[activeTrack.id] === 'video' ? 'animate-spin inline-block' : ''}>
                                {downloadingIds[activeTrack.id] === 'video' ? '⏳' : '📥'}
                              </span>
                              <span>
                                {downloadingIds[activeTrack.id] === 'video'
                                  ? 'Downloading...'
                                  : downloadedVideos.includes(activeTrack.id)
                                  ? 'Downloaded'
                                  : 'Download'}
                              </span>
                            </button>
                            
                            {/* Audio Only toggle button */}
                            <button
                              onClick={() => setIsAudioOnlyWatch(!isAudioOnlyWatch)}
                              className={`flex items-center gap-1 text-[11px] font-bold border px-4 py-2 rounded-full transition duration-300 cursor-pointer shrink-0 ${
                                isAudioOnlyWatch
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                                  : 'text-theme-text bg-theme-sidebar hover:bg-theme-sidebar-hover border-theme-border'
                              }`}
                            >
                              <span>{isAudioOnlyWatch ? 'Video' : 'Audio'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Channel & Subscription controls */}
                        <div className="flex items-center justify-between mt-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white">
                              {activeTrack.channelAvatar}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-theme-text">{activeTrack.channel}</h4>
                              <p className="text-[10px] text-theme-text-muted">{activeTrack.subscribers}</p>
                            </div>
                          </div>
                          <button className="bg-theme-text hover:opacity-90 text-theme-bg text-xs font-bold px-5 py-2.5 rounded-full transition duration-300 cursor-pointer">
                            Subscribe
                          </button>
                        </div>
                      </div>

                      {/* YouTube Mobile Style Comments Preview Box */}
                      <div 
                        onClick={() => setIsCommentsDrawerOpen(true)}
                        className="mt-6 p-4.5 bg-theme-card border border-theme-border rounded-2xl cursor-pointer hover:bg-theme-sidebar-hover transition duration-200 select-none"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-theme-text">Comments</span>
                            <span className="text-[10px] text-theme-text-muted font-bold bg-theme-sidebar border border-theme-border px-2 py-0.5 rounded-full">
                              {activeTrackComments.length}
                            </span>
                          </div>
                          <span className="text-[10px] text-indigo-500 font-extrabold flex items-center gap-1">
                            <span>Tap to view all</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>

                        {activeTrackComments[activeCommentIdx] ? (
                          <div className="flex items-start gap-2.5 animate-fade-in" key={activeTrackComments[activeCommentIdx].id}>
                            <div className="w-6 h-6 rounded-full bg-theme-sidebar border border-theme-border flex items-center justify-center text-theme-text font-extrabold text-[10px] shrink-0">
                              {activeTrackComments[activeCommentIdx].avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-theme-text truncate max-w-[120px]">
                                  {activeTrackComments[activeCommentIdx].author}
                                </span>
                                <span className="text-[9px] text-theme-text-muted">{activeTrackComments[activeCommentIdx].time}</span>
                              </div>
                              <p className="text-xs text-theme-text-secondary line-clamp-1 leading-snug">
                                {activeTrackComments[activeCommentIdx].text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-theme-text-muted">Be the first to comment...</p>
                        )}
                      </div>

                      {/* YouTube-Style Comments Bottom Sheet Drawer Overlay */}
                      <AnimatePresence>
                        {isCommentsDrawerOpen && (
                          <>
                            {/* Backdrop shadow overlay */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setIsCommentsDrawerOpen(false)}
                              className="fixed inset-0 bg-black z-50 pointer-events-auto"
                            />

                            {/* Sliding bottom sheet drawer */}
                            <motion.div
                              initial={{ y: '100%' }}
                              animate={{ y: 0 }}
                              exit={{ y: '100%' }}
                              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                              className="fixed bottom-0 inset-x-0 h-[65vh] sm:h-[75vh] md:max-w-xl md:mx-auto md:rounded-t-3xl bg-theme-card border-t border-theme-border rounded-t-2xl z-50 flex flex-col shadow-2xl pointer-events-auto"
                            >
                              {/* Handle bar at top */}
                              <div className="w-12 h-1 bg-theme-text-muted/30 rounded-full mx-auto my-3 shrink-0" />

                              {/* Drawer Header */}
                              <div className="px-5 pb-3 border-b border-theme-border flex items-center justify-between shrink-0">
                                <div>
                                  <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
                                    <span>Comments</span>
                                    <span className="text-xs text-theme-text-muted bg-theme-sidebar border border-theme-border px-2.5 py-0.5 rounded-full font-bold">
                                      {activeTrackComments.length}
                                    </span>
                                  </h3>
                                </div>
                                <button
                                  onClick={() => setIsCommentsDrawerOpen(false)}
                                  className="w-8 h-8 rounded-full bg-theme-sidebar border border-theme-border hover:bg-theme-sidebar-hover flex items-center justify-center text-theme-text transition cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Interactive Comment Input field */}
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!newCommentText.trim()) return;
                                  const newComment = {
                                    id: 'uc_' + Date.now(),
                                    author: 'You',
                                    avatar: 'Y',
                                    text: newCommentText.trim(),
                                    likes: '0',
                                    time: 'Just now'
                                  };
                                  setCustomComments(prev => ({
                                    ...prev,
                                    [activeTrack.id]: [newComment, ...(prev[activeTrack.id] || [])]
                                  }));
                                  setNewCommentText('');
                                }}
                                className="p-4 border-b border-theme-border flex items-center gap-3 shrink-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 select-none">
                                  Y
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    className="flex-1 bg-theme-sidebar border border-theme-border rounded-full px-4 py-2 text-xs text-theme-text placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!newCommentText.trim()}
                                    className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 flex items-center justify-center text-white transition cursor-pointer shrink-0"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </form>

                              {/* Scrollable list of comments */}
                              <div className="flex-1 overflow-y-auto p-5 space-y-4.5 scrollbar-thin">
                                {activeTrackComments.map((comment) => (
                                  <div key={comment.id} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-theme-sidebar border border-theme-border flex items-center justify-center text-theme-text font-extrabold text-xs shrink-0 select-none">
                                      {comment.avatar}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-theme-text">{comment.author}</span>
                                        <span className="text-[10px] text-theme-text-muted font-semibold">{comment.time}</span>
                                      </div>
                                      <p className="text-xs text-theme-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {comment.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Right sidebar recommendation / Live feed */}
                    <div className="w-full lg:w-[350px] shrink-0 space-y-6">
                      {/* If stream is live, render full ActiveAudience interactions panel! */}
                      {activeTrack.isLive ? (
                        <div className="h-[480px]">
                          <ActiveAudience
                            trackId={selectedTrackId}
                            isIplStream={selectedTrackId === 'T-v8U1e02U4'}
                          />
                        </div>
                      ) : (
                        /* Else show Up Next recommended feed */
                        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-xl">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-theme-border">
                            <h3 className="text-xs font-extrabold text-theme-text uppercase tracking-wider">
                              Up Next Queue
                            </h3>
                            <span className="text-[10px] text-theme-text-muted font-semibold">Recommendations</span>
                          </div>
                          <div className="space-y-3.5">
                            {upNextList.map((rec) => (
                              <div
                                key={rec.id}
                                onClick={() => selectTrackAndPlay(rec.id)}
                                className="flex gap-3 items-start group cursor-pointer hover:bg-theme-sidebar-hover p-2 rounded-2xl transition duration-300"
                              >
                                <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-theme-sidebar shrink-0 border border-theme-border">
                                  {/* Overlay graphic */}
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-lg">
                                    {rec.category === 'live' || rec.isLive ? '🔴' : '▶'}
                                  </div>
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white">
                                    {rec.duration}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-theme-text group-hover:text-indigo-500 dark:group-hover:text-indigo-400 line-clamp-2 leading-tight transition">
                                    {rec.title}
                                  </h4>
                                  <p className="text-[10px] text-theme-text-muted mt-1 truncate">{rec.artist}</p>
                                  <span className="text-[9px] text-theme-text-muted/70">{rec.views}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* --- PREMIUM YOUTUBE MUSIC AUDIO (MP3) MODE --- */
                  <div className="animate-fade-in">
                    <AudioPlayerUI
                      track={activeTrack}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      onNext={handleNextTrack}
                      onPrev={handlePrevTrack}
                      upNext={upNextList}
                      onSelectTrack={selectTrackAndPlay}
                      appMode={appMode}
                      setAppMode={setAppMode}
                      onClose={() => setIsWatchPageOpen(false)}
                      onDownload={() => toggleDownload(activeTrack.id, 'audio')}
                      isDownloaded={downloadedAudios.includes(activeTrack.id)}
                      isPremium={isPremium}
                      onPremiumClick={() => setIsPremiumModalOpen(true)}
                      onLike={() => toggleLike(activeTrack.id)}
                      isLiked={likedAudioIds.includes(activeTrack.id)}
                      onSave={() => toggleSave(activeTrack.id)}
                      isSaved={playlistTrackIds.includes(activeTrack.id)}
                    />
                    {/* Keep standard Youtube embed stream running in the background */}
                    <div className="hidden">
                      <YoutubePlayer
                        videoId={selectedTrackId}
                        appMode="audio"
                        title={activeTrack.title}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : appMode === 'audio' ? (
            /* ==================== TUNE_TUBE PREMIUM AUDIO STATION ==================== */
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-theme-text pb-12">
              {/* Sub-tabs below header */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'music', label: 'Music', emoji: '🎵' },
                  { id: 'podcasts', label: 'Podcasts', emoji: '🎙️' },
                  { id: 'library', label: 'My Library', emoji: '📁' },
                ].map((tab) => {
                  const isActive = audioSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAudioSubTab(tab.id as any);
                        setSearchQuery('');
                      }}
                      className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-black transition duration-300 cursor-pointer border ${
                        isActive
                          ? 'scale-102 font-black'
                          : 'bg-theme-card text-theme-text-secondary hover:text-theme-text border-theme-border hover:bg-theme-sidebar-hover'
                      }`}
                      style={isActive ? {
                        backgroundColor: 'var(--highlight-color)',
                        borderColor: 'var(--highlight-color)',
                        color: '#000000',
                        boxShadow: '0 4px 12px var(--highlight-border-alpha)'
                      } : undefined}
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Results / Content switcher */}
              {searchQuery ? (
                /* ==================== SEARCH RESULTS SECTION ==================== */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                    <h3 className="text-xs font-extrabold text-theme-text-muted uppercase tracking-widest">
                      Search Results for "{searchQuery}"
                    </h3>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-white transition uppercase tracking-widest"
                    >
                      Clear Search
                    </button>
                  </div>

                  {CURATED_TRACKS.filter(t => 
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {CURATED_TRACKS.filter(t => 
                        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((item) => {
                        const isActive = item.id === selectedTrackId;
                        return (
                          <div
                            key={item.id}
                            onClick={() => selectTrackAndPlay(item.id)}
                            className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition duration-300 border ${
                              isActive
                                ? ''
                                : 'bg-theme-card hover:bg-theme-sidebar-hover border-theme-border'
                            }`}
                            style={isActive ? {
                              backgroundColor: 'var(--highlight-bg-alpha)',
                              borderColor: 'var(--highlight-color)',
                              boxShadow: '0 4px 12px var(--highlight-border-alpha)'
                            } : {}}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden border border-theme-border"
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                                  alt={item.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {isActive && isPlaying && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                                    <div className="flex items-end gap-0.5 h-3">
                                      <div className="w-0.5 h-1.5 animate-pulse" style={{ backgroundColor: 'var(--highlight-color)' }}></div>
                                      <div className="w-0.5 h-3 animate-pulse delay-75" style={{ backgroundColor: 'var(--highlight-color)' }}></div>
                                      <div className="w-0.5 h-1 animate-pulse delay-150" style={{ backgroundColor: 'var(--highlight-color)' }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 
                                  className="text-xs font-bold truncate leading-tight transition duration-200 text-theme-text"
                                  style={isActive ? { color: 'var(--highlight-color)' } : {}}
                                >
                                  {item.title}
                                </h4>
                                <p className="text-[10px] text-theme-text-muted font-semibold truncate mt-1">
                                  {item.artist}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 pl-2">
                              <span className="text-[10px] text-theme-text-muted font-bold font-mono">
                                {item.duration}
                              </span>
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                  isActive ? 'scale-100' : 'bg-theme-sidebar border border-theme-border text-theme-text-muted group-hover:scale-105'
                                }`}
                                style={isActive ? {
                                  backgroundColor: 'var(--highlight-color)',
                                  color: '#000000'
                                } : {}}
                              >
                                <Play className="w-2.5 h-2.5 fill-current translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-xs font-bold">No tracks match your search</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ==================== STANDARD SECTION GRIDS ==================== */
                <>
                  {audioSubTab === 'music' && (
                    <div className="space-y-8">
                      {/* Section 1: Your Usuals */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-black tracking-tight text-theme-text">Your Usuals</h2>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                          {CURATED_TRACKS.filter(t => t.category === 'music').slice(0, 9).map((item) => {
                            const isActive = item.id === selectedTrackId;
                            return (
                              <div
                                key={item.id}
                                onClick={() => selectTrackAndPlay(item.id)}
                                className="group cursor-pointer flex flex-col items-center text-center"
                              >
                                <div className="w-full aspect-square rounded-2xl overflow-hidden relative border border-theme-border transition-all duration-300 shadow-lg">
                                  <img
                                    src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                  
                                  {/* Center Translucent Play Icon Overlay */}
                                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition opacity duration-300">
                                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-[#00e676] group-hover:border-[#00e676] transition-all duration-300">
                                      <Play className="w-3 h-3 fill-white text-white group-hover:fill-black group-hover:text-black translate-x-0.5" />
                                    </div>
                                  </div>

                                  {/* Bottom Active Indicator bar */}
                                  {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00e676]"></div>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-theme-text-secondary mt-2 truncate w-full px-1 group-hover:text-indigo-600 dark:group-hover:text-[#00e676] transition duration-200">
                                  {item.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Pop & Party Hits */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-black tracking-tight text-theme-text">Pop & Party Hits</h2>
                        </div>
                        <div className="flex items-start gap-4 overflow-x-auto pb-3 scrollbar-hide px-1 -mx-1">
                          {[
                            { id: 'JGwWNGJdvx8', tag: 'ENG', banner: 'Ed Sheeran Specials', title: 'Ed Sheeran - Pop Hits', subtitle: 'Just Updated', gradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)' },
                            { id: '4NRXx6U8ABQ', tag: 'ENG', banner: '80s Synth Party', title: 'The Weeknd - Retro Synth', subtitle: 'Just Updated', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                            { id: 'kTJczUoc26U', tag: 'ENG', banner: 'Top Duos Mashup', title: 'Stay - Pop Anthems', subtitle: 'Just Updated', gradient: 'linear-gradient(135deg, #f12711, #f5af19)' },
                            { id: 'H5v3kku4y6Q', tag: 'ENG', banner: 'Summer Vibes Mix', title: 'Harry Styles Essentials', subtitle: 'Just Updated', gradient: 'linear-gradient(135deg, #2b5876, #4e4376)' }
                          ].map((playlist, idx) => {
                            return (
                              <div
                                key={idx}
                                onClick={() => selectTrackAndPlay(playlist.id)}
                                className="w-36 sm:w-40 shrink-0 group cursor-pointer"
                              >
                                <div className="w-full aspect-square rounded-2xl overflow-hidden relative border border-theme-border mb-2.5 shadow-md">
                                  <img
                                    src={`https://img.youtube.com/vi/${playlist.id}/mqdefault.jpg`}
                                    alt={playlist.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    referrerPolicy="no-referrer"
                                  />

                                  {/* Badge on top-left (logo) */}
                                  <div className="absolute top-2 left-2 w-4.5 h-4.5 rounded-full bg-[#00e676] flex items-center justify-center shadow-md">
                                    <span className="text-[9px] text-black font-black">✓</span>
                                  </div>

                                  {/* Badge on top-right (Language) */}
                                  <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[8px] font-extrabold text-[#00e676] border border-[#00e676]/20 px-1.5 py-0.5 rounded">
                                    {playlist.tag}
                                  </span>

                                  {/* Dynamic colored bottom banner bar on cover image */}
                                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-red-600/95 via-red-500/85 to-transparent py-3 px-2 text-center flex flex-col justify-end">
                                    <span className="font-black text-[9px] tracking-tight leading-none text-white uppercase">
                                      {playlist.banner}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-xs font-bold text-theme-text group-hover:text-indigo-600 dark:group-hover:text-[#00e676] transition truncate w-full">
                                  {playlist.title}
                                </h4>
                                <p className="text-[10px] text-theme-text-muted font-semibold truncate mt-0.5">
                                  {playlist.subtitle}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Recommended Artist Stations */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-black tracking-tight text-theme-text">Recommended Artist Stations</h2>
                        </div>
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
                          {[
                            { name: 'Ed Sheeran', count: '5.2M Listeners', initial: 'E', bg: 'linear-gradient(135deg, #141e30, #243b55)' },
                            { name: 'The Weeknd', count: '6.4M Listeners', initial: 'W', bg: 'linear-gradient(135deg, #F2994A, #F2C94C)' },
                            { name: 'Harry Styles', count: '3.1M Listeners', initial: 'H', bg: 'linear-gradient(135deg, #3a7bd5, #3a6073)' },
                            { name: 'Miley Cyrus', count: '2.8M Listeners', initial: 'M', bg: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                            { name: 'Lex Fridman', count: '1.2M Listeners', initial: 'L', bg: 'linear-gradient(135deg, #000000, #434343)' },
                            { name: 'Lofi Girl', count: '500K Listeners', initial: 'L', bg: 'linear-gradient(135deg, #654ea3, #eaafc8)' }
                          ].map((artist, idx) => {
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  // Clicking artist station searches that artist
                                  setSearchQuery(artist.name.split(' ')[0]);
                                }}
                                className="flex flex-col items-center text-center shrink-0 w-24 sm:w-28 group cursor-pointer"
                              >
                                <div
                                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg relative border border-theme-border group-hover:scale-105 transition-all duration-300"
                                  style={{ background: artist.bg }}
                                >
                                  {artist.initial}
                                  {/* TuneTube badge */}
                                  <div className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-[#00e676] flex items-center justify-center border-2 border-[#090909] shadow-md">
                                    <span className="text-[9px] text-black font-black">✓</span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-theme-text group-hover:text-indigo-600 dark:group-hover:text-[#00e676] transition duration-200 truncate w-full">
                                  {artist.name}
                                </span>
                                <span className="text-[10px] text-theme-text-muted font-semibold mt-0.5 truncate w-full">
                                  {artist.count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 4: Made For Your Moods */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-black tracking-tight text-theme-text">Made For Your Moods</h2>
                        </div>
                        <div className="flex items-start gap-4 overflow-x-auto pb-3 scrollbar-hide px-1 -mx-1">
                          {[
                            { id: 'JGwWNGJdvx8', banner: 'Workout MIX', title: 'Acoustic Workout MIX', subtitle: 'Includes Shape of You, Stay', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                            { id: '4NRXx6U8ABQ', banner: '80s Dance MIX', title: 'Retro 80s Dance MIX', subtitle: 'Includes Blinding Lights', gradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)' },
                            { id: 'U3ASj1L6_sY', banner: 'Drive MIX', title: 'Late Night Soul Drive', subtitle: 'Includes Adele, Coldplay', gradient: 'linear-gradient(135deg, #3a7bd5, #3a6073)' }
                          ].map((playlist, idx) => {
                            return (
                              <div
                                key={idx}
                                onClick={() => selectTrackAndPlay(playlist.id)}
                                className="w-36 sm:w-40 shrink-0 group cursor-pointer"
                              >
                                <div className="w-full aspect-square rounded-2xl overflow-hidden relative border border-theme-border mb-2.5 shadow-md">
                                  <img
                                    src={`https://img.youtube.com/vi/${playlist.id}/mqdefault.jpg`}
                                    alt={playlist.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    referrerPolicy="no-referrer"
                                  />

                                  <div className="absolute top-2 left-2 w-4.5 h-4.5 rounded-full bg-[#00e676] flex items-center justify-center shadow-md">
                                    <span className="text-[9px] text-black font-black">✓</span>
                                  </div>

                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md py-2 px-2.5 flex flex-col items-center justify-center text-center">
                                    <span className="font-extrabold text-[9px] tracking-tight text-[#00e676] uppercase">
                                      {playlist.banner}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-xs font-bold text-theme-text group-hover:text-indigo-600 dark:group-hover:text-[#00e676] transition truncate w-full">
                                  {playlist.title}
                                </h4>
                                <p className="text-[10px] text-theme-text-muted font-semibold truncate mt-0.5">
                                  {playlist.subtitle}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {audioSubTab === 'podcasts' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-theme-border pb-2">
                        <h2 className="text-sm font-black text-theme-text uppercase tracking-widest">🎙️ Premium Audio Podcasts</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CURATED_TRACKS.filter(t => t.category === 'podcast').map((item) => {
                          const isActive = item.id === selectedTrackId;
                          return (
                            <div
                              key={item.id}
                              onClick={() => selectTrackAndPlay(item.id)}
                              className={`group flex gap-4 p-4 rounded-3xl cursor-pointer border transition duration-300 ${
                                isActive
                                  ? ''
                                  : 'bg-theme-card hover:bg-theme-sidebar-hover border-theme-border'
                              }`}
                              style={isActive ? {
                                backgroundColor: 'var(--highlight-bg-alpha)',
                                borderColor: 'var(--highlight-color)',
                                boxShadow: '0 4px 12px var(--highlight-border-alpha)'
                              } : {}}
                            >
                              <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-theme-border relative overflow-hidden"
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                                  alt={item.title}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 
                                    className="text-xs font-extrabold truncate transition text-theme-text"
                                    style={isActive ? { color: 'var(--highlight-color)' } : {}}
                                  >
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-theme-text-secondary font-bold mt-1">{item.artist}</p>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-theme-text-muted font-extrabold mt-2">
                                  <span>{item.duration}</span>
                                  <span 
                                    className="uppercase font-extrabold"
                                    style={{ color: 'var(--highlight-color)' }}
                                  >
                                    Listen Now
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {audioSubTab === 'library' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-theme-border pb-2">
                        <h2 className="text-sm font-black text-theme-text uppercase tracking-widest">📁 My Curated Library</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CURATED_TRACKS.map((item) => {
                          const isActive = item.id === selectedTrackId;
                          return (
                            <div
                              key={item.id}
                              onClick={() => selectTrackAndPlay(item.id)}
                              className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition duration-300 border ${
                                isActive
                                  ? ''
                                  : 'bg-theme-card hover:bg-theme-sidebar-hover border-theme-border'
                              }`}
                              style={isActive ? {
                                backgroundColor: 'var(--highlight-bg-alpha)',
                                borderColor: 'var(--highlight-color)',
                                boxShadow: '0 4px 12px var(--highlight-border-alpha)'
                              } : {}}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden border border-theme-border"
                                >
                                  <img
                                    src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 
                                    className="text-xs font-bold truncate text-theme-text"
                                    style={isActive ? { color: 'var(--highlight-color)' } : {}}
                                  >
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-theme-text-secondary font-semibold truncate mt-1">
                                    {item.artist}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 pl-2">
                                <span className="text-[10px] text-theme-text-muted font-bold font-mono">
                                  {item.duration}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ==================== HOME / BROWSE FEED SCREEN (Videos) ==================== */
            <div className="max-w-6xl mx-auto">
              {/* Header / Active View information */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  {(!selectedPlaylistId && activeTab === 'home' && !searchQuery) ? null : (
                    <h2 className="text-lg font-black text-theme-text tracking-tight flex items-center gap-2">
                      {selectedPlaylistId ? <ListMusic className="w-5 h-5 text-indigo-400" /> : <Flame className="w-5 h-5 text-indigo-400 animate-pulse" />}
                      <span>
                        {selectedPlaylistId
                          ? `Playlist: ${activePlaylist?.name}`
                          : activeTab === 'live'
                          ? 'Live Arenas & Streams'
                          : activeTab === 'explore'
                          ? 'Shorts & Trending Hits'
                          : activeTab === 'library'
                          ? 'My Curated Audio Library'
                          : activeTab === 'history'
                          ? 'Playback History'
                          : activeTab === 'liked'
                          ? 'Liked Videos'
                          : ''}
                      </span>
                    </h2>
                  )}
                </div>

                {/* YouTube Filter Pills / Tags */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                  {['All', 'Music', 'Trending'].map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setSearchQuery('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                          isSelected
                            ? 'bg-theme-text text-theme-bg border-theme-text'
                            : 'bg-theme-card text-theme-text border-theme-border hover:bg-theme-sidebar-hover'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CURATED GRID OF VIDEOS */}
              {filteredTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {filteredTracks.map((item) => {
                    const isActive = item.id === selectedTrackId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => selectTrackAndPlay(item.id)}
                        className={`group cursor-pointer transition duration-300 relative flex flex-col justify-between ${
                          isActive ? 'scale-[1.01]' : ''
                        }`}
                      >
                        {/* Aspect Ratio Video Box */}
                        <div className={`relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 mb-3.5 border transition duration-300 ${isActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-theme-border group-hover:border-indigo-500/50'}`}>
                          {/* Real YouTube video thumbnail */}
                          <img
                            src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const attempt = parseInt(target.getAttribute('data-attempt') || '0', 10);
                              if (attempt === 0) {
                                target.setAttribute('data-attempt', '1');
                                target.src = `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`;
                              } else if (attempt === 1) {
                                target.setAttribute('data-attempt', '2');
                                target.src = `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`;
                              }
                            }}
                          />

                          {/* Live Indicator (No Music/Podcast mention) */}
                          {(item.isLive || item.category === 'live') && (
                            <span className="absolute top-2 left-2 bg-[#00e676] text-black font-extrabold text-[8px] tracking-wider px-2 py-0.5 rounded-full animate-pulse uppercase z-10">
                              🔴 LIVE
                            </span>
                          )}

                          <span className="absolute bottom-2 right-2 bg-black/85 text-[9px] font-extrabold tracking-mono text-gray-100 px-2 py-0.5 rounded-md z-10">
                            {item.duration}
                          </span>
                        </div>

                        {/* YouTube Card Layout with Channel Icon Left & Title Details Right */}
                        <div className="flex gap-3">
                          {/* Channel Avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-extrabold text-white text-xs shrink-0 shadow-md">
                            {item.channelAvatar}
                          </div>

                          {/* Text Details */}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[13px] font-bold text-theme-text group-hover:text-indigo-400 transition line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            
                            <div className="mt-1 text-xs text-theme-text-secondary">
                              <p className="hover:text-theme-text transition truncate font-medium">
                                {item.artist} • {item.channel}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-theme-text-muted">
                                <span>{item.views}</span>
                                <span>•</span>
                                <span>{item.publishedAt || '9 months ago'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-theme-card border border-theme-border rounded-3xl p-8 max-w-lg mx-auto">
                  <Search className="w-12 h-12 text-theme-text-muted mx-auto mb-4 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-theme-text mb-1">No search results found</h3>
                  <p className="text-xs text-theme-text-muted">
                    Try checking spelling or choosing another curated category tab!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom mini-player bar for background listening */}
      <AnimatePresence>
        {!isWatchPageOpen && activeTrack && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={(e) => {
              // Open watch page on click, unless the user clicks an interactive control button
              if ((e.target as HTMLElement).closest('button')) return;
              setIsWatchPageOpen(true);
            }}
            className="fixed bottom-0 inset-x-0 bg-theme-card/95 backdrop-blur-md border-t border-theme-border p-3.5 px-6 z-40 flex items-center justify-between gap-4 shadow-2xl cursor-pointer hover:bg-theme-sidebar-hover transition-colors"
          >
            {/* Visual Progress ticker line at very top of bar */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-theme-border">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-1000"
                style={{ width: '42%' }} // simple aesthetic mock progress
              ></div>
            </div>

            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:max-w-xs">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden border border-theme-border"
              >
                <img
                  src={`https://img.youtube.com/vi/${activeTrack.id}/mqdefault.jpg`}
                  alt={activeTrack.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-theme-text truncate">{activeTrack.title}</h4>
                <p className="text-[10px] text-theme-text-muted font-semibold mt-0.5 truncate">{activeTrack.artist}</p>
              </div>
            </div>

            {/* Middle Quick Engine Toggles (Only show if video mode to switch to audio, hide once in audio) */}
            {appMode === 'video' && (
              <div className="hidden sm:flex items-center gap-4 bg-theme-active-bg px-3.5 py-1.5 rounded-full border border-theme-border">
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-theme-text-muted uppercase tracking-wider">
                  <span>Active engine:</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAppMode('video')}
                    className={`text-[9px] font-bold px-3 py-1 rounded-full transition cursor-pointer ${
                      appMode === 'video'
                        ? 'bg-indigo-600 text-white font-extrabold'
                        : 'text-theme-text-muted hover:text-theme-text'
                    }`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => {
                      setAppMode('audio');
                      setIsWatchPageOpen(true);
                    }}
                    className={`text-[9px] font-bold px-3 py-1 rounded-full transition cursor-pointer ${
                      appMode === 'audio'
                        ? 'bg-indigo-600 text-white font-extrabold'
                        : 'text-theme-text-muted hover:text-theme-text'
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>
            )}

            {/* Quick Player Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevTrack}
                className="hidden sm:flex text-theme-text-muted hover:text-theme-text p-2 rounded-full hover:bg-theme-sidebar-hover cursor-pointer"
              >
                ⏮
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white hover:scale-105 active:scale-95 flex items-center justify-center transition duration-200 shadow-md cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />}
              </button>
              <button
                onClick={handleNextTrack}
                className="text-theme-text-muted hover:text-theme-text p-2 rounded-full hover:bg-theme-sidebar-hover cursor-pointer"
              >
                ⏭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spectacular Premium Upgrade & Comparison Modal */}
      <AnimatePresence>
        {isPremiumModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#181614] to-[#0a0a0a] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Gold gradient top crown bar */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsPremiumModalOpen(false);
                  setCouponMessage(null);
                  setCouponCode('');
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 border border-white/5 text-gray-400 hover:text-white transition duration-200 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Body: Scrollable */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 scrollbar-hide flex-1">
                {/* Header branding */}
                <div className="text-center space-y-2 mt-2">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest animate-pulse">
                    <span>👑</span>
                    <span>Isaipadam VIP Pass</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 tracking-tight">
                    Upgrade to Premium
                  </h2>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    Enjoy the ultimate cinematic and Hi-Fi acoustic experience without boundaries.
                  </p>
                </div>

                {/* Price Display Block */}
                <div className="bg-[#12100e] border border-amber-500/10 rounded-2xl p-4.5 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-bl-xl animate-bounce">
                    First-time Offer
                  </div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Monthly Membership</p>
                  <div className="flex items-center justify-center gap-3.5 mt-2">
                    <span className="text-gray-500 line-through text-lg font-black">$2.00</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                      $1.00
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest ml-1">/ Month</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-400/80 font-bold mt-1.5">
                    🔥 50% discount applied automatically for first-time subscribers!
                  </p>
                </div>

                {/* Grid of features comparisons */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Features Comparison</h3>
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 text-xs">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 bg-[#121212] border-b border-white/5 p-3 font-black uppercase text-[10px] text-gray-400">
                      <span>Feature Benefit</span>
                      <span className="text-center">Free Mode</span>
                      <span className="text-center text-amber-400 flex items-center justify-center gap-1">
                        <span>👑 Premium</span>
                      </span>
                    </div>

                    {/* Comparisons */}
                    {[
                      { name: '🎥 8K Ultra HD Playback', free: '❌ (Max 1080p)', premium: '✅ Cinematic up to 8K/4K' },
                      { name: '📥 Unlimited Storage Cache', free: '❌ (5 tracks maximum)', premium: '✅ Unlimited MP3/Video' },
                      { name: '🚫 Zero Sponsored Ads', free: '❌ (Video promo banners)', premium: '✅ 100% Ad-Free Experience' },
                      { name: '🎙️ Synced Karaoke Click-Seek', free: '❌ (Static auto-scroll)', premium: '✅ Tap line to sing along' },
                      { name: '🎨 Accent Highlight Customizer', free: '❌ (Default Emerald only)', premium: '✅ Purple, Rose, Blue, Amber' },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-3 border-b border-white/5 last:border-b-0 items-center font-semibold text-gray-300">
                        <span>{row.name}</span>
                        <span className="text-center text-gray-500 text-[11px]">{row.free}</span>
                        <span className="text-center text-amber-300 text-[11px] font-black">{row.premium}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon Code Place */}
                <div className="space-y-3 p-4.5 bg-[#121212] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Have a Coupon Code?</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Promo Code (e.g., FIRST50, TUNE50)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponMessage(null);
                      }}
                      className="flex-1 bg-black text-xs font-black text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-gray-600 uppercase"
                    />
                    <button
                      onClick={() => {
                        const trimmed = couponCode.trim().toUpperCase();
                        if (!trimmed) {
                          setCouponMessage({ text: 'Please enter a coupon code first.', isError: true });
                          return;
                        }
                        // Simulate coupon verification
                        setDiscountApplied(true);
                        setCouponMessage({
                          text: `🎉 Code "${trimmed}" applied! 100% discount granted - Premium is now FREE!`,
                          isError: false,
                        });
                        setIsPremium(true);
                      }}
                      className="text-xs font-black px-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition cursor-pointer hover:scale-102 active:scale-98 shrink-0"
                    >
                      Claim Code
                    </button>
                  </div>

                  {couponMessage && (
                    <div className={`text-[11px] font-bold mt-1 ${couponMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                      {couponMessage.text}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {isPremium ? (
                    <div className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
                      <span>🎉 VIP Premium Active! Enjoy Unlimited Benefits</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsPremium(true);
                        // Show success message or auto close
                        setCouponMessage({
                          text: '👑 Subscription Activated Successfully! Welcome to Isaipadam Premium!',
                          isError: false,
                        });
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-sm transition hover:scale-102 active:scale-98 cursor-pointer shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
                    >
                      <span>🚀 Unlock Premium - $1.00 / month</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Search Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              {/* Close voice search */}
              <button
                onClick={() => setIsListening(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center space-y-4">
                {/* Glowing Mic Container */}
                <div className="w-20 h-20 bg-indigo-600/10 border-2 border-indigo-500/40 rounded-full flex items-center justify-center text-indigo-400 relative">
                  {/* Bouncing radar ring */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500/25 animate-ping" />
                  <Mic className="w-8 h-8 relative z-10 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">
                    {voiceSearchStatus}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Try speaking a song title or artist name...
                  </p>
                </div>
              </div>

              {/* Soundwaves visualizer */}
              <div className="flex items-end justify-center gap-1 h-8 px-4">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isListening ? [8, Math.random() * 28 + 8, 8] : 8,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + i * 0.08,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>

              {/* Real-time transcribed text */}
              {voiceTranscript && (
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-1">
                    Live Transcript
                  </span>
                  <p className="text-sm font-black text-white italic">
                    "{voiceTranscript}"
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
