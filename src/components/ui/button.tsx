import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 rounded-xl",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "py-4 px-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg backdrop-blur-md",
        glassSecondary: "py-4 px-8 rounded-2xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 font-medium text-lg",
        glassAccent: "py-4 px-8 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg backdrop-blur-md",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
        glassDefault: "py-4 px-8",
        glassLg: "py-5 px-10",
        glassSm: "py-3 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };

// Glass morphism specific button components
export const GlassButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    variant?: "primary" | "secondary" | "accent";
    size?: "sm" | "default" | "lg";
    asChild?: boolean;
  }
>(({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
  const glassVariantMap = {
    primary: "glass",
    secondary: "glassSecondary",
    accent: "glassAccent",
  } as const;

  const glassSizeMap = {
    sm: "glassSm",
    default: "glassDefault",
    lg: "glassLg",
  } as const;

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({
          variant: glassVariantMap[variant],
          size: glassSizeMap[size]
        }),
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

GlassButton.displayName = "GlassButton";