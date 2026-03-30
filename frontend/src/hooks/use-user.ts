import { updateUserPreferences } from "@/lib/firebase/user";
import { updateUserDataCookie } from "@/lib/firebase/session";
import { useAuth } from "@/contexts/auth-context";
import useMutation from "./use-mutation";

export const useUpdateUserPreferences = () => {
  const { user } = useAuth();

  const mutation = useMutation(
    (preferences: {
      theme?: "light" | "dark" | "system";
      pushNotifications?: boolean;
      notificationTime?: number;
      timezone?: string;
    }) => updateUserPreferences(user?.uid || "", preferences),
    {
      onSuccess: async (_, preferences) => {
        if (preferences.theme) {
          await updateUserDataCookie({ theme: preferences.theme });
        }
      },
      onError: "Failed to update. Please try again.",
    },
  );

  return mutation;
};
