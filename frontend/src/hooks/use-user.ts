import {
  updateUserCustomCategories,
  updateUserPreferences,
  getFcmTokens,
  saveFcmToken,
  deleteFcmToken,
  deleteAllFcmTokens,
} from "@/lib/firebase/user";
import { updateUserDataCookie } from "@/lib/firebase/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export const useUpdateUserPreferences = () => {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: {
        theme?: "light" | "dark" | "system";
        pushNotifications?: boolean;
        notificationTime?: number;
        timezone?: string;
      };
    }) => updateUserPreferences(userId, preferences),
    onSuccess: async (_, { preferences }) => {
      if (preferences.theme) {
        await updateUserDataCookie({ theme: preferences.theme });
      }
      refreshUser();
    },
  });
};

export const useUpdateUserCustomCategories = () => {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({
      userId,
      customCategories,
    }: {
      userId: string;
      customCategories: string[];
    }) => updateUserCustomCategories(userId, customCategories),
    onSuccess: () => {
      refreshUser();
    },
  });
};

export const useGetFcmTokens = (userId: string) => {
  return useQuery({
    queryKey: ["fcmTokens", userId],
    queryFn: () => getFcmTokens(userId),
    enabled: !!userId,
  });
};

export const useSaveFcmToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      saveFcmToken(userId, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fcmTokens", variables.userId],
      });
    },
  });
};

export const useDeleteFcmToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, tokenId }: { userId: string; tokenId: string }) =>
      deleteFcmToken(userId, tokenId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fcmTokens", variables.userId],
      });
    },
  });
};

export const useDeleteAllFcmTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAllFcmTokens(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["fcmTokens", userId] });
    },
  });
};
