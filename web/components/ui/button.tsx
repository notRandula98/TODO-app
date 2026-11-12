// Reusable shadcn button with interaction styles.
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:pointer-events-none disabled:opacity-50', { variants: { variant: { default: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm', outline: 'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700', ghost: 'hover:bg-zinc-100 text-zinc-500', destructive: 'bg-red-600 text-white hover:bg-red-700' }, size: { default: 'h-10 px-4', sm: 'h-8 px-3', icon: 'h-9 w-9' } }, defaultVariants: { variant: 'default', size: 'default' } });
export function Button({ className, variant, size, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) { return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />; }
