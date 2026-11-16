"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUp, ArrowUpRight, Check, EnvelopeSimple, MapPin, Phone, WhatsappLogo, X } from "@phosphor-icons/react";
import { ASSISTANT_EVENT } from "@/components/assistant/events";
import { CALLBACK, CONTACT, reply, STARTERS } from "@/components/assistant/brain";
import { errorMessage } from "@/lib/api";
import { cleanMobile, recalledContact, rememberContact, sendCallback } from "@/lib/callback";
import { formatINR, formatINRShort } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { site } from "@/lib/site";
import { useSiteSettings } from "@/lib/site-settings";
import { useTyping } from "@/lib/use-typing";
import { cn } from "@/lib/utils";

const STORE = "probiz:chat";
const TEASER = "probiz:chat-teaser";
const ease = [0.16, 1, 0.3, 1];

// Bot text is stored as English templates and translated on render, so a language switch re-renders the chat.
const GREETING = {
  from: "bot",
  text: "Hi, I'm the Probiz assistant. I can point you to the right loan or cover, work out an EMI, share our contact details, or get an advisor to call you.",
  chips: STARTERS,
};

const YES = "Yes, call me";
const CHANGE = "Use different details";
const CANCEL = "Cancel";
const RETRY = "Try again";
const NAME_OK = /^[\p{L}\p{M} .'-]{2,60}$/u;

let nextId = 1;
const withId = (m) => ({ id: `${Date.now()}-${nextId++}`, ...m });

export function Avatar({ className }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("shrink-0", className)}>
      <circle cx="20" cy="20" r="20" fill="var(--brand)" />
      <g className="avatar-eyes">
        <ellipse cx="14.5" cy="18" rx="2.4" ry="3.2" fill="var(--foreground)" />
        <ellipse cx="25.5" cy="18" rx="2.4" ry="3.2" fill="var(--foreground)" />
      </g>
      <path d="M14 25.5 Q20 30 26 25.5" fill="none" stroke="var(--foreground)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function EmiCard({ emi, t }) {
  const total = emi.principal + emi.interest;
  const share = Math.round((emi.principal / total) * 100);
  return (
    <div className="mt-2 rounded-2xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]">
      <p className="text-xs text-muted-foreground">{t("Monthly EMI")}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">{formatINR(emi.monthly)}</p>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-brand-soft">
        <div className="h-full bg-brand" style={{ width: `${share}%` }} />
      </div>
      <dl className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">{t("Principal")}</dt>
          <dd className="font-medium">{formatINR(emi.principal)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("Total interest")}</dt>
          <dd className="font-medium">{formatINR(emi.interest)}</dd>
        </div>
      </dl>
    </div>
  );
}

