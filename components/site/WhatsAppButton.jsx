import { WhatsappLogo } from "@phosphor-icons/react";
import { useRouter } from "next/router";
import { productBySlug, serviceBySlug } from "@/lib/catalog";
import { useT } from "@/lib/i18n";
import { useSiteSettings, WHATSAPP_GREETING, WHATSAPP_PRODUCT, whatsappUrl } from "@/lib/site-settings";
import { useTyping } from "@/lib/use-typing";
import { cn } from "@/lib/utils";

// Bottom-left, opposite the assistant launcher; hidden when no WhatsApp number is configured.
// On a product or service page the message names that product.
export default function WhatsAppButton() {
  const t = useT();
  const { whatsappPhone } = useSiteSettings();
  const { asPath } = useRouter();
  const typing = useTyping();
  const slug = asPath.split(/[?#]/)[0].split("/")[1] || "";
  const item = productBySlug[slug] || serviceBySlug[slug];
  const whatsappHref = whatsappUrl(whatsappPhone, item ? t(WHATSAPP_PRODUCT, { name: t(item.name) }) : t(WHATSAPP_GREETING));
  if (!whatsappHref) return null;
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat with Probiz Finance on WhatsApp")}
      title={t("Chat on WhatsApp")}
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-foreground text-[#25D366] shadow-[0_18px_40px_-16px_oklch(0.21_0.006_286/0.6)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] sm:bottom-5 sm:left-5",
        typing && "max-sm:hidden"
      )}
    >
      <WhatsappLogo weight="fill" className="size-7" />
    </a>
  );
}
