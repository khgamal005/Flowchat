import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import { Workspace as UserWorkspace } from "@/types/app";

import { getUserWorkspaceChannels } from "@/actions/get-user-workspace-channels";
import ChatGroup from "@/components/chat-group";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import Sidebar from "@/components/sidebar";
import InfoSection from "@/components/info-section";
import ChatHeader from "@/components/chat-header";
import TextEditor from "@/components/text-editor";
import ChatMessages from "@/components/chat-messages";

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
    <div className="flex h-screen">
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
      
      <div className="flex flex-col flex-1 relative">
        <ChatHeader
          title={currentChannelData.name}
          chatId={"chatId"}
          userData={userData}
        />

        <div className="flex-1 overflow-auto pb-20"> {/* Add padding bottom */}
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

        {/* Fixed TextEditor at bottom */}
        <div className="fixed bottom-0 left-0 right-0 ml-[320px] mr-[320px] bg-background border-t">
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
};

export default ChannelId;
