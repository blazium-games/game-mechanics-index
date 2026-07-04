import type { ReactNode } from 'react'
import { HelpTooltip } from './HelpTooltip'

export function FieldLabel({
  entryId,
  children,
  inline,
}: {
  entryId: string
  children: ReactNode
  inline?: boolean
}) {
  const Tag = inline ? 'span' : 'div'
  return (
    <Tag className="field-label">
      <span className="field-label-text">{children}</span>
      <HelpTooltip entryId={entryId} label={typeof children === 'string' ? `Help: ${children}` : undefined} />
    </Tag>
  )
}

export function MetaField({
  entryId,
  label,
  value,
}: {
  entryId: string
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <span className="meta-field">
      <FieldLabel entryId={entryId} inline>
        {label}
      </FieldLabel>
      : {value}
    </span>
  )
}
