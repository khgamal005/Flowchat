import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import { Workspace as UserWorkspace } from "@/types/app";

import { getUserWorkspaceChannels } from "@/actions/get-user-workspace-channels";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";

import Sidebar from "@/components/sidebar";
import InfoSection from "@/components/info-section";
import ChatHeader from "@/components/chat-header";
import ChatMessages from "@/components/chat-messages";
import TextEditor from "@/components/text-editor";

const ChannelId = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) => {
  const { workspaceId, channelId } = await params;

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    (channel) => channel.id === channelId
  );

  if (!currentChannelData) return redirect("/");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar + Info */}
      <Sidebar
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorkspacesData={userWorkspaceData as UserWorkspace[]}
      />
      <InfoSection
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorkspaceChannels={userWorkspaceChannels}
        currentChannelId={channelId}
      />

      {/* ✅ Chat area */}
      <div className="flex flex-col w-full h-full">
        <ChatHeader
          title={currentChannelData.name}
          chatId={"chatId"}
          userData={userData}
        />

        {/* ✅ Scrollable messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages
            userData={userData}
            name={currentChannelData?.name ?? "USERNAME"}
            workspaceData={currentWorkspaceData}
            chatId={channelId}
            type="Channel"
            apiUrl="/api/messages"
            socketUrl="/api/web-socket/messages"
            socketQuery={{
              channelId: currentChannelData.id,
              workspaceId: currentWorkspaceData,
            }}
            paramKey="channelId"
            paramValue={channelId}
            channelData={currentChannelData}
          />
        </div>

        {/* ✅ Fixed at bottom */}
<div className="p-3 border dark:border-zinc-600 border-neutral-700 rounded-lg relative bg-background/60 backdrop-blur-sm">
          <TextEditor
            apiUrl={"/api/web-socket/messages"}
            type="Channel"
            channel={currentChannelData}
            userData={userData}
            workspaceData={currentWorkspaceData}
          />
        </div>
      </div>
    </div>
  );
};

export default ChannelId;

