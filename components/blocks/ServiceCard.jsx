import { useId, useState } from "react";
import { ArrowUpRight, CaretDown, Check } from "@phosphor-icons/react";
import { useT } from "@/lib/i18n";

// Heading only until hovered (mouse) or tapped (touch, keyboard); the reveal itself lives in globals.css (.svc-*).
export default function ServiceCard({ section }) {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  const items = section.items || [];

  return (
    <article
      data-open={open}
      className="svc-card relative rounded-2xl border border-border bg-background p-6"
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-24 w-full flex-col text-left outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-brand/40"
        >
          <span className="flex w-full items-start justify-between gap-4">
            <span className="text-lg font-semibold tracking-[-0.015em] text-pretty">{t(section.heading)}</span>
            <ArrowUpRight aria-hidden="true" className="svc-arrow mt-1 size-4 shrink-0 text-muted-foreground" />
          </span>
          <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-medium text-muted-foreground">
            {t("Explore services")}
            <CaretDown aria-hidden="true" weight="bold" className="svc-caret size-3" />
          </span>
        </button>
      </h3>
      <div id={id} className="svc-body">
        <div>
          {section.intro && <p className="svc-item pt-4 text-sm leading-relaxed text-muted-foreground" style={{ "--i": 0 }}>{t(section.intro)}</p>}
          {items.length > 0 && (
            <ul className="grid gap-2.5 pt-4">
              {items.map((item, i) => (
                <li key={item.title} className="svc-item flex gap-2.5 text-sm leading-relaxed" style={{ "--i": i + (section.intro ? 1 : 0) }}>
                  <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" />
                  <span>
                    {item.description ? <span className="font-medium">{t(item.title)}. </span> : t(item.title)}
                    {item.description && <span className="text-muted-foreground">{t(item.description)}</span>}
                    {item.bullets?.length > 0 && <span className="mt-1 block text-muted-foreground">{item.bullets.map((b) => t(b)).join(", ")}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
