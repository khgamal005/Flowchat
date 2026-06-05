"use client";

import { FC, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/sidebar";
import InfoSection from "@/components/info-section";
import ChatHeader from "@/components/chat-header";
import TextEditor from "@/components/text-editor";
import { Workspace as UserWorkspace, MessageWithUser } from "@/types/app";
import SearchBar from "./search-bar";
import ChatMessages from "./chat-messages";
import { Channel, User } from "@/types/app";
import VideoChat from "./video-chat";

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
  userWorksapcesData: UserWorkspace[];
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
  userWorksapcesData,
}) => {
  const [isVideoCall, setIsVideoCall] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const callParam = searchParams?.get("call");
    setIsVideoCall(callParam === "true");
  }, [searchParams, chatId]);




  return (
    <>
      <Sidebar
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorksapcesData={userWorksapcesData as UserWorkspace[]}
      />

      <InfoSection
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorkspaceChannels={userWorkspaceChannels}
        currentChannelId={
          type === "Channel" ? currentChannelData?.id : undefined
        }
      />

      <div className="flex flex-col h-full min-h-0">
        <SearchBar
          currentWorkspaceData={currentWorkspaceData}
          currentChannelData={currentChannelData}
          loggedInUserId={userData.id}
        />

        <div className="flex-1 overflow-y-auto min-h-0 p-4 relative">
          <ChatHeader title={headerTitle} chatId={chatId} userData={userData} />

          <div className="mt-10">
            {!isVideoCall && (
              <ChatMessages
                userData={userData}
                name={currentChannelData?.name ?? "USERNAME"}
                workspaceData={currentWorkspaceData}
                chatId={chatId}
                type={type}
                apiUrl={apiUrl}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
                paramKey={paramKey}
                paramValue={paramValue}
                channelData={currentChannelData}
              />
            )}
            {isVideoCall && (
              <VideoChat
                chatId={type === "Channel" ? (currentChannelData?.id ?? chatId) : chatId}
                userData={userData}
              />
            )}
          </div>
        </div>

        <div className="px-4 pb-4 md:pb-0">
          {!isVideoCall && (
            <TextEditor
              apiUrl={socketUrl}
              channel={currentChannelData}
              type={type}
              userData={userData}
              workspaceData={currentWorkspaceData}
              recipientId={type === "DirectMessage" ? chatId : undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatGroup;
