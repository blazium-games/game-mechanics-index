import { describe, expect, it } from 'vitest'
import { listByCategory } from '../lexicon'

describe('LexiconPage data', () => {
  it('has process category entries', () => {
    const process = listByCategory('process')
    expect(process.length).toBeGreaterThan(5)
    expect(process.some(({ id }) => id === 'gdd')).toBe(true)
  })
})
