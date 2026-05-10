import React, { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-wider",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-sui-accent text-sui-dark shadow-[0_0_10px_rgba(0,255,153,0.3)]",
                secondary:
                    "border-transparent bg-surface-secondary text-foreground-secondary dark:bg-white/20 dark:text-white",
                destructive:
                    "border-transparent bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-500",
                outline: "text-foreground border-[var(--border-default)] dark:border-white/20",
                glass: "bg-white/10 border-white/10 backdrop-blur-sm dark:bg-white/10 dark:border-white/10",
                success: "border-transparent bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-500",
                blue: "border-transparent bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
                purple: "border-transparent bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
                orange: "border-transparent bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={twMerge(clsx(badgeVariants({ variant }), className))} {...props} />
    );
}

export { Badge, badgeVariants };
