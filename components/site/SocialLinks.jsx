import { FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from "@phosphor-icons/react";
import { useT } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: FacebookLogo, color: "#1877F2" },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramLogo,
    color: "#E1306C",
    fill: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
  },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinLogo, color: "#0A66C2" },
  { key: "youtube", label: "YouTube", Icon: YoutubeLogo, color: "#FF0000" },
];

// Links come from Website settings; platforms without a URL are skipped. `dark` is for dark backgrounds.
export default function SocialLinks({ dark = false, className }) {
  const t = useT();
  const { social } = useSiteSettings();
  const socials = SOCIALS.filter(({ key }) => social[key]);
  if (socials.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-2.5", className)}>
      {socials.map(({ key, label, Icon, color, fill }) => (
        <li key={key}>
          <a
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Visit Probiz Finance on {platform}", { platform: label })}
            title={label}
            style={{ "--brand": color }}
            className={cn(
              "group relative isolate inline-flex size-11 items-center justify-center overflow-hidden rounded-full text-(--brand) transition-[transform,box-shadow,color,border-color] duration-300 ease-out hover:text-white hover:shadow-[0_10px_24px_-8px_var(--brand)] focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 motion-safe:hover:-translate-y-1 sm:size-10",
              dark
                ? "bg-background/10 focus-visible:ring-background/40"
                : "border border-[color-mix(in_oklab,var(--brand)_25%,transparent)] bg-[color-mix(in_oklab,var(--brand)_7%,var(--background))] hover:border-transparent focus-visible:ring-ring"
            )}
          >
            {/* Brand fill grows from the centre on hover. */}
            <span
              aria-hidden
              style={{ background: fill || color }}
              className="absolute inset-0 -z-10 scale-0 rounded-full opacity-0 transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            />
            <Icon weight="fill" className="size-5 transition-transform duration-300 ease-out motion-safe:group-hover:-rotate-8 motion-safe:group-hover:scale-110" />
          </a>
        </li>
      ))}
    </ul>
  );
}
