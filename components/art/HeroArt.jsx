import { CheckCircle } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import { cn } from "@/lib/utils";

const CHIP_SPOTS = [
  "left-[4%] top-[8%] xl:left-[-4%]",
  "right-[3%] top-[44%] xl:right-[-4%]",
  "bottom-[6%] left-[10%]",
];

// Hero illustration on a warm panel, with up to three real facts floating over it.
export default function HeroArt({ scene, title, chips = [], className }) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-[6/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,var(--brand-soft),var(--cream)_55%,oklch(0.96_0.03_65))]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,oklch(1_0_0/0.9),transparent)]" />
        <Scene name={scene} title={title} className="absolute inset-0 m-auto h-[92%] w-[92%]" />
      </div>
      {chips.slice(0, 3).map((chip, i) => (
        <div
          key={chip.label}
          className={cn(
            "art-float absolute hidden max-w-[15rem] items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-[0_18px_40px_-24px_oklch(0.21_0.006_286/0.45)] backdrop-blur sm:flex",
            CHIP_SPOTS[i],
            i === 1 && "art-float-2",
            i === 2 && "art-float-3"
          )}
        >
          {chip.value ? (
            <span className="font-display text-xl font-semibold tracking-[-0.03em] text-brand-ink">{chip.value}</span>
          ) : (
            <CheckCircle weight="fill" className="size-5 shrink-0 text-brand" />
          )}
          <span className="text-sm leading-tight font-medium text-foreground/80">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}
