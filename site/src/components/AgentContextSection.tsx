import type { AgentContext } from '../types'
import { SectionHeading } from './SectionHeading'

export function AgentContextSection({
  ctx,
  sectionId = 'agent-context',
}: {
  ctx?: AgentContext
  sectionId?: string
}) {
  if (!ctx) return null
  return (
    <>
      {ctx.summary_for_agents && (
        <section id={sectionId}>
          <SectionHeading sectionId={sectionId} helpKey="section.mechanic.agent-context">
            Agent context
          </SectionHeading>
          <p>{ctx.summary_for_agents}</p>
        </section>
      )}
      {ctx.gdd_prompt && (
        <section id="gdd-prompt">
          <SectionHeading sectionId="gdd-prompt" helpKey="gdd">
            GDD prompt
          </SectionHeading>
          <pre className="prompt-block">{ctx.gdd_prompt}</pre>
        </section>
      )}
      {ctx.implementation_checklist && ctx.implementation_checklist.length > 0 && (
        <section id="implementation-checklist">
          <SectionHeading sectionId="implementation-checklist" helpKey="agent-context">
            Implementation checklist
          </SectionHeading>
          <ul>
            {ctx.implementation_checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
