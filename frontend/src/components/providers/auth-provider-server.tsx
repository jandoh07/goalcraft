import { AuthProvider, InitialUser } from "@/contexts/auth-context";
import { getServerUser } from "@/lib/firebase/server-auth";

export async function AuthProviderWithServerUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverUser = await getServerUser();

  const initialUser: InitialUser | null = serverUser
    ? {
        uid: serverUser.uid,
        email: serverUser.email,
        name: serverUser.name,
        theme: serverUser.theme,
        subscription: serverUser.subscription,
        sessionCreatedAt: serverUser.sessionCreatedAt,
      }
    : null;

  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
