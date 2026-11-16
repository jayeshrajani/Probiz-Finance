"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { cleanMobile, recalledContact, rememberContact, sendCallback } from "@/lib/callback";
import { useLocale, useT } from "@/lib/i18n";
import { HONEYPOT } from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

const field =
  "h-12 w-full rounded-xl border border-input bg-background px-3.5 text-[0.9375rem] outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-brand focus:ring-[3px] focus:ring-brand/25 aria-[invalid=true]:border-destructive";

// Name and mobile, one tap of consent. `interest` (English) tells the advisor what the call is about.
export default function QuickLead({ interest, topics, moreHref, autoFocus, onDone, className }) {
  const t = useT();
  const locale = useLocale();
  const id = useId().replace(/:/g, "");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [topic, setTopic] = useState(interest || "");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const trapRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const saved = recalledContact();
    if (saved?.name) setName(saved.name);
    if (saved?.mobile) setMobile(saved.mobile);
    if (autoFocus) requestAnimationFrame(() => nameRef.current?.focus());
  }, [autoFocus]);

  async function onSubmit(e) {
    e.preventDefault();
    const phone = cleanMobile(mobile);
    const next = {};
    if (name.trim().length < 2) next.name = "Please add your name.";
    if (!phone) next.mobile = "Enter a 10-digit mobile number";
    if (!consent) next.consent = "Please tick this so we can contact you.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setStatus("busy");
    setError("");
    const res = await sendCallback({ name: name.trim(), mobile: phone, interest: topic, locale, trap: trapRef.current?.value || "" });
    if (res.ok) {
      rememberContact(name.trim(), phone);
      setSentTo(phone);
      setStatus("done");
      onDone?.();
    } else {
      setStatus("idle");
      setError(errorMessage(res.data));
    }
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("grid gap-3", className)} role="status">
        <CheckCircle weight="fill" className="size-10 text-brand" />
        <p className="headline text-xl">{t("Thanks, {name}. We'll call you soon.", { name: name.trim().split(" ")[0] })}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("An advisor will call you on {mobile}. Keep your phone handy.", { mobile: `+91 ${sentTo}` })}</p>
        {moreHref && (
          <a href={moreHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:underline">
            {t("Add more details to speed things up")} <ArrowRight weight="bold" className="size-3.5" />
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={cn("grid gap-3", className)}>
      {topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("What do you need help with?")}>
          {topics.map((tp) => (
            <button
              key={tp}
              type="button"
              aria-pressed={topic === tp}
              onClick={() => setTopic(topic === tp ? "" : tp)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                topic === tp ? "border-brand bg-brand-soft text-brand-ink" : "border-border bg-background text-foreground/80 hover:border-brand/40"
              )}
            >
              {t(tp)}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-name`} className="sr-only">
          {t("Your name")}
        </label>
        <input
          ref={nameRef}
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("Your name")}
          autoComplete="name"
          maxLength={120}
          aria-invalid={errors.name ? true : undefined}
          className={field}
        />
        {errors.name && <p className="text-xs font-medium text-destructive">{t(errors.name)}</p>}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-mobile`} className="sr-only">
          {t("Mobile number")}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[0.9375rem] text-muted-foreground">+91</span>
          <input
            id={`${id}-mobile`}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/[^\d\s+-]/g, ""))}
            placeholder={t("Mobile number")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={14}
            aria-invalid={errors.mobile ? true : undefined}
            className={cn(field, "pl-12 tabular-nums")}
          />
        </div>
        {errors.mobile && <p className="text-xs font-medium text-destructive">{t(errors.mobile)}</p>}
      </div>
      <label htmlFor={`${id}-consent`} className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
        <input
          id={`${id}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            setErrors((x) => ({ ...x, consent: null }));
          }}
          aria-invalid={errors.consent ? true : undefined}
          className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
        />
        <span>
          {t("Probiz can call, WhatsApp or email me about this.")}{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            {t("Privacy policy")}
          </Link>
        </span>
      </label>
      {errors.consent && <p className="-mt-1 pl-6.5 text-xs font-medium text-destructive">{t(errors.consent)}</p>}

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input ref={trapRef} type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
          {t(error)}
        </p>
      )}
      <Button type="submit" size="lg" disabled={status === "busy"} className="mt-1 h-12 w-full">
        {status === "busy" ? <SpinnerGap className="animate-spin" /> : null}
        {status === "busy" ? t("Sending") : t("Call me back")}
        {status !== "busy" && <ArrowRight weight="bold" />}
      </Button>
    </form>
  );
}

// Hero panel for product and service pages: the quick form where the eye lands, the full form further down.
export function LeadPanel({ interest, scene: SceneEl, fact, moreHref, title }) {
  const t = useT();
  return (
    <div className="relative rounded-[2.5rem] bg-[linear-gradient(160deg,var(--brand-soft),var(--cream)_60%)] p-4 pt-28 sm:p-8 sm:pt-32">
      {SceneEl}
      {fact && (
        <div className="art-float absolute top-8 left-6 hidden items-center gap-2.5 rounded-2xl bg-background/95 px-4 py-3 shadow-[0_18px_40px_-24px_oklch(0.21_0.006_286/0.45)] sm:flex">
          {fact.value && <span className="font-display text-xl font-semibold text-brand-ink">{fact.value}</span>}
          <span className="max-w-[12rem] text-sm leading-tight font-medium text-foreground/80">{t(fact.label)}</span>
        </div>
      )}
      <div className="relative rounded-[1.75rem] border border-border bg-background p-5 shadow-[0_40px_100px_-56px_oklch(0.21_0.006_286/0.5)] sm:p-7">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-ink">
          <span className="size-1.5 rounded-full bg-brand" /> {t("Free callback, no obligation")}
        </p>
        <p className="headline mt-4 text-xl">{title || t("Talk to an advisor about {topic}", { topic: t(interest) })}</p>
        <p className="mt-1.5 mb-5 text-sm text-muted-foreground">{t("Two details. We call you back and handle the rest.")}</p>
        <QuickLead interest={interest} moreHref={moreHref} />
      </div>
    </div>
  );
}
