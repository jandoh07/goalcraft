import {
  addTimeBlock,
  updateTimeBlock,
  fetchUserTimeBlocks,
  removeTimeBlock,
  subscribeToUserTimeBlocks,
  moveTimeBlock,
  batchDeleteTimeBlocks,
} from "@/lib/firebase/schedule";
import { TimeBlock, TimeBlockInstance } from "@/types/schedule";
import {
  expandTimeBlocks,
  isInstanceId,
  getMasterBlockId,
} from "@/lib/utils/recurrence";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export const useGetTimeBlocks = (
  userId: string,
  filters?: { startDate?: Date; endDate?: Date }
) => {
  const queryClient = useQueryClient();

  const startDateIso = filters?.startDate?.toISOString();
  const endDateIso = filters?.endDate?.toISOString();

  const queryKey = useMemo(
    () => ["timeBlocks", userId, startDateIso, endDateIso] as const,
    [userId, startDateIso, endDateIso]
  );

  const memoizedFilters = useMemo(
    () => filters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDateIso, endDateIso]
  );

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserTimeBlocks(
      userId,
      memoizedFilters,
      (timeBlocks) => {
        queryClient.setQueryData(queryKey, timeBlocks);
      }
    );

    return () => unsubscribe();
  }, [userId, memoizedFilters, queryClient, queryKey]);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchUserTimeBlocks(userId, memoizedFilters),
    enabled: !!userId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Expand recurring blocks into instances
  const expandedBlocks = useMemo(() => {
    if (!query.data || !filters?.startDate || !filters?.endDate) {
      return query.data ?? [];
    }
    return expandTimeBlocks(query.data, filters.startDate, filters.endDate) as (
      | TimeBlock
      | TimeBlockInstance
    )[];
  }, [query.data, filters?.startDate, filters?.endDate]);

  return {
    ...query,
    data: expandedBlocks,
    rawData: query.data, // Original data without expansion (for editing master blocks)
  };
};

export const useAddTimeBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      timeBlock: Omit<TimeBlock, "id" | "createdAt" | "updatedAt">
    ) => addTimeBlock(timeBlock),
    onMutate: async (newTimeBlock) => {
      await queryClient.cancelQueries({ queryKey: ["timeBlocks"] });

      const tempTimeBlock: TimeBlock = {
        ...newTimeBlock,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["timeBlocks"] })
        .forEach((query) => {
          const oldData = query.state.data as TimeBlock[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            queryClient.setQueryData(query.queryKey, [
              ...oldData,
              tempTimeBlock,
            ]);
          }
        });

      return { previousQueries, tempTimeBlock };
    },
    onError: (err, newTimeBlock, context) => {
      console.error("Failed to add time block:", err);

      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useUpdateTimeBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeBlockId,
      updates,
    }: {
      timeBlockId: string;
      updates: Partial<Omit<TimeBlock, "id" | "userId" | "createdAt">>;
    }) => {
      // If this is an instance ID, update the master block
      const actualId = isInstanceId(timeBlockId)
        ? getMasterBlockId(timeBlockId)
        : timeBlockId;
      return updateTimeBlock(actualId, updates);
    },
    onMutate: async ({ timeBlockId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["timeBlocks"] });

      const actualId = isInstanceId(timeBlockId)
        ? getMasterBlockId(timeBlockId)
        : timeBlockId;

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["timeBlocks"] })
        .forEach((query) => {
          const oldData = query.state.data as TimeBlock[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((block) =>
              block.id === actualId
                ? { ...block, ...updates, updatedAt: new Date() }
                : block
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to update time block:", err);

      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useDeleteTimeBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeBlockId: string) => {
      // If this is an instance ID, delete the master block
      const actualId = isInstanceId(timeBlockId)
        ? getMasterBlockId(timeBlockId)
        : timeBlockId;
      return removeTimeBlock(actualId);
    },
    onMutate: async (timeBlockId: string) => {
      await queryClient.cancelQueries({ queryKey: ["timeBlocks"] });

      const actualId = isInstanceId(timeBlockId)
        ? getMasterBlockId(timeBlockId)
        : timeBlockId;

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["timeBlocks"] })
        .forEach((query) => {
          const oldData = query.state.data as TimeBlock[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.filter(
              (block) => block.id !== actualId
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, timeBlockId, context) => {
      console.error("Failed to delete time block:", err);

      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useMoveTimeBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeBlockId,
      newStart,
      newEnd,
    }: {
      timeBlockId: string;
      newStart: Date;
      newEnd: Date;
    }) => moveTimeBlock(timeBlockId, newStart, newEnd),
    onMutate: async ({ timeBlockId, newStart, newEnd }) => {
      await queryClient.cancelQueries({ queryKey: ["timeBlocks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["timeBlocks"] })
        .forEach((query) => {
          const oldData = query.state.data as TimeBlock[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((block) =>
              block.id === timeBlockId
                ? {
                    ...block,
                    start: newStart,
                    end: newEnd,
                    updatedAt: new Date(),
                  }
                : block
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to move time block:", err);

      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useBatchDeleteTimeBlocks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: batchDeleteTimeBlocks,
    onMutate: async (timeBlockIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["timeBlocks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["timeBlocks"] })
        .forEach((query) => {
          const oldData = query.state.data as TimeBlock[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.filter(
              (block) => !timeBlockIds.includes(block.id)
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, timeBlockIds, context) => {
      console.error("Failed to batch delete time blocks:", err);

      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};
