import { SockerIoApiResponse } from "@/types/app";
import { NextApiRequest } from "next";
import { getUserDataPages } from "@/actions/get-user-data";
import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { recipientId, workspaceId } = req.query;

    if (!recipientId || typeof recipientId !== "string") {
      return res.status(400).json({ error: "Invalid recipient ID" });
    }

    const { content, fileUrl } = req.body;
    if (!content && !fileUrl) {
      return res.status(400).json({ error: "Message must contain content or file" });
    }

    const supabase = supabaseServerClientPages(req, res);
    const io = global._io; // ✅ Global socket instance

    // ---------------------------------------------------
    // 💬 INSERT NEW DIRECT MESSAGE
    // ---------------------------------------------------
    const { data: newMessage, error: sendingMessageError } = await supabase
      .from("direct_messages")
      .insert({
        content,
        file_url: fileUrl || null,
        user: userData.id,
        user_one: userData.id,
        user_two: recipientId,
      })
      .select(`
        *,
        user:users!direct_messages_user_fkey(*),
        user_one:users!direct_messages_user_one_fkey(*),
        user_two:users!direct_messages_user_two_fkey(*)
      `)
      .order("created_at", { ascending: false })
      .single();

    if (sendingMessageError) {
      console.error("❌ DIRECT MESSAGE ERROR:", sendingMessageError);
      return res.status(500).json({ error: "Error sending message" });
    }

    // ---------------------------------------------------
    // 🔔 EMIT SOCKET EVENT
    // ---------------------------------------------------
    if (io && newMessage) {
      io.emit("direct:message:new", { ...newMessage, workspaceId });
      console.log("🟢 Emitted direct:message:new");
    } else {
      console.warn("⚠️ io not found on global");
    }

    return res.status(200).json({ message: newMessage });
  } catch (error) {
    console.error("🔥 DIRECT MESSAGE ERROR:", error);
    return res.status(500).json({ error: "Error sending message" });
  }
}
