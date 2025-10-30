import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  try {
    const { messageId, channelId, workspaceId } = req.query;

    if (!messageId || typeof messageId !== "string") {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const user = await getUserDataPages(req, res);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const supabase = supabaseServerClientPages(req, res);
    const io = global._io; // ✅ access the global Socket.IO instance

    // ---------------------------------------------------
    // 🗑️ DELETE MESSAGE
    // ---------------------------------------------------
    if (req.method === "DELETE") {
      const { data: message, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (fetchError) {
        console.error("❌ Fetch Error:", fetchError);
        return res.status(500).json({ error: "Failed to fetch message" });
      }

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.user_id !== user.id) {
        return res
          .status(403)
          .json({ error: "You cannot delete this message" });
      }

      const { data: deletedMsg, error: deleteError } = await supabase
        .from("messages")
        .update({
          is_deleted: true,
          content: "[deleted]",
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select()
        .single();

      if (deleteError) {
        console.error("❌ Delete Error:", deleteError);
        return res.status(500).json({ error: deleteError.message });
      }

      // ✅ Emit deletion event to clients
      if (io) {
        const deleteKey = channelId
          ? "channel:message:delete"
          : "direct:message:delete";

        io.emit(deleteKey, { messageId, channelId, workspaceId });
        console.log("🟠 Emitted", deleteKey);
      } else {
        console.warn("⚠️ io not found on global");
      }

      return res.status(200).json({ success: true });
    }

    // ---------------------------------------------------
    //  EDIT MESSAGE (PATCH)
    // ---------------------------------------------------
    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { messageId } = req.query;
    const { content } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const supabase = supabaseServerClientPages(req, res);

    const { data: messageData, error } = await supabase
      .from('direct_messages')
      .select(
        `
        *,
        user_one:users!direct_messages_user_one_fkey(*),
        user_two:users!direct_messages_user_two_fkey(*)
        `
      )
      .eq('id', messageId)
      .single();

    console.log('DIRECT MESSAGE messageData: ', error);
    console.log('DIRECT MESSAGE messageData: ', messageData);

    if (error || !messageData) {
      console.log('DIRECT MESSAGE ERROR: ', error);
      return res.status(404).json({ error: 'Message not found' });
    }

    const isMessageOwner =
      userData.id === messageData.user_one.id ||
      userData.id === messageData.user_two.id;
    const isAdmin = userData.type === 'admin';
    const isRegulator = userData.type === 'regulator';

    const canEditMessage =
      isMessageOwner || isAdmin || isRegulator || !messageData.is_deleted;

    if (!canEditMessage) {
      console.log('DIRECT MESSAGE ERROR: canEditMessage:', error);
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'PATCH') {
      if (!isMessageOwner) {
        return res.status(403).json({ error: 'Forbidden' });
      }

 

    const { data: updatedMessage, error: messageError } = await supabase
      .from('direct_messages')
      .select(
        `
        *,
        user_one:users!direct_messages_user_one_fkey(*),
        user_two:users!direct_messages_user_two_fkey(*),
        user:users!direct_messages_user_fkey(*)
        `
      )
      .eq('id', messageId)
      .single();

    if (messageError || !updatedMessage) {
      console.log('DIRECT MESSAGE ERROR: ', messageError);
      return res.status(404).json({ error: 'Message not found' });
    }

    res?.socket?.server?.io?.emit('direct-message:update', updatedMessage);
    return res.status(200).json({ message: updatedMessage });
  } catch (error) {
    console.log('DIRECT MESSAGE ERROR: ', error);
    return res.status(500).json({ error: 'Error sending message' });
  }
}


}
