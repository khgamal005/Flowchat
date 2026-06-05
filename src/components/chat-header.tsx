"use client";
import { FC } from "react";
import { IoMdHeadset, IoMdMenu, IoMdArrowBack } from "react-icons/io";
import { FaListUl } from "react-icons/fa6";

import Typography from "@/components/ui/typography";
import { User } from "@/types/app";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMobileNav } from "@/providers/mobile-nav-context";

type ChatHeaderProp = { title: string; chatId: string; userData: User };

const ChatHeader: FC<ChatHeaderProp> = ({ title, chatId, userData }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toggleSidebar, toggleInfoSection } = useMobileNav();

  const workspaceId = params?.workspaceId as string | undefined;

  const handleCall = () => {
    const currentParams = new URLSearchParams(searchParams?.toString());
    if (currentParams.has("call")) {
      currentParams.delete("call");
    } else {
      currentParams.set("call", "true");
    }

    router.push(`?${currentParams.toString()}`);
  };

  return (
    <div className="sticky z-20 h-10 top-0 left-0 w-full">
      <div className="h-10 flex items-center justify-between px-4 w-full md:w-[calc(100%-305px)] lg:w-[calc(100%-447px)] bg-white dark:bg-neutral-800 border-b border-b-white/30 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <button
            className="md:hidden text-foreground p-1"
            onClick={() => {
              if (workspaceId) router.push(`/workspace/${workspaceId}`);
            }}
            aria-label="Back to workspace"
          >
            <IoMdArrowBack size={20} />
          </button>
          <Typography
            text={`# ${title}`}
            variant="h4"
            className="truncate"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="md:hidden text-foreground p-1"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <IoMdMenu size={20} />
          </button>
          <button
            className="md:hidden text-foreground p-1"
            onClick={toggleInfoSection}
            aria-label="Toggle channel list"
          >
            <FaListUl size={18} />
          </button>
          <IoMdHeadset
            onClick={handleCall}
            className="text-primary cursor-pointer"
            size={24}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
