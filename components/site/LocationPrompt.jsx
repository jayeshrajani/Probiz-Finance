import { useEffect, useState } from "react";
import { MapPin, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CONSENT_EVENT, gaConfigured, getConsent } from "@/lib/analytics";
import { useT } from "@/lib/i18n";
import { declineLocation, declinedLocation, detectLocation, savedLocation } from "@/lib/location";

const FRESH_KEY = "probiz:location-fresh";

// Asks once, with our own card first: browsers only show their permission prompt after the visitor taps Allow.
export default function LocationPrompt() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator) || declinedLocation()) return;
    let cancelled = false;
    let timer;
    const show = () => {
      timer = setTimeout(() => !cancelled && setOpen(true), 3000);
    };
    // Don't stack on top of the analytics cookie card.
    const onConsent = () => {
      window.removeEventListener(CONSENT_EVENT, onConsent);
      show();
    };

    (async () => {
      let state = "prompt";
      try {
        state = (await navigator.permissions.query({ name: "geolocation" })).state;
      } catch {
        // Older Safari: no Permissions API, treat as not asked yet.
      }
      if (cancelled || state === "denied") return;
      if (state === "granted") {
        // Already allowed: refresh quietly once per visit, in case they moved.
        try {
          if (window.sessionStorage.getItem(FRESH_KEY)) return;
          window.sessionStorage.setItem(FRESH_KEY, "1");
        } catch {
          // Private mode: refresh anyway.
        }
        detectLocation().catch(() => {});
        return;
      }
      if (savedLocation()) return;
      if (gaConfigured && getConsent() === null) window.addEventListener(CONSENT_EVENT, onConsent);
      else show();
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, []);

  async function allow() {
    setBusy(true);
    try {
      const loc = await detectLocation();
      toast.success(t("Location set to {place}. You can change it on any form.", { place: loc.label }));
    } catch (e) {
      if (e?.code === 1) declineLocation();
      toast(t("We couldn't get your location. You can type your city on the form instead."));
    }
    setBusy(false);
    setOpen(false);
  }

  function dismiss() {
    declineLocation();
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div
      role="region"
      aria-label={t("Share your location")}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-border bg-background p-4 shadow-[0_24px_60px_-30px_oklch(0.21_0.006_286/0.45)] sm:bottom-5"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <MapPin weight="fill" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{t("Use your location?")}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {t("We'll fill in your city on our forms so you type less. You can always change it.")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={dismiss} disabled={busy}>
          {t("Not now")}
        </Button>
        <Button size="sm" onClick={allow} disabled={busy}>
          {busy && <SpinnerGap className="animate-spin" />}
          {t("Allow location")}
        </Button>
      </div>
    </div>
  );
}
