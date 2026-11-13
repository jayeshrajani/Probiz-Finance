import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/input";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "min-h-28 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export { Textarea };
