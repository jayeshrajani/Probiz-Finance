"use client";

import { useCallback, useLayoutEffect, useState } from "react";

const KEY = "probiz-admin-theme";

// Dark mode is scoped to the staff panel: the class goes on <html> (so portals get it too) and is removed on the way out.
export function useAdminTheme() {
  const [choice, setChoice] = useState(null);
  const [systemDark, setSystemDark] = useState(false);

  useLayoutEffect(() => {
    try {
      setChoice(window.localStorage.getItem(KEY));
    } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dark = choice ? choice === "dark" : systemDark;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "";
    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = "";
    };
  }, [dark]);

  const toggle = useCallback(() => {
    const next = dark ? "light" : "dark";
    try {
      window.localStorage.setItem(KEY, next);
    } catch {}
    setChoice(next);
  }, [dark]);

  return { dark, toggle };
}
