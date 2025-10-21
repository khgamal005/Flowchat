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
  }: any): Promise<{ data: MessageWithUser[] }> => {
    try {
      const url = `${apiUrl}?${paramKey}=${encodeURIComponent(
        paramValue
      )}&page=${pageParam}&size=${pageSize}`;

      const { data } = await axios.get<{ data: MessageWithUser[] }>(url, {
        withCredentials: true,
        timeout: 10000, // Add timeout
      });

      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Don't retry on auth errors
        throw error;
      }
      throw error;
    }
  };

  return useInfiniteQuery<{ data: MessageWithUser[] }, Error>({
    queryKey: [queryKey, paramValue],
    queryFn: fetcher,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.length === pageSize ? allPages.length : undefined,
    refetchInterval: isConnected ? false : 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error.response?.status === 401) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Reduce refetching
    refetchOnReconnect: true,
    initialPageParam: 0,
  });
};