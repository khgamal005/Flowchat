'use server';

import { getUserData } from '@/actions/get-user-data';


export const getUserWorkspaceData = async (workspaceIds: Array<string>) => {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds);

  return [data, error];
};

export const getCurrentWorksaceData = async (workspaceId: string) => {
  const supabase = await supabaseServerClien();

  const { data, error } = await supabase
    .from('workspaces')
    .select('*, channels (*)')
    .eq('id', workspaceId)
    .single();

  if (error) {
    return [null, error];
  }

  const { members } = data;

  const memberDetails = await Promise.all(
    members.map(async (memberId: string) => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (userError) {
        console.log(
          `Error fetching user data for member ${memberId}`,
          userError
        );
        return null;
      }

      return userData;
    })
  );

  data.members = memberDetails.filter(member => member !== null);

  return [data, error];
};


