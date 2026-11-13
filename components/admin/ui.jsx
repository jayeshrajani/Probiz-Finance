"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretLeft, CaretRight, SpinnerGap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { STATUS_META } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export function Panel({ title, description, actions, className, bodyClassName, children }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-background", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em]">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", meta.tone, className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-secondary">
        <span className="size-3 rounded-full bg-brand" />
      </div>
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 6 }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3 w-40 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <span>{error.message}</span>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function Pager({ page, limit, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-sm text-muted-foreground">
      <span className="tabular-nums">
        {from} to {to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <CaretLeft weight="bold" />
        </Button>
        <span className="px-2 tabular-nums">
          {page} / {pages}
        </span>
        <Button size="icon-sm" variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <CaretRight weight="bold" />
        </Button>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = "Delete", busy, onConfirm, onClose }) {
  const cancelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus(), 30);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <motion.div className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-[0_40px_100px_-30px_oklch(0.21_0.006_286/0.5)]"
          >
            <h2 id="confirm-title" className="text-lg font-semibold tracking-[-0.015em]">
              {title}
            </h2>
            {body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button ref={cancelRef} variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" disabled={busy} onClick={onConfirm}>
                {busy && <SpinnerGap className="animate-spin" />}
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
