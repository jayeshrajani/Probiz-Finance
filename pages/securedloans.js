import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import ProductTile from "@/components/blocks/ProductTile";
import SiteLayout from "@/components/site/SiteLayout";
import { products } from "@/lib/catalog";

const groups = [
  { key: "property", title: "Home and property", intro: "Buy, build, renovate or borrow against property." },
  { key: "personal", title: "Personal", intro: "Unsecured loans, vehicles, education, gold and cards." },
  { key: "business", title: "Business and farm", intro: "Working capital, project finance and government schemes." },
];

export default function LoansPage() {
  return (
    <SiteLayout title="All Loans" description="Every loan Probiz Finance arranges: home, property, personal, business, car, gold, education and farm loans." path="/securedloans">
      <section className="container-page pt-10 pb-8 md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Loans" }]} />
        <h1 className="display-1 mt-6 max-w-[16ch] text-balance">Every loan, one advisor.</h1>
        <p className="lede mt-5 max-w-xl">Twenty kinds of loans from partner banks and NBFCs, compared and applied for with help from our team.</p>
      </section>
      {groups.map((g) => (
        <section key={g.key} className="container-page border-t border-border py-14 first-of-type:border-t-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 className="headline">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.intro}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
              {products
                .filter((p) => p.group === g.key && !p.hidden)
                .map((p) => (
                  <ProductTile key={p.slug} item={p} blurb={p.headline} />
                ))}
            </div>
          </div>
        </section>
      ))}
    </SiteLayout>
  );
}
