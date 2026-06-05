import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const skip = page ? page * limit : 0;

  return { skip, take: limit };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!channelId) {
      return new Response('Bad Request', { status: 400 });
    }

    const page = Number(searchParams.get('page'));
    const size = Number(searchParams.get('size'));

    const { skip, take } = getPagination(page, size);

    const data = await prisma.message.findMany({
      where: { channelId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const mapped = data.map(msg => ({
      id: msg.id,
      content: msg.content,
      file_url: msg.fileUrl,
      channel_id: msg.channelId,
      user_id: msg.userId,
      workspace_id: msg.workspaceId,
      is_deleted: msg.isDeleted,
      created_at: msg.createdAt.toISOString(),
      updated_at: msg.updatedAt.toISOString(),
      user: {
        avatar_url: msg.user.avatarUrl,
        channels: null,
        created_at: msg.user.createdAt.toISOString(),
        email: msg.user.email,
        id: msg.user.id,
        is_away: msg.user.isAway,
        name: msg.user.name,
        phone: msg.user.phone,
        type: msg.user.type,
        workspaces: null,
      },
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.log('SERVER ERROR: ', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
