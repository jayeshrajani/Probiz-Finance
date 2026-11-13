"use client";

import { useState } from "react";
import { ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { errorMessage, postJSON } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const res = await postJSON("addNewsLatters", { email });
    setBusy(false);
    if (res.ok) {
      toast.success("You're subscribed. Expect the occasional useful email, nothing more.");
      setEmail("");
    } else {
      toast.error(errorMessage(res.data));
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <label htmlFor="newsletter-email" className="text-sm font-medium text-background">
        Rates and tips by email
      </label>
      <div className="mt-3 flex h-12 items-center rounded-full border border-background/15 bg-background/5 pr-1 pl-4 transition-shadow focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/30">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] text-background outline-none placeholder:text-background/40"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Subscribe"
          className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform active:scale-95 disabled:opacity-60"
        >
          {busy ? <SpinnerGap className="size-4 animate-spin" /> : <ArrowRight weight="bold" className="size-4" />}
        </button>
      </div>
    </form>
  );
}
