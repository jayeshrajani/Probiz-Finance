"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/api";

export function useStoredUser() {
  const [user, setUser] = useState(null);

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

export function signIn(userData) {
  window.localStorage.setItem("userData", JSON.stringify(userData));
  window.dispatchEvent(new Event("probiz:auth"));
}
