import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function getPagination(page: number, size: number) {
  const limit = size ? +size : 10;
  const skip = page ? page * limit : 0;

  return { skip, take: limit };
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = session.user.id;
    const recipientId = searchParams.get('recipientId');

    if (!recipientId) return new NextResponse('Bad Request', { status: 400 });

    const page = Number(searchParams.get('page'));
    const size = Number(searchParams.get('size'));

    const { skip, take } = getPagination(page, size);

    const data = await prisma.directMessage.findMany({
      where: {
        OR: [
          { userOne: userId, userTwo: recipientId },
          { userOne: recipientId, userTwo: userId },
        ],
      },
      include: {
        sender: true,
        userOneRel: true,
        userTwoRel: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
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

    const mapped = data.map(msg => ({
      id: String(msg.id),
      content: msg.content,
      file_url: msg.fileUrl,
      user_id: msg.user,
      is_deleted: msg.isDeleted,
      created_at: msg.createdAt.toISOString(),
      updated_at: msg.updatedAt.toISOString(),
      user: mapUser(msg.sender),
      user_one: mapUser(msg.userOneRel),
      user_two: mapUser(msg.userTwoRel),
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('Error fetching direct messages', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
