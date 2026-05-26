import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// POST - Create new idea (raw input)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, source = 'text', podcast_name } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ideas_raw')
      .insert({
        user_id: user.id,
        content: content.trim(),
        source,
        podcast_name: podcast_name || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
    }

    return NextResponse.json({ idea: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List all ideas (AI-processed)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const priority = searchParams.get('priority');
    const group_id = searchParams.get('group_id');

    let query = supabase
      .from('ideas_ai')
      .select('*, idea_groups(*)')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (priority) query = query.eq('priority', priority);
    if (group_id) query = query.eq('group_id', group_id);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }

    return NextResponse.json({ ideas: data || [] });
  } catch (error) {
    console.error('Error in GET /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update idea (done, archive, edit)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, title, context, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (title) updates.title = title;
    if (context !== undefined) updates.context = context;
    if (priority) updates.priority = priority;
    if (status === 'done') updates.done_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('ideas_ai')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating idea:', error);
      return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
    }

    return NextResponse.json({ idea: data });
  } catch (error) {
    console.error('Error in PATCH /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Hard delete idea
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get the raw_id before deleting AI idea
    const { data: idea } = await supabase
      .from('ideas_ai')
      .select('raw_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    // Delete AI idea (cascades to idea_links)
    await supabase.from('ideas_ai').delete().eq('id', id).eq('user_id', user.id);

    // Delete raw idea if exists
    if (idea?.raw_id) {
      await supabase.from('ideas_raw').delete().eq('id', idea.raw_id).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
