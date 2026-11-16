import { MapPin } from "@phosphor-icons/react";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// The office address with a location pin; opens Google Maps in a new tab.
export default function AddressLink({ className, iconClassName }) {
  const t = useT();
  const address = t(site.address);
  return (
    <a
      href={site.mapLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("{address} (opens Google Maps)", { address })}
      className={cn("inline-flex items-start gap-1.5 underline-offset-2 hover:underline", className)}
    >
      <MapPin weight="fill" aria-hidden="true" className={cn("mt-[0.2em] size-4 shrink-0", iconClassName)} />
      <span>{address}</span>
    </a>
  );
}
