import { SockerIoApiResponse } from '@/types/app';
import { NextApiRequest } from 'next';

import { getUserDataPages } from '@/actions/get-user-data';
import { supabaseServerClientPages } from '@/supabase/supabaseSeverPages';

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recipientId, type } = req.query;

    if (!recipientId || !type) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { content, fileUrl } = req.body;

    const supabase = supabaseServerClientPages(req, res);

    const { data: newMessage, error: sendingMessageError } = await supabase
      .from('direct_messages')
      .insert({
        content,
        file_url: fileUrl,
        user: userData.id,
        user_one: userData.id,
        user_two: recipientId,
      })
      .select('*, user (*), user_one (*), user_two (*)')
      .order('created_at', { ascending: false })
      .single();

    if (sendingMessageError) {
      console.log('DIRECT MESSAGE ERROR: ', sendingMessageError);
      return res.status(500).json({ error: 'Error sending message' });
    }

    // ✅ Emit socket event dynamically (if socket.io server is available)
    const addKey =
      type === 'Channel'
        ? 'channel:message:new'
        : 'direct:message:new';

    if (global._io && newMessage) {
      global._io.emit(addKey, newMessage);
      console.log(`📤 Emitted ${addKey}`, newMessage);
    }

    return res.status(200).json({ message: 'Message sent', data: newMessage });
  } catch (error) {
    console.log('DIRECT MESSAGE ERROR: ', error);
    return res.status(500).json({ error: 'Error sending message' });
  }
}
