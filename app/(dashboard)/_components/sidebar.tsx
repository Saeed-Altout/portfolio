"use client";
import { routes } from "@/config";

import { Logo } from "@/components/logo";
import { NavItem } from "@/components/nav-item";
import { NavCard } from "@/components/nav-card";

export const Sidebar = () => {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <Logo />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {routes.map(({ label, href, badge, path, icon }, index) => (
              <NavItem
                key={index}
                label={label}
                href={href}
                badge={badge}
                path={path}
                icon={icon}
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <NavCard />
        </div>
      </div>
    </div>
  );
};
