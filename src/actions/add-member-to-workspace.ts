import { prisma } from "@/lib/prisma";

export const addMemberToWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const data = await prisma.workspaceMember.create({
    data: { userId, workspaceId },
  });
  return [data, null];
};
