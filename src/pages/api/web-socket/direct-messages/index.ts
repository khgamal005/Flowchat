import { SockerIoApiResponse } from '@/types/app';
import { NextApiRequest } from 'next';
import { getUserDataPages } from '@/actions/get-user-data';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = await getUserDataPages(req, res);

    if (!userData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recipientId } = req.query;

    if (!recipientId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { content, fileUrl } = req.body;

    const newMessage = await prisma.directMessage.create({
      data: {
        content,
        fileUrl,
        user: userData.id,
        userOne: userData.id,
        userTwo: recipientId as string,
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

    const io = (global as any)._io;
    if (io) {
      io.emit('direct:message:new', data);
    }

    return res.status(200).json({ message: 'Message sent', data });
  } catch (error) {
    console.log('DIRECT MESSAGE ERROR: ', error);
    return res.status(500).json({ error: 'Error sending message' });
  }
}
