import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/supabaseServer';
import { getUserData } from '@/actions/get-user-data';

// ✅ Shared CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle POST (send message)
export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const userData = await getUserData();
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const workspaceId = searchParams.get('workspaceId');

    if (!channelId || !workspaceId) {
      return NextResponse.json({ message: 'Missing required params' }, { status: 400, headers: corsHeaders });
    }

    const body = await req.json();
    const { content, fileUrl } = body;

    if (!content && !fileUrl) {
      return NextResponse.json({ message: 'Message content required' }, { status: 400, headers: corsHeaders });
    }

    // ✅ Validate channel access
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .contains('members', [userData.id])
      .maybeSingle();

    if (channelError) {
      console.error('CHANNEL FETCH ERROR:', channelError);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: corsHeaders });
    }

    if (!channelData) {
      return NextResponse.json({ message: 'Channel not found or unauthorized' }, { status: 403, headers: corsHeaders });
    }

    // ✅ Insert new message
    const { data, error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: userData.id,
        workspace_id: workspaceId,
        channel_id: channelId,
        content,
        file_url: fileUrl,
      })
      .select('*, user:user_id(*)')
      .single();

    if (messageError) {
      console.error('MESSAGE CREATION ERROR:', messageError);
      return NextResponse.json({ message: 'Failed to create message' }, { status: 500, headers: corsHeaders });
    }

    // (Optional) Socket event emit — example:
    // io?.to(`channel:${channelId}`).emit('new-message', data);

    return NextResponse.json(
      { message: 'Message created successfully', data },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('UNEXPECTED ERROR:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

// ✅ Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
