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

// Mapování mezi podcast kategoriemi a note kategoriemi pro smart předvyplnění
export const PODCAST_TO_NOTE_CATEGORY_MAPPING: Record<string, NoteCategory> = {
  'Tech': 'ai-tech',
  'Science': 'science', 
  'Business': 'business',
  'Czech': 'other', // Český podcast může být různé téma, defaultní "other"
};

/**
 * Automatické rozpoznání kategorie poznámky na základě kategorie podcastu
 */
export function suggestNoteCategoryFromPodcast(podcastCategory: string): NoteCategory {
  return PODCAST_TO_NOTE_CATEGORY_MAPPING[podcastCategory] || 'other';
}

/**
 * Rozšířené mapování na základě názvu podcastu pro lepší přesnost
 */
export function suggestNoteCategoryFromPodcastName(podcastName: string, category: string): NoteCategory {
  const name = podcastName.toLowerCase();
  
  // Specifické mapování podle názvu
  if (name.includes('huberman')) return 'health';
  if (name.includes('lex fridman')) return 'ai-tech';
  if (name.includes('planet money')) return 'economics';
  if (name.includes('how i built')) return 'business';
  if (name.includes('na vlně ai') || name.includes('ai v kostce')) return 'ai-tech';
  if (name.includes('insider')) return 'business';
  if (name.includes('ted talk')) return 'philosophy'; // TED Talky jsou často filozofické
  
  // Fallback na kategorii
  return suggestNoteCategoryFromPodcast(category);
}

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