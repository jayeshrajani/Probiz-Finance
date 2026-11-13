"use client";

import { FilePdf, ImageSquare, Paperclip, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,application/pdf";

export const formatBytes = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function FileSlot({ slot, file, onChange, idPrefix }) {
  const id = `${idPrefix}-file-${slot.name}`;
  const Icon = file?.type === "application/pdf" ? FilePdf : file ? ImageSquare : Paperclip;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors",
        file ? "border-brand/40 bg-brand-soft" : "border-dashed border-input hover:border-foreground/30 hover:bg-secondary"
      )}
    >
      <Icon weight="duotone" className={cn("size-6 shrink-0", file ? "text-brand-ink" : "text-muted-foreground")} />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium after:absolute after:inset-0">
          {slot.label}
        </label>
        <p className="truncate text-xs text-muted-foreground">
          {file ? `${file.name} · ${formatBytes(file.size)}` : "PDF, JPG or PNG"}
        </p>
      </div>
      {file && (
        <button
          type="button"
          onClick={() => onChange(slot.name, null)}
          aria-label={`Remove ${slot.label}`}
          className="relative z-10 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <X weight="bold" className="size-3.5" />
        </button>
      )}
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          onChange(slot.name, e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
