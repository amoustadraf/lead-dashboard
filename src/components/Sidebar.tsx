"use client";

import { Home, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavProps } from "@/lib/types";
import { usePathname } from "next/navigation";


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // empty for now, will add more props later
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const navigation: NavProps[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      current: pathname === "/", // This will be dynamic based on the current route
    },
    {
      name: "Send Emails",
      href: "/send-emails",
      icon: Mail,
      current: pathname === "/send-emails", // This will be dynamic based on the current route
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Overview
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
