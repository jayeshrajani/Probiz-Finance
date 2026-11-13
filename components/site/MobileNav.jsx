"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { List, Phone } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { hrefFor, nav } from "@/lib/catalog";
import { site } from "@/lib/site";
import { signOut } from "@/lib/use-user";

export default function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
          <List weight="bold" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Browse loans, insurance, investments and services</SheetDescription>
        <div className="px-6 pt-16 pb-8">
          <Accordion type="single" collapsible>
            {nav.map((item) => (
              <AccordionItem key={item.label} value={item.label} className="border-border">
                <AccordionTrigger className="py-4 text-xl font-semibold tracking-[-0.02em]">{item.label}</AccordionTrigger>
                <AccordionContent className="pr-0">
                  <div className="grid gap-6 pt-1">
                    {item.columns.map((col) => (
                      <div key={col.title}>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">{col.title}</p>
                        <ul className="grid grid-cols-2 gap-x-4">
                          {col.items.map((link) => (
                            <li key={link.slug}>
                              <Link href={hrefFor(link)} className="block py-2 text-[0.9375rem] text-foreground/85">
                                {link.name}
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
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="block border-b border-border py-4 text-xl font-semibold tracking-[-0.02em]">
              {label}
            </Link>
          ))}

          <div className="mt-8 grid gap-3">
            <Button asChild size="lg">
              <Link href="/eligibility">Check eligibility</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={site.phoneHref}>
                <Phone weight="bold" /> {site.phoneDisplay}
              </a>
            </Button>
            {user ? (
              <Button size="lg" variant="ghost" onClick={signOut}>
                Sign out
              </Button>
            ) : (
              <Button asChild size="lg" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
