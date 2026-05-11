import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sui-accent disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                primary:
                    "bg-sui-accent text-sui-dark shadow-[0_0_15px_rgba(0,255,153,0.3)] hover:shadow-[0_0_25px_rgba(0,255,153,0.5)] hover:bg-sui-accent-light border border-transparent",
                secondary:
                    "bg-white/10 text-white hover:bg-white/20 border border-white/10",
                outline:
                    "border border-sui-accent/50 text-sui-accent hover:bg-sui-accent/10 hover:border-sui-accent",
                ghost: "hover:bg-white/10 text-white",
                glass:
                    "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-sui-accent/50",
                danger:
                    "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
                neutral:
                    "bg-surface-secondary text-foreground border border-[var(--border-default)] hover:bg-[var(--border-default)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={twMerge(clsx(buttonVariants({ variant, size, className })))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
