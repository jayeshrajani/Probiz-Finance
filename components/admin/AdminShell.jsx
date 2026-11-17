"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowSquareOut,
  Briefcase,
  Buildings,
  ClockCounterClockwise,
  CurrencyInr,
  EnvelopeSimple,
  Globe,
  List,
  MagnifyingGlass,
  Moon,
  Newspaper,
  PlusCircle,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Sun,
  Tray,
  UserCirclePlus,
  UserGear,
  Users,
} from "@phosphor-icons/react";
import CommandPalette from "@/components/admin/CommandPalette";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { adminFetch, clearToken, getToken } from "@/lib/admin-api";
import { useAdminTheme } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);
export const personaLabel = (config, persona) => config.personas?.find((p) => p.id === persona)?.label || null;
export const stageLabel = (config, stage) => config.stages?.find((s) => s.id === stage)?.label || null;

const GROUP_ICONS = { loans: CurrencyInr, cover: ShieldCheck, services: Briefcase, inbox: EnvelopeSimple };
const GROUP_TONES = {
  loans: "bg-brand/15 text-brand-ink",
  cover: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  services: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  inbox: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};
// Older forms stay reachable through the product filter on the leads page.
const SIDEBAR_GROUPS = Object.keys(GROUP_ICONS);

function NavLink({ href, icon: Icon, label, active, count, tone, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none",
        tone ? "h-10 px-2" : "h-9 px-3",
        active
          ? tone
            ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border"
            : "bg-secondary font-medium text-foreground"
          : cn("text-muted-foreground hover:text-foreground", tone ? "hover:bg-background/70" : "hover:bg-secondary/70")
      )}
    >
      {active && !tone && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand" />}
      {Icon &&
        (tone ? (
          <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md", tone)}>
            <Icon weight={active ? "fill" : "bold"} className="size-3.5" />
          </span>
        ) : (
          <Icon weight={active ? "fill" : "regular"} className={cn("size-4 shrink-0", active ? "text-brand-ink" : "text-muted-foreground/80")} />
        ))}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className={cn("rounded-full px-1.5 text-[0.6875rem] leading-5 tabular-nums", active ? "bg-background text-foreground ring-1 ring-border" : "text-muted-foreground")}>{count}</span>
      )}
    </Link>
  );
}

