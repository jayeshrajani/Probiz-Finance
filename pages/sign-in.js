import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, postJSON } from "@/lib/api";
import { signIn } from "@/lib/use-user";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    const res = await postJSON("userLogin", { user_Email: email, password });
    setBusy(false);
    if (res.ok && res.data?.data) {
      signIn(res.data.data);
      toast.success("Signed in.");
      router.push(typeof router.query.next === "string" && router.query.next.startsWith("/") ? router.query.next : "/");
    } else {
      setError(errorMessage(res.data, "Sign-in failed. Check your details and try again."));
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      path="/sign-in"
      heading="Sign in"
      intro="Welcome back."
      footer={
        <>
          New to Probiz? <AuthLink href="/sign-up">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <AuthLink href="/forgot-password">
              <span className="text-xs">Forgot password?</span>
            </AuthLink>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12" />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
            >
              {show ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? <SpinnerGap className="animate-spin" /> : null} Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
