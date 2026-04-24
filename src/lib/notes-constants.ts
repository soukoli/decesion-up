/**
 * Shared constants for notes - safe for client and server
 */

// Note categories with translations
export const NOTE_CATEGORIES = [
  { value: 'ai-tech', labelEn: 'AI & Technology', labelCs: 'AI & Technologie' },
  { value: 'productivity', labelEn: 'Productivity', labelCs: 'Produktivita' },
  { value: 'business', labelEn: 'Business', labelCs: 'Podnikání' },
  { value: 'science', labelEn: 'Science', labelCs: 'Věda' },
  { value: 'philosophy', labelEn: 'Philosophy', labelCs: 'Filosofie' },
  { value: 'health', labelEn: 'Health', labelCs: 'Zdraví' },
  { value: 'psychology', labelEn: 'Psychology', labelCs: 'Psychologie' },
  { value: 'history', labelEn: 'History', labelCs: 'Historie' },
  { value: 'economics', labelEn: 'Economics', labelCs: 'Ekonomika' },
  { value: 'other', labelEn: 'Other', labelCs: 'Ostatní' },
] as const;

export type NoteCategory = typeof NOTE_CATEGORIES[number]['value'];

// Podcast Note type (shared between client and server)
export interface PodcastNote {
  id: number;
  podcast_id: string;
  podcast_name: string;
  episode_title: string;
  note: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}
