import { NextRequest, NextResponse } from 'next/server';
import { 
  createPodcastNote, 
  getAllNotes, 
  getNotesByPodcastId,
  getNotesByCategory,
  getOrCreateNoteForEpisode,
  updatePodcastNote,
  appendToNote,
  deletePodcastNote,
  initDatabase,
  NOTE_CATEGORIES
} from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Don't throw - let individual operations fail gracefully
    }
  }
}

// GET - Get all notes or notes for a specific podcast/category
export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const { searchParams } = new URL(request.url);
    const podcastId = searchParams.get('podcastId');
    const category = searchParams.get('category');
    const getCategories = searchParams.get('categories');
    
    // Return available categories
    if (getCategories === 'true') {
      return NextResponse.json({ categories: NOTE_CATEGORIES });
    }
    
    let notes;
    if (podcastId) {
      notes = await getNotesByPodcastId(podcastId);
    } else if (category) {
      notes = await getNotesByCategory(category);
    } else {
      notes = await getAllNotes();
    }
    
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create a new note or get/create for episode
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const { podcastId, podcastName, episodeTitle, note, category, getOrCreate } = body;
    
    if (!podcastId || !podcastName || !episodeTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: podcastId, podcastName, episodeTitle' },
        { status: 400 }
      );
    }
    
    // If getOrCreate flag is set, use upsert-like behavior
    if (getOrCreate) {
      const existingOrNew = await getOrCreateNoteForEpisode(podcastId, podcastName, episodeTitle);
      return NextResponse.json({ note: existingOrNew }, { status: 200 });
    }
    
    // Otherwise require note content
    if (!note) {
      return NextResponse.json(
        { error: 'Missing required field: note' },
        { status: 400 }
      );
    }
    
    const newNote = await createPodcastNote(podcastId, podcastName, episodeTitle, note, category);
    
    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// PUT - Update a note (full update)
export async function PUT(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const { id, note, category } = body;
    
    if (!id || note === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id, note' },
        { status: 400 }
      );
    }
    
    const updatedNote = await updatePodcastNote(id, note, category);
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// PATCH - Append text to an existing note
export async function PATCH(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const { id, text } = body;
    
    if (!id || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: id, text' },
        { status: 400 }
      );
    }
    
    const updatedNote = await appendToNote(id, text);
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Error appending to note:', error);
    
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to append to note' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    const deleted = await deletePodcastNote(parseInt(id));
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