function ContactCard({ t }) {
  const { primary, secondary, whatsappHref, contactEmail, emailHref } = useSiteSettings();
  const rows = [
    { Icon: Phone, label: t("Call"), value: primary.display, href: primary.href },
    secondary && secondary.number !== primary.number && { Icon: Phone, label: t("Or call"), value: secondary.display, href: secondary.href },
    whatsappHref && { Icon: WhatsappLogo, label: "WhatsApp", value: t("Message us on WhatsApp"), href: whatsappHref, external: true },
    emailHref && { Icon: EnvelopeSimple, label: t("Email"), value: contactEmail, href: emailHref },
    { Icon: MapPin, label: t("Office"), value: t(site.address), href: site.mapLink, external: true },
  ].filter(Boolean);
  return (
    <ul className="mt-2 grid gap-1.5">
      {rows.map(({ Icon, label, value, href, external }) => (
        <li key={label}>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex items-start gap-3 rounded-xl bg-background px-3 py-2.5 shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-brand-soft"
          >
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink group-hover:bg-background">
              <Icon weight="duotone" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">{label}</span>
              <span className="block text-sm leading-snug font-medium break-words">{value}</span>
            </span>
            {external && <ArrowUpRight weight="bold" className="mt-1 size-3.5 shrink-0 text-muted-foreground" />}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Message({ m, onChip, last, t }) {
  if (m.from === "user") {
    return (
      <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease }} className="flex justify-end">
        <p className="max-w-[85%] rounded-[1.25rem] rounded-br-md bg-foreground px-4 py-2.5 text-[0.9375rem] leading-snug break-words text-background">{m.text}</p>
      </motion.li>
    );
  }
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease }} className="flex gap-2.5">
      <Avatar className="mt-0.5 size-7" />
      <div className="min-w-0 max-w-[88%]">
        <p className="rounded-[1.25rem] rounded-tl-md bg-secondary px-4 py-2.5 text-[0.9375rem] leading-snug">{t(m.text, m.vars)}</p>
        {m.list?.length > 0 && (
          <ul className="mt-2 grid gap-1 rounded-2xl bg-background p-3 text-sm shadow-[0_0_0_1px_var(--border)]">
            {m.list.map((x) => (
              <li key={x} className="flex gap-2">
                <Check weight="bold" className="mt-1 size-3.5 shrink-0 text-brand-ink" /> {t(x)}
              </li>
            ))}
          </ul>
        )}
        {m.emi && <EmiCard emi={m.emi} t={t} />}
        {m.contact && <ContactCard t={t} />}
        {m.consent && (
          <p className="mt-2 px-1 text-xs leading-relaxed text-muted-foreground">
            {t("By tapping \"Yes, call me\" you agree that Probiz can call, WhatsApp or email you about this.")}{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2">
              {t("Privacy policy")}
            </Link>
          </p>
        )}
        {m.links?.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {m.links.filter(Boolean).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-background px-3.5 py-2.5 text-sm font-medium shadow-[0_0_0_1px_var(--border)] transition-colors hover:text-brand-ink"
                >
                  {t(l.label, l.vars)}
                  <ArrowRight weight="bold" className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {m.more && (
          <Link href={m.more.href} className="mt-2 inline-block px-1 text-sm font-medium text-brand-ink hover:underline">
            {t(m.more.label)}
          </Link>
        )}
        {last && m.chips?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {m.chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChip(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                  c === YES ? "border-brand bg-brand text-brand-foreground hover:bg-brand/90" : "border-brand/40 bg-background text-brand-ink hover:bg-brand-soft"
                )}
              >
                {t(c)}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}

// `amount` is a rupee value; everything else that is text gets translated.
const translateVars = (t, vars, locale) =>
  vars && Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, k === "amount" && typeof v === "number" ? formatINRShort(v, locale) : typeof v === "string" ? t(v) : v]));

const confirmMsg = (name, mobile, topic) => ({
  text: topic ? "Shall an advisor call {name} on {mobile} about {topic}?" : "Shall an advisor call {name} on {mobile}?",
  vars: { name, mobile: `+91 ${mobile}`, ...(topic ? { topic: topic.name } : {}) },
  chips: [YES, CHANGE, CANCEL],
  consent: true,
});

const isOneOf = (text, t, options) => {
  const low = text.trim().toLowerCase();
  return options.some((o) => low === o.toLowerCase() || low === t(o).toLowerCase());
};

export default function Assistant() {
  const { t, locale } = useI18n();
  const { primary } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const fieldFocused = useTyping();
  const [messages, setMessages] = useState([]);
  // In-chat callback: { step: "name" | "mobile" | "confirm" | "sending" | "failed", topic, name, mobile }
  const [flow, setFlow] = useState(null);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [teaser, setTeaser] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const timers = useRef([]);
  const topicRef = useRef(null);
  const flowRef = useRef(null);
  flowRef.current = flow;
  const tr = useCallback((text, vars) => t(text, translateVars(t, vars, locale)), [t, locale]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "null");
      const list = Array.isArray(saved) ? saved : saved?.messages;
      if (Array.isArray(list) && list.length) setMessages(list.filter((m) => m && m.text));
      if (saved?.flow && saved.flow.step !== "sending") setFlow(saved.flow);
      if (saved?.topic) topicRef.current = saved.topic;
    } catch {}
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(TEASER)) setTeaser(true);
    }, 9000);
    const pending = timers.current;
    return () => {
      clearTimeout(timer);
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (messages.length) {
      try {
        sessionStorage.setItem(STORE, JSON.stringify({ messages: messages.slice(-40), flow: flow?.step === "sending" ? null : flow, topic: topicRef.current }));
      } catch {}
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, flow]);

  const dismissTeaser = useCallback(() => {
    setTeaser(false);
    sessionStorage.setItem(TEASER, "1");
  }, []);

  const say = useCallback((msg, delay = 380) => {
    setTyping(true);
    const timer = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, withId({ from: "bot", ...msg })]);
    }, delay);
    timers.current.push(timer);
  }, []);

  const startLead = useCallback(
    (topic) => {
      const tp = topic || topicRef.current;
      const saved = recalledContact();
      if (saved?.name && cleanMobile(saved.mobile)) {
        setFlow({ step: "confirm", topic: tp, name: saved.name, mobile: saved.mobile });
        say(confirmMsg(saved.name, saved.mobile, tp));
      } else {
        setFlow({ step: "name", topic: tp });
        say({
          text: tp ? "Happy to arrange a call about {topic}. What's your name?" : "Happy to arrange that. What's your name?",
          vars: tp ? { topic: tp.name } : undefined,
          chips: [CANCEL],
        });
      }
    },
    [say]
  );

  const submitLead = useCallback(
    async (f) => {
      setFlow({ ...f, step: "sending" });
      setTyping(true);
      const res = await sendCallback({ name: f.name, mobile: f.mobile, interest: f.topic?.name, locale, channel: "assistant", message: "Requested through the website assistant." });
      setTyping(false);
      if (res.ok) {
        rememberContact(f.name, f.mobile);
        setFlow(null);
        setMessages((m) => [
          ...m,
          withId({
            from: "bot",
            text: res.data?.repeat ? "We already had a recent request from you, so I've added this to it. An advisor will call {name} on {mobile}." : "Done. An advisor will call {name} on {mobile} soon.",
            vars: { name: f.name.split(" ")[0], mobile: `+91 ${f.mobile}` },
            links: f.topic ? [{ label: "Add more details on the {product} form", vars: { product: f.topic.name }, href: `/${f.topic.slug}${f.topic.form}` }] : [],
            chips: [CONTACT, "Find a loan"],
          }),
        ]);
      } else {
        setFlow({ ...f, step: "failed" });
        setMessages((m) => [...m, withId({ from: "bot", text: errorMessage(res.data), chips: [RETRY, CONTACT] })]);
      }
    },
    [locale]
  );

  // Returns true when the message belonged to the callback flow.
  const handleFlow = useCallback(
    (text, f) => {
      if (isOneOf(text, t, [CANCEL, "stop", "no", "nahi", "रद्द", "नहीं", "रहने दो"])) {
        setFlow(null);
        say({ text: "No problem. Anything else I can help with?", chips: STARTERS });
        return true;
      }
      if (f.step === "sending") return true;
      if (STARTERS.includes(text) && text !== CALLBACK) {
        setFlow(null);
        return false;
      }
      if (f.step === "name") {
        const phone = text.match(/(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}/);
        const name = text
          .replace(phone?.[0] || "", " ")
          .replace(/^\s*(my name is|name is|i am|i'm|this is|mera naam|मेरा नाम|नाम)\s*/i, "")
          .replace(/\s*(है|hai|here)\s*$/i, "")
          .replace(/[,.]+$/, "")
          .trim();
        if (!NAME_OK.test(name)) {
          say({ text: "Please share just your name, for example Rahul Sharma.", chips: [CANCEL] });
          return true;
        }
        const mobile = phone ? cleanMobile(phone[0]) : null;
        if (mobile) {
          setFlow({ ...f, step: "confirm", name, mobile });
          say(confirmMsg(name, mobile, f.topic));
        } else {
          setFlow({ ...f, step: "mobile", name });
          say({ text: "Thanks, {name}. What's your 10-digit mobile number?", vars: { name: name.split(" ")[0] }, chips: [CANCEL] });
        }
        return true;
      }
      if (f.step === "mobile") {
        const mobile = cleanMobile(text);
        if (!mobile) {
          say({ text: "That doesn't look like a 10-digit Indian mobile number. Please try again.", chips: [CANCEL] });
          return true;
        }
        setFlow({ ...f, step: "confirm", mobile });
        say(confirmMsg(f.name, mobile, f.topic));
        return true;
      }
      if (f.step === "confirm") {
        if (isOneOf(text, t, [YES, "yes", "haan", "han", "ha", "ok", "okay", "हाँ", "हां", "जी"])) {
          submitLead(f);
          return true;
        }
        if (isOneOf(text, t, [CHANGE])) {
          setFlow({ step: "name", topic: f.topic });
          say({ text: "Sure. What's your name?", chips: [CANCEL] });
          return true;
        }
        const mobile = cleanMobile(text);
        if (mobile) {
          setFlow({ ...f, mobile });
          say(confirmMsg(f.name, mobile, f.topic));
          return true;
        }
        say({ text: "Tap \"Yes, call me\" to confirm, or change your details.", chips: [YES, CHANGE, CANCEL] });
        return true;
      }
      if (f.step === "failed" && isOneOf(text, t, [RETRY])) {
        submitLead(f);
        return true;
      }
      setFlow(null);
      return false;
    },
    [say, submitLead, t]
  );

  const send = useCallback(
    (raw, display) => {
      const text = String(raw || "").trim().slice(0, 300);
      if (!text) return;
      setMessages((m) => [...(m.length ? m : [withId(GREETING)]), withId({ from: "user", text: display || text })]);
      setInput("");
      const f = flowRef.current;
      if (f && handleFlow(text, f)) return;
      const r = reply(text);
      if (r.topic) topicRef.current = r.topic;
      if (r.action === "lead") return startLead(r.topic);
      say(r, 420 + Math.min(text.length * 6, 380));
    },
    [handleFlow, say, startLead]
  );

  const onChip = useCallback((c) => send(c, t(c)), [send, t]);

  const show = useCallback(() => {
    dismissTeaser();
    setOpen(true);
    setMessages((m) => (m.length ? m : [withId(GREETING)]));
  }, [dismissTeaser]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = (e) => {
      show();
      if (e.detail?.prompt) send(e.detail.prompt);
    };
    window.addEventListener(ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_EVENT, onOpen);
  }, [show, send]);

  useEffect(() => {
    if (!open) return;
    // Phones: the panel is full screen, so stop the page behind it from scrolling, and don't pop the keyboard uninvited.
    const phone = window.matchMedia("(max-width: 639px)").matches;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    if (phone) root.style.overflow = "hidden";
    const timer = window.matchMedia("(pointer: fine)").matches ? setTimeout(() => inputRef.current?.focus(), 60) : null;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      if (timer) clearTimeout(timer);
      if (phone) root.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const step = flow?.step;
  const placeholder = step === "name" ? t("Type your name") : step === "mobile" ? t("10-digit mobile number") : t("Ask about loans, EMIs, documents");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t("Probiz assistant")}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ duration: 0.32, ease }}
            className="fixed inset-0 z-50 flex origin-bottom-right flex-col overflow-hidden bg-background sm:inset-auto sm:right-5 sm:bottom-24 sm:h-[min(40rem,calc(100dvh-8rem))] sm:w-[25rem] sm:rounded-[1.75rem] sm:border sm:border-border sm:shadow-[0_40px_100px_-40px_oklch(0.21_0.006_286/0.45)]"
          >
            <header className="flex items-center gap-3 border-b border-border px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
              <Avatar className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-[-0.015em]">{t("Probiz assistant")}</p>
                <p className="text-xs text-muted-foreground">{t("Instant answers. An advisor follows up.")}</p>
              </div>
              <a href={primary.href} aria-label={t("Call {phone}", { phone: primary.display })} title={primary.display} className="inline-flex size-9 items-center justify-center rounded-full text-brand-ink hover:bg-brand-soft">
                <Phone weight="bold" className="size-4" />
              </a>
              <button type="button" onClick={close} aria-label={t("Close assistant")} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent">
                <X weight="bold" className="size-4" />
              </button>
            </header>

            <ul ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5">
              {messages.map((m, i) => (
                <Message key={m.id} m={m} onChip={onChip} t={tr} last={i === messages.length - 1} />
              ))}
              {typing && (
                <li className="flex items-center gap-2.5" aria-label={t("Assistant is typing")}>
                  <Avatar className="size-7" />
                  <span className="inline-flex gap-1 rounded-full bg-secondary px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-1.5 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: `${d * 120}ms` }} />
                    ))}
                  </span>
                </li>
              )}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              {!flow && (
                <div className="mb-2 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
                  {[CALLBACK, CONTACT, "Work out an EMI"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChip(c)}
                      className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-brand-soft hover:text-brand-ink"
                    >
                      {t(c)}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full border border-input bg-background py-1 pr-1 pl-4 transition-shadow focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/25">
                <label htmlFor="assistant-input" className="sr-only">
                  {t("Message")}
                </label>
                <input
                  ref={inputRef}
                  id="assistant-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  autoComplete={step === "name" ? "name" : step === "mobile" ? "tel-national" : "off"}
                  inputMode={step === "mobile" ? "tel" : "text"}
                  enterKeyHint="send"
                  maxLength={300}
                  className="h-9 min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground/80"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || step === "sending"}
                  aria-label={t("Send")}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground transition-[transform,opacity] active:scale-95 disabled:opacity-40"
                >
                  <ArrowUp weight="bold" className="size-4" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[0.6875rem] text-muted-foreground">
                {t("Automated replies, not financial advice. Urgent? Call")}{" "}
                <a href={primary.href} className="underline">
                  {primary.display}
                </a>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 sm:right-5 sm:bottom-5", (open || fieldFocused) && "max-sm:hidden")}>
        <AnimatePresence>
          {teaser && !open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease }}
              className="absolute right-0 bottom-[calc(100%+0.75rem)] hidden w-64 origin-bottom-right rounded-2xl border border-border bg-background p-4 pr-9 text-sm shadow-[0_20px_50px_-24px_oklch(0.21_0.006_286/0.4)] sm:block"
            >
              <button type="button" onClick={show} className="text-left leading-snug">
                <span className="font-semibold">{t("Need a hand?")}</span> {t("Ask me about loans, EMIs or the documents you'll need.")}
              </button>
              <button type="button" onClick={dismissTeaser} aria-label={t("Dismiss")} className="absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent">
                <X weight="bold" className="size-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? close() : show())}
          aria-expanded={open}
          aria-label={open ? t("Close assistant") : t("Open assistant")}
          className="group flex h-14 items-center gap-2.5 rounded-full bg-foreground px-2 text-background shadow-[0_18px_40px_-16px_oklch(0.21_0.006_286/0.6)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:pr-5"
        >
          <span className="relative inline-flex size-10 items-center justify-center">
            <AnimatePresence initial={false} mode="wait">
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="inline-flex size-10 items-center justify-center rounded-full bg-background/10">
                  <X weight="bold" className="size-4" />
                </motion.span>
              ) : (
                <motion.span key="a" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Avatar className="size-10" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="hidden text-sm font-medium sm:inline">{open ? t("Close") : t("Ask Probiz")}</span>
        </button>
      </div>
    </>
  );
}
