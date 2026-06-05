import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/types/app";

export const getUserData = async (): Promise<User | null> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workspaces: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      avatar_url: user.avatarUrl,
      channels: null,
      created_at: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      is_away: user.isAway,
      name: user.name,
      phone: user.phone,
      type: user.type,
      workspaces: user.workspaces.map((uw) => uw.workspaceId),
    } as User;
  } catch (error) {
    console.log("Unexpected error in getUserData:", error);
    return null;
  }
};

export const getUserDataPages = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> => {
  try {
    const session = await auth(req, res);

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workspaces: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      avatar_url: user.avatarUrl,
      channels: null,
      created_at: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      is_away: user.isAway,
      name: user.name,
      phone: user.phone,
      type: user.type,
      workspaces: user.workspaces.map((uw) => uw.workspaceId),
    } as User;
  } catch (error) {
    console.log(error);
    return null;
  }
};
