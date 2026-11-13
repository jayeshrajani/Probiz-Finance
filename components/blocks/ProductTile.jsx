import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import Scene, { sceneFor } from "@/components/art/Scene";
import { hrefFor } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// Compact link tile: icon, name and one line. Used for related products, hubs and services.
export default function ProductTile({ item, blurb, className, art = false }) {
  const Icon = item.icon;
  if (art) {
    return (
      <Link
        href={hrefFor(item)}
        className={cn("group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/15", className)}
      >
        <div className="bg-secondary/70 px-6 pt-3 transition-colors group-hover:bg-brand-soft">
          <Scene name={sceneFor(item)} className="mx-auto h-32 w-auto" />
        </div>
        <div className="flex flex-1 items-start justify-between gap-4 p-5">
          <div>
            <p className="font-semibold tracking-[-0.015em]">{item.name}</p>
            {(blurb ?? item.blurb) && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{blurb ?? item.blurb}</p>}
          </div>
          <ArrowUpRight weight="bold" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={hrefFor(item)}
      className={cn(
        "group flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-background p-5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_18px_40px_-28px_oklch(0.21_0.006_286/0.35)]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        {Icon && (
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground/80 transition-colors group-hover:bg-brand-soft group-hover:text-brand-ink">
            <Icon weight="duotone" className="size-6" />
          </span>
        )}
        <ArrowUpRight weight="bold" className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div>
        <p className="font-semibold tracking-[-0.015em]">{item.name}</p>
        {(blurb ?? item.blurb ?? item.summary) && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{blurb ?? item.blurb ?? item.summary}</p>
        )}
      </div>
    </Link>
  );
}
