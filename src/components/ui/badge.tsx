import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-600 text-white",
        secondary: "border-transparent bg-gray-200 text-gray-800",
        destructive: "border-transparent bg-red-600 text-white",
        outline: "text-gray-700 border-gray-300",
        glass: "border-white/30 bg-white/20 text-white backdrop-blur-sm",
        glassDark: "border-white/20 bg-black/30 text-white backdrop-blur-sm",
        glassBlue:
          "border-blue-400/30 bg-blue-500/20 text-blue-100 backdrop-blur-sm",
        glassGreen:
          "border-green-400/30 bg-green-500/20 text-green-100 backdrop-blur-sm",
        glassYellow:
          "border-yellow-400/30 bg-yellow-500/20 text-yellow-100 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
