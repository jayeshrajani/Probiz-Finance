"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CheckCircle, ImageSquare, SpinnerGap, WarningCircle, X } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import FormField from "@/components/forms/FormField";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { errorMessage, postForm } from "@/lib/api";
import { PROPERTY_SECTIONS, propertyErrors, visibleFields } from "@/lib/property";
import { useStoredUser } from "@/lib/use-user";
import { useT } from "@/lib/i18n";
import { localeProps } from "@/lib/i18n-static";

export const getStaticProps = localeProps;

const MAX_UPLOAD = 4.4 * 1024 * 1024;
const sections = PROPERTY_SECTIONS;
const visible = visibleFields;

const ownerDefaults = (user) => ({ ownerName: user?.user_Name || "", contactNo: user?.mobile_no || "" });

export default function AddPropertyPage() {
  const t = useT();
  const user = useStoredUser();
  const router = useRouter();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const total = images.reduce((s, f) => s + f.size, 0);
  const tooLarge = total > MAX_UPLOAD;

  // The account already has the owner's name and mobile; don't ask for them again.
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({ ...v, ...Object.fromEntries(Object.entries(ownerDefaults(user)).filter(([k]) => !v[k])) }));
  }, [user]);

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = propertyErrors(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`property-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    if (tooLarge) return;

    const fd = new FormData();
    for (const s of sections) {
      for (const f of visible(s.fields, values)) {
        const val = String(values[f.name] ?? "").trim();
        if (val) fd.append(f.name, val);
      }
    }
    images.forEach((img) => fd.append("propertyImage", img));

    setStatus("submitting");
    setSubmitError(null);
    const res = await postForm("addProperty", fd);
    if (res.ok) {
      setStatus("done");
      window.scrollTo({ top: 0 });
    } else {
      setStatus("idle");
      setSubmitError(errorMessage(res.data));
    }
  }

  if (user === undefined) {
    return (
      <SiteLayout title="List Your Property" path="/add-product" noindex>
        <section className="min-h-[60dvh]" />
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout title="List Your Property" path="/add-product" noindex>
        <section className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
          <h1 className="display-2 max-w-lg">{t("Sign in to list your property.")}</h1>
          <p className="lede mt-4 max-w-md">{t("Listings are linked to an account so buyers reach the right owner.")}</p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link href="/sign-in?next=/add-product">{t("Sign in")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up?next=/add-product">{t("Create an account")}</Link>
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (status === "done") {
    return (
      <SiteLayout title="List Your Property" path="/add-product" noindex>
        <section className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
          <CheckCircle weight="fill" className="size-14 text-brand" />
          <h1 className="display-2 mt-6 max-w-lg">{t("Your property is listed.")}</h1>
          <p className="lede mt-4 max-w-md">{t("Buyers can now find it in our listings.")}</p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={() => router.push("/property")}>
              {t("See listings")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => { setValues(ownerDefaults(user)); setImages([]); setStatus("idle"); }}>
              {t("List another")}
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title="List Your Property" path="/add-product" noindex>
      <section className="container-page max-w-4xl pt-10 pb-24 md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Property", href: "/property" }, { label: "List your property" }]} />
        <h1 className="display-2 mt-6">{t("List your property.")}</h1>
        <p className="lede mt-4 max-w-xl">{t("Add the details buyers ask about first. Good photos make the biggest difference.")}</p>

        <form onSubmit={onSubmit} noValidate className="mt-12 grid gap-12">
          {sections.map((s) => (
            <fieldset key={s.title} className="grid gap-x-4 gap-y-5 border-t border-border pt-8 sm:grid-cols-2">
              <legend className="headline mb-6 text-xl">{t(s.title)}</legend>
              {visible(s.fields, values).map((f) => (
                <FormField key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={setValue} idPrefix="property" />
              ))}
            </fieldset>
          ))}

          <fieldset className="border-t border-border pt-8">
            <legend className="headline mb-6 text-xl">{t("Photos")}</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input px-4 py-4 hover:bg-secondary">
              <ImageSquare weight="duotone" className="size-6 text-muted-foreground" />
              <span>
                <span className="block text-sm font-medium">{t("Add photos")}</span>
                <span className="block text-xs text-muted-foreground">{t("Up to 10, JPG or PNG")}</span>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="sr-only"
                onChange={(e) => {
                  // Copy before clearing: the updater runs after e.target.value is reset.
                  const picked = Array.from(e.target.files || []);
                  setImages((cur) => [...cur, ...picked].slice(0, 10));
                  e.target.value = "";
                }}
              />
            </label>
            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img, i) => (
                  <li key={`${img.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                    <img src={URL.createObjectURL(img)} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))}
                      aria-label={t("Remove {name}", { name: img.name })}
                      className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow"
                    >
                      <X weight="bold" className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={tooLarge ? "mt-3 text-xs font-medium text-destructive" : "mt-3 text-xs text-muted-foreground"}>
              {tooLarge ? t("Photos are over the 4.4 MB limit. Remove some or compress them.") : t("Up to 4.4 MB in total.")}
            </p>
          </fieldset>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
              {t(submitError)}
            </p>
          )}

          <div className="flex justify-end border-t border-border pt-8">
            <Button type="submit" size="lg" disabled={status === "submitting" || tooLarge}>
              {status === "submitting" ? (
                <>
                  <SpinnerGap className="animate-spin" /> {t("Publishing")}
                </>
              ) : (
                t("Publish listing")
              )}
            </Button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
