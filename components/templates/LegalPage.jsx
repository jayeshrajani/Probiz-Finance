import SiteLayout from "@/components/site/SiteLayout";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import CausticsBackground from "@/components/kokonutui/caustics-background";
import { useT } from "@/lib/i18n";

export default function LegalPage({ title, path, sections }) {
  const t = useT();
  const [head, ...rest] = sections;
  const effective = head?.paragraphs?.[0];

  return (
    <SiteLayout title={title} description={t("{title} for Probiz Finance (ProBiz Management Services Pvt. Ltd.).", { title: t(title) })} path={path}>
      <CausticsBackground as="h1" title={t(title)} className="min-h-[380px] text-foreground [--bg-light:#fff] [--bg-water:var(--brand-soft)]">
        <div className="grid justify-items-center gap-3">
          {effective && <p className="text-sm text-foreground/70">{t(effective)}</p>}
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        </div>
      </CausticsBackground>
      <article className="container-page max-w-3xl pt-6 pb-24">
        <div className="prose-legal">
          {rest.map((s, i) => (
            <section key={`${s.heading}-${i}`}>
              {s.heading && <h2>{t(s.heading)}</h2>}
              {s.paragraphs?.map((p) => (
                <p key={p}>{t(p)}</p>
              ))}
              {s.bullets?.length > 0 && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{t(b)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
