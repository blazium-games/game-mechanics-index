import type { ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="chart-card">
      <h2>{title}</h2>
      {description && <p className="meta">{description}</p>}
      <div className="chart-body">{children}</div>
      {footer}
    </section>
  )
}
