import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return <div data-slot="card" className={cn("flex flex-col rounded-2xl border border-border bg-card text-card-foreground", className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 border-b border-border px-5 py-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return <h2 data-slot="card-title" className={cn("text-[0.9375rem] leading-none font-semibold tracking-[-0.01em]", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p data-slot="card-description" className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function CardAction({ className, ...props }) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-center justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center border-t border-border px-5 py-4", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter };
