import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ className }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center rounded-md", className)} aria-label="Probiz Finance home">
      <img src="/brand/probiz-logo.png" alt="Probiz Management Services" width={130} height={42} className="h-[30px] w-auto" />
    </Link>
  );
}
