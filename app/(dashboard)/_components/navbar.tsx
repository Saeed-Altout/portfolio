"use client";

import { Menu } from "lucide-react";

import { routes } from "@/config";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

import { NavCard } from "@/components/nav-card";
import { NavItem } from "@/components/nav-item";
import { NavInput } from "@/components/nav-input";
import { NavButton } from "@/components/nav-button";

export const Navbar = () => {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-4 text-lg font-medium">
            <Logo />
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
          <div className="mt-auto">
            <NavCard />
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <NavInput />
      </div>
      <NavButton />
    </header>
  );
};
