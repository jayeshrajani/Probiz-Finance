export const PROPERTY_TYPES = ["Flat", "Row House", "Bunglow", "Plot", "Farm House", "Pent House", "Commercial Property", "Agriculture Land"];

export const TYPE_LABELS = { Bunglow: "Bungalow", "Pent House": "Penthouse" };

export const typeLabel = (t) => TYPE_LABELS[t] || t;

export const firstImage = (p) => (Array.isArray(p.propertyImage) ? p.propertyImage[0] : p.propertyImage) || null;

export const hasValue = (v) => v !== undefined && v !== null && v !== "" && v !== "0" && v !== 0;
