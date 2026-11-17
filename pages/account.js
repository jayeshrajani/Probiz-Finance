"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeSlash, FileText, SealCheck, SignOut, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import OtpForm, { useOtpAvailable } from "@/components/forms/OtpForm";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, getJSON, getStoredUser, postJSON, sendJSON } from "@/lib/api";
import { formatINRShort } from "@/lib/format";
import { signIn, signOut } from "@/lib/use-user";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

const STATUS = {
  new: { label: "Received", tone: "bg-brand-soft text-brand-ink ring-brand/30" },
  contacted: { label: "Advisor in touch", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  in_progress: { label: "In progress", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  won: { label: "Completed", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  lost: { label: "Closed", tone: "bg-secondary text-muted-foreground ring-border" },
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const formatAmount = (value) => (value && Number(value) > 0 ? formatINRShort(value) : value || null);

function Card({ title, intro, children, className }) {
  const t = useT();
  return (
    <section className={cn("rounded-[2rem] border border-border bg-background p-6 sm:p-8", className)}>
      <h2 className="headline text-xl">{t(title)}</h2>
      {intro && <p className="mt-1.5 text-sm text-muted-foreground">{t(intro)}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ id, label, help, error, ...props }) {
  const t = useT();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {t(label)}
      </label>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={error || help ? `${id}-note` : undefined} {...props} />
      {(error || help) && (
        <p id={`${id}-note`} className={cn("text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>
          {t(error || help)}
        </p>
      )}
    </div>
  );
}

function Applications({ items }) {
  const t = useT();
  if (!items.length) {
    return (
      <div className="rounded-2xl bg-secondary/60 px-6 py-10 text-center">
        <FileText weight="duotone" className="mx-auto size-10 text-muted-foreground/60" />
        <p className="mt-4 font-medium">{t("No applications yet")}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t("Applications you send while signed in show up here with their status.")}</p>
        <Button asChild className="mt-6">
          <Link href="/eligibility">
            {t("Check your eligibility")} <ArrowRight weight="bold" />
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((a) => {
        const status = STATUS[a.status] || STATUS.new;
        const amount = formatAmount(a.amount);
        return (
          <li key={a.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium">{a.page ? <Link href={a.page} className="underline-offset-4 hover:underline">{a.product}</Link> : a.product}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[t("Sent {date}", { date: formatDate(a.createdAt) }), amount, a.advisor && t("Advisor: {name}", { name: a.advisor })].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", status.tone)}>{t(status.label)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function Interest({ interest }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  async function pick(option) {
    setBusy(option.type);
    const res = await postJSON("account/interest", { type: option.type });
    if (res.ok && res.data?.page) router.push(res.data.page);
    else {
      setBusy(null);
      toast.error(t(errorMessage(res.data)));
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {interest.options.map((o) => (
        <Button key={o.type} type="button" variant={interest.chosen === o.label ? "default" : "outline"} disabled={Boolean(busy)} onClick={() => pick(o)}>
          {busy === o.type && <SpinnerGap className="animate-spin" />} {t(o.label)}
        </Button>
      ))}
      <Button asChild variant="ghost">
        <Link href="/contact">{t("Something else")}</Link>
      </Button>
    </div>
  );
}

function ProfileForm({ user, onSaved }) {
  const t = useT();
  const [values, setValues] = useState({ user_Name: user.user_Name || "", mobile_no: user.mobile_no || "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dirty = values.user_Name.trim() !== (user.user_Name || "") || values.mobile_no !== (user.mobile_no || "");

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!values.user_Name.trim()) errs.user_Name = "Required";
    if (!/^[6-9]\d{9}$/.test(values.mobile_no)) errs.mobile_no = "Enter a 10-digit mobile number";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await sendJSON("account", { user_Name: values.user_Name.trim(), mobile_no: values.mobile_no }, "PATCH");
    setBusy(false);
    if (res.ok) {
      onSaved(res.data.user);
      toast.success(t("Details saved."));
    } else {
      toast.error(t(errorMessage(res.data, "We couldn't save your details.")));
    }
  }

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((x) => ({ ...x, [name]: null }));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="user_Name" label="Full name" autoComplete="name" value={values.user_Name} onChange={set("user_Name")} error={errors.user_Name} />
      <Field id="mobile_no" label="Mobile number" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel" value={values.mobile_no} onChange={set("mobile_no")} error={errors.mobile_no} help={user.mobileVerified ? "Verified" : "Not verified yet"} />
      {user.user_Email && <Field id="user_Email" label="Email" value={user.user_Email} readOnly disabled help="To change your email, contact us." />}
      <div>
        <Button type="submit" disabled={busy || !dirty}>
          {busy ? <SpinnerGap className="animate-spin" /> : null} {t("Save details")}
        </Button>
      </div>
    </form>
  );
}

function PasswordForm({ hasPassword = true }) {
  const t = useT();
  const empty = { current: "", next: "", confirm: "" };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (hasPassword && !values.current) errs.current = "Required";
    if (!PASSWORD_RULE.test(values.next)) errs.next = "Use 8+ characters with upper and lower case, a number and a symbol";
    if (values.confirm !== values.next) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await sendJSON("account/password", { current: values.current, next: values.next }, "PUT");
    setBusy(false);
    if (res.ok) {
      setValues(empty);
      toast.success(t("Password updated."));
    } else {
      setErrors({ current: res.status === 400 && /current/i.test(res.data?.message || "") ? res.data.message : null });
      toast.error(t(errorMessage(res.data, "We couldn't update your password.")));
    }
  }

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    setErrors((x) => ({ ...x, [name]: null }));
  };
  const type = show ? "text" : "password";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {hasPassword && <Field id="current" label="Current password" type={type} autoComplete="current-password" value={values.current} onChange={set("current")} error={errors.current} />}
      <Field id="next" label="New password" type={type} autoComplete="new-password" value={values.next} onChange={set("next")} error={errors.next} help="At least 8 characters with upper and lower case, a number and a symbol." />
      <Field id="confirm" label="Confirm new password" type={type} autoComplete="new-password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? <SpinnerGap className="animate-spin" /> : null} {t("Update password")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setShow((v) => !v)}>
          {show ? <EyeSlash /> : <Eye />} {show ? t("Hide passwords") : t("Show passwords")}
        </Button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const t = useT();
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: null, user: null, applications: [], interest: null });
  const otpAvailable = useOtpAvailable();

  useEffect(() => {
    if (!getStoredUser()?.accessToken) {
      router.replace("/sign-in?next=/account");
      return;
    }
    let active = true;
    getJSON("account").then((res) => {
      if (!active) return;
      if (res.status === 401) {
        signOut();
        router.replace("/sign-in?next=/account");
      } else if (res.ok) {
        setState({ loading: false, error: null, user: res.data.user, applications: res.data.applications || [], interest: res.data.interest || null });
      } else {
        setState((s) => ({ ...s, loading: false, error: errorMessage(res.data) }));
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  function onSaved(user) {
    setState((s) => ({ ...s, user }));
    signIn({ ...getStoredUser(), ...user });
  }

  function onVerified() {
    setState((s) => ({ ...s, user: { ...s.user, mobileVerified: true } }));
    toast.success(t("Mobile number verified."));
  }

  function onSignOut() {
    signOut();
    router.push("/");
  }

  const { loading, error, user, applications, interest } = state;
  const firstName = (user?.user_Name || "").split(" ")[0];

  return (
    <SiteLayout title="My Account" path="/account" noindex>
      <section className="container-page pt-10 pb-24 md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account" }]} />
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground" role="status">
            <SpinnerGap className="size-6 animate-spin" />
            <span className="sr-only">{t("Loading your account")}</span>
          </div>
        ) : error ? (
          <div className="mt-10 flex items-start gap-3 rounded-2xl bg-destructive/5 p-5 text-sm" role="alert">
            <WarningCircle weight="fill" className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p>{t(error)}</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="display-2">{firstName ? t("Hello, {name}.", { name: firstName }) : t("Your account")}</h1>
                <p className="lede mt-3 flex items-center gap-2">
                  {user.user_Email || `+91 ${user.mobile_no}`}
                  {user.mobileVerified && <SealCheck weight="fill" className="size-5 text-brand" aria-label={t("Mobile number verified")} />}
                </p>
              </div>
              <Button variant="outline" onClick={onSignOut}>
                <SignOut weight="bold" /> {t("Sign out")}
              </Button>
            </div>
            {interest && (
              <Card title="What can we help you with?" intro="Pick what you're looking for. We'll take you to a short application, and an advisor will call you." className="mt-10">
                <Interest interest={interest} />
              </Card>
            )}
            {!user.mobileVerified && otpAvailable && (
              <Card title="Verify your mobile number" intro="So our advisors know it's really you. We'll send a code to the number in your details." className="mt-6">
                <OtpForm purpose="account" onDone={onVerified} />
              </Card>
            )}
            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <Card title="Your applications" intro="Status updates appear here as our team works on them." className="lg:col-span-7 lg:row-span-2">
                <Applications items={applications} />
              </Card>
              <Card title="Your details" className="lg:col-span-5">
                <ProfileForm key={`${user._id}-${user.mobileVerified}`} user={user} onSaved={onSaved} />
              </Card>
              {user.user_Email ? (
                <Card title={user.hasPassword === false ? "Set a password" : "Password"} className="lg:col-span-5">
                  <PasswordForm hasPassword={user.hasPassword !== false} />
                </Card>
              ) : (
                <Card title="Signing in" intro="You sign in with your mobile number and a one-time code. No password needed." className="lg:col-span-5">
                  <span />
                </Card>
              )}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
