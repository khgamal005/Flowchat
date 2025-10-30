import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  try {
    const { messageId, workspaceId } = req.query;

    if (!messageId || typeof messageId !== "string") {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const user = await getUserDataPages(req, res);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const supabase = supabaseServerClientPages(req, res);
    const io = global._io; // ✅ same as your channel route

    // ---------------------------------------------------
    // 🗑️ DELETE MESSAGE
    // ---------------------------------------------------
    if (req.method === "DELETE") {
      const { data: message, error: fetchError } = await supabase
        .from("direct_messages")
        .select("id, user_one, user_two")
        .eq("id", messageId)
        .single();

      if (fetchError) {
        console.error("❌ Fetch Error:", fetchError);
        return res.status(500).json({ error: "Failed to fetch message" });
      }

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner =
        user.id === message.user_one || user.id === message.user_two;

      if (!isOwner) {
        return res
          .status(403)
          .json({ error: "You cannot delete this message" });
      }

      const { data: deletedMsg, error: deleteError } = await supabase
        .from("direct_messages")
        .update({
          is_deleted: true,
          content: "[deleted]",
          file_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*, user_one:users!direct_messages_user_one_fkey(*), user_two:users!direct_messages_user_two_fkey(*)")
        .single();

      if (deleteError) {
        console.error("❌ Delete Error:", deleteError);
        return res.status(500).json({ error: deleteError.message });
      }

      // ✅ Emit deletion event (same pattern as channel route)
      if (io) {
        io.emit("direct:message:delete", { messageId, workspaceId });
        console.log("🟠 Emitted direct:message:delete");
      } else {
        console.warn("⚠️ io not found on global");
      }

      return res.status(200).json({ success: true });
    }

    // ---------------------------------------------------
    // ✏️ UPDATE MESSAGE
    // ---------------------------------------------------
    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      // Check message ownership first
      const { data: message, error: fetchError } = await supabase
        .from("direct_messages")
        .select("id, user_one, user_two")
        .eq("id", messageId)
        .single();

      if (fetchError || !message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner =
        user.id === message.user_one || user.id === message.user_two;

      if (!isOwner) {
        return res.status(403).json({ error: "You cannot edit this message" });
      }

      const { data: updatedMessage, error: updateError } = await supabase
        .from("direct_messages")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*, user_one:users!direct_messages_user_one_fkey(*), user_two:users!direct_messages_user_two_fkey(*)")
        .single();

      if (updateError) {
        console.error("❌ Update Error:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      // ✅ Emit update event (same key as in channel router)
      if (io) {
        io.emit("direct:message:update", updatedMessage);
        console.log("🟢 Emitted direct:message:update");
      } else {
        console.warn("⚠️ io not found on global");
      }

      return res.status(200).json(updatedMessage);
    }

    // ---------------------------------------------------
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("🔥 API Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
