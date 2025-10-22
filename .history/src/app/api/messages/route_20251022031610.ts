import { NextResponse } from 'next/server';
import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';

function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const from = page ? page * limit : 0;
  const to = page ? from + limit - 1 : limit - 1;
  return { from, to };
}

// ✅ Handle GET — fetch messages
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const userData = await getUserData();
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!channelId) {
      return new Response('Bad Request', { status: 400 });
    }

    const page = Number(searchParams.get('page'));
    const size = Number(searchParams.get('size'));
    const { from, to } = getPagination(page, size);

    const { data, error } = await supabase
      .from('messages')
      .select('*, user: user_id (*)')
      .eq('channel_id', channelId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('GET MESSAGES ERROR:', error);
      return new Response('Bad Request', { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.log('SERVER ERROR:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// ✅ Handle POST — create message
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userData = await getUserData();
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const body = await req.json();

    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!channelId) {
      return new Response('Bad Request', { status: 400 });
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

    // 🔊 Emit new message
    if (global._io) {
      global._io.to(channelId).emit('message:new', data);
      console.log('📡 Sent message via Socket.IO:', data.id);
    } else {
      console.log('⚠️ No global._io found — socket not initialized.');
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('SERVER ERROR:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
