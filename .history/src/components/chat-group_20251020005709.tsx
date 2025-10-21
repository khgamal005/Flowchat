"use client";

import { FC, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/sidebar";
import { Channel, User } from "@/types/app";
import InfoSection from "@/components/info-section";
import ChatHeader from "@/components/chat-header";
import TextEditor from "@/components/text-editor";
import { Workspace as UserWorkspace } from "@/types/app";
import ChatMessages from "./chat-messages";
import SearchBar from "./search-bar";

type ChatGroupProps = {
  type: "Channel" | "DirectMessage";
  socketUrl: string;
  apiUrl: string;
  headerTitle: string;
  chatId: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "recipientId";
  paramValue: string;
  userData: User;
  currentWorkspaceData: UserWorkspace;
  currentChannelData: Channel | undefined;
  userWorkspaceData: UserWorkspace[];
  userWorkspaceChannels: Channel[];
  slug: string;
};

const ChatGroup: FC<ChatGroupProps> = ({
  apiUrl,
  chatId,
  headerTitle,
  paramKey,
  paramValue,
  socketQuery,
  socketUrl,
  type,
  currentChannelData,
  currentWorkspaceData,
  slug,
  userData,
  userWorkspaceChannels,
  userWorkspaceData,
}) => {
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const callParam = searchParams?.get("call");
    setIsVideoCall(callParam === "true");
  }, [searchParams, chatId]);

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
        currentChannelId={
          type === "Channel" ? currentChannelData?.id : undefined
        }
      />
      <SearchBar
        currentWorkspaceData={currentWorkspaceData}
        currentChannelData={currentChannelData}
        loggedInUserId={userData.id}
      />

      <div className="flex flex-col flex-1">
        <ChatHeader title={headerTitle} chatId={chatId} userData={userData} />

        <div className="flex-1 overflow-hidden">
<ChatMessages
  socketQuery={socketQuery}
  paramKey={paramKey}
  paramValue={paramValue}
  apiUrl={apiUrl}
/>


        </div>

        <div className="sticky bottom-0 bg-background border-t">
          <TextEditor
            apiUrl={socketUrl}
            channel={currentChannelData}
            type={type}
            userData={userData}
            workspaceData={currentWorkspaceData}
            recipientId={type === "DirectMessage" ? chatId : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatGroup;
