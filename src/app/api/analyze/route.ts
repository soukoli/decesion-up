import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Jsi osobní organizační AI asistent. Uživatel ti diktuje myšlenky, úkoly, nápady hlasem nebo textem.

Tvoje práce:
1. Pochop co uživatel říká (může být neformální, zkrácené, hovorové)
2. Vytvoř krátký jasný title (max 5 slov, česky)
3. Zaraď do existující skupiny NEBO VYTVOŘ NOVOU skupinu
4. Urči prioritu

PRIORITA:
- "red" = musí udělat dnes/zítra, deadline, rodina, škola, kritické
- "yellow" = normální úkol, nákup, volání, schůzka
- "blue" = nápad, inspirace, učení, zajímavost
- "purple" = budoucnost, výzkum, dlouhodobé, someday/maybe

SKUPINY (max 15):
Skupiny NEJSOU obecné kategorie jako "Nápady" nebo "Úkoly".
Skupiny JSOU konkrétní projekty, témata a životní oblasti specifické pro uživatele.

PŘÍKLADY DOBRÝCH SKUPIN:
- "Narozeniny Nela" (konkrétní událost)
- "Rekonstrukce koupelny" (konkrétní projekt)
- "AI asistent app" (konkrétní projekt)
- "Škola Matyáš" (konkrétní oblast)
- "Dovolená Chorvatsko" (konkrétní plán)

PŘÍKLADY ŠPATNÝCH SKUPIN (příliš obecné — NEPOUŽÍVEJ):
- "Nápady" ❌
- "Úkoly" ❌
- "Osobní" ❌
- "Práce" ❌ (příliš obecné, radši konkrétní projekt)
- "Budoucnost" ❌

PRAVIDLA:
- Když uživatel zmíní konkrétní projekt/téma → VYTVOŘ novou skupinu s tím názvem
- Když uživatel řekne "nový projekt X" nebo "pracuji na X" → VŽDY vytvoř skupinu X
- Pokud existující skupina přesně sedí → použij ji
- NIKDY nepoužívej obecné názvy skupin
- Skupiny pojmenuj konkrétně dle obsahu (ne abstraktně)
- Title musí být jasný i bez kontextu
- Pokud si nejsi jistý prioritou → yellow
- Vždy odpovídej česky

Odpověz POUZE validní JSON:
{"title":"krátký title","priority":"red|yellow|blue|purple","group":"Konkrétní název skupiny","reason":"proč"}`;

const MAX_GROUPS = 15;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { raw_id, content } = body;

    if (!raw_id || !content) {
      return NextResponse.json({ error: 'raw_id and content required' }, { status: 400 });
    }

    // Get FULL context: all active ideas + groups + recent archive
    const [groupsRes, activeRes, archiveRes] = await Promise.all([
      supabase.from('idea_groups').select('id, name, color').eq('user_id', user.id),
      supabase.from('ideas_ai').select('title, priority, ai_label').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('ideas_ai').select('title, priority, ai_label').eq('user_id', user.id).eq('status', 'done').order('created_at', { ascending: false }).limit(50),
    ]);

    const existingGroups = groupsRes.data || [];
    const activeIdeas = activeRes.data || [];
    const archivedIdeas = archiveRes.data || [];

    // Build context message
    const contextParts: string[] = [];

    if (existingGroups.length > 0) {
      contextParts.push(`Existující skupiny (${existingGroups.length}/${MAX_GROUPS}): ${existingGroups.map(g => g.name).join(', ')}`);
      contextParts.push('(Použij existující POUZE pokud přesně sedí. Jinak vytvoř novou konkrétní skupinu.)');
    } else {
      contextParts.push('Zatím žádné skupiny — vytvoř první konkrétní skupinu dle obsahu nápadu.');
    }

    if (activeIdeas.length > 0) {
      contextParts.push(`\nAktivní nápady: ${activeIdeas.map(i => `"${i.title}" [${i.ai_label || '-'}]`).join(', ')}`);
    }

    contextParts.push(`\nNOVÝ NÁPAD: "${content}"`);

    const contextMessage = contextParts.join('\n');

    // Call OpenAI
    let aiResponse: { title: string; priority: string; group: string; reason: string };

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contextMessage },
        ],
        temperature: 0.5,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
    } catch (aiError) {
      // AI failed — create with defaults (fallback)
      console.error('OpenAI error:', aiError);

      const { data: fallbackIdea, error } = await supabase
        .from('ideas_ai')
        .insert({
          raw_id,
          user_id: user.id,
          title: content.slice(0, 80),
          context: content,
          priority: 'blue',
          status: 'active',
          group_id: null,
          ai_label: null,
          ai_reason: 'AI nedostupná',
        })
        .select('*, idea_groups(*)')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
      }

      return NextResponse.json({ idea: fallbackIdea }, { status: 201 });
    }

    const { title, priority, group, reason } = aiResponse;

    // Find or create group (respect MAX_GROUPS limit)
    let groupId: string | null = null;
    if (group) {
      // Try exact match first
      const existing = existingGroups.find(g => g.name.toLowerCase() === group.toLowerCase());

      if (existing) {
        groupId = existing.id;
      } else if (existingGroups.length < MAX_GROUPS) {
        // Create new group
        const { data: newGroup } = await supabase
          .from('idea_groups')
          .insert({
            user_id: user.id,
            name: group,
            color: priority || 'blue',
            ai_generated: true,
          })
          .select('id')
          .single();
        groupId = newGroup?.id || null;
      } else {
        // Max groups reached — find closest existing
        groupId = existingGroups[0]?.id || null;
      }
    }

    // Create AI-processed idea
    const validPriority = ['red', 'yellow', 'blue', 'purple'].includes(priority) ? priority : 'blue';

    const { data: ideaAI, error } = await supabase
      .from('ideas_ai')
      .insert({
        raw_id,
        user_id: user.id,
        title: title || content.slice(0, 80),
        context: content,
        priority: validPriority,
        status: 'active',
        group_id: groupId,
        ai_label: group || null,
        ai_reason: reason || null,
      })
      .select('*, idea_groups(*)')
      .single();

    if (error) {
      console.error('Error creating AI idea:', error);
      return NextResponse.json({ error: 'Failed to create AI idea' }, { status: 500 });
    }

    return NextResponse.json({ idea: ideaAI }, { status: 201 });
  } catch (error) {
    console.error('Error in analyze:', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
