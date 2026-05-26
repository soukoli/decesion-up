import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const BACKUP_FILENAME = 'decisionup-backup.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

// GET - Get backup info (last backup date)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.provider_token) {
      return NextResponse.json({ error: 'No Google token. Please sign out and sign in again.' }, { status: 401 });
    }

    const token = session.provider_token;

    // Search for backup file in appDataFolder
    const searchRes = await fetch(
      `${DRIVE_API}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,modifiedTime)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!searchRes.ok) {
      return NextResponse.json({ exists: false, lastBackup: null });
    }

    const searchData = await searchRes.json();
    const file = searchData.files?.[0];

    return NextResponse.json({
      exists: !!file,
      lastBackup: file?.modifiedTime || null,
    });
  } catch (error) {
    console.error('Backup info error:', error);
    return NextResponse.json({ exists: false, lastBackup: null });
  }
}

// POST - Create backup
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session?.provider_token || !user) {
      return NextResponse.json({ error: 'No Google token. Please sign out and sign in again.' }, { status: 401 });
    }

    const token = session.provider_token;

    // Fetch all user data
    const [rawRes, aiRes, groupsRes] = await Promise.all([
      supabase.from('ideas_raw').select('*').eq('user_id', user.id),
      supabase.from('ideas_ai').select('*').eq('user_id', user.id),
      supabase.from('idea_groups').select('*').eq('user_id', user.id),
    ]);

    const backupData = {
      version: 1,
      app: 'DecisionUp',
      createdAt: new Date().toISOString(),
      userId: user.id,
      data: {
        ideas_raw: rawRes.data || [],
        ideas_ai: aiRes.data || [],
        idea_groups: groupsRes.data || [],
      },
    };

    const content = JSON.stringify(backupData, null, 2);

    // Check if file exists
    const searchRes = await fetch(
      `${DRIVE_API}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();
    const existingFileId = searchData.files?.[0]?.id;

    if (existingFileId) {
      // Update existing file
      await fetch(
        `${DRIVE_UPLOAD}/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: content,
        }
      );
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: BACKUP_FILENAME,
        parents: ['appDataFolder'],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: 'application/json' }));

      await fetch(
        `${DRIVE_UPLOAD}/files?uploadType=multipart`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
    }

    return NextResponse.json({ success: true, backedUp: new Date().toISOString() });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}

// PUT - Restore from backup
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session?.provider_token || !user) {
      return NextResponse.json({ error: 'No Google token. Please sign out and sign in again.' }, { status: 401 });
    }

    const token = session.provider_token;

    // Find backup file
    const searchRes = await fetch(
      `${DRIVE_API}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;

    if (!fileId) {
      return NextResponse.json({ error: 'No backup found' }, { status: 404 });
    }

    // Download file content
    const downloadRes = await fetch(
      `${DRIVE_API}/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const backupData = await downloadRes.json();

    if (!backupData?.data) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    // Restore idea_groups first (referenced by ideas_ai)
    if (backupData.data.idea_groups?.length > 0) {
      for (const group of backupData.data.idea_groups) {
        await supabase.from('idea_groups').upsert({
          id: group.id,
          user_id: user.id,
          name: group.name,
          color: group.color,
          ai_generated: group.ai_generated ?? true,
          created_at: group.created_at,
          updated_at: group.updated_at,
        }, { onConflict: 'id' });
      }
    }

    // Restore ideas_raw
    if (backupData.data.ideas_raw?.length > 0) {
      for (const raw of backupData.data.ideas_raw) {
        await supabase.from('ideas_raw').upsert({
          id: raw.id,
          user_id: user.id,
          content: raw.content,
          source: raw.source || 'text',
          podcast_name: raw.podcast_name || null,
          created_at: raw.created_at,
        }, { onConflict: 'id' });
      }
    }

    // Restore ideas_ai
    if (backupData.data.ideas_ai?.length > 0) {
      for (const ai of backupData.data.ideas_ai) {
        await supabase.from('ideas_ai').upsert({
          id: ai.id,
          raw_id: ai.raw_id,
          user_id: user.id,
          title: ai.title,
          context: ai.context || null,
          priority: ai.priority || 'blue',
          status: ai.status || 'active',
          group_id: ai.group_id || null,
          ai_label: ai.ai_label || null,
          ai_reason: ai.ai_reason || null,
          done_at: ai.done_at || null,
          created_at: ai.created_at,
          updated_at: ai.updated_at,
        }, { onConflict: 'id' });
      }
    }

    return NextResponse.json({
      success: true,
      restored: {
        groups: backupData.data.idea_groups?.length || 0,
        ideas: backupData.data.ideas_ai?.length || 0,
      },
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
