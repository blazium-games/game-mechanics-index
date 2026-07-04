import type { ReactNode } from 'react'
import { ShareSectionLink } from './ShareSectionLink'
import { HelpTooltip } from './HelpTooltip'

export function SectionHeading({
  sectionId,
  helpKey,
  children,
}: {
  sectionId: string
  helpKey?: string
  children: ReactNode
}) {
  return (
    <h2>
      {children}
      {helpKey && <HelpTooltip entryId={helpKey} />}
      <ShareSectionLink sectionId={sectionId} />
    </h2>
  )
}
