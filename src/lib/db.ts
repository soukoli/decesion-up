/**
 * Database Connection for Neon PostgreSQL
 * Based on brain-food project pattern
 * SERVER-ONLY - Do not import in client components
 */

import { Pool, PoolConfig } from 'pg';

// Re-export constants from shared file
export { NOTE_CATEGORIES, type NoteCategory, type PodcastNote } from './notes-constants';

// Singleton pool instance
let pool: Pool | undefined;

/**
 * Parse connection string and extract components
 */
function parseConnectionString(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const params = url.searchParams;

  // Determine SSL configuration
  const sslMode = params.get('sslmode');
  let ssl: PoolConfig['ssl'] = false;

  if (sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'prefer') {
    ssl = {
      rejectUnauthorized: sslMode === 'verify-full',
    };
  }

  // Remove params that cause issues
  params.delete('sslmode');
  params.delete('channel_binding');

  return {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 5432,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1), // Remove leading "/"
    ssl,
    max: 10,
  };
}

/**
 * Check if we're in build phase (no DB needed)
 */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    if (isBuildPhase()) {
      throw new Error('Database not available during build phase');
    }

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error('Missing database connection. Set DATABASE_URL or POSTGRES_URL.');
    }

    // Check if it's a Neon or other cloud database (has sslmode in URL)
    if (connectionString.includes('sslmode=')) {
      const config = parseConnectionString(connectionString);
      pool = new Pool(config);
    } else {
      // Local development - simple connection string
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
    }

    console.log('Database pool created');
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Health check - verifies database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Close database connections (for graceful shutdown)
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

// ============================================
// Database Schema Initialization
// ============================================

export async function initDatabase() {
  try {
    // Create podcast_notes table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS podcast_notes (
        id SERIAL PRIMARY KEY,
        podcast_id VARCHAR(255) NOT NULL,
        podcast_name VARCHAR(255) NOT NULL,
        episode_title VARCHAR(500) NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Add category column if it doesn't exist (migration for existing tables)
    await query(`
      ALTER TABLE podcast_notes 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100)
    `);
    
    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_podcast_notes_podcast_id 
      ON podcast_notes(podcast_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_podcast_notes_category 
      ON podcast_notes(category)
    `);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

// ============================================
// CRUD Operations
// ============================================

// Import PodcastNote type from shared constants
import type { PodcastNote } from './notes-constants';

// Create a new note
export async function createPodcastNote(
  podcastId: string,
  podcastName: string,
  episodeTitle: string,
  note: string,
  category?: string
): Promise<PodcastNote> {
  const result = await query<PodcastNote>(
    `INSERT INTO podcast_notes (podcast_id, podcast_name, episode_title, note, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [podcastId, podcastName, episodeTitle, note, category || null]
  );
  return result[0];
}

// Get or create a note for a specific episode (upsert-like behavior)
export async function getOrCreateNoteForEpisode(
  podcastId: string,
  podcastName: string,
  episodeTitle: string
): Promise<PodcastNote> {
  // First try to get existing note
  const existing = await query<PodcastNote>(
    `SELECT * FROM podcast_notes 
     WHERE podcast_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [podcastId]
  );
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new empty note
  return createPodcastNote(podcastId, podcastName, episodeTitle, '');
}

// Get all notes for a specific podcast
export async function getNotesByPodcastId(podcastId: string): Promise<PodcastNote[]> {
  return query<PodcastNote>(
    `SELECT * FROM podcast_notes 
     WHERE podcast_id = $1
     ORDER BY created_at DESC`,
    [podcastId]
  );
}

// Get all notes
export async function getAllNotes(): Promise<PodcastNote[]> {
  return query<PodcastNote>(
    `SELECT * FROM podcast_notes 
     ORDER BY updated_at DESC
     LIMIT 100`
  );
}

// Get a single note by ID
export async function getNoteById(id: number): Promise<PodcastNote | null> {
  const result = await query<PodcastNote>(
    `SELECT * FROM podcast_notes 
     WHERE id = $1`,
    [id]
  );
  return result[0] || null;
}

// Update a note
export async function updatePodcastNote(
  id: number,
  note: string,
  category?: string
): Promise<PodcastNote | null> {
  const result = await query<PodcastNote>(
    `UPDATE podcast_notes 
     SET note = $1, 
         category = COALESCE($2, category),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [note, category || null, id]
  );
  return result[0] || null;
}

// Append text to an existing note
export async function appendToNote(
  id: number,
  textToAppend: string
): Promise<PodcastNote | null> {
  const result = await query<PodcastNote>(
    `UPDATE podcast_notes 
     SET note = CASE 
           WHEN note = '' THEN $1
           ELSE note || E'\\n\\n' || $1
         END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [textToAppend, id]
  );
  return result[0] || null;
}

// Delete a note
export async function deletePodcastNote(id: number): Promise<boolean> {
  const result = await query<{ id: number }>(
    `DELETE FROM podcast_notes 
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return result.length > 0;
}

// Get notes by category
export async function getNotesByCategory(category: string): Promise<PodcastNote[]> {
  return query<PodcastNote>(
    `SELECT * FROM podcast_notes 
     WHERE category = $1
     ORDER BY created_at DESC`,
    [category]
  );
}

// Get all unique categories used
export async function getUsedCategories(): Promise<string[]> {
  const result = await query<{ category: string }>(
    `SELECT DISTINCT category FROM podcast_notes 
     WHERE category IS NOT NULL
     ORDER BY category`
  );
  return result.map(r => r.category);
}
