import React from 'react';
import { Home, FolderHeart, History, ThumbsUp, Settings2, PlaySquare, Music, Tv, Download } from 'lucide-react';
import { ActiveTab, AppMode, Playlist } from '../types';
import { PLAYLISTS } from '../data/musicData';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  onSelectTrack: (trackId: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isSignedIn: boolean;
  username: string;
  isPremium?: boolean;
  onPremiumClick?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  appMode,
  setAppMode,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onSelectTrack,
  isDarkMode,
  setIsDarkMode,
  isSignedIn,
  username,
  isPremium = false,
  onPremiumClick,
}: SidebarProps) {
  
  // Navigation items as requested: Home, Subscriptions, Library, History, Liked Videos, Downloads, Settings
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: appMode === 'video' ? 'Library' : 'Playlist', icon: FolderHeart },
    { id: 'history', label: 'History', icon: History },
    { id: 'liked', label: appMode === 'video' ? 'Liked Videos' : 'Liked Audio', icon: ThumbsUp },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ] as const;

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylistId(playlist.id);
    setActiveTab('home'); // Go to home list of tracks
  };

  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme-border h-full flex flex-col justify-between select-none transition-colors duration-300">
      <div className="flex-1 py-4 overflow-y-auto">
        {/* Navigation Section */}
        <div className="px-2 mb-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && selectedPlaylistId === null;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setSelectedPlaylistId(null);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-5 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-theme-active-bg text-theme-text font-bold'
                      : 'text-theme-text-secondary hover:bg-theme-sidebar-hover'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#6366F1]' : 'text-theme-text-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-theme-border my-3 mx-4"></div>

        {/* Dark Mode Switch Toggle */}
        <div className="px-3 mb-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-card border border-theme-border">
            <div className="flex items-center gap-2.5">
              <span className="text-sm select-none">{isDarkMode ? '🌙' : '☀️'}</span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-theme-text-secondary">
                Dark Mode
              </span>
            </div>
            <button
              id="sidebar-darkmode-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none ${
                isDarkMode ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
              aria-label="Toggle Dark Mode"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* User Footer info: Clean Profile access that hides email outside & links directly to Settings */}
      <div 
        onClick={() => {
          setSelectedPlaylistId(null);
          setActiveTab('settings');
        }}
        className="p-4 border-t border-theme-border bg-theme-sidebar hover:bg-theme-sidebar-hover transition cursor-pointer"
        title="Open Settings"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-xs shadow-md uppercase">
            {isSignedIn ? (username.substring(0, 2) || 'AK') : 'GU'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-theme-text truncate">
              {isSignedIn ? username : 'Guest User'}
            </h4>
            <p className="text-[9px] text-theme-text-muted font-semibold">
              {isSignedIn ? 'Settings & Account' : 'Click to Login'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
