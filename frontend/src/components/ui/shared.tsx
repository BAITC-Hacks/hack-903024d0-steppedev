import type { ReactNode } from 'react'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cn('panel', className)}>{children}</section>
}
export function PanelHeading({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#e2e8ee]">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-[11px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
export function Badge({
  children,
  tone = 'green',
  dot = false,
}: {
  children: ReactNode
  tone?: 'green' | 'amber' | 'blue' | 'gray' | 'red'
  dot?: boolean
}) {
  return (
    <span className={cn('badge', `badge-${tone}`)}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  )
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-[#8debbf]"
      onClick={onClick}
    >
      {children}
      <ArrowUpRight size={13} />
    </button>
  )
}
export function LoadingState({ label = 'Receiving weather data…' }: { label?: string }) {
  return (
    <div role="status" className="space-y-5">
      <div className="flex items-center gap-3 text-sm text-emerald-300">
        <LoaderCircle size={18} className="animate-spin" />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-[#17222c]" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-[#17222c]" />
    </div>
  )
}
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted">
      <Check size={13} className="text-emerald-300" />
      {children}
    </span>
  )
}
