import { updateUserPreferences } from "@/lib/firebase/user";
import { useMutation } from "@tanstack/react-query";
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
      };
    }) => updateUserPreferences(userId, preferences),
    onSuccess: () => {
      refreshUser();
    },
  });
};
