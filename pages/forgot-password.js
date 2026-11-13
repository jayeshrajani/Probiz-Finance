import { EnvelopeSimple, Phone } from "@phosphor-icons/react";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

// There is no self-service reset endpoint yet, so resets go through the team.
export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      path="/forgot-password"
      heading="Forgot your password?"
      intro="Contact us from your registered email or mobile number and we'll reset it for you."
      footer={
        <>
          Remembered it? <AuthLink href="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <div className="grid gap-3">
        <Button asChild size="lg" className="w-full">
          <a href={`mailto:${site.email}?subject=Password reset`}>
            <EnvelopeSimple weight="bold" /> Email {site.email}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <a href={site.phoneHref}>
            <Phone weight="bold" /> Call {site.phoneDisplay}
          </a>
        </Button>
      </div>
    </AuthLayout>
  );
}
