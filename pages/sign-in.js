import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setToken } from "@/lib/admin-api";
import { errorMessage, postJSON } from "@/lib/api";
import { safeNext, signIn } from "@/lib/use-user";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

const MODES = [
  { id: "customer", label: "Customer", intro: "Welcome back." },
  { id: "staff", label: "Probiz staff", intro: "Employees and admins. Your account decides what you can access." },
];

export default function SignInPage() {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const isStaff = mode === "staff";

  useEffect(() => {
    const as = router.query.as;
    if (as === "staff" || as === "employee" || as === "admin") setMode("staff");
  }, [router.query.as]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    if (isStaff) {
      const res = await postJSON("staffLogin", { email: email.trim(), password });
      setBusy(false);
      if (res.ok && res.data?.accessToken) {
        setToken(res.data.accessToken);
        router.push("/admin-panel/dashboard");
      } else {
        setError(errorMessage(res.data, "That email and password don't match a staff account."));
      }
      return;
    }
    const res = await postJSON("userLogin", { user_Email: email, password });
    setBusy(false);
    if (res.ok && res.data?.data) {
      signIn({ ...res.data.data, accessToken: res.data.accessToken });
      toast.success(t("Signed in."));
      router.push(safeNext(router.query.next));
    } else {
      setError(errorMessage(res.data, "Sign-in failed. Check your details and try again."));
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      path="/sign-in"
      heading="Sign in"
      intro={MODES.find((m) => m.id === mode).intro}
      footer={
        isStaff ? (
          <>{t("Staff accounts are created by a Probiz admin. Forgotten your password? Ask an admin to reset it.")}</>
        ) : (
          <>
            {t("New to Probiz?")}{" "}
            <AuthLink href={router.query.next ? `/sign-up?next=${encodeURIComponent(safeNext(router.query.next))}` : "/sign-up"}>{t("Create an account")}</AuthLink>
          </>
        )
      }
    >
      <div role="tablist" aria-label={t("Account type")} className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setError(null);
            }}
            className={cn("relative h-9 rounded-full text-sm font-medium transition-colors", mode === m.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {mode === m.id && (
              <motion.span layoutId="signin-mode" className="absolute inset-0 rounded-full bg-background shadow-[0_1px_2px_oklch(0.21_0.006_286/0.12)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{t(m.label)}</span>
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t("Email")}
          </label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              {t("Password")}
            </label>
            {!isStaff && (
              <AuthLink href="/forgot-password">
                <span className="text-xs">{t("Forgot password?")}</span>
              </AuthLink>
            )}
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12" />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? t("Hide password") : t("Show password")}
              className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
            >
              {show ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(error)}
          </p>
        )}
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? <SpinnerGap className="animate-spin" /> : null} {t("Sign in")}
        </Button>
      </form>
    </AuthLayout>
  );
}
