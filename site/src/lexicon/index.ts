import lexiconDoc from '@lexicon/lexicon.json'

export type LexiconCategory = {
  id: string
  title: string
  description: string
}

export type LexiconEntry = {
  category: string
  title: string
  short: string
  long: string
  related?: string[]
  seeAlso?: string[]
  schemaRef?: string
  enumHelp?: Record<string, string>
}

type LexiconDocument = {
  schema_version: string
  categories: LexiconCategory[]
  entries: Record<string, LexiconEntry>
}

const doc = lexiconDoc as LexiconDocument

export function getEntry(id: string): LexiconEntry | undefined {
  return doc.entries[id]
}

export function getShort(id: string): string {
  return doc.entries[id]?.short ?? ''
}

export function getLong(id: string): string {
  return doc.entries[id]?.long ?? ''
}

export function lexiconHref(id: string): string {
  return `/docs/lexicon#${encodeURIComponent(id)}`
}

export function listCategories(): LexiconCategory[] {
  return doc.categories
}

export function listEntries(): Array<{ id: string; entry: LexiconEntry }> {
  return Object.entries(doc.entries)
    .map(([id, entry]) => ({ id, entry }))
    .sort((a, b) => a.entry.title.localeCompare(b.entry.title))
}

export function listByCategory(categoryId: string): Array<{ id: string; entry: LexiconEntry }> {
  return listEntries().filter(({ entry }) => entry.category === categoryId)
}

export function searchEntries(query: string): Array<{ id: string; entry: LexiconEntry }> {
  const q = query.trim().toLowerCase()
  if (!q) return listEntries()
  return listEntries().filter(({ id, entry }) => {
    const hay = [id, entry.title, entry.short, entry.long, entry.schemaRef ?? ''].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

export function fieldHelpId(entity: string, field: string): string {
  return `field.${entity}.${field}`
}

export function enumHelpText(entryId: string, value: string): string | undefined {
  return doc.entries[entryId]?.enumHelp?.[value]
}

export { doc as lexiconDocument }
