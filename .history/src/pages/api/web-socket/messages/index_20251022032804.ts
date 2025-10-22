import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServerClientPages } from '@/supabase/supabaseSeverPages';
import { getUserDataPages } from '@/actions/get-user-data';

// Helper
function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const from = page ? page * limit : 0;
  const to = page ? from + limit - 1 : limit - 1;
  return { from, to };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = supabaseServerClientPages(req, res);
    const userData = await getUserDataPages(req, res);

    if (!userData) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const { channelId, page = 0, size = 10 } = req.query;

      if (!channelId) return res.status(400).json({ message: 'Bad Request' });

      const { from, to } = getPagination(Number(page), Number(size));

      const { data, error } = await supabase
        .from('messages')
        .select('*, user: user_id (*)')
        .eq('channel_id', channelId)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('GET MESSAGES ERROR:', error);
        return res.status(400).json({ message: 'Bad Request' });
      }

      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
      const { channelId, workspaceId } = req.query;
      const { content, fileUrl } = req.body;

      if (!channelId || !workspaceId) return res.status(400).json({ message: 'Bad request' });
      if (!content && !fileUrl) return res.status(400).json({ message: 'Bad request' });

      const { data: channelData } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .contains('members', [userData.id]);

      if (!channelData?.length)
        return res.status(403).json({ message: 'Channel not found' });

      const { error: creatingMessageError, data } = await supabase
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
        console.log('MESSAGE CREATION ERROR:', creatingMessageError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res?.socket?.server?.io?.emit(`channel:${channelId}:channel-messages`, data);

      return res.status(201).json({ message: 'Message created', data });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.log('SERVER ERROR:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
