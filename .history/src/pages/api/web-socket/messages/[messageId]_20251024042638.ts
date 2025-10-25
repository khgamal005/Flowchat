import { NextApiRequest } from 'next';

import { SockerIoApiResponse } from '@/types/app';
import { getUserDataPages } from '@/actions/get-user-data';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServerClientPages } from '@/supabase/supabaseSeverPages';

// In your message API handler
export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (!['DELETE', 'PATCH'].includes(req.method!)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { messageId, channelId, workspaceId } = req.query as Record<
      string,
      string
    >;

    if (!messageId || !channelId || !workspaceId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { content } = req.body;

    const supabase = supabaseServerClientPages(req, res);

    // First, verify the message exists and get current data
    const { data: messageData, error: fetchError } = await supabase
      .from('messages')
      .select('*, user: user_id (*)')
      .eq('id', messageId)
      .single();

    if (fetchError || !messageData) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check permissions
    const isMessageOwner = messageData.user_id === userData.id;
    const isAdmin = userData.type === 'admin';
    const isRegulator = userData.type === 'regulator';

    // Fix: Correct permission logic
    const canEditMessage = isMessageOwner && !messageData.is_deleted;
    const canDeleteMessage = isMessageOwner || isAdmin || isRegulator;

    if (req.method === 'PATCH') {
      if (!canEditMessage) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Content is required' });
      }

      const { error: updateError } = await supabase
        .from('messages')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (updateError) {
        console.log('UPDATE ERROR:', updateError);
        return res.status(500).json({ error: 'Failed to update message' });
      }

    } else if (req.method === 'DELETE') {
      if (!canDeleteMessage) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { error: deleteError } = await supabase
        .from('messages')
        .update({
          content: 'This message has been deleted',
          file_url: null,
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (deleteError) {
        console.log('DELETE ERROR:', deleteError);
        return res.status(500).json({ error: 'Failed to delete message' });
      }
    }

    // Fetch the updated message
    const { data: updatedMessage, error: messageError } = await supabase
      .from('messages')
      .select('*, user: user_id (*)')
      .eq('id', messageId)
      .single();

    if (messageError || !updatedMessage) {
      return res.status(404).json({ error: 'Message not found after update' });
    }

    // Emit socket event with consistent naming
    const socketEventName = `channel:${channelId}:channel-messages`;
    res?.socket?.server?.io?.emit(socketEventName, {
      action: req.method === 'PATCH' ? 'update' : 'delete',
      data: updatedMessage
    });

    return res.status(200).json({ message: updatedMessage });
  } catch (error) {
    console.log('MESSAGE ID ERROR', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}