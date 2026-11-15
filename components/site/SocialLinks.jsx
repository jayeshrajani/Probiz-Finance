import { FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from "@phosphor-icons/react";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: FacebookLogo },
  { key: "instagram", label: "Instagram", Icon: InstagramLogo },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinLogo },
  { key: "youtube", label: "YouTube", Icon: YoutubeLogo },
];

// Links come from Website settings; platforms without a URL are skipped. `dark` is for dark backgrounds.
export default function SocialLinks({ dark = false, className }) {
  const { social } = useSiteSettings();
  const socials = SOCIALS.filter(({ key }) => social[key]);
  if (socials.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {socials.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit Probiz Finance on ${label}`}
            title={label}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 sm:size-10",
              dark
                ? "bg-background/10 text-background/80 hover:bg-background/20 hover:text-background focus-visible:ring-background/40"
                : "border border-border bg-background text-foreground/70 hover:border-foreground/20 hover:text-foreground focus-visible:ring-ring"
            )}
          >
            <Icon weight="fill" className="size-[1.125rem]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
