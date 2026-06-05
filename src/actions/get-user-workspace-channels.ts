'use server';

import { prisma } from '@/lib/prisma';
import { Channel } from '@/types/app';

export const getUserWorkspaceChannels = async (
  workspaceId: string,
  userId: string
) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { channels: true },
  });

  if (!workspace) {
    console.error('Workspace not found');
    return [];
  }

  const channelIds = workspace.channels.map(c => c.id);

  if (channelIds.length === 0) {
    console.log('No channels found');
    return [];
  }

  const channelsData = await prisma.channel.findMany({
    where: {
      id: { in: channelIds },
    },
  });

  const userWorkspaceChannels: Channel[] = channelsData.map(c => ({
    id: c.id,
    members: null,
    name: c.name,
    regulators: null,
    user_id: c.userId,
    workspace_id: c.workspaceId,
    created_at: c.createdAt.toISOString(),
  }));

  return userWorkspaceChannels;
};
