import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useT } from "@/lib/i18n";

export default function Faq({ items, title = "Questions people ask.", aside }) {
  const t = useT();
  return (
    <section className="section border-t border-border">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display-2 max-w-sm">{t(title)}</h2>
          {aside}
        </div>
        <Accordion type="single" collapsible defaultValue="0" className="lg:col-span-8">
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={String(i)}>
              <AccordionTrigger className="py-6 text-lg font-semibold tracking-[-0.015em]">{t(item.q)}</AccordionTrigger>
              <AccordionContent className="max-w-2xl text-base">{t(item.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
