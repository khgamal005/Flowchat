'use server';

import { getUserData } from '@/actions/get-user-data';
import { prisma } from '@/lib/prisma';
import { addMemberToWorkspace } from './add-member-to-workspace';
import { updateUserWorkspace } from './update-user-workspace';
import { Workspace } from '@/types/app';

export const getUserWorkspaceData = async (workspaceIds: Array<string>) => {
  const data = await prisma.workspace.findMany({
    where: { id: { in: workspaceIds } },
  });

  const workspaces: Workspace[] = data.map(d => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    invite_code: d.inviteCode,
    image_url: d.imageUrl,
    super_admin: d.superAdmin,
    created_at: d.createdAt.toISOString(),
    members: null,
    channels: null,
    regulators: null,
  }));

  return [workspaces, null];
};

export const getCurrentWorksaceData = async (workspaceId: string) => {
  const data = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (!data) {
    return [null, new Error('Workspace not found')] as const;
  }

  const members = data.members.map(m => ({
    avatar_url: m.user.avatarUrl,
    channels: null,
    created_at: m.user.createdAt.toISOString(),
    email: m.user.email,
    id: m.user.id,
    is_away: m.user.isAway,
    name: m.user.name,
    phone: m.user.phone,
    type: m.user.type,
    workspaces: null,
  }));

  const workspaceData: Workspace = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    invite_code: data.inviteCode,
    image_url: data.imageUrl,
    super_admin: data.superAdmin,
    created_at: data.createdAt.toISOString(),
    members,
    channels: null,
    regulators: null,
  };

  return [workspaceData, null] as const;
};

export const workspaceInvite = async (inviteCode: string) => {
  const userData = await getUserData();

  const data = await prisma.workspace.findUnique({
    where: { inviteCode },
    include: { members: true, channels: true },
  });

  if (!data) {
    console.log('Error fetching workspace invite');
    return;
  }

  const isUserMember = data.members.some(m => m.userId === userData?.id);

  if (isUserMember) {
    console.log('User is already a member of this workspace');
    return;
  }

  if (data.superAdmin === userData?.id) {
    console.log('User is the super admin of this workspace');
    return;
  }

  if (!userData?.id) return;
  await addMemberToWorkspace(userData.id, data.id);

  await updateUserWorkspace(userData.id, data.id);

  // Add new member to all existing channels
  for (const channel of data.channels) {
    await prisma.channelMember.create({
      data: { userId: userData.id, channelId: channel.id },
    }).catch(() => {
      // Ignore duplicate errors
    });
    await prisma.userChannel.create({
      data: { userId: userData.id, channelId: channel.id },
    }).catch(() => {
      // Ignore duplicate errors
    });
  }
};
