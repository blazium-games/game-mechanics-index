import type { MechanicEntry } from '../types'

type RichMechanic = MechanicEntry & {
  complexity?: string
  flavor_rationale?: string
  player_experience?: string
  common_in?: string[]
  synergy_notes?: Array<{ slug: string; note?: string }>
  design_guidance?: {
    when_to_use?: string
    where_to_use?: string
    when_to_avoid?: string[]
  }
  examples?: Array<{ label?: string; description?: string; map_slug?: string }>
  agent_context?: { summary_for_agents?: string }
}

export function formatMechanic(entry: MechanicEntry, format: 'md' | 'yaml' | 'txt'): string {
  const e = entry as RichMechanic
  if (format === 'yaml') {
    return simpleYaml(e)
  }
  const md = mechanicMarkdown(e)
  return format === 'txt' ? md.replace(/^## /gm, '') : md
}

function mechanicMarkdown(e: RichMechanic): string {
  const lines: string[] = [`# ${e.name}`, '']
  let meta = `**Flavor:** ${e.flavor} · **Domain:** ${e.domain}`
  if (e.complexity) meta += ` · **Complexity:** ${e.complexity}`
  lines.push(meta, '')
  if (e.summary) {
    lines.push('## Description', '', e.summary, '')
  }
  if (e.flavor_rationale) {
    lines.push('## Category Insights', '', e.flavor_rationale, '')
  }
  if (e.featured_in?.length) {
    lines.push('## Featured In', '', ...e.featured_in.map((s) => `- ${s}`), '')
  }
  if (e.synergy_notes?.length) {
    lines.push('## Synergies', '')
    for (const sn of e.synergy_notes) {
      lines.push(sn.note ? `- **${sn.slug}**: ${sn.note}` : `- ${sn.slug}`)
    }
    lines.push('')
  } else if (e.synergies?.length) {
    lines.push('## Synergies', '', ...e.synergies.map((s) => `- ${s}`), '')
  }
  if (e.design_guidance?.when_to_use) {
    lines.push('## When to Use', '', e.design_guidance.when_to_use, '')
  }
  if (e.design_guidance?.where_to_use) {
    lines.push('## Where to Use', '', e.design_guidance.where_to_use, '')
  }
  if (e.signature_of?.games?.length) {
    lines.push('## Signature of', '', ...e.signature_of.games.map((g) => `- ${g}`), '')
  }
  if (e.agent_context?.summary_for_agents) {
    lines.push('## Agent Summary', '', e.agent_context.summary_for_agents, '')
  }
  return lines.join('\n').trim() + '\n'
}

function simpleYaml(e: RichMechanic): string {
  const lines = [
    `slug: ${e.slug}`,
    `name: ${yamlQuote(e.name)}`,
    `flavor: ${e.flavor}`,
    `domain: ${e.domain}`,
    `summary: ${yamlQuote(e.summary)}`,
  ]
  return lines.join('\n') + '\n'
}

function yamlQuote(s: string): string {
  if (/[:#\n]/.test(s)) return JSON.stringify(s)
  return s.includes(' ') ? `"${s}"` : s
}
