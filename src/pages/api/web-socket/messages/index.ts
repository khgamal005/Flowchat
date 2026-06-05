import { NextApiRequest } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserDataPages } from '@/actions/get-user-data';
import { SockerIoApiResponse } from '@/types/app';

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { channelId, workspaceId } = req.query;

    if (!channelId || !workspaceId) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const { content, fileUrl } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId as string },
      include: {
        members: { where: { userId: userData.id } },
      },
    });

    if (!channel || channel.members.length === 0) {
      return res.status(403).json({ message: 'Channel not found' });
    }

    const message = await prisma.message.create({
      data: {
        userId: userData.id,
        workspaceId: workspaceId as string,
        channelId: channelId as string,
        content,
        fileUrl,
      },
      include: {
        user: true,
      },
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
      user: {
        avatar_url: message.user.avatarUrl,
        channels: null,
        created_at: message.user.createdAt.toISOString(),
        email: message.user.email,
        id: message.user.id,
        is_away: message.user.isAway,
        name: message.user.name,
        phone: message.user.phone,
        type: message.user.type,
        workspaces: null,
      },
    };

    const io = (global as any)._io;
    if (io) {
      io.emit('channel:message:new', data);
    }

    return res.status(201).json({ message: 'Message created', data });
  } catch (error) {
    console.log('MESSAEGE CREATION ERROR: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
