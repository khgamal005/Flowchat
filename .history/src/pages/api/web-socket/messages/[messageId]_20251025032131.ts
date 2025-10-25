// pages/api/web-socket/messages/[messageId].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServerClientPages } from '@/supabase/supabaseSeverPages';
import { getUserDataPages } from '@/actions/get-user-data';
import { SockerIoApiResponse } from '@/types/app';

export default async function handler(req: NextApiRequest, res: SockerIoApiResponse) {
  try {
    const { messageId } = req.query;
    const { channelId, workspaceId } = req.query;

    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const user = await getUserDataPages();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = supabaseServerClientPages();

    // 🧾 DELETE MESSAGE
    if (req.method === 'DELETE') {
      // Verify message exists and user has permission
      const { data: existingMessage, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        console.error('Fetch Error:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch message' });
      }

      if (!existingMessage) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Optional: check if user owns message or is admin in workspace
      if (existingMessage.user_id !== user.id) {
        return res.status(403).json({ error: 'You cannot delete this message' });
      }

      // Mark message as deleted (soft delete)
      const { error: deleteError } = await supabase
        .from('messages')
        .update({ is_deleted: true, content: '[deleted]' })
        .eq('id', messageId);

      if (deleteError) {
        console.error('Delete Error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete message' });
      }

      // Emit socket event to notify clients
      const io = res.socket?.server?.io;
      if (io) {
        io.to(channelId as string).emit('message:delete', {
          id: messageId,
          channelId,
          workspaceId,
        });
      }

      return res.status(200).json({ success: true });
    }

    // 📝 EDIT MESSAGE
    if (req.method === 'PATCH') {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content required' });

      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId)
        .select('*, user(*)')
        .single();

      if (updateError) {
        console.error('Update Error:', updateError);
        return res.status(500).json({ error: 'Failed to update message' });
      }

      const io = res.socket?.server?.io;
      if (io) {
        io.to(channelId as string).emit('message:update', updatedMessage);
      }

      return res.status(200).json(updatedMessage);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
