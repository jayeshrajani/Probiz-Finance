import { ChatCircleDots, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import Scene from "@/components/art/Scene";
import { openAssistant } from "@/components/assistant/events";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import DotField from "@/components/kokonutui/dot-field";
import ApplicationForm from "@/components/forms/ApplicationForm";
import SiteLayout from "@/components/site/SiteLayout";
import { site } from "@/lib/site";

const channels = [
  { Icon: Phone, label: "Call", value: site.phoneDisplay, href: site.phoneHref },
  { Icon: ChatCircleDots, label: "Chat", value: "Ask the Probiz assistant", onClick: () => openAssistant() },
  { Icon: EnvelopeSimple, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { Icon: MapPin, label: "Visit", value: site.address },
];

export default function ContactPage() {
  return (
    <SiteLayout title="Contact Us" description={`Call ${site.phoneDisplay}, email ${site.email} or visit us at ${site.address}.`} path="/contact">
      <DotField spacing={18} className="block min-h-0 bg-transparent text-brand/35">
      <section className="container-page relative pt-10 pb-20 text-foreground md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="display-1 max-w-[12ch] text-balance">We're a call away.</h1>
            <p className="lede mt-6 max-w-md">Questions about a loan, a policy or a document? Write to us and an advisor will get back to you.</p>
            <ul className="mt-10 grid gap-3">
              {channels.map(({ Icon, label, value, href, onClick }) => {
                const inner = (
                  <>
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                      <Icon weight="duotone" className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-muted-foreground">{label}</span>
                      <span className="block font-medium">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="flex items-center gap-4 rounded-2xl p-2 -m-2 transition-colors hover:bg-secondary">
                        {inner}
                      </a>
                    ) : onClick ? (
                      <button type="button" onClick={onClick} className="-m-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-2xl p-2 text-left transition-colors hover:bg-secondary">
                        {inner}
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Scene name="location" className="mt-10 hidden h-56 w-auto lg:block" />
          </div>
          <div className="lg:col-span-7">
            <ApplicationForm formKey="contact" productName="message" className="shadow-[0_24px_60px_-40px_oklch(0.21_0.006_286/0.35)]" />
          </div>
        </div>
      </section>
      </DotField>
      <section className="container-page pb-24">
        <iframe
          title="Probiz Finance office location"
          src={site.mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[420px] w-full rounded-[2rem] border border-border grayscale-[30%]"
        />
      </section>
    </SiteLayout>
  );
}
