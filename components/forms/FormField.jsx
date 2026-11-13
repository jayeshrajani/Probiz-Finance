"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const optionValue = (o) => (typeof o === "string" ? o : o.value);
const optionLabel = (o) => (typeof o === "string" ? o : o.label);

export default function FormField({ field, value, error, onChange, idPrefix }) {
  const id = `${idPrefix}-${field.name}`;
  const describedBy = [field.help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    value: value ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    required: field.required,
    onChange: (e) => onChange(field.name, field.uppercase ? e.target.value.toUpperCase() : e.target.value),
  };

  let control;
  if (field.type === "select") {
    control = (
      <NativeSelect {...common}>
        <option value="" disabled>
          Select
        </option>
        {field.options.map((o) => (
          <option key={optionValue(o)} value={optionValue(o)}>
            {optionLabel(o)}
          </option>
        ))}
      </NativeSelect>
    );
  } else if (field.type === "textarea") {
    control = <Textarea {...common} rows={4} />;
  } else {
    control = (
      <Input
        {...common}
        type={field.type === "tel" ? "tel" : field.type}
        inputMode={field.inputMode || (field.type === "tel" ? "numeric" : undefined)}
        autoComplete={field.autoComplete}
        maxLength={field.type === "tel" ? 10 : field.maxLength}
        min={field.type === "number" ? 0 : undefined}
        max={field.type === "date" && field.name.toLowerCase().includes("birth") ? new Date().toISOString().slice(0, 10) : undefined}
      />
    );
  }

  return (
    <div className={cn("grid content-start gap-2", field.half ? "sm:col-span-1" : "sm:col-span-2")}>
      <label htmlFor={id} className="text-sm font-medium">
        {field.label}
        {!field.required && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </label>
      {control}
      {field.help && !error && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
