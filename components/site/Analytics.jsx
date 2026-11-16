import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { CONSENT_EVENT, GA_ID, gaConfigured, getConsent, setConsent, track, trackPageView } from "@/lib/analytics";
import { useT } from "@/lib/i18n";

// Contact links are tracked by type only; the number or address itself is never sent.
function linkEvent(href) {
  if (href.startsWith("tel:")) return "phone_click";
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return "whatsapp_click";
  if (href.startsWith("mailto:")) return "email_click";
  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps/.test(href)) return "map_click";
  return null;
}

export default function Analytics() {
  const router = useRouter();
  const t = useT();
  const [consent, setConsentState] = useState(undefined);

  useEffect(() => {
    if (!gaConfigured) return;
    setConsentState(getConsent());
    const onChange = (e) => setConsentState(e.detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!gaConfigured) return;
    window[`ga-disable-${GA_ID}`] = consent !== "granted";
    if (consent !== "granted") return;

    if (typeof window.gtag !== "function") {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { send_page_view: false });
    }
    trackPageView();

    const onClick = (e) => {
      const name = linkEvent(e.target.closest?.("a[href]")?.getAttribute("href") || "");
      if (name) track(name);
    };
    router.events.on("routeChangeComplete", trackPageView);
    document.addEventListener("click", onClick, true);
    return () => {
      router.events.off("routeChangeComplete", trackPageView);
      document.removeEventListener("click", onClick, true);
    };
  }, [consent, router.events]);

  if (!gaConfigured) return null;
  return (
    <>
      {consent === "granted" && <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />}
      {consent === null && (
        <div
          role="region"
          aria-label={t("Analytics cookies")}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-background p-4 shadow-[0_24px_60px_-30px_oklch(0.21_0.006_286/0.45)] sm:bottom-5"
        >
          <p className="text-sm leading-relaxed">
            {t("May we use Google Analytics cookies to see how visitors use this site? It helps us improve it, and no names, phone numbers or emails are sent.")}{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2">
              {t("Privacy policy")}
            </Link>
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setConsent("denied")}>
              {t("No thanks")}
            </Button>
            <Button size="sm" onClick={() => setConsent("granted")}>
              {t("Allow")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
