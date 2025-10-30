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
 try {
    const user = await getUserDataPages(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { messageId } = req.query;
    const { content } = req.body;

    if (!messageId) return res.status(400).json({ error: 'Missing messageId' });
    if (!content) return res.status(400).json({ error: 'Content required' });

    const supabase = supabaseServerClientPages(req, res);

    // 🔹 Update message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('direct_messages')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select('*, user_one:users!direct_messages_user_one_fkey(*), user_two:users!direct_messages_user_two_fkey(*)')
      .single();

    if (updateError) {
      console.error('❌ Update Error:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    // ✅ Emit update event
    const io = (global as any)._io;
    if (io) {
      io.emit('direct:message:update', updatedMessage);
      console.log('🟢 Emitted direct:message:update');
    } else {
      console.warn('⚠️ io not found on global');
    }

    return res.status(200).json(updatedMessage);
  } catch (err: any) {
    console.error('🔥 API Error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal server error' });
  }
}
