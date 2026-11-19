import { Check, Gift, ListChecks, Target } from "@phosphor-icons/react";
import { useT } from "@/lib/i18n";

export function StepList({ steps }) {
  const t = useT();
  return (
    <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="border-t border-border pt-5">
          <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
          <p className="mt-2 font-semibold">{t(s.title)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t(s.body)}</p>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items, className }) {
  const t = useT();
  return (
    <ul className={className || "grid gap-2.5"}>
      {items.map((x) => (
        <li key={x} className="flex gap-2.5 text-sm text-foreground/85">
          <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" /> {t(x)}
        </li>
      ))}
    </ul>
  );
}

export function ProgrammeDetails({ programme }) {
  const t = useT();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        [Gift, "What you get", programme.get],
        [ListChecks, "What you will do", programme.doList],
        [Target, "What we look for", programme.lookFor],
      ].map(([Icon, title, list]) => (
        <div key={title} className="rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]">
          <p className="flex items-center gap-2 font-semibold">
            <Icon weight="duotone" className="size-5 text-brand-ink" /> {t(title)}
          </p>
          <CheckList items={list} className="mt-5 grid gap-3" />
        </div>
      ))}
    </div>
  );
}
