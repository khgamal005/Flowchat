// app/api/messages/route.ts
import { createClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, type } = await request.json();
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const recipientId = searchParams.get('recipientId');
    const workspaceId = searchParams.get('workspaceId');

    // Validate required fields
    if (!content || !workspaceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let insertData: any = {
      content,
      user_id: user.id,
      workspace_id: workspaceId
    };

    if (type === 'Channel' && channelId) {
      insertData.channel_id = channelId;
    } else if (type === 'DirectMessage' && recipientId) {
      insertData.recipient_id = recipientId;
    } else {
      return NextResponse.json({ error: 'Invalid message type or ID' }, { status: 400 });
    }

    // Insert message
    const { data, error } = await supabase
      .from(type === 'Channel' ? 'channel_messages' : 'direct_messages')
      .insert(insertData)
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}