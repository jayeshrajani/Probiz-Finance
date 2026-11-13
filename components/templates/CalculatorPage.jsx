import Scene from "@/components/art/Scene";
import ProductTile from "@/components/blocks/ProductTile";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import TopoBackground from "@/components/kokonutui/topo-background";
import SiteLayout from "@/components/site/SiteLayout";
import { tools } from "@/lib/catalog";

const SCENES = { eligibility: "calc", sipcalculator: "growth", idvcalculator: "motor" };

export default function CalculatorPage({ slug, title, description, headline, intro, children, note }) {
  const others = tools.filter((t) => !t.slug.startsWith(slug));

  return (
    <SiteLayout title={title} description={description} path={`/${slug}`}>
      <TopoBackground labels={false} className="block min-h-0 bg-transparent text-brand/70">
        <section className="relative text-foreground">
          <div className="container-page relative grid items-center gap-8 pt-10 md:pt-14 lg:grid-cols-12">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 lg:col-span-7">
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Calculators" }, { label: title }]} />
              <h1 className="display-page mt-6 max-w-[20ch] text-balance">{headline}</h1>
              <p className="lede mt-5 max-w-xl text-pretty">{intro}</p>
            </div>
            <Scene name={SCENES[slug] || "calc"} className="mx-auto hidden h-64 w-auto animate-in fade-in duration-1000 lg:col-span-5 lg:block" />
          </div>
        </section>
        <section className="container-page relative pt-10 pb-16 text-foreground">
          <div className="rounded-[2rem] border border-border bg-background p-6 shadow-[0_32px_80px_-48px_oklch(0.21_0.006_286/0.35)] sm:p-10">{children}</div>
          {note && <p className="mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">{note}</p>}
        </section>
      </TopoBackground>

      <section className="section border-t border-border">
        <div className="container-page">
          <h2 className="headline">More calculators</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {others.map((t) => (
              <ProductTile key={t.slug} item={t} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
