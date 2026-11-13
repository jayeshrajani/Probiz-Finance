import { useState } from "react";
import { useRouter } from "next/router";
import { SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, postJSON } from "@/lib/api";

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

const fields = [
  { name: "user_Name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "user_Email", label: "Email", type: "email", autoComplete: "email" },
  { name: "mobile_no", label: "Mobile number", type: "tel", autoComplete: "tel", inputMode: "numeric", maxLength: 10 },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", help: "At least 8 characters with upper and lower case, a number and a symbol." },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
];

function validate(v) {
  const e = {};
  if (!v.user_Name?.trim()) e.user_Name = "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.user_Email || "")) e.user_Email = "Enter a valid email address";
  if (!/^[6-9]\d{9}$/.test(v.mobile_no || "")) e.mobile_no = "Enter a 10-digit mobile number";
  if (!PASSWORD_RULE.test(v.password || "")) e.password = "Use 8+ characters with upper and lower case, a number and a symbol";
  if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords don't match";
  return e;
}

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setFormError(null);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setBusy(true);
    const res = await postJSON("userSignUp", { ...values, country_code: "+91" });
    setBusy(false);
    if (res.ok) {
      toast.success("Account created. Sign in to continue.");
      router.push("/sign-in");
    } else {
      setFormError(errorMessage(res.data, "We couldn't create your account. Please try again."));
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      path="/sign-up"
      heading="Create an account"
      intro="It takes a minute."
      footer={
        <>
          Already have an account? <AuthLink href="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        {fields.map((f) => (
          <div key={f.name} className="grid gap-2">
            <label htmlFor={f.name} className="text-sm font-medium">
              {f.label}
            </label>
            <Input
              id={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              inputMode={f.inputMode}
              maxLength={f.maxLength}
              value={values[f.name] || ""}
              aria-invalid={errors[f.name] ? true : undefined}
              aria-describedby={errors[f.name] ? `${f.name}-error` : f.help ? `${f.name}-help` : undefined}
              onChange={(e) => {
                setValues((v) => ({ ...v, [f.name]: e.target.value }));
                setErrors((x) => ({ ...x, [f.name]: null }));
              }}
            />
            {errors[f.name] ? (
              <p id={`${f.name}-error`} className="text-xs font-medium text-destructive">
                {errors[f.name]}
              </p>
            ) : (
              f.help && (
                <p id={`${f.name}-help`} className="text-xs text-muted-foreground">
                  {f.help}
                </p>
              )
            )}
          </div>
        ))}
        {formError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? <SpinnerGap className="animate-spin" /> : null} Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
