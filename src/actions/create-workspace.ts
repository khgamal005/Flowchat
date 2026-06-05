'use server';

import { getUserData } from './get-user-data';
import { prisma } from '@/lib/prisma';

export const createWorkspace = async ({
  imageUrl,
  name,
  slug,
  invite_code,
}: {
  imageUrl?: string;
  name: string;
  slug: string;
  invite_code: string;
}) => {
  const userData = await getUserData();

  if (!userData) {
    return { error: 'No user data' };
  }

  const workspaceRecord = await prisma.workspace.create({
    data: {
      imageUrl,
      name,
      superAdmin: userData.id,
      slug,
      inviteCode: invite_code,
    },
  });

  await prisma.userWorkspace.create({
    data: {
      userId: userData.id,
      workspaceId: workspaceRecord.id,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: userData.id,
      workspaceId: workspaceRecord.id,
    },
  });
};
