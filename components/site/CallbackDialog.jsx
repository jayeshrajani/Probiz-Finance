"use client";

import { useEffect, useState } from "react";
import QuickLead from "@/components/blocks/QuickLead";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CALLBACK_EVENT } from "@/lib/callback";
import { useT } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

const TOPICS = ["Home loan", "Business loan", "Personal loan", "Loan against property", "Insurance", "Investments", "Something else"];

// One dialog for the whole site, opened by openCallback() from the header, menus and pages.
export default function CallbackDialog() {
  const t = useT();
  const { primary } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState(null);

  useEffect(() => {
    const onOpen = (e) => {
      setInterest(e.detail?.interest || null);
      setOpen(true);
    };
    window.addEventListener(CALLBACK_EVENT, onOpen);
    return () => window.removeEventListener(CALLBACK_EVENT, onOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md sm:p-7">
        <DialogHeader>
          <DialogTitle className="headline text-2xl">{t("Get a free callback")}</DialogTitle>
          <DialogDescription>
            {t("Leave your name and number and an advisor will call you back.")}{" "}
            {t("Or call us now on {phone}.", { phone: primary.display })}
          </DialogDescription>
        </DialogHeader>
        {open && <QuickLead key={interest || "any"} interest={interest || ""} topics={interest ? null : TOPICS} autoFocus />}
      </DialogContent>
    </Dialog>
  );
}
