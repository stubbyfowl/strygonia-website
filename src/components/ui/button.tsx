import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ark-btn)] text-white shadow-md hover:bg-[var(--ark-btn-hover)] hover:shadow-lg active:scale-[0.98]",
        outline:
          "border-2 border-[var(--ark-line)] bg-transparent text-[var(--ark-ink)] hover:bg-[var(--ark-ink)]/5 active:scale-[0.98]",
        ghost:
          "text-[var(--ark-ink-dim)] hover:bg-[var(--ark-ink)]/5 hover:text-[var(--ark-ink)]",
        light:
          "border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:scale-[0.98]",
        link: "text-[var(--ark-signal)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm rounded-full",
        sm: "h-9 px-4 text-xs rounded-full",
        lg: "h-14 px-10 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
