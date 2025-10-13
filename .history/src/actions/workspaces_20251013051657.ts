'use server';

import { getUserData } from '@/actions/get-user-data';
import { createClient } from '@/supabase/supabaseServer';
import { addMemberToWorkspace } from './add-member-to-workspace';
import { updateUserWorkspace } from './update-user-workspace';

export const getUserWorkspaceData = async (workspaceIds: Array<string>) => {
    const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds);

  return [data, error];
};


export const getCurrentWorksaceData = async (workspaceId: string) => {
  const supabase = await createClient();

  // 1. Fetch the main workspace data
  const { data: workspaceData, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*, channels (*)')
    .eq('id', workspaceId)
    .single();

  // 🛑 FIX 1: Check if workspaceData is null OR if there was an error.
  if (workspaceError || !workspaceData) {
    // Log the error for debugging.
    if (workspaceError) {
      console.error(`Supabase error fetching workspace ${workspaceId}:`, workspaceError.message);
    } else {
      console.warn(`Workspace with ID ${workspaceId} not found.`);
    }
    // Return null data and the error object (which might be null if only data is missing).
    return [null, workspaceError];
  }

  // 2. Safely access members, since workspaceData is guaranteed to be an object here.
  const { members } = workspaceData;

  const memberDetails = await Promise.all(
    members.map(async (memberId: string) => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (userError) {
        console.error( // Use console.error for actual errors
          `Error fetching user data for member ${memberId}`,
          userError
        );
        return null;
      }

      return userData;
    })
  );

  // 3. Assign filtered members back to the workspaceData object
  workspaceData.members = memberDetails.filter(member => member !== null);

  // Return the fetched data and the (now null) error object
  return [workspaceData, null]; // Return null for the error since it was handled
};

export const workspaceInvite = async (inviteCode: string) => {
    const supabase = await createClient();
  const userData = await getUserData();

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) {
    console.log('Error fetching workspace invite', error);
    return;
  }

  const isUserMember = data?.members?.includes(userData?.id);

  if (isUserMember) {
    console.log('User is already a member of this workspace');
    return;
  }

  if (data?.super_admin === userData?.id) {
    console.log('User is the super admin of this workspace');
    return;
  }

  await addMemberToWorkspace(userData?.id!, data?.id);

  await updateUserWorkspace(userData?.id!, data?.id);
};
