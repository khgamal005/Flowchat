// pages/api/web-socket/messages/[messageId].ts

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

    // ✅ FIX: pass req, res
    const user = await getUserDataPages(req, res);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const supabase = supabaseServerClientPages(req, res);

    // --- DELETE MESSAGE ---
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

    if (io) {
        io.emit(`message:deleted:${channelId}`, {
          messageId,
          channelId,
          workspaceId,
        });
        console.log('🟠 Emitted message:deleted event');
      } else {
        console.warn('⚠️ io not found on global');
      }

    // --- EDIT MESSAGE ---
    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const { data: updatedMessage, error: updateError } = await supabase
        .from("messages")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*, user(*)")
        .single();

      if (updateError) {
        console.error("❌ Update Error:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      const io = (res.socket as any)?.server?.io;
      if (io) {
        io.to(channelId as string).emit("message:update", updatedMessage);
      }

      return res.status(200).json(updatedMessage);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("🔥 API Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
