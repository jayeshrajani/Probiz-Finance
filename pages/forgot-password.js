import { EnvelopeSimple, Phone } from "@phosphor-icons/react";
import AuthLayout, { AuthLink } from "@/components/templates/AuthLayout";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/site-settings";
import { useT } from "@/lib/i18n";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

// There is no self-service reset endpoint yet, so resets go through the team.
export default function ForgotPasswordPage() {
  const t = useT();
  const { primary, contactEmail, emailHref } = useSiteSettings();
  return (
    <AuthLayout
      title="Reset Password"
      path="/forgot-password"
      heading="Forgot your password?"
      intro="Contact us from your registered email or mobile number and we'll reset it for you."
      footer={
        <>
          {t("Remembered it?")} <AuthLink href="/sign-in">{t("Sign in")}</AuthLink>
        </>
      }
    >
      <div className="grid gap-3">
        <Button asChild size="lg" className="w-full">
          <a href={`${emailHref}?subject=Password reset`}>
            <EnvelopeSimple weight="bold" /> {t("Email {email}", { email: contactEmail })}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <a href={primary.href}>
            <Phone weight="bold" /> {t("Call {phone}", { phone: primary.display })}
          </a>
        </Button>
      </div>
    </AuthLayout>
  );
}
