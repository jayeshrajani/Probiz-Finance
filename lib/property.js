export const PROPERTY_TYPES = ["Flat", "Row House", "Bunglow", "Plot", "Farm House", "Pent House", "Commercial Property", "Agriculture Land"];

export const TYPE_LABELS = { Bunglow: "Bungalow", "Pent House": "Penthouse" };

export const typeLabel = (t) => TYPE_LABELS[t] || t;

export const firstImage = (p) => (Array.isArray(p.propertyImage) ? p.propertyImage[0] : p.propertyImage) || null;

export const hasValue = (v) => v !== undefined && v !== null && v !== "" && v !== "0" && v !== 0;

const BUILT = ["Flat", "Row House", "Bunglow", "Farm House", "Pent House", "Commercial Property"];
const builtOnly = (v) => BUILT.includes(v.propertyType);
const nums = ["1", "2", "3", "4", "5", "6"];

// Shared by the public listing form and the admin editor.
export const PROPERTY_SECTIONS = [
  {
    title: "Property",
    fields: [
      { name: "propertyName", label: "Listing title", type: "text", required: true, help: "For example, 3 BHK flat with covered parking" },
      { name: "propertyType", label: "Type", type: "select", required: true, half: true, options: PROPERTY_TYPES.map((type) => ({ value: type, label: typeLabel(type) })) },
      { name: "price", label: "Asking price (₹)", type: "number", required: true, half: true, inputMode: "numeric" },
      { name: "bhk_of_house", label: "Configuration", type: "select", half: true, options: ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK"], showIf: builtOnly },
      { name: "buildUpArea", label: "Built-up area (sq ft)", type: "number", half: true, inputMode: "numeric", showIf: builtOnly },
      { name: "carpetArea", label: "Carpet area (sq ft)", type: "number", half: true, inputMode: "numeric", showIf: builtOnly },
      { name: "plotArea", label: "Plot area (sq ft)", type: "number", half: true, inputMode: "numeric" },
      { name: "houseFacing", label: "Facing", type: "select", half: true, options: ["North", "South", "East", "West"] },
      { name: "furnishingStatus", label: "Furnishing", type: "select", half: true, options: ["Furnished", "Semi-Furnished", "Unfurnished"], showIf: builtOnly },
      { name: "bathrooms", label: "Bathrooms", type: "select", half: true, options: nums, showIf: builtOnly },
      { name: "numberOfBalconies", label: "Balconies", type: "select", half: true, options: nums, showIf: builtOnly },
      { name: "construction_year", label: "Year built", type: "number", half: true, inputMode: "numeric", maxLength: 4, showIf: builtOnly },
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

export const visibleFields = (fields, values) => fields.filter((f) => !f.showIf || f.showIf(values));

export function propertyErrors(values) {
  const errs = {};
  for (const s of PROPERTY_SECTIONS) {
    for (const f of visibleFields(s.fields, values)) {
      const val = String(values[f.name] ?? "").trim();
      if (f.required && !val) errs[f.name] = "Required";
      else if (f.type === "tel" && val && !/^[6-9]\d{9}$/.test(val)) errs[f.name] = "Enter a 10-digit mobile number";
    }
  }
  return errs;
}
