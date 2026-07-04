import { REPO_URL } from '../types'
import { getShort } from '../lexicon'
import { HelpTooltip } from './HelpTooltip'

type EnrichKind = 'variable' | 'ui-menu'

const FIELD_HELP: Record<EnrichKind, Record<string, string>> = {
  variable: {
    shared_rationale: 'field.variable.shared_rationale',
    player_focus: 'field.variable.player_focus',
    typical_range: 'field.variable.typical_range',
  },
  'ui-menu': {
    shared_rationale: 'field.menu.shared_rationale',
  },
}

export function EmptyField({
  slug,
  field,
  kind,
}: {
  slug: string
  field: string
  kind: EnrichKind
}) {
  const template = kind === 'variable' ? 'enrich-variable.yml' : 'enrich-ui-menu.yml'
  const title = encodeURIComponent(`Enrich ${kind === 'variable' ? 'variable' : 'UI menu'}: ${slug} — ${field}`)
  const body = encodeURIComponent(
    `**Slug:** \`${slug}\`\n**Field:** \`${field}\`\n\n**Suggested content:**\n\n`,
  )
  const url = `${REPO_URL}/issues/new?template=${template}&title=${title}&body=${body}`
  const helpId = FIELD_HELP[kind][field]
  const helpShort = helpId ? getShort(helpId) : ''

  return (
    <>
      {helpShort && (
        <p className="empty-field-help">
          {helpShort}
          {helpId && <HelpTooltip entryId={helpId} />}
        </p>
      )}
      <p className="empty-field">
        <a href={url} target="_blank" rel="noreferrer">
          Add information here
        </a>
      </p>
    </>
  )
}