function Sidebar({ onNavigate }) {
  const { config, counts, staff, isAdmin, isSales, signOut } = useAdmin();
  const router = useRouter();
  const onLeads = router.pathname.startsWith("/admin-panel/leads");
  const activeType = onLeads ? router.query.type || null : null;
  const activeScope = router.pathname === "/admin-panel/leads" ? router.query.scope || "" : null;
  const activeGroup = onLeads ? router.query.group || config.types.find((t) => t.type === activeType)?.group || null : null;
  const filteredByProduct = Boolean(activeType || activeGroup);

  const is = (path) => router.pathname === path;
  const sectionLabel = "px-3 pb-2 text-[0.6875rem] font-medium tracking-[0.08em] text-muted-foreground/70 uppercase";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        {/* The logo artwork is dark ink, so it sits on a white chip in dark mode. */}
        <img src="/brand/probiz-logo.png" alt="Probiz" width={110} height={36} className="h-7 w-auto dark:h-8 dark:rounded-md dark:bg-white dark:px-2 dark:py-1" />
      </div>

      <nav aria-label="Staff" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          <NavLink href="/admin-panel/dashboard" icon={SquaresFour} label={isAdmin ? "Overview" : isSales ? "My dashboard" : "My day"} active={is("/admin-panel/dashboard")} onNavigate={onNavigate} />
          {isAdmin ? (
            <>
              <NavLink href="/admin-panel/leads" icon={Tray} label="All leads" active={activeScope === "" && !filteredByProduct} count={counts.open} onNavigate={onNavigate} />
              <NavLink href="/admin-panel/leads?scope=unassigned" icon={UserCirclePlus} label="Unassigned" active={activeScope === "unassigned" && !filteredByProduct} count={counts.unassigned} onNavigate={onNavigate} />
              <NavLink href="/admin-panel/leads?scope=archived" icon={Archive} label="Archived" active={activeScope === "archived" && !filteredByProduct} count={counts.archived} onNavigate={onNavigate} />
            </>
          ) : isSales ? (
            <NavLink href="/admin-panel/leads?scope=mine" icon={Tray} label="My leads" active={activeScope === "mine" && !filteredByProduct} count={counts.active} onNavigate={onNavigate} />
          ) : (
            <>
              <NavLink href="/admin-panel/leads?scope=mine" icon={Tray} label="My leads" active={activeScope === "mine" && !filteredByProduct} count={counts.active} onNavigate={onNavigate} />
              <NavLink href="/admin-panel/leads?scope=unassigned" icon={UserCirclePlus} label="Pick up new leads" active={activeScope === "unassigned" && !filteredByProduct} count={counts.unassigned} onNavigate={onNavigate} />
              <NavLink href="/admin-panel/leads?scope=handled" icon={ClockCounterClockwise} label="Handled earlier" active={activeScope === "handled" && !filteredByProduct} onNavigate={onNavigate} />
            </>
          )}
          <NavLink href="/admin-panel/leads/new" icon={PlusCircle} label="Add a lead" active={is("/admin-panel/leads/new")} onNavigate={onNavigate} />
        </div>

        {!isSales && (
          <div>
            <p className={sectionLabel}>Categories</p>
            <div className="space-y-1 rounded-xl border border-border bg-secondary/40 p-1">
              {config.groups
                .filter((g) => SIDEBAR_GROUPS.includes(g.id))
                .map((g) => (
                  <NavLink
                    key={g.id}
                    href={{ pathname: "/admin-panel/leads", query: { group: g.id } }}
                    icon={GROUP_ICONS[g.id]}
                    tone={GROUP_TONES[g.id]}
                    label={g.label}
                    active={activeGroup === g.id}
                    count={config.types.filter((t) => t.group === g.id).reduce((n, t) => n + (counts.byType[t.type] || 0), 0)}
                    onNavigate={onNavigate}
                  />
                ))}
            </div>
          </div>
        )}

        <div>
          <p className={sectionLabel}>Manage</p>
          <div className="space-y-0.5">
            {!isSales && <NavLink href="/admin-panel/properties" icon={Buildings} label="Property listings" active={is("/admin-panel/properties")} onNavigate={onNavigate} />}
            {isAdmin && (
              <>
                <NavLink href="/admin-panel/customers" icon={Users} label="Customers" active={is("/admin-panel/customers")} onNavigate={onNavigate} />
                <NavLink href="/admin-panel/subscribers" icon={Newspaper} label="Subscribers" active={is("/admin-panel/subscribers")} onNavigate={onNavigate} />
                <NavLink href="/admin-panel/careers" icon={Briefcase} label="Careers" active={is("/admin-panel/careers")} onNavigate={onNavigate} />
                <NavLink href="/admin-panel/settings" icon={Globe} label="Website settings" active={is("/admin-panel/settings")} onNavigate={onNavigate} />
              </>
            )}
            <NavLink href="/admin-panel/team" icon={UserGear} label={isAdmin ? "Team and account" : "My account"} active={is("/admin-panel/team")} onNavigate={onNavigate} />
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
            {(staff.name || "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{staff.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {staff.platform ? "Platform manager" : isAdmin ? "Admin" : [personaLabel(config, staff.persona) || staff.title || "Employee", staff.employeeId].filter(Boolean).join(", ")}
            </span>
          </span>
          <button type="button" onClick={signOut} aria-label="Sign out" className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <SignOut className="size-4" />
          </button>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowSquareOut className="size-3.5" /> View website
        </a>
      </div>
    </div>
  );
}

export default function AdminShell({ title, children }) {
  const router = useRouter();
  const { dark, toggle: toggleTheme } = useAdminTheme();
  const [session, setSession] = useState(null);
  const [counts, setCounts] = useState({ open: 0, active: 0, unassigned: 0, archived: 0, byType: {} });
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const refreshCounts = useCallback(async () => {
    try {
      const { data } = await adminFetch("admin/overview");
      setCounts({
        open: data.totals.open,
        active: data.totals.active,
        unassigned: data.totals.unassigned,
        archived: data.totals.archived || 0,
        byType: Object.fromEntries(data.byType.map((t) => [t.type, t.open])),
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin-panel");
      return;
    }
    Promise.all([adminFetch("admin/me"), adminFetch("admin/config")])
      .then(([me, cfg]) =>
        setSession({ staff: me.data, isAdmin: me.data.role === "admin", isSales: me.data.role === "employee" && me.data.persona === "sales", config: cfg.data })
      )
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
          <TooltipProvider>
          <div className="min-h-dvh bg-secondary/50 lg:grid lg:grid-cols-[16.5rem_1fr]">
            <aside className="sticky top-0 hidden h-dvh border-r border-border bg-background lg:block">
              <Sidebar />
            </aside>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetContent side="left" className="w-72 bg-background p-0">
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
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                    title={dark ? "Light mode" : "Dark mode"}
                    className="ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </button>
                </div>
              </header>

              <main className="px-4 py-8 sm:px-8 lg:py-10">{children}</main>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          </TooltipProvider>
        </AdminContext.Provider>
      )}
    </>
  );
}
