import { NextResponse } from 'next/server';
import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userData = await getUserData();
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    // 🔒 Check authorization
    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    // ⚠️ Ensure channelId exists
    if (!channelId) {
      return new Response('Bad Request', { status: 400 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return new Response('Message content required', { status: 400 });
    }

    // 💾 Insert message into Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: userData.id,
        channel_id: channelId,
      })
      .select('*, user: user_id(*)')
      .single();

    if (error) {
      console.error('INSERT MESSAGE ERROR:', error);
      return new Response('Bad Request', { status: 400 });
    }

    // 📡 Emit message via global Socket.IO instance
    try {
      if (global._io) {
        // Optional: emit only to users in this channel
        global._io.to(channelId).emit('message:new', data);

        // Or broadcast globally:
        // global._io.emit('message:new', data);

        console.log('📡 Broadcasted new message:', data.id);
      } else {
        console.warn('⚠️ global._io not found — socket not initialized.');
      }
    } catch (socketError) {
      console.error('SOCKET EMIT ERROR:', socketError);
    }

    // ✅ Return message JSON
    return NextResponse.json({ data });
  } catch (error) {
    console.error('SERVER ERROR:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
