import { Compass, File, LucideIcon } from "lucide-react";

export interface RoutesProps {
  label: string;
  href: string;
  badge: boolean;
  path: string;
  icon: LucideIcon;
}

export const routes: RoutesProps[] = [
  {
    label: "Browse",
    href: "/",
    badge: false,
    path: "/",
    icon: Compass,
  },
  {
    label: "Projects",
    href: "/projects",
    badge: true,
    path: "/projects",
    icon: File,
  },
];
