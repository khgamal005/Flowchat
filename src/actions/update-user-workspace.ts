'use server';

import { prisma } from "@/lib/prisma";

export const updateUserWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const data = await prisma.userWorkspace.create({
    data: { userId, workspaceId },
  });
  return [data, null];
};
