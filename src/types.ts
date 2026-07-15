export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: string;
  time: string;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration: string;
  category: 'music' | 'video' | 'live' | 'podcast' | 'sports' | 'shopping';
  views: string;
  likes: string;
  channel: string;
  channelAvatar: string;
  subscribers: string;
  publishedAt: string;
  audioBgGradient?: string;
  lyrics?: LyricLine[];
  comments: Comment[];
  isLive?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
  trackIds: string[];
}

export type AppMode = 'video' | 'audio';

export type ActiveTab = 'home' | 'explore' | 'live' | 'library' | 'favorites' | 'history' | 'liked' | 'settings' | 'downloads';
