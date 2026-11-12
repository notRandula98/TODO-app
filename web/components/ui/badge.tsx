// Reusable shadcn badge for task statuses.
import { cn } from '@/lib/utils'
export function Badge({ className, ...props }: React.ComponentProps<'span'>) { return <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap', className)} {...props} />; }
