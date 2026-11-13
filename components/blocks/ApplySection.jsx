import { Phone } from "@phosphor-icons/react";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { site } from "@/lib/site";

const defaultNext = [
  "An advisor reviews your details and calls you to discuss your options.",
  "We compare offers from our partner banks and NBFCs.",
  "You choose. We handle the paperwork through to disbursal.",
];

export default function ApplySection({ id = "apply", title, intro, formKey, preset, productName, next, formTitle }) {
  const steps = next || defaultNext;
  return (
    <section id={id} className="section border-t border-border bg-secondary/50">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="display-2">{title}</h2>
            {intro && <p className="lede mt-4 max-w-sm">{intro}</p>}
            <ol className="mt-10 grid gap-6">
              {steps.map((line, i) => (
                <li key={line} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold tabular-nums shadow-[0_0_0_1px_var(--border)]">
                    {i + 1}
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{line}</p>
                </li>
              ))}
            </ol>
            <a href={site.phoneHref} className="mt-10 inline-flex items-center gap-3 rounded-full bg-background px-5 py-3 text-sm shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-accent">
              <Phone weight="duotone" className="size-5 text-brand-ink" />
              <span>
                Prefer to talk? <span className="font-semibold">{site.phoneDisplay}</span>
              </span>
            </a>
          </div>
        </div>
        <div className="lg:col-span-8">
          {formTitle && <h3 className="sr-only">{formTitle}</h3>}
          <ApplicationForm formKey={formKey} preset={preset} productName={productName} className="shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)]" />
        </div>
      </div>
    </section>
  );
}
