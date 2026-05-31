import { AppUser } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function UserInfo({ user }: { user: AppUser }) {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  const joinDate = user.createdAt
    ? format(new Date(user.createdAt), "dd MMMM yyyy")
    : null;

  return (
    <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.photoURL || ""} alt={user.name || "User"} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold">{user.name || ""}</h2>
        {user.email && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}
        {joinDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Joined {joinDate}
          </p>
        )}
      </div>
    </div>
  );
}
