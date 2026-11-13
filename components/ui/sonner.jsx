"use client";

import { CheckCircle, Info, SpinnerGap, WarningCircle, XCircle } from "@phosphor-icons/react";
import { Toaster as Sonner } from "sonner";

const Toaster = (props) => (
  <Sonner
    theme="light"
    position="top-center"
    className="toaster group"
    icons={{
      success: <CheckCircle weight="fill" className="size-5 text-brand" />,
      info: <Info weight="fill" className="size-5" />,
      warning: <WarningCircle weight="fill" className="size-5" />,
      error: <XCircle weight="fill" className="size-5 text-destructive" />,
      loading: <SpinnerGap className="size-5 animate-spin" />,
    }}
    style={{
      "--normal-bg": "var(--popover)",
      "--normal-text": "var(--popover-foreground)",
      "--normal-border": "var(--border)",
      "--border-radius": "1rem",
    }}
    {...props}
  />
);

export { Toaster };
