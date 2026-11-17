"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/api";

// undefined until localStorage has been read, so pages can avoid flashing the signed-out state.
export function useStoredUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const read = () => setUser(getStoredUser());
    read();
    window.addEventListener("storage", read);
    window.addEventListener("probiz:auth", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("probiz:auth", read);
    };
  }, []);

  return user;
}

export function signOut() {
  window.localStorage.removeItem("userData");
  window.dispatchEvent(new Event("probiz:auth"));
}

// Only same-site paths; "//host" and "/\host" would redirect off-site.
export function safeNext(next, fallback = "/") {
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : fallback;
}

export function signIn(userData) {
  window.localStorage.setItem("userData", JSON.stringify(userData));
  window.dispatchEvent(new Event("probiz:auth"));
}
