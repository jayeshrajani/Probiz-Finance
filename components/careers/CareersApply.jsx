import Link from "next/link";
import { useId, useState } from "react";
import { ArrowSquareOut, Buildings, Check, EnvelopeSimple, Info, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cleanMobile } from "@/lib/callback";
import { applicationMessage, careersOffice, CONSENT, DISCLAIMER, hiringAreas, programmes } from "@/lib/careers";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";
import { useSiteSettings, whatsappUrl } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const placeNames = [...new Set(hiringAreas.flatMap((d) => [d.district, ...d.areas]))].sort();

// Nothing is stored on the site: the form opens WhatsApp with the details filled in, the candidate taps send.
function ApplyForm({ programme, onProgrammeChange }) {
  const t = useT();
  const id = useId().replace(/:/g, "");
  const { whatsappPhone, primaryPhone } = useSiteSettings();
  const [values, setValues] = useState({ name: "", mobile: "", city: "", detail: "" });
  const [errors, setErrors] = useState({});
  const [sentHref, setSentHref] = useState("");
  const onMainPage = Boolean(onProgrammeChange);

  const set = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((x) => ({ ...x, [key]: null }));
  };

  function onSubmit(e) {
    e.preventDefault();
    const mobile = cleanMobile(values.mobile);
    const next = {};
    if (values.name.trim().length < 2) next.name = "Please add your name.";
    if (!mobile) next.mobile = "Enter a 10-digit mobile number";
    if (values.city.trim().length < 2) next.city = "Please add your city or town.";
    if (values.detail.trim().length < 2) next.detail = "Please fill this in.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    const text = applicationMessage({
      programme,
      onMainPage,
      name: values.name.trim(),
      mobile: `+91 ${mobile}`,
      city: values.city.trim(),
      detail: values.detail.trim(),
    });
    const href = whatsappUrl(whatsappPhone || primaryPhone, text);
    window.open(href, "_blank", "noopener,noreferrer");
    setSentHref(href);
  }

  const error = (key) => errors[key] && <p className="text-xs font-medium text-destructive">{t(errors[key])}</p>;

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5">
      {onMainPage && (
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">{t("I am applying as")}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {programmes.map((p) => (
              <label
                key={p.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-brand/25",
                  p.slug === programme.slug ? "border-brand bg-brand-soft text-brand-ink" : "border-input hover:border-brand/40"
                )}
              >
                <input type="radio" name={`${id}-role`} value={p.slug} checked={p.slug === programme.slug} onChange={() => onProgrammeChange(p.slug)} className="sr-only" />
                {p.slug === programme.slug ? <Check weight="bold" className="size-4 shrink-0" /> : <span className="size-4 shrink-0 rounded-full border border-input" />}
                {t(p.role)}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            {t("Full name")}
          </label>
          <Input id={`${id}-name`} value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={120} aria-invalid={errors.name ? true : undefined} />
          {error("name")}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-mobile`} className="text-sm font-medium">
            {t("Mobile number")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[0.9375rem] text-muted-foreground">+91</span>
            <Input
              id={`${id}-mobile`}
              value={values.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/[^\d\s+-]/g, ""))}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={14}
              aria-invalid={errors.mobile ? true : undefined}
              className="pl-12 tabular-nums"
            />
          </div>
          {error("mobile")}
        </div>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-city`} className="text-sm font-medium">
          {t("City or town in MP")}
        </label>
        <Input id={`${id}-city`} value={values.city} onChange={(e) => set("city", e.target.value)} list={`${id}-places`} autoComplete="address-level2" maxLength={80} aria-invalid={errors.city ? true : undefined} />
        <datalist id={`${id}-places`}>
          {placeNames.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {error("city")}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-detail`} className="text-sm font-medium">
          {t(programme.field.label)}
        </label>
        <Input
          id={`${id}-detail`}
          value={values.detail}
          onChange={(e) => set("detail", e.target.value)}
          placeholder={t(programme.field.placeholder)}
          maxLength={200}
          aria-invalid={errors.detail ? true : undefined}
        />
        {error("detail")}
        {programme.formNote && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info weight="bold" className="mt-px size-3.5 shrink-0" /> {t(programme.formNote)}
          </p>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t(CONSENT)}{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
          {t("Privacy policy")}
        </Link>
      </p>
      <Button type="submit" size="lg" className="h-12 w-full sm:w-fit">
        <WhatsappLogo weight="fill" /> {t("Send on WhatsApp")}
      </Button>
      {sentHref && (
        <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-ink">
          {t("WhatsApp opens with your details filled in. Tap send to finish.")}{" "}
          <a href={sentHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline underline-offset-2">
            {t("Open WhatsApp again")} <ArrowSquareOut weight="bold" className="size-3.5" />
          </a>
        </p>
      )}
    </form>
  );
}

// Form plus the company details and disclaimer the sheet asks for on every careers page.
export default function CareersApply({ programme, onProgrammeChange, title }) {
  const t = useT();
  const { primary, secondary, contactEmail, emailHref } = useSiteSettings();
  return (
    <section id="apply" className="section scroll-mt-20 border-t border-border bg-secondary/50">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h2 className="display-2 max-w-[20ch]">{t(title)}</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{t("Fill in your details and send them to our team on WhatsApp in one tap.")}</p>
          <div className="mt-8 rounded-[1.75rem] border border-border bg-background p-5 shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)] sm:p-8">
            <ApplyForm programme={programme} onProgrammeChange={onProgrammeChange} />
          </div>
        </div>
        <aside className="lg:col-span-5 lg:pt-2">
          <h3 className="headline">{t("Talk to us")}</h3>
          <ul className="mt-6 grid gap-4 text-[0.9375rem]">
            <li className="flex gap-3">
              <Buildings weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand-ink" />
              <span>{site.legalName}</span>
            </li>
            <li className="flex gap-3">
              <MapPin weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand-ink" />
              <span>
                {t(careersOffice)} <span className="text-muted-foreground">({t("head office")})</span>
              </span>
            </li>
            {[primary, secondary].filter(Boolean).map((p) => (
              <li key={p.number} className="flex gap-3">
                <Phone weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand-ink" />
                <a href={p.href} className="tabular-nums hover:underline">
                  {p.display}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <EnvelopeSimple weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand-ink" />
              <a href={emailHref} className="hover:underline">
                {contactEmail}
              </a>
            </li>
          </ul>
          <p className="mt-8 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">{t(DISCLAIMER)}</p>
        </aside>
      </div>
    </section>
  );
}
