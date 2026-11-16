import Link from "next/link";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Logo({ className }) {
  const t = useT();
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center rounded-md", className)} aria-label={t("Probiz Finance home")}>
      <img src="/brand/probiz-logo.png" alt="Probiz Management Services" width={130} height={42} className="h-[30px] w-auto" />
    </Link>
  );
}
