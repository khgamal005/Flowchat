import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  try {
    const { messageId, channelId, workspaceId } = req.query as Record<string, string>;

    if (!messageId || !channelId || !workspaceId)
      return res.status(400).json({ error: "Invalid request" });

    const user = await getUserDataPages(req, res);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const supabase = supabaseServerClientPages(req, res);
    const io = global._io;

    // 🗑️ DELETE MESSAGE
    if (req.method === "DELETE") {
      const { data: message, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (error || !message) return res.status(404).json({ error: "Message not found" });

      if (message.user_id !== user.id)
        return res.status(403).json({ error: "Forbidden" });

      const { data: updated, error: deleteError } = await supabase
        .from("messages")
        .update({
          is_deleted: true,
          content: "This message has been deleted",
          file_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*, user(*)")
        .single();

      if (deleteError)
        return res.status(500).json({ error: deleteError.message });

      // ✅ fire one unified event
      io?.emit(`message:updated:${channelId}`, updated);
      return res.status(200).json(updated);
    }

    // ✏️ EDIT MESSAGE
    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const { data: updated, error: updateError } = await supabase
        .from("messages")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select("*, user(*)")
        .single();

      if (updateError)
        return res.status(500).json({ error: updateError.message });

      // ✅ same event as delete
      io?.emit(`message:updated:${channelId}`, updated);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("🔥 Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
