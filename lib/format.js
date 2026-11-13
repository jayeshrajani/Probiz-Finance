const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatINR = (value) => `₹${inr.format(Math.round(Number(value) || 0))}`;

// 12,50,000 -> "₹12.5 L", 2,40,00,000 -> "₹2.4 Cr"
export function formatINRShort(value) {
  const n = Number(value) || 0;
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  return formatINR(n);
}

const trim = (n) => (Math.round(n * 100) / 100).toString();

export function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function principalForEmi(monthlyEmi, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (!monthlyEmi || !months) return 0;
  if (r === 0) return monthlyEmi * months;
  const f = Math.pow(1 + r, months);
  return (monthlyEmi * (f - 1)) / (r * f);
}

export function sipFutureValue(monthly, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}
