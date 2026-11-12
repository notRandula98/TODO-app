// LLM: Reusable shadcn table primitives for task data.
import * as React from 'react'
import { cn } from '@/lib/utils'
export function Table({ className, ...props }: React.ComponentProps<'table'>) { return <div className="overflow-x-auto"><table className={cn('w-full caption-bottom text-sm', className)} {...props} /></div>; }
export function TableHeader(props: React.ComponentProps<'thead'>) { return <thead className="bg-zinc-50/80 text-xs text-zinc-500" {...props} />; }
export function TableBody(props: React.ComponentProps<'tbody'>) { return <tbody {...props} />; }
export function TableRow(props: React.ComponentProps<'tr'>) { return <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60" {...props} />; }
export function TableHead(props: React.ComponentProps<'th'>) { return <th className="h-11 px-5 text-left font-medium whitespace-nowrap" {...props} />; }
export function TableCell(props: React.ComponentProps<'td'>) { return <td className="px-5 py-5" {...props} />; }
