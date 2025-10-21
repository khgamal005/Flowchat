import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/supabaseServer';
import { getUserData } from '@/actions/get-user-data';
import type { MessageWithUser } from '@/types/app';

export async function POST(req: Request) {
  const supabase = await createClient();
  const userData = await getUserData();

  if (!userData) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId');
  const workspaceId = searchParams.get('workspaceId');
  const { content, fileUrl } = await req.json();

  if (!channelId || !workspaceId || (!content && !fileUrl)) {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 });
  }

  const { data, error } = await supabase
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
    .single<MessageWithUser>();

  if (error) {
    console.error('MESSAGE CREATION ERROR:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }

  // ✅ Emit real-time message event via global Socket.IO
  globalThis.io?.emit(`channel:${channelId}:channel-messages`, data);

  return NextResponse.json({ message: 'Message created', data }, { status: 201 });
}
