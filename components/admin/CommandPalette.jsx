"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { useAdmin } from "@/components/admin/AdminShell";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Overview", href: "/admin-panel/dashboard", hint: "Page" },
  { label: "All leads", href: "/admin-panel/leads", hint: "Page" },
  { label: "Unassigned leads", href: "/admin-panel/leads?scope=unassigned", hint: "Page" },
  { label: "My leads", href: "/admin-panel/leads?scope=mine", hint: "Page", staffOnly: true },
  { label: "Property listings", href: "/admin-panel/properties", hint: "Page" },
  { label: "Customers", href: "/admin-panel/customers", hint: "Page", adminOnly: true },
  { label: "Subscribers", href: "/admin-panel/subscribers", hint: "Page", adminOnly: true },
  { label: "Team and account", href: "/admin-panel/team", hint: "Page" },
];

export default function CommandPalette({ open, onClose }) {
  const { config, isAdmin } = useAdmin();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const pages = PAGES.filter((p) => (isAdmin ? !p.staffOnly : !p.adminOnly));
    const all = [...pages, ...config.types.map((t) => ({ label: t.label, href: `/admin-panel/leads?type=${t.type}`, hint: "Leads" }))];
    const term = q.trim().toLowerCase();
    const matches = term ? all.filter((i) => i.label.toLowerCase().includes(term)) : all;
    return term ? [{ label: `Search leads for "${q.trim()}"`, href: `/admin-panel/leads?q=${encodeURIComponent(q.trim())}`, hint: "Search" }, ...matches] : matches;
  }, [q, config.types, isAdmin]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  const go = (item) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && items[active]) go(items[active]);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-[0_40px_100px_-30px_oklch(0.21_0.006_286/0.5)]"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <MagnifyingGlass className="size-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Type a name, phone, product or page"
                aria-label="Search"
                className="h-12 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul role="listbox" className="max-h-80 overflow-y-auto p-1.5">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing matches.</li>}
              {items.map((item, i) => (
                <li key={item.href} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm", i === active ? "bg-secondary" : "")}
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                    {i === active && <ArrowRight weight="bold" className="size-3.5 text-muted-foreground" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
