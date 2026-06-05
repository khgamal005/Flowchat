import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { prisma } from "@/lib/prisma";

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

    const io = (global as any)._io;

    if (req.method === "DELETE") {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.userId !== user.id) {
        return res.status(403).json({ error: "You cannot delete this message" });
      }

      const deletedMsg = await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: "[deleted]",
          fileUrl: null,
          updatedAt: new Date(),
        },
      });

      if (io) {
        io.emit("channel:message:delete", { messageId, workspaceId });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.userId !== user.id) {
        return res.status(403).json({ error: "You cannot edit this message" });
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          updatedAt: new Date(),
        },
        include: { user: true },
      });

      if (io) {
        io.emit("channel:message:update", updatedMessage);
      }

      return res.status(200).json(updatedMessage);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
