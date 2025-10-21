import { useInfiniteQuery } from '@tanstack/react-query';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

type ChatFetcherProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: 'channelId' | 'recipientId';
  paramValue: string;
  pageSize: number;
};

type ChatResponse = {
  data: MessageWithUser[];
  nextPage?: number;
};

export const useChatFetcher = ({
  apiUrl,
  queryKey,
  pageSize,
  paramKey,
  paramValue,
}: ChatFetcherProps) => {
  const { isConnected } = useSocket();

  return useInfiniteQuery<ChatResponse, Error>({
    queryKey: [queryKey, paramValue],

    // ✅ Fetch messages page by page with cookies
    queryFn: async ({ pageParam = 0 }) => {
      const url = `${apiUrl}?${paramKey}=${encodeURIComponent(
        paramValue
      )}&page=${pageParam}&size=${pageSize}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include', // ✅ Keeps cookies in SSR/client fetch
      });

      if (res.status === 401) {
        // Don't retry on auth errors
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        data: data.data,
        nextPage: data.data.length === pageSize ?  + 1 : undefined,
      };
    },

    getNextPageParam: (lastPage) => lastPage.nextPage,

    // ✅ Only refetch if disconnected (reconnect recovery)
    refetchInterval: isConnected ? false : 1000,

    retry: (failureCount, error) => {
      if (error.message === 'Unauthorized') return false;
      return failureCount < 3;
    },

    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    initialPageParam: 0,
  });
};
