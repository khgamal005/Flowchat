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

    const { recipientId } = req.query;

    if (!recipientId) {
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

    // ✅ Emit the event through Socket.IO
    const io = (global as any)._io;
    if (io) {
      io.emit('direct:message:new', newMessage);
      console.log('📤 Emitted direct:message:new', newMessage);
    } else {
      console.warn('⚠️ No Socket.IO instance found');
    }

    return res.status(200).json({ message: 'Message sent', newMessage });
  } catch (error) {
    console.log('DIRECT MESSAGE ERROR: ', error);
    return res.status(500).json({ error: 'Error sending message' });
  }
}
