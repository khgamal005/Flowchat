'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const toggleUserAway = async (): Promise<{ success: boolean; is_away: boolean }> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { isAway: !user.isAway },
  });

  return { success: true, is_away: updated.isAway };
};

export const clearUserStatus = async (): Promise<{ success: boolean }> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isAway: false },
  });

  return { success: true };
};
