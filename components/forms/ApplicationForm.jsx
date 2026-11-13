"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import FileSlot, { formatBytes } from "@/components/forms/FileSlot";
import FormField from "@/components/forms/FormField";
import Confetti from "@/components/fun/Confetti";
import { Button } from "@/components/ui/button";
import { errorMessage, postForm, postJSON } from "@/lib/api";
import { forms } from "@/lib/forms";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Hosting (Vercel) rejects request bodies above 4.5 MB.
const MAX_UPLOAD = 4.4 * 1024 * 1024;
const MOBILE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";
const visible = (items, values) => (items || []).filter((f) => !f.showIf || f.showIf(values));

function validateField(field, value) {
  if (isEmpty(value)) return field.required ? "Required" : null;
  const v = String(value).trim();
  if (field.type === "tel" && !MOBILE.test(v)) return "Enter a 10-digit mobile number";
  if (field.type === "email" && !EMAIL.test(v)) return "Enter a valid email address";
  if (field.type === "number" && Number(v) < 0) return "Enter a positive number";
  if (field.type === "date" && /birth/i.test(field.name) && new Date(v) > new Date()) return "Date of birth can't be in the future";
  if (field.pattern && !field.pattern.test(v)) return field.patternMessage || "Check this value";
  return null;
}

export default function ApplicationForm({ formKey, preset = {}, productName, className }) {
  const config = forms[formKey];
  const idPrefix = useId().replace(/:/g, "");
  const topRef = useRef(null);

  const steps = useMemo(
    () => [...config.steps, ...(config.files?.length ? [{ id: "documents", title: "Documents", files: true }] : [])],
    [config]
  );

  const [values, setValues] = useState(() => ({ ...preset }));
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const visibleFiles = visible(config.files, values);
  const uploadBytes = visibleFiles.reduce((sum, s) => sum + (files[s.name]?.size || 0), 0);
  const tooLarge = uploadBytes > MAX_UPLOAD;

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: null } : e));
  };
  const setFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  function validate(stepIndexes) {
    const next = {};
    for (const i of stepIndexes) {
      for (const field of visible(steps[i].fields, values)) {
        const err = validateField(field, values[field.name]);
        if (err) next[field.name] = err;
      }
    }
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      const failingStep = stepIndexes.find((i) => visible(steps[i].fields, values).some((f) => f.name === first));
      if (failingStep !== undefined && failingStep !== step) {
        setDirection(-1);
        setStep(failingStep);
      }
      requestAnimationFrame(() => document.getElementById(`${idPrefix}-${first}`)?.focus());
      return false;
    }
    return true;
  }

  function go(to) {
    setDirection(to > step ? 1 : -1);
    setStep(to);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    if (!validate(steps.map((_, i) => i))) return;
    if (tooLarge) return;

    const payload = {};
    for (const s of config.steps) {
      for (const field of visible(s.fields, values)) {
        if (!isEmpty(values[field.name])) payload[field.name] = String(values[field.name]).trim();
      }
    }

    setStatus("submitting");
    setSubmitError(null);
    let res;
    if (config.json) {
      res = await postJSON(config.endpoint, payload);
    } else {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      visibleFiles.forEach((slot) => files[slot.name] && fd.append(slot.name, files[slot.name]));
      res = await postForm(config.endpoint, fd);
    }

    if (res.ok) {
      setStatus("done");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setStatus("idle");
      setSubmitError(errorMessage(res.data));
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (isLast) submit();
    else if (validate([step])) go(step + 1);
  }

  const firstName = (values.fullName || values.first_Name || values.name || "").trim().split(" ")[0];
  const phone = values.contactNumber || values.mobile_no;

  if (status === "done") {
    return (
      <div ref={topRef} className={cn("rounded-2xl border border-border bg-background p-8 sm:p-10", className)}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <span className="relative inline-block">
            <CheckCircle weight="fill" className="size-12 text-brand" />
            <Confetti />
          </span>
          <h3 className="headline mt-5">{firstName ? `Thank you, ${firstName}.` : "Thank you."} We have your details.</h3>
          <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
            A Probiz advisor will call you{phone ? ` on ${phone}` : ""} to take your {productName ? productName.toLowerCase() : "request"} forward. If it's urgent,
            call us on <a href={site.phoneHref} className="font-medium text-foreground underline-offset-4 hover:underline">{site.phoneDisplay}</a>.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button variant="outline" onClick={() => { setValues({ ...preset }); setFiles({}); setStep(0); setStatus("idle"); }}>
              Submit another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <form ref={topRef} noValidate onSubmit={onSubmit} className={cn("rounded-2xl border border-border bg-background p-6 sm:p-8", className)}>
      {steps.length > 1 && (
        <ol className="mb-8 flex gap-1.5" aria-label="Application progress">
          {steps.map((s, i) => (
            <li key={s.id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={i > step}
                onClick={() => i < step && go(i)}
                aria-current={i === step ? "step" : undefined}
                className="group block w-full text-left disabled:cursor-default"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="block h-full rounded-full bg-brand"
                    initial={false}
                    animate={{ width: i <= step ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className={cn("mt-2 block truncate text-xs", i === step ? "font-medium text-foreground" : "text-muted-foreground", i < step && "group-hover:text-foreground")}>
                  {s.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.fieldset
          key={current.id}
          custom={direction}
          initial={{ opacity: 0, x: 16 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 * direction }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <legend className="headline text-xl">{current.title}</legend>

          {current.files ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Optional. Add what you have now; your advisor can collect the rest later.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {visibleFiles.map((slot) => (
                  <FileSlot key={slot.name} slot={slot} file={files[slot.name]} onChange={setFile} idPrefix={idPrefix} />
                ))}
              </div>
              <p className={cn("mt-4 text-xs", tooLarge ? "font-medium text-destructive" : "text-muted-foreground")}>
                {tooLarge
                  ? `Total ${formatBytes(uploadBytes)} is over the 4.4 MB limit. Remove a file or share it with your advisor later.`
                  : uploadBytes
                    ? `${formatBytes(uploadBytes)} of 4.4 MB`
                    : "Up to 4.4 MB in total"}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {visible(current.fields, values).map((field) => (
                <FormField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={setValue} idPrefix={idPrefix} />
              ))}
            </div>
          )}
        </motion.fieldset>
      </AnimatePresence>

      {submitError && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
            <ArrowLeft weight="bold" /> Back
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            By continuing you agree to our <Link href="/privacy-policy" className="underline underline-offset-2">privacy policy</Link>.
          </p>
        )}
        <Button type="submit" size="lg" disabled={status === "submitting" || (isLast && tooLarge)}>
          {status === "submitting" ? (
            <>
              <SpinnerGap className="animate-spin" /> Sending
            </>
          ) : isLast ? (
            config.submitLabel || "Submit application"
          ) : (
            <>
              Continue <ArrowRight weight="bold" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
