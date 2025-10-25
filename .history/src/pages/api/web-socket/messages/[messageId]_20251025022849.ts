import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";

/**
 * API Route for message editing and deletion.
 * Supports:
 *  - PATCH → edit message content
 *  - DELETE → soft-delete a message
 */
export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  // Allow only PATCH or DELETE
  if (!["DELETE", "PATCH"].includes(req.method!)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🧩 1. Verify authenticated user
    const userData = await getUserDataPages(req, res);
    if (!userData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🧩 2. Validate query params
    const { messageId, channelId, workspaceId } = req.query as Record<
      string,
      string
    >;
    if (!messageId || !channelId || !workspaceId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // 🧩 3. Prepare Supabase client
    const supabase = supabaseServerClientPages(req, res);
    const { content } = req.body;

    // 🧩 4. Fetch existing message
    const { data: messageData, error: fetchError } = await supabase
      .from("messages")
      .select("*, user: user_id (*)")
      .eq("id", messageId)
      .single();

    if (fetchError || !messageData) {
      return res.status(404).json({ error: "Message not found" });
    }

    // 🧩 5. Check permissions
    const isMessageOwner = messageData.user_id === userData.id;
    const isAdmin = userData.type === "admin";
    const isRegulator = userData.type === "regulator";

    const canEditMessage = isMessageOwner && !messageData.is_deleted;
    const canDeleteMessage = isMessageOwner || isAdmin || isRegulator;

    // 🧩 6. Handle PATCH (edit message)
    if (req.method === "PATCH") {
      if (!canEditMessage) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Content is required" });
      }

      const { error: updateError } = await supabase
        .from("messages")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (updateError) {
        console.error("UPDATE ERROR:", updateError);
        return res.status(500).json({ error: "Failed to update message" });
      }
    }

    // 🧩 7. Handle DELETE (soft delete message)
    if (req.method === "DELETE") {
      if (!canDeleteMessage) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { error: deleteError } = await supabase
        .from("messages")
        .update({
          content: "This message has been deleted",
          file_url: null,
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (deleteError) {
        console.error("DELETE ERROR:", deleteError);
        return res.status(500).json({ error: "Failed to delete message" });
      }
    }

    // 🧩 8. Fetch the updated message to emit
    const { data: updatedMessage, error: messageError } = await supabase
      .from("messages")
      .select("*, user: user_id (*)")
      .eq("id", messageId)
      .single();

    if (messageError || !updatedMessage) {
      return res
        .status(404)
        .json({ error: "Message not found after update" });
    }
    

    // 🧩 9. Emit real-time socket event
    const socketEventName = `channel:${channelId}:channel-messages`;
    res?.socket?.server?.io?.emit(socketEventName, {
      action: req.method === "PATCH" ? "update" : "delete",
      data: updatedMessage,
    });

    // 🧩 10. Return the updated message
    return res.status(200).json({ message: updatedMessage });
  } catch (error) {
    console.error("MESSAGE ID ERROR", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
