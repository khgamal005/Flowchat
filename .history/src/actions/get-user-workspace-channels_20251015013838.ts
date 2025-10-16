'use server';

import { createClient } from '@/supabase/supabaseServer';
import { Channel } from '@/types/app';

export const getUserWorkspaceChannels = async (
  workspaceId: string,
  userId: string
) => {
  const supabase = await createClient();

  // ✅ Get all channels that belong to the workspace
  const { data: channelsData, error } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error fetching channels:', error);
    return [];
  }

  if (!channelsData || channelsData.length === 0) {
    console.log('No channels found for workspace:', workspaceId);
    return [];
  }

  // ✅ Filter only channels where user is a member
  const userWorkspaceChannels = channelsData.filter(
    (channel) => Array.isArray(channel.members) && channel.members.includes(userId)
  );

  return userWorkspaceChannels as Channel[];
};
