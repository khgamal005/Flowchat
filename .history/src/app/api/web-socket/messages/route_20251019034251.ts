import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/supabaseServer';
import { getUserData } from '@/actions/get-user-data';

export async function POST(req: Request) {
  const supabase = await createClient(); // ✅ await here

  // ✅ Define headers at the top
  const headers = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
    'Access-Control-Allow-Credentials': 'true',
  };

  try {
    const userData = await getUserData();

    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const workspaceId = searchParams.get('workspaceId');

    if (!channelId || !workspaceId) {
      return NextResponse.json({ message: 'Bad request' }, { status: 400, headers });
    }

    const body = await req.json();
    const { content, fileUrl } = body;

    if (!content && !fileUrl) {
      return NextResponse.json({ message: 'Bad request' }, { status: 400, headers });
    }

    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .contains('members', [userData.id]);

    if (channelError) {
      console.error('CHANNEL FETCH ERROR:', channelError);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers });
    }

    if (!channelData?.length) {
      return NextResponse.json({ message: 'Channel not found' }, { status: 403, headers });
    }

    const { data, error: creatingMessageError } = await supabase
      .from('messages')
      .insert({
        user_id: userData.id,
        workspace_id: workspaceId,
        channel_id: channelId,
        content,
        file_url: fileUrl,
      })
      .select('*, user: user_id(*)')
      .order('created_at', { ascending: true })
      .single();

    if (creatingMessageError) {
      console.error('MESSAGE CREATION ERROR:', creatingMessageError);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers });
    }

    // (Optional) Emit Socket.IO event via your socket server here
    // e.g. io.to(`channel:${channelId}`).emit('channel-messages', data);

    return NextResponse.json({ message: 'Message created', data }, { status: 201, headers });
  } catch (error) {
    console.error('MESSAGE CREATION ERROR:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers });
  }
}

// ✅ (Optional) Handle OPTIONS preflight (needed for CORS)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
