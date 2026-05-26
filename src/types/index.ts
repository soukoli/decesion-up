// Core domain types for Decision App New
// MUST match DB schema in supabase/migrations/

export type Priority = 'red' | 'yellow' | 'blue' | 'purple';
export type IdeaStatus = 'active' | 'done' | 'archived';
export type IdeaSource = 'text' | 'voice' | 'podcast' | 'school';

// Table: public.ideas_raw
export interface IdeaRaw {
  id: string;
  user_id: string;
  content: string;
  source: IdeaSource;
  podcast_name?: string;
  created_at: string;
}

// Table: public.ideas_ai
export interface IdeaAI {
  id: string;
  raw_id: string;
  user_id: string;
  title: string;
  context?: string;
  priority: Priority;
  status: IdeaStatus;
  group_id?: string;
  ai_label?: string;
  ai_reason?: string;
  done_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relations (not stored)
  group?: IdeaGroup;
  raw?: IdeaRaw;
  // Client-only flag (not in DB)
  _processing?: boolean;
}

// Table: public.idea_groups
export interface IdeaGroup {
  id: string;
  user_id: string;
  name: string;
  color: Priority;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  // Computed (not stored)
  ideas_count?: number;
}

// Table: public.user_profile
export interface UserProfile {
  id: string;
  font_size: 'sm' | 'md' | 'lg';
  language: 'cs' | 'en';
  theme: 'dark' | 'light' | 'system';
  google_token?: string;
  google_refresh_token?: string;
  created_at: string;
  updated_at: string;
}

// Priority colors for UI
export const PRIORITY_CONFIG: Record<Priority, { label: string; labelCz: string; color: string; bg: string }> = {
  red: { label: 'Critical', labelCz: 'Kritické', color: 'text-red-400', bg: 'bg-red-500/20' },
  yellow: { label: 'Normal', labelCz: 'Normální', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  blue: { label: 'Ideas', labelCz: 'Nápady', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  purple: { label: 'Future', labelCz: 'Budoucnost', color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

// ===== Feed types (from DecisionApp) =====

export interface PodcastEpisode {
  id: string;
  podcastName: string;
  title: string;
  description: string;
  duration: string;
  pubDate: string;
  imageUrl: string;
  spotifyUrl: string;
  youtubeUrl?: string;
  webUrl?: string;
  category: string;
  categoryColor: string;
}

export interface TechTrend {
  id: string;
  title: string;
  url: string;
  score: number;
  comments: number;
  source: 'hackernews' | 'devto' | 'github';
  timeAgo: string;
}

export interface WorldNews {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  credibility?: number;
  freshness?: 'hot' | 'fresh' | 'recent' | 'old';
  sourceType?: 'public' | 'private' | 'independent';
  isLocal?: boolean;
}

export interface AIResearch {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  url: string;
  category: string;
  publishedAt: string;
}

export interface SchoolArticle {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  imageUrl: string | null;
  articleUrl: string;
  category: 'Novinky' | 'Družina';
  categoryColor: string;
}
