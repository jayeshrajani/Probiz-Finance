"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CaretDown, Plus, SignOut, UserCircle } from "@phosphor-icons/react";
import Logo from "@/components/site/Logo";
import Scene from "@/components/art/Scene";
import MobileNav from "@/components/site/MobileNav";
import { Button } from "@/components/ui/button";
import { hrefFor, nav } from "@/lib/catalog";
import { signOut, useStoredUser } from "@/lib/use-user";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1];

const LINKS = [
  { label: "Property", href: "/property" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function MegaPanel({ item }) {
  const units = item.columns.map((c) => (c.items.length > 8 ? 2 : 1));
  const total = units.reduce((a, b) => a + b, 0);

  return (
    <div className="container-page grid grid-cols-12 gap-10 py-9">
      <div className="col-span-9 grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {item.columns.map((col, i) => (
          <div key={col.title} style={{ gridColumn: `span ${units[i]}` }}>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {col.href ? (
                <Link href={col.href} className="hover:text-foreground">
                  {col.title}
                </Link>
              ) : (
                col.title
              )}
            </p>
            <ul className={cn("grid gap-x-8", units[i] === 2 && "grid-cols-2")}>
              {col.items.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={hrefFor(link)}
                    className="block rounded-md py-1.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-foreground/85 transition-colors hover:text-brand-ink"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link
        href={item.feature.href}
        className="group col-span-3 flex flex-col overflow-hidden rounded-2xl bg-brand-soft transition-colors hover:bg-[color-mix(in_oklch,var(--brand-soft)_80%,var(--brand))]"
      >
        <Scene name={item.feature.scene} className="mx-auto -mb-2 h-32 w-auto" />
        <div className="p-6 pt-0">
          <p className="headline text-lg">{item.feature.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.feature.body}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink">
            Open
            <ArrowRight weight="bold" className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/sign-in" className="hidden h-9 items-center rounded-full px-3.5 text-sm font-medium text-foreground/80 hover:text-foreground md:inline-flex">
        Sign in
      </Link>
    );
  }

  const firstName = (user.user_Name || "Account").split(" ")[0];
  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground/85 hover:bg-accent"
      >
        <UserCircle weight="duotone" className="size-5" />
        {firstName}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease }}
            className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-border bg-popover p-1.5 shadow-[0_16px_40px_-16px_oklch(0.21_0.006_286/0.25)]"
          >
            <Link role="menuitem" href="/add-product" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-accent">
              <Plus weight="bold" className="size-4" /> List a property
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-accent"
            >
              <SignOut weight="bold" className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(null);
  const closeTimer = useRef();
  const router = useRouter();
  const user = useStoredUser();
  const panelId = useId();

  useEffect(() => {
    const close = () => setOpen(null);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const active = open === null ? null : nav[open];

  return (
    <header className="sticky top-0 z-40" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      <div className={cn("glass-bar relative z-10 border-b border-border/70", active && "bg-background")}>
        <div className="container-page flex h-16 items-center gap-6 xl:gap-10">
          <Logo />
          <nav aria-label="Main" className="hidden items-center lg:flex">
            {nav.map((item, i) => (
              <button
                key={item.label}
                type="button"
                aria-expanded={open === i}
                aria-controls={panelId}
                onMouseEnter={() => {
                  cancelClose();
                  setOpen(i);
                }}
                onClick={() => setOpen(open === i ? null : i)}
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground xl:px-3.5",
                  open === i && "bg-accent text-foreground"
                )}
              >
                {item.label}
                <CaretDown weight="bold" className={cn("size-3 transition-transform duration-200", open === i && "rotate-180")} />
              </button>
            ))}
            <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={router.pathname === link.href ? "page" : undefined}
                onMouseEnter={scheduleClose}
                onFocus={() => setOpen(null)}
                className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground aria-[current=page]:text-foreground xl:px-3.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <AccountMenu user={user} />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/eligibility">Check eligibility</Link>
            </Button>
            <MobileNav user={user} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            id={panelId}
            key="mega"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
            transition={{ duration: 0.28, ease }}
            className="absolute inset-x-0 top-16 hidden border-b border-border bg-background shadow-[0_32px_64px_-32px_oklch(0.21_0.006_286/0.22)] lg:block"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                <MegaPanel item={active} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
