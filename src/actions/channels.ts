'use server';

import { prisma } from '@/lib/prisma';
import { getUserData } from './get-user-data';

export const createChannel = async ({
  name,
  workspaceId,
  userId,
}: {
  workspaceId: string;
  name: string;
  userId: string;
}) => {
  const userData = await getUserData();

  if (!userData) {
    return { error: 'No user data' };
  }

  const channelRecord = await prisma.channel.create({
    data: {
      name,
      userId,
      workspaceId,
    },
  });

  // Add all workspace members to the channel
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
  });

  for (const member of workspaceMembers) {
    await prisma.channelMember
      .create({
        data: { userId: member.userId, channelId: channelRecord.id },
      })
      .catch(() => {});
    await prisma.userChannel
      .create({
        data: { userId: member.userId, channelId: channelRecord.id },
      })
      .catch(() => {});
  }

  return {};
};

export const addChannelToUser = async (userId: string, channelId: string) => {
  const data = await prisma.userChannel.create({
    data: { userId, channelId },
  });
  return [data, null];
};

export const updateChannelMembers = async (
  channelId: string,
  userId: string
) => {
  const data = await prisma.channelMember.create({
    data: { userId, channelId },
  });
  return [data, null];
};

export const updateChannelRegulators = async (
  userId: string,
  channelId: string
) => {
  const data = await prisma.channelRegulator.create({
    data: { userId, channelId },
  });
  return [data, null];
};
