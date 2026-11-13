"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { CheckCircle, ImageSquare, SpinnerGap, VideoCamera, WarningCircle, X } from "@phosphor-icons/react";
import Breadcrumbs from "@/components/blocks/Breadcrumbs";
import FormField from "@/components/forms/FormField";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { errorMessage, postForm } from "@/lib/api";
import { PROPERTY_TYPES, typeLabel } from "@/lib/property";
import { useStoredUser } from "@/lib/use-user";

const MAX_UPLOAD = 4.4 * 1024 * 1024;
const BUILT = ["Flat", "Row House", "Bunglow", "Farm House", "Pent House", "Commercial Property"];
const nums = ["1", "2", "3", "4", "5", "6"];

const sections = [
  {
    title: "Property",
    fields: [
      { name: "propertyName", label: "Listing title", type: "text", required: true, help: "For example, 3 BHK flat in Vijay Nagar" },
      { name: "propertyType", label: "Type", type: "select", required: true, half: true, options: PROPERTY_TYPES.map((t) => ({ value: t, label: typeLabel(t) })) },
      { name: "price", label: "Asking price (₹)", type: "number", required: true, half: true, inputMode: "numeric" },
      { name: "bhk_of_house", label: "Configuration", type: "select", half: true, options: ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK"], showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "buildUpArea", label: "Built-up area (sq ft)", type: "number", half: true, inputMode: "numeric", showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "carpetArea", label: "Carpet area (sq ft)", type: "number", half: true, inputMode: "numeric", showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "plotArea", label: "Plot area (sq ft)", type: "number", half: true, inputMode: "numeric" },
      { name: "houseFacing", label: "Facing", type: "select", half: true, options: ["North", "South", "East", "West"] },
      { name: "furnishingStatus", label: "Furnishing", type: "select", half: true, options: ["Furnished", "Semi-Furnished", "Unfurnished"], showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "bathrooms", label: "Bathrooms", type: "select", half: true, options: nums, showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "numberOfBalconies", label: "Balconies", type: "select", half: true, options: nums, showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "construction_year", label: "Year built", type: "number", half: true, inputMode: "numeric", maxLength: 4, showIf: (v) => BUILT.includes(v.propertyType) },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    title: "Location",
    fields: [
      { name: "address", label: "Address", type: "text", required: true, autoComplete: "street-address" },
      { name: "area", label: "Area or locality", type: "text", half: true },
      { name: "city", label: "City", type: "text", required: true, half: true, autoComplete: "address-level2" },
      { name: "state", label: "State", type: "text", required: true, half: true, autoComplete: "address-level1" },
    ],
  },
  {
    title: "Owner",
    fields: [
      { name: "ownerName", label: "Owner's name", type: "text", required: true, half: true, autoComplete: "name" },
      { name: "contactNo", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
    ],
  },
];

const visible = (fields, v) => fields.filter((f) => !f.showIf || f.showIf(v));

export default function AddPropertyPage() {
  const user = useStoredUser();
  const router = useRouter();
  const [values, setValues] = useState({ city: "Indore", state: "Madhya Pradesh" });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const total = images.reduce((s, f) => s + f.size, 0) + (video?.size || 0);
  const tooLarge = total > MAX_UPLOAD;

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    for (const s of sections) {
      for (const f of visible(s.fields, values)) {
        const val = String(values[f.name] ?? "").trim();
        if (f.required && !val) errs[f.name] = "Required";
        else if (f.type === "tel" && val && !/^[6-9]\d{9}$/.test(val)) errs[f.name] = "Enter a 10-digit mobile number";
      }
    }
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
    if (video) fd.append("propertyVideo", video);

    setStatus("submitting");
    setSubmitError(null);
    const res = await postForm("addProperty", fd);
    if (res.ok) setStatus("done");
    else {
      setStatus("idle");
      setSubmitError(errorMessage(res.data));
    }
  }

  if (!user) {
    return (
      <SiteLayout title="List Your Property" path="/add-product">
        <section className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
          <h1 className="display-2 max-w-lg">Sign in to list your property.</h1>
          <p className="lede mt-4 max-w-md">Listings are linked to an account so buyers reach the right owner.</p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link href="/sign-in?next=/add-product">Sign in</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Create an account</Link>
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (status === "done") {
    return (
      <SiteLayout title="List Your Property" path="/add-product">
        <section className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
          <CheckCircle weight="fill" className="size-14 text-brand" />
          <h1 className="display-2 mt-6 max-w-lg">Your property is listed.</h1>
          <p className="lede mt-4 max-w-md">Buyers can now find it in our listings.</p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={() => router.push("/property")}>
              See listings
            </Button>
            <Button size="lg" variant="outline" onClick={() => { setValues({ city: "Indore", state: "Madhya Pradesh" }); setImages([]); setVideo(null); setStatus("idle"); }}>
              List another
            </Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title="List Your Property" path="/add-product">
      <section className="container-page max-w-4xl pt-10 pb-24 md:pt-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Property", href: "/property" }, { label: "List your property" }]} />
        <h1 className="display-2 mt-6">List your property.</h1>
        <p className="lede mt-4 max-w-xl">Add the details buyers ask about first. Good photos make the biggest difference.</p>

        <form onSubmit={onSubmit} noValidate className="mt-12 grid gap-12">
          {sections.map((s) => (
            <fieldset key={s.title} className="grid gap-x-4 gap-y-5 border-t border-border pt-8 sm:grid-cols-2">
              <legend className="headline mb-6 text-xl">{s.title}</legend>
              {visible(s.fields, values).map((f) => (
                <FormField key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={setValue} idPrefix="property" />
              ))}
            </fieldset>
          ))}

          <fieldset className="border-t border-border pt-8">
            <legend className="headline mb-6 text-xl">Photos and video</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input px-4 py-4 hover:bg-secondary">
                <ImageSquare weight="duotone" className="size-6 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium">Add photos</span>
                  <span className="block text-xs text-muted-foreground">Up to 10, JPG or PNG</span>
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    setImages((cur) => [...cur, ...Array.from(e.target.files || [])].slice(0, 10));
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input px-4 py-4 hover:bg-secondary">
                <VideoCamera weight="duotone" className="size-6 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium">{video ? video.name : "Add a video"}</span>
                  <span className="block text-xs text-muted-foreground">One MP4, optional</span>
                </span>
                <input type="file" accept="video/mp4" className="sr-only" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
              </label>
            </div>
            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img, i) => (
                  <li key={`${img.name}-${i}`} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                    <img src={URL.createObjectURL(img)} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))}
                      aria-label={`Remove ${img.name}`}
                      className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow"
                    >
                      <X weight="bold" className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={tooLarge ? "mt-3 text-xs font-medium text-destructive" : "mt-3 text-xs text-muted-foreground"}>
              {tooLarge ? "Files are over the 4.4 MB limit. Remove some photos or compress them." : "Up to 4.4 MB in total."}
            </p>
          </fieldset>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
              {submitError}
            </p>
          )}

          <div className="flex justify-end border-t border-border pt-8">
            <Button type="submit" size="lg" disabled={status === "submitting" || tooLarge}>
              {status === "submitting" ? (
                <>
                  <SpinnerGap className="animate-spin" /> Publishing
                </>
              ) : (
                "Publish listing"
              )}
            </Button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
