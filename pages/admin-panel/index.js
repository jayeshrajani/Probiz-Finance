import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/ui/input";
import { adminFetch, getToken, setToken } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    adminFetch("admin/me")
      .then(() => router.replace("/admin-panel/dashboard"))
      .catch(() => {});
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await adminFetch("staffLogin", { method: "POST", body: { email: email.trim(), password } });
      setToken(res.accessToken);
      router.replace("/admin-panel/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign in | Probiz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="grid min-h-dvh lg:grid-cols-2">
        <BackgroundPaths className="hidden min-h-dvh items-end justify-start bg-foreground text-brand lg:flex">
          <div className="relative p-12 text-background">
            <img src="/brand/probiz-logo.png" alt="" width={130} height={42} className="mb-10 h-8 w-auto rounded-md bg-background px-2 py-1" />
            <p className="max-w-md font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">Every lead, every file, one calm place.</p>
            <p className="mt-4 max-w-sm text-background/60">Track applications from the website, follow up, and keep notes for the whole team.</p>
          </div>
        </BackgroundPaths>

        <div className="flex items-center justify-center px-6 py-16">
          <form onSubmit={onSubmit} noValidate className="w-full max-w-sm">
            <img src="/brand/probiz-logo.png" alt="Probiz" width={130} height={42} className="mb-10 h-8 w-auto lg:hidden" />
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Employees and admins sign in here. Your account decides what you can access.</p>

            <div className="mt-8 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                Email
                <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(fieldBase, "h-11")} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Password
                <span className="relative">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(fieldBase, "h-11 pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
              {busy && <SpinnerGap className="animate-spin" />}
              Sign in
            </Button>
            <p className="mt-6 text-center text-xs text-muted-foreground">Forgotten your password? Ask an admin to reset it.</p>
          </form>
        </div>
      </div>
    </>
  );
}
