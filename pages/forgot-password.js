import { EnvelopeSimple, Phone } from "@phosphor-icons/react";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/site-settings";

// There is no self-service reset endpoint yet, so resets go through the team.
export default function ForgotPasswordPage() {
  const { primary, contactEmail, emailHref } = useSiteSettings();
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
          <a href={`${emailHref}?subject=Password reset`}>
            <EnvelopeSimple weight="bold" /> Email {contactEmail}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <a href={primary.href}>
            <Phone weight="bold" /> Call {primary.display}
          </a>
        </Button>
      </div>
    </AuthLayout>
  );
}
