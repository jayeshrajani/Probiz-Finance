"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUp, CheckCircle, SpinnerGap, X } from "@phosphor-icons/react";
import { ASSISTANT_EVENT } from "@/components/assistant/events";
import { reply, STARTERS } from "@/components/assistant/brain";
import { errorMessage, postJSON } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const STORE = "probiz:chat";
const TEASER = "probiz:chat-teaser";
const ease = [0.16, 1, 0.3, 1];

const GREETING = {
  from: "bot",
  text: "Hi, I'm the Probiz assistant. I can point you to the right loan or cover, work out an EMI, or get an advisor to call you.",
  chips: STARTERS,
};

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

function EmiCard({ emi }) {
  const total = emi.principal + emi.interest;
  const share = Math.round((emi.principal / total) * 100);
  return (
    <div className="mt-3 rounded-2xl bg-background p-4 shadow-[0_0_0_1px_var(--border)]">
      <p className="text-xs text-muted-foreground">Monthly EMI</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">{formatINR(emi.monthly)}</p>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-brand-soft">
        <div className="h-full bg-brand" style={{ width: `${share}%` }} />
      </div>
      <dl className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Principal</dt>
          <dd className="font-medium">{formatINR(emi.principal)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total interest</dt>
          <dd className="font-medium">{formatINR(emi.interest)}</dd>
        </div>
      </dl>
    </div>
  );
}

function CallbackForm({ topic }) {
  const [values, setValues] = useState({ name: "", mobile_no: "", email: "" });
  const [state, setState] = useState({ status: "idle", error: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const mobile = values.mobile_no.replace(/\D/g, "").slice(-10);
    if (values.name.trim().length < 2) return setState({ status: "idle", error: "Please add your name." });
    if (!/^[6-9]\d{9}$/.test(mobile)) return setState({ status: "idle", error: "Enter a 10-digit mobile number." });
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setState({ status: "idle", error: "Enter a valid email." });
    setState({ status: "busy", error: "" });
    const res = await postJSON("addContactUs", {
      name: values.name.trim(),
      mobile_no: mobile,
      email: values.email.trim(),
      message: `Callback requested from the website assistant.${topic ? ` Topic: ${topic}` : ""}`,
    });
    setState(res.ok ? { status: "done", error: "" } : { status: "idle", error: errorMessage(res.data) });
  }

  if (state.status === "done") {
    return (
      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-background p-3.5 text-sm shadow-[0_0_0_1px_var(--border)]">
        <CheckCircle weight="fill" className="mt-0.5 size-4 shrink-0 text-brand" />
        Done. An advisor will call you back on {values.mobile_no.replace(/\D/g, "").slice(-10)}.
      </p>
    );
  }

  const field =
    "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-brand focus:ring-[3px] focus:ring-brand/25";
  return (
    <form onSubmit={onSubmit} noValidate className="mt-3 grid gap-2 rounded-2xl bg-background p-3 shadow-[0_0_0_1px_var(--border)]">
      <input aria-label="Your name" placeholder="Your name" autoComplete="name" className={field} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <input aria-label="Mobile number" placeholder="Mobile number" type="tel" inputMode="numeric" autoComplete="tel" className={field} value={values.mobile_no} onChange={(e) => setValues({ ...values, mobile_no: e.target.value })} />
      <input aria-label="Email" placeholder="Email" type="email" autoComplete="email" className={field} value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
      {state.error && (
        <p role="alert" className="px-1 text-xs text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state.status === "busy"}
        className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {state.status === "busy" && <SpinnerGap className="size-4 animate-spin" />}
        Request a callback
      </button>
    </form>
  );
}

function Message({ m, onChip, topic, last }) {
  if (m.from === "user") {
    return (
      <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease }} className="flex justify-end">
        <p className="max-w-[85%] rounded-[1.25rem] rounded-br-md bg-foreground px-4 py-2.5 text-[0.9375rem] leading-snug text-background">{m.text}</p>
      </motion.li>
    );
  }
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease }} className="flex gap-2.5">
      <Avatar className="mt-0.5 size-7" />
      <div className="min-w-0 max-w-[88%]">
        <p className="rounded-[1.25rem] rounded-tl-md bg-secondary px-4 py-2.5 text-[0.9375rem] leading-snug">{m.text}</p>
        {m.emi && <EmiCard emi={m.emi} />}
        {m.form === "callback" && <CallbackForm topic={topic} />}
        {m.links?.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {m.links.filter(Boolean).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-background px-3.5 py-2.5 text-sm font-medium shadow-[0_0_0_1px_var(--border)] transition-colors hover:text-brand-ink"
                >
                  {l.label}
                  <ArrowRight weight="bold" className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {m.more && (
          <Link href={m.more.href} className="mt-2 inline-block px-1 text-sm font-medium text-brand-ink hover:underline">
            {m.more.label}
          </Link>
        )}
        {last && m.chips?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {m.chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChip(c)}
                className="rounded-full border border-brand/40 bg-background px-3 py-1.5 text-[0.8125rem] font-medium text-brand-ink transition-colors hover:bg-brand-soft"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [teaser, setTeaser] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const timers = useRef([]);
  const lastTopic = useRef("");

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "[]");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
    const t = setTimeout(() => {
      if (!sessionStorage.getItem(TEASER)) setTeaser(true);
    }, 9000);
    const pending = timers.current;
    return () => {
      clearTimeout(t);
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (messages.length) sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40)));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const dismissTeaser = useCallback(() => {
    setTeaser(false);
    sessionStorage.setItem(TEASER, "1");
  }, []);

  const send = useCallback((raw) => {
    const text = raw.trim().slice(0, 300);
    if (!text) return;
    if (!/^(talk to a person|find a loan|insurance quote|documents needed|work out an emi)$/i.test(text)) lastTopic.current = text;
    setMessages((m) => [...(m.length ? m : [withId(GREETING)]), withId({ from: "user", text })]);
    setInput("");
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, withId({ from: "bot", ...reply(text) })]);
    }, 420 + Math.min(text.length * 6, 380));
    timers.current.push(t);
  }, []);

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
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Probiz assistant"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ duration: 0.32, ease }}
            className="fixed inset-0 z-50 flex origin-bottom-right flex-col overflow-hidden bg-background sm:inset-auto sm:right-5 sm:bottom-24 sm:h-[min(40rem,calc(100dvh-8rem))] sm:w-[25rem] sm:rounded-[1.75rem] sm:border sm:border-border sm:shadow-[0_40px_100px_-40px_oklch(0.21_0.006_286/0.45)]"
          >
            <header className="flex items-center gap-3 border-b border-border px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
              <Avatar className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-[-0.015em]">Probiz assistant</p>
                <p className="text-xs text-muted-foreground">Instant answers. An advisor follows up.</p>
              </div>
              <button type="button" onClick={close} aria-label="Close assistant" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent">
                <X weight="bold" className="size-4" />
              </button>
            </header>

            <ul ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5">
              {messages.map((m, i) => (
                <Message key={m.id} m={m} onChip={send} topic={lastTopic.current} last={i === messages.length - 1} />
              ))}
              {typing && (
                <li className="flex items-center gap-2.5" aria-label="Assistant is typing">
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
              <div className="flex items-center gap-2 rounded-full border border-input bg-background py-1 pr-1 pl-4 transition-shadow focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/25">
                <label htmlFor="assistant-input" className="sr-only">
                  Message
                </label>
                <input
                  ref={inputRef}
                  id="assistant-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about loans, EMIs, documents"
                  autoComplete="off"
                  maxLength={300}
                  className="h-9 min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground/80"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground transition-[transform,opacity] active:scale-95 disabled:opacity-40"
                >
                  <ArrowUp weight="bold" className="size-4" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[0.6875rem] text-muted-foreground">
                Automated replies, not financial advice. Urgent? Call{" "}
                <a href={site.phoneHref} className="underline">
                  {site.phoneDisplay}
                </a>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 sm:right-5 sm:bottom-5", open && "max-sm:hidden")}>
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
                <span className="font-semibold">Need a hand?</span> Ask me about loans, EMIs or the documents you'll need.
              </button>
              <button type="button" onClick={dismissTeaser} aria-label="Dismiss" className="absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent">
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
          aria-label={open ? "Close assistant" : "Open assistant"}
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
          <span className="hidden text-sm font-medium sm:inline">{open ? "Close" : "Ask Probiz"}</span>
        </button>
      </div>
    </>
  );
}
