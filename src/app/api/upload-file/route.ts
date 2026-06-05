import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileUrl, channelId, workspaceId, recipientId, userId } = await req.json();

    if (!fileUrl || !userId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const io = (global as any)._io;

    if (recipientId) {
      const newMessage = await prisma.directMessage.create({
        data: { fileUrl, user: userId, userOne: userId, userTwo: recipientId },
        include: { sender: true, userOneRel: true, userTwoRel: true },
      });

      const data = {
        id: String(newMessage.id),
        content: newMessage.content,
        file_url: newMessage.fileUrl,
        user_id: newMessage.user,
        is_deleted: newMessage.isDeleted,
        created_at: newMessage.createdAt.toISOString(),
        updated_at: newMessage.updatedAt.toISOString(),
        user: mapUser(newMessage.sender),
        user_one: mapUser(newMessage.userOneRel),
        user_two: mapUser(newMessage.userTwoRel),
      };

      if (io) {
        io.emit("direct:message:new", data);
      }

      return NextResponse.json({ success: true, fileUrl, data });
    }

    if (channelId && workspaceId) {
      const message = await prisma.message.create({
        data: { fileUrl, userId, channelId, workspaceId },
        include: { user: true },
      });

      const data = {
        id: message.id,
        content: message.content,
        file_url: message.fileUrl,
        channel_id: message.channelId,
        user_id: message.userId,
        workspace_id: message.workspaceId,
        is_deleted: message.isDeleted,
        created_at: message.createdAt.toISOString(),
        updated_at: message.updatedAt.toISOString(),
        user: mapUser(message.user),
      };

      if (io) {
        io.emit("channel:message:new", data);
      }

      return NextResponse.json({ success: true, fileUrl, data });
    }

    return new NextResponse("Bad Request", { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
