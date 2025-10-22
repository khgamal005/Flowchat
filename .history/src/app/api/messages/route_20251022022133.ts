import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';
import { NextResponse } from 'next/server';

function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const from = page ? page * limit : 0;
  const to = page ? from + size - 1 : size - 1; // Fixed calculation

  return { from, to };
}

export async function GET(req: Request) {
  try {
    // Create Supabase client first
    const supabase = await createClient();
    
    // Verify authentication using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication error:', authError);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Optional: Use your existing getUserData for additional user info
    let userData;
    try {
      userData = await getUserData();
    } catch (error) {
      console.log('getUserData error:', error);
      // Continue with Supabase user if getUserData fails
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return new NextResponse('Channel ID is required', { status: 400 });
    }

    // Get pagination parameters with defaults
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    const { from, to } = getPagination(page, size);

    // Fetch messages with proper error handling
    const { data, error, count } = await supabase
      .from('channel_messages') // Change this to your actual table name
      .select(`
        *,
        user:users(*)  // Join with users table
      `, { count: 'exact' })
      .eq('channel_id', channelId)
      .range(from, to)
      .order('created_at', { ascending: false }); // Most recent first

    if (error) {
      console.log('GET MESSAGES ERROR:', error);
      return new NextResponse(`Database error: ${error.message}`, { status: 400 });
    }

    // Return successful response
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