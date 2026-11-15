import { WhatsappLogo } from "@phosphor-icons/react";
import { useSiteSettings } from "@/lib/site-settings";
import { useTyping } from "@/lib/use-typing";
import { cn } from "@/lib/utils";

// Bottom-left, opposite the assistant launcher; hidden when no WhatsApp number is configured.
export default function WhatsAppButton() {
  const { whatsappHref } = useSiteSettings();
  const typing = useTyping();
  if (!whatsappHref) return null;
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Probiz Finance on WhatsApp"
      title="Chat on WhatsApp"
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-foreground text-[#25D366] shadow-[0_18px_40px_-16px_oklch(0.21_0.006_286/0.6)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] sm:bottom-5 sm:left-5",
        typing && "max-sm:hidden"
      )}
    >
      <WhatsappLogo weight="fill" className="size-7" />
    </a>
  );
}
