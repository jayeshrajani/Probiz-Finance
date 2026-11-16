"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { List, Phone } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { openCallback } from "@/lib/callback";
import { hrefFor, nav } from "@/lib/catalog";
import { useT } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";
import { signOut } from "@/lib/use-user";

export default function MobileNav({ user }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { primary } = useSiteSettings();

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("Open menu")}>
          <List weight="bold" className="size-5" />
        </Button>
      </SheetTrigger>
      {/* The list scrolls inside the panel so the close button stays pinned at the top. */}
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetTitle className="sr-only">{t("Menu")}</SheetTitle>
        <SheetDescription className="sr-only">{t("Browse loans, insurance, investments and services")}</SheetDescription>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-16 pb-8">
          <Accordion type="single" collapsible>
            {nav.map((item) => (
              <AccordionItem key={item.label} value={item.label} className="border-border last:border-b">
                <AccordionTrigger className="py-4 text-xl font-semibold tracking-[-0.02em]">{t(item.label)}</AccordionTrigger>
                <AccordionContent className="pr-0">
                  <div className="grid gap-6 pt-1">
                    {item.columns.map((col) => (
                      <div key={col.title}>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">{t(col.title)}</p>
                        <ul className="grid grid-cols-2 gap-x-4">
                          {col.items.map((link) => (
                            <li key={link.slug}>
                              <Link href={hrefFor(link)} className="block py-2 text-[0.9375rem] text-foreground/85">
                                {t(link.name)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {[
            ["Property", "/property"],
            ["About", "/about"],
            ["Careers", "/Careers"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="block border-b border-border py-4 text-xl font-semibold tracking-[-0.02em]">
              {t(label)}
            </Link>
          ))}

          <div className="mt-8 grid gap-3">
            <Button
              size="lg"
              onClick={() => {
                setOpen(false);
                openCallback();
              }}
            >
              <Phone weight="bold" /> {t("Get a free callback")}
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/eligibility">{t("Check loan eligibility")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={primary.href}>
                <Phone weight="bold" /> {primary.display}
              </a>
            </Button>
            {user ? (
              <>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/account">{t("My account")}</Link>
                </Button>
                <Button size="lg" variant="ghost" onClick={signOut}>
                  {t("Sign out")}
                </Button>
              </>
            ) : (
              <Button asChild size="lg" variant="ghost">
                <Link href="/sign-in">{t("Sign in")}</Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
