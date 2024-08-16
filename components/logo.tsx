import Link from "next/link";
import { Code } from "lucide-react";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
      <Code className="h-7 w-7" />
      <span className="text-base">Code Plus.</span>
    </Link>
  );
};
