import { NextResponse } from 'next/server';
import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userData = await getUserData();
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const body = await req.json();

    if (!userData || !channelId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { content } = body;

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
      console.log('INSERT MESSAGE ERROR:', error);
      return new Response('Bad Request', { status: 400 });
    }

    // ✅ Emit via global Socket.IO instance
    if (global._io) {
      global._io.emit('message:new', data); // or io.to(channelId).emit(...)
      console.log('📡 Emitted message via socket:', data.id);
    } else {
      console.log('⚠️ No global._io found — socket not initialized.');
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('SERVER ERROR:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
