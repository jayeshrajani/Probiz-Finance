import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full min-w-0 rounded-xl border border-input bg-background px-3.5 text-[0.9375rem] text-foreground transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/80 hover:border-[color-mix(in_oklch,var(--input)_70%,var(--foreground))] focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldBase, "h-12", className)}
      {...props}
    />
  );
}

export { Input, fieldBase };
