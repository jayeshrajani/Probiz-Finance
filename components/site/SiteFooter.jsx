import Link from "next/link";
import { ArrowUpRight, ChatCircleDots, FacebookLogo, InstagramLogo, LinkedinLogo, Phone, YoutubeLogo } from "@phosphor-icons/react";
import { openAssistant } from "@/components/assistant/events";
import NewsletterForm from "@/components/site/NewsletterForm";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

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

const socials = [
  { label: "Facebook", href: site.socials.facebook, Icon: FacebookLogo },
  { label: "Instagram", href: site.socials.instagram, Icon: InstagramLogo },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedinLogo },
  { label: "YouTube", href: site.socials.youtube, Icon: YoutubeLogo },
];

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div className="container-page grid gap-12 pt-20 pb-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2 className="display-2 max-w-[16ch] text-balance">Questions about money? Ask a person.</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="brand">
              <a href={site.phoneHref}>
                <Phone weight="bold" /> {site.phoneDisplay}
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="text-background hover:bg-background/10 hover:text-background" onClick={openAssistant}>
              <ChatCircleDots weight="bold" /> Chat with us
            </Button>
          </div>
        </div>
        <div className="lg:col-span-5 lg:justify-self-end">
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page">
        <div className="grid gap-10 border-t border-background/12 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" aria-label="Probiz Finance home" className="inline-flex rounded-xl bg-background px-3 py-2">
              <img src="/brand/probiz-logo.png" alt="" width={130} height={42} className="h-7 w-auto" />
            </Link>
            <address className="mt-6 grid gap-1.5 text-sm not-italic leading-relaxed text-background/65">
              <span>{site.address}</span>
              <a href={`mailto:${site.email}`} className="w-fit hover:text-background">
                {site.email}
              </a>
            </address>
          </div>
          <nav aria-label="Footer" className="md:col-span-7">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 text-[0.9375rem] text-background/75 transition-colors hover:text-background">
                    {link.name}
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
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-background">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="hover:text-background">
              Terms
            </Link>
            <div className="flex items-center gap-1">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-background/10 hover:text-background"
                >
                  <Icon weight="fill" className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none -mb-[0.2em] select-none text-center font-display text-[clamp(6rem,22vw,20rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-background/[0.06]">
        probiz
      </p>
    </footer>
  );
}
