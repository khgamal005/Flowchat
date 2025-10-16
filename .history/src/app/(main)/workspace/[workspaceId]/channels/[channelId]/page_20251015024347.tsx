const ChannelId = async ({ params }: { params: Promise<{ workspaceId: string; channelId: string }> }) => {
  const { workspaceId, channelId } = await params;

  const userData = await getUserData();
  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    (channel) => channel.id === channelId
  );

  if (!currentChannelData) return redirect('/');

  return (
    <div>
      channelId: {channelId}
    </div>
  );
};

export default ChannelId;
