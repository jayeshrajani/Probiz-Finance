"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  ArrowSquareOut,
  Briefcase,
  Buildings,
  CaretDown,
  CurrencyInr,
  EnvelopeSimple,
  List,
  MagnifyingGlass,
  Newspaper,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Tray,
  UserGear,
  Users,
} from "@phosphor-icons/react";
import CommandPalette from "@/components/admin/CommandPalette";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { adminFetch, clearToken, getToken } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const GROUP_ICONS = { loans: CurrencyInr, cover: ShieldCheck, services: Briefcase, inbox: EnvelopeSimple, archive: Archive };

function NavLink({ href, icon: Icon, label, active, count, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
        active ? "bg-background font-medium text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0.21_0.006_286/0.06)]" : "text-foreground/70 hover:bg-background/70 hover:text-foreground"
      )}
    >
      {Icon && <Icon weight={active ? "fill" : "regular"} className={cn("size-4 shrink-0", active ? "text-brand-ink" : "text-muted-foreground")} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count > 0 && <span className="rounded-full bg-brand-soft px-1.5 text-[0.6875rem] font-semibold tabular-nums text-brand-ink">{count}</span>}
    </Link>
  );
}

function Sidebar({ onNavigate }) {
  const { config, counts, admin, signOut } = useAdmin();
  const router = useRouter();
  const activeType = router.pathname.startsWith("/admin-panel/leads") ? router.query.type || null : null;
  const activeGroup = config.types.find((t) => t.type === activeType)?.group;
  const [open, setOpen] = useState(() => new Set(activeGroup ? [activeGroup] : ["loans"]));

  useEffect(() => {
    if (activeGroup) setOpen((s) => new Set(s).add(activeGroup));
  }, [activeGroup]);

  const toggle = (id) =>
    setOpen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const is = (path) => router.pathname === path;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <img src="/brand/probiz-logo.png" alt="Probiz" width={110} height={36} className="h-7 w-auto" />
        <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-background uppercase">Admin</span>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          <NavLink href="/admin-panel/dashboard" icon={SquaresFour} label="Overview" active={is("/admin-panel/dashboard")} onNavigate={onNavigate} />
          <NavLink
            href="/admin-panel/leads"
            icon={Tray}
            label="All leads"
            active={router.pathname === "/admin-panel/leads" && !activeType}
            count={counts.open}
            onNavigate={onNavigate}
          />
        </div>

        <div>
          <p className="px-2.5 pb-2 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Leads by product</p>
          <div className="space-y-0.5">
            {config.groups.map((g) => {
              const Icon = GROUP_ICONS[g.id] || Tray;
              const types = config.types.filter((t) => t.group === g.id);
              const groupOpen = types.reduce((n, t) => n + (counts.byType[t.type] || 0), 0);
              const expanded = open.has(g.id);
              return (
                <div key={g.id}>
                  <button
                    type="button"
                    onClick={() => toggle(g.id)}
                    aria-expanded={expanded}
                    className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-foreground/75 transition-colors hover:bg-background/70 hover:text-foreground"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-left">{g.label}</span>
                    {groupOpen > 0 && !expanded && <span className="size-1.5 rounded-full bg-brand" />}
                    <CaretDown weight="bold" className={cn("size-3 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-[1.1rem] space-y-0.5 border-l border-border py-1 pl-2">
                          {types.map((t) => (
                            <NavLink
                              key={t.type}
                              href={{ pathname: "/admin-panel/leads", query: { type: t.type } }}
                              label={t.label}
                              active={activeType === t.type}
                              count={counts.byType[t.type] || 0}
                              onNavigate={onNavigate}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2.5 pb-2 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">Manage</p>
          <div className="space-y-0.5">
            <NavLink href="/admin-panel/properties" icon={Buildings} label="Property listings" active={is("/admin-panel/properties")} onNavigate={onNavigate} />
            <NavLink href="/admin-panel/customers" icon={Users} label="Customers" active={is("/admin-panel/customers")} onNavigate={onNavigate} />
            <NavLink href="/admin-panel/subscribers" icon={Newspaper} label="Subscribers" active={is("/admin-panel/subscribers")} onNavigate={onNavigate} />
            <NavLink href="/admin-panel/team" icon={UserGear} label="Team and account" active={is("/admin-panel/team")} onNavigate={onNavigate} />
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
            {(admin.admin_Name || "A").slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{admin.admin_Name}</span>
            <span className="block truncate text-xs text-muted-foreground">{admin.admin_Email}</span>
          </span>
          <button type="button" onClick={signOut} aria-label="Sign out" className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground">
            <SignOut className="size-4" />
          </button>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowSquareOut className="size-3.5" /> View website
        </a>
      </div>
    </div>
  );
}

export default function AdminShell({ title, children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [counts, setCounts] = useState({ open: 0, byType: {} });
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const refreshCounts = useCallback(async () => {
    try {
      const { data } = await adminFetch("admin/overview");
      setCounts({ open: data.totals.open, byType: Object.fromEntries(data.byType.map((t) => [t.type, t.open])) });
    } catch {}
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin-panel");
      return;
    }
    Promise.all([adminFetch("admin/me"), adminFetch("admin/config")])
      .then(([me, cfg]) => setSession({ admin: me.data, config: cfg.data }))
      .catch(() => router.replace("/admin-panel"));
    refreshCounts();
  }, [router, refreshCounts]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  const signOut = useCallback(() => {
    clearToken();
    router.replace("/admin-panel");
  }, [router]);

  const value = useMemo(() => (session ? { ...session, counts, refreshCounts, signOut } : null), [session, counts, refreshCounts, signOut]);

  return (
    <>
      <Head>
        <title>{`${title ? `${title} | ` : ""}Probiz Admin`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {!value ? (
        <div className="grid min-h-dvh place-items-center bg-secondary/50">
          <span className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" aria-label="Loading" />
        </div>
      ) : (
        <AdminContext.Provider value={value}>
          <div className="min-h-dvh bg-secondary/50 lg:grid lg:grid-cols-[16.5rem_1fr]">
            <aside className="sticky top-0 hidden h-dvh border-r border-border bg-secondary/80 lg:block">
              <Sidebar />
            </aside>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetContent side="left" className="w-72 bg-secondary p-0">
                <SheetTitle className="sr-only">Admin menu</SheetTitle>
                <SheetDescription className="sr-only">Navigate the admin panel</SheetDescription>
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <header className="glass-bar sticky top-0 z-30 border-b border-border">
                <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
                  <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-accent lg:hidden">
                    <List weight="bold" className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20"
                  >
                    <MagnifyingGlass className="size-4" />
                    <span className="flex-1 text-left">Search leads or jump to...</span>
                    <kbd className="hidden rounded border border-border bg-secondary px-1.5 font-sans text-[0.6875rem] sm:inline">⌘K</kbd>
                  </button>
                </div>
              </header>

              <main className="px-4 py-8 sm:px-8 lg:py-10">{children}</main>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </AdminContext.Provider>
      )}
    </>
  );
}
