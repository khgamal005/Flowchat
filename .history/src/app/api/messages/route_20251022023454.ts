import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';
import { NextResponse } from 'next/server';

function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const from = page ? page * limit : 0;
  const to = page ? from + size - 1 : size - 1;

  return { from, to };
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication only
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication error:', authError);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return new NextResponse('Channel ID is required', { status: 400 });
    }

    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const { from, to } = getPagination(page, size);

    // Direct query to messages table - no access control
    const { data, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(*)
      `, { count: 'exact' })
      .eq('channel_id', channelId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('GET MESSAGES ERROR:', error);
      return new NextResponse(`Database error: ${error.message}`, { status: 400 });
    }

    return NextResponse.json({ 
      data: data || [],
      pagination: {
        page,
        size,
        total: count || 0,
        hasMore: data ? data.length === size : false
      }
    });

  } catch (error) {
    console.log('SERVER ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}