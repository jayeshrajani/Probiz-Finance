"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.21_0.006_286/0.3)] backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-border bg-background p-6 shadow-[0_40px_100px_-30px_oklch(0.21_0.006_286/0.5)] duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-sm",
          className
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }) {
  return <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-lg font-semibold tracking-[-0.015em]", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />;
}

function AlertDialogAction({ className, variant = "default", ...props }) {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant, size: "sm" }), className)} {...props} />;
}

function AlertDialogCancel({ className, ...props }) {
  return <AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)} {...props} />;
}

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle };
