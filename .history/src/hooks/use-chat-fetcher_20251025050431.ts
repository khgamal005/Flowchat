import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

type ChatFetcherProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: 'channelId' | 'recipientId';
  paramValue: string;
  pageSize: number;
};

export const useChatFetcher = ({
  apiUrl,
  queryKey,
  pageSize,
  paramKey,
  paramValue,
}: ChatFetcherProps) => {
  const { isConnected } = useSocket();

  const fetcher = async ({
    pageParam = 0,
  }): Promise<{ data: MessageWithUser[] }> => {
    const url = `${apiUrl}?${paramKey}=${encodeURIComponent(
      paramValue
    )}&page=${pageParam}&size=${pageSize}`;

    const { data } = await axios.get<{ data: MessageWithUser[] }>(url);

    return data;
  };

  return useInfiniteQuery<{ data: MessageWithUser[] }, Error>({
    queryKey: [queryKey, paramValue],
    queryFn: fetcher,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.length === pageSize ? allPages.length : undefined,
    refetchInterval: isConnected ? false : 20000, // slower fallback polling
    retry: 2,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    initialPageParam: 0,
  });
};
