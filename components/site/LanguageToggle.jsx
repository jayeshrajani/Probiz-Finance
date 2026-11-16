import { useRouter } from "next/router";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { locale: "en", label: "EN", name: "English" },
  { locale: "hi", label: "हिं", name: "हिन्दी" },
];

export default function LanguageToggle({ className }) {
  const router = useRouter();
  const current = router.locale || "en";

  const switchTo = (locale) => {
    if (locale === current) return;
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale, scroll: false });
  };

  return (
    <div role="group" aria-label="Language / भाषा" className={cn("inline-flex h-9 items-center rounded-full bg-secondary p-1 text-xs font-semibold", className)}>
      {OPTIONS.map((o) => {
        const active = current === o.locale;
        return (
          <button
            key={o.locale}
            type="button"
            lang={o.locale}
            title={o.name}
            aria-pressed={active}
            onClick={() => switchTo(o.locale)}
            className={cn("relative inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2.5 transition-colors", active ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {active && <motion.span layoutId="lang-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-background shadow-[0_1px_3px_oklch(0.21_0.006_286/0.18)]" />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
