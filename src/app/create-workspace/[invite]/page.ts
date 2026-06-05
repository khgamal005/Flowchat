import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { workspaceInvite } from '@/actions/workspaces';

export const dynamic = 'force-dynamic';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ invite: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }

  const { invite: inviteCode } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { inviteCode },
  });

  if (!workspace) {
    redirect('/create-workspace');
  }

  await workspaceInvite(inviteCode);

  redirect(`/workspace/${workspace.id}`);
}
