"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  label: string;
  href: string;
  badge: boolean;
  path: string;
  icon: LucideIcon;
}

export const NavItem = ({
  href,
  label,
  path,
  badge,
  icon: Icon,
}: NavItemProps) => {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        "mx-[-0.65rem] flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:text-foreground text-base",
        path === pathname && "bg-muted text-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
      {badge && (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
          6
        </Badge>
      )}
    </Link>
  );
};
