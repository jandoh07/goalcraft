import { Goal, Sun, Inbox, BarChart3, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabItems = [
  {
    id: 1,
    label: "Today",
    icon: Sun,
    href: "/today",
  },
  {
    id: 2,
    label: "Inbox",
    icon: Inbox,
    href: "/inbox",
  },
  {
    id: 3,
    label: "Goals",
    icon: Goal,
    href: "/goals",
  },
  {
    id: 4,
    label: "Review",
    icon: BarChart3,
    href: "/review",
  },
  {
    id: 5,
    label: "Profile",
    icon: User,
    href: "/settings",
  },
];

const BottomTab = () => {
  const pathname = usePathname();

  return (
    <nav className="flex justify-around items-center fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border">
      {tabItems.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className={`flex flex-col items-center ${
            pathname === item.href ? "text-accent" : "text-foreground"
          }`}
        >
          <item.icon className="size-6 my-1" />
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomTab;
