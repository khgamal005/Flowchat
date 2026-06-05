import { NextApiRequest } from "next";
import { SockerIoApiResponse } from "@/types/app";
import { getUserDataPages } from "@/actions/get-user-data";
import { prisma } from "@/lib/prisma";

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

    const io = (global as any)._io;

    if (req.method === "DELETE") {
      const message = await prisma.directMessage.findUnique({
        where: { id: parseInt(messageId) },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner = user.id === message.userOne || user.id === message.userTwo;

      if (!isOwner) {
        return res.status(403).json({ error: "You cannot delete this message" });
      }

      const deletedMsg = await prisma.directMessage.update({
        where: { id: parseInt(messageId) },
        data: {
          isDeleted: true,
          content: "[deleted]",
          fileUrl: null,
          updatedAt: new Date(),
        },
      });

      if (io) {
        io.emit("direct:message:delete", { messageId, workspaceId });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const message = await prisma.directMessage.findUnique({
        where: { id: parseInt(messageId) },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const isOwner = user.id === message.userOne || user.id === message.userTwo;

      if (!isOwner) {
        return res.status(403).json({ error: "You cannot edit this message" });
      }

      const updatedMessage = await prisma.directMessage.update({
        where: { id: parseInt(messageId) },
        data: {
          content,
          updatedAt: new Date(),
        },
        include: {
          sender: true,
          userOneRel: true,
          userTwoRel: true,
        },
      });

      const mapUser = (u: any) => ({
        avatar_url: u.avatarUrl,
        channels: null,
        created_at: u.createdAt.toISOString(),
        email: u.email,
        id: u.id,
        is_away: u.isAway,
        name: u.name,
        phone: u.phone,
        type: u.type,
        workspaces: null,
      });

      const data = {
        id: String(updatedMessage.id),
        content: updatedMessage.content,
        file_url: updatedMessage.fileUrl,
        user_id: updatedMessage.user,
        is_deleted: updatedMessage.isDeleted,
        created_at: updatedMessage.createdAt.toISOString(),
        updated_at: updatedMessage.updatedAt.toISOString(),
        user: mapUser(updatedMessage.sender),
        user_one: mapUser(updatedMessage.userOneRel),
        user_two: mapUser(updatedMessage.userTwoRel),
      };

      if (io) {
        io.emit("direct:message:update", data);
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
