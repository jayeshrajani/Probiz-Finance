"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChatCircleText, SpinnerGap, WhatsappLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, getJSON, postJSON } from "@/lib/api";
import { leadMeta } from "@/lib/attribution";
import { useLocale, useT } from "@/lib/i18n";
import { CONSENT_TEXT } from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 30;

let statusRequest = null;
// True once the server has a code sender (WhatsApp or SMS); verification prompts stay hidden otherwise.
export function useOtpAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    (statusRequest ||= getJSON("otp/status")).then((res) => active && setAvailable(Boolean(res.ok && res.data?.available)));
    return () => {
      active = false;
    };
  }, []);
  return available;
}

// Mobile OTP in two steps (number, then code). purpose: "signin" (typed number), "account" or "lead" (number on file).
export default function OtpForm({ purpose, leadId, submitLabel = "Verify", onDone, className }) {
  const t = useT();
  const stop = useLocale() === "hi" ? "।" : ".";
  const id = useId().replace(/:/g, "");
  const codeRef = useRef(null);
  const typed = purpose === "signin";
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState("start");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(null);
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const target = () => (typed ? { mobile } : purpose === "lead" ? { leadId } : {});

  async function send(channel) {
    setError(null);
    if (typed && !/^[6-9]\d{9}$/.test(mobile)) return setError("Enter a 10-digit mobile number.");
    if (typed && !consent) return setError("Please tick this so we can contact you.");
    setBusy(true);
    const res = await postJSON("otp/send", { purpose, ...target(), consent: typed ? consent : undefined, channel });
    setBusy(false);
    if (!res.ok) return setError(errorMessage(res.data));
    setSent(res.data);
    setCode("");
    setStep("code");
    setWait(RESEND_SECONDS);
    requestAnimationFrame(() => codeRef.current?.focus());
  }

  async function verify(value = code) {
    if (!/^\d{6}$/.test(value)) return setError("Enter the 6-digit code.");
    setError(null);
    setBusy(true);
    const res = await postJSON("otp/verify", { purpose, ...target(), code: value, _meta: typed ? leadMeta({ consent: true }) : undefined });
    setBusy(false);
    if (!res.ok) return setError(errorMessage(res.data));
    onDone?.(res.data);
  }

  if (step === "start") {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className={cn("grid gap-5", className)}
      >
        {typed && (
          <div className="grid gap-2">
            <label htmlFor={`${id}-mobile`} className="text-sm font-medium">
              {t("Mobile number")}
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-12 items-center rounded-xl border border-input bg-secondary px-3 text-sm text-muted-foreground">+91</span>
              <Input
                id={`${id}-mobile`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("We'll send a 6-digit code on WhatsApp.")}</p>
          </div>
        )}
        {typed && (
          <label htmlFor={`${id}-consent`} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input id={`${id}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--brand)]" />
            <span>
              {t(CONSENT_TEXT.replace("privacy policy.", "").trim())}{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                {t("privacy policy")}
              </Link>
              {stop}
            </span>
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(error)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={busy} className={typed ? "w-full" : "w-fit"}>
          {busy ? <SpinnerGap className="animate-spin" /> : <WhatsappLogo weight="fill" />} {t(typed ? "Send code" : "Send code on WhatsApp")}
        </Button>
      </form>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      className={cn("grid gap-5", className)}
    >
      <div className="grid gap-2">
        <label htmlFor={`${id}-code`} className="text-sm font-medium">
          {t("6-digit code")}
        </label>
        <Input
          ref={codeRef}
          id={`${id}-code`}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(next);
            if (next.length === 6) verify(next);
          }}
          className="text-center text-lg tracking-[0.5em] tabular-nums"
        />
        <p className="text-xs text-muted-foreground">
          {sent?.channel === "sms"
            ? t("Sent by SMS to {to}.", { to: sent.to })
            : sent?.channel === "whatsapp"
              ? t("Sent on WhatsApp to {to}.", { to: sent.to })
              : t("Sent to {to}.", { to: sent?.to })}
          {sent?.devCode && <> {t("Test mode: your code is {code}.", { code: sent.devCode })}</>}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {t(error)}
        </p>
      )}
      <Button type="submit" size="lg" disabled={busy || code.length !== 6} className={typed ? "w-full" : "w-fit"}>
        {busy && <SpinnerGap className="animate-spin" />} {t(submitLabel)}
      </Button>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {wait > 0 ? (
          <span className="text-muted-foreground">{t("Resend in {seconds}s", { seconds: wait })}</span>
        ) : (
          <>
            <button type="button" disabled={busy} onClick={() => send(sent?.channel === "sms" ? "sms" : undefined)} className="font-medium underline-offset-4 hover:underline">
              {t("Resend code")}
            </button>
            {sent?.smsAvailable && sent?.channel !== "sms" && (
              <button type="button" disabled={busy} onClick={() => send("sms")} className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
                <ChatCircleText className="size-4" /> {t("Didn't get it? Send by SMS")}
              </button>
            )}
          </>
        )}
        {typed && (
          <button
            type="button"
            onClick={() => {
              setStep("start");
              setError(null);
            }}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("Change number")}
          </button>
        )}
      </div>
    </form>
  );
}
