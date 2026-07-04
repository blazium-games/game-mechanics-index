import { describe, expect, it } from 'vitest'
import { getEntry, getShort, lexiconHref, listByCategory, searchEntries } from './index'

describe('lexicon', () => {
  it('looks up GDD entry', () => {
    const entry = getEntry('gdd')
    expect(entry?.title).toContain('GDD')
    expect(getShort('gdd').length).toBeGreaterThan(10)
  })

  it('builds lexicon href', () => {
    expect(lexiconHref('core-loop')).toBe('/docs/lexicon#core-loop')
  })

  it('filters by category', () => {
    const process = listByCategory('process')
    expect(process.some(({ id }) => id === 'enrichment')).toBe(true)
  })

  it('searches entries', () => {
    const hits = searchEntries('GDD')
    expect(hits.length).toBeGreaterThan(0)
  })
})
