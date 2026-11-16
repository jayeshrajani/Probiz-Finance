import Link from "next/link";
import { ArrowUpRight, ChatCircleDots, Phone } from "@phosphor-icons/react";
import { openAssistant } from "@/components/assistant/events";
import AddressLink from "@/components/site/AddressLink";
import NewsletterForm from "@/components/site/NewsletterForm";
import SocialLinks from "@/components/site/SocialLinks";
import { Button } from "@/components/ui/button";
import { gaConfigured, setConsent } from "@/lib/analytics";
import { openCallback } from "@/lib/callback";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";
import { useSiteSettings } from "@/lib/site-settings";

// One flat list: the header already carries the full product catalogue.
const links = [
  { name: "Loans", href: "/securedloans" },
  { name: "Insurance", href: "/healthInsurance" },
  { name: "Motor insurance", href: "/automobile-insurance" },
  { name: "Investments", href: "/investmentplans" },
  { name: "Calculators", href: "/eligibility" },
  { name: "Property", href: "/property" },
  { name: "About", href: "/about" },
  { name: "Careers", href: "/Careers" },
  { name: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  const t = useT();
  const { primary, secondary, contactEmail, emailHref } = useSiteSettings();
  const phones = [primary, secondary].filter((p, i, all) => p && all.findIndex((q) => q?.number === p.number) === i);
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div className="container-page grid gap-12 pt-20 pb-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2 className="display-2 max-w-[16ch] text-balance">{t("Questions about money? Ask a person.")}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="brand" onClick={() => openCallback()}>
              <Phone weight="bold" /> {t("Get a free callback")}
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background">
              <a href={primary.href}>
                <Phone weight="bold" /> {primary.display}
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background" onClick={() => openAssistant()}>
              <ChatCircleDots weight="bold" /> {t("Chat with us")}
            </Button>
          </div>
          <SocialLinks dark className="mt-6" />
        </div>
        <div className="lg:col-span-5 lg:justify-self-end">
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page">
        <div className="grid gap-10 border-t border-background/12 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" aria-label={t("Probiz Finance home")} className="inline-flex rounded-xl bg-background px-3 py-2">
              <img src="/brand/probiz-logo.png" alt="" width={130} height={42} className="h-7 w-auto" />
            </Link>
            <address className="mt-6 grid gap-0.5 text-sm not-italic leading-relaxed text-background/65">
              <AddressLink className="w-fit pb-1 hover:text-background" />
              {phones.map((p) => (
                <a key={p.number} href={p.href} className="w-fit py-1.5 tabular-nums hover:text-background">
                  {p.display}
                </a>
              ))}
              {emailHref && (
                <a href={emailHref} className="w-fit py-1.5 hover:text-background">
                  {contactEmail}
                </a>
              )}
            </address>
          </div>
          <nav aria-label={t("Footer")} className="md:col-span-7">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 py-2 text-[0.9375rem] text-background/75 transition-colors hover:text-background">
                    {t(link.name)}
                    <ArrowUpRight weight="bold" className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-background/12 py-6 text-xs text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}
          </p>
          <div className="flex flex-wrap items-center gap-x-5">
            <Link href="/privacy-policy" className="py-3 hover:text-background">
              {t("Privacy")}
            </Link>
            <Link href="/terms-conditions" className="py-3 hover:text-background">
              {t("Terms")}
            </Link>
            {gaConfigured && (
              <button type="button" onClick={() => setConsent(null)} className="py-3 hover:text-background">
                {t("Cookie preferences")}
              </button>
            )}
            <Link href="/sign-in?as=staff" className="py-3 hover:text-background">
              {t("Staff sign-in")}
            </Link>
          </div>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none -mb-[0.2em] select-none text-center font-display text-[clamp(6rem,22vw,20rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-background/[0.06]">
        probiz
      </p>
    </footer>
  );
}
