/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelpTooltip } from './HelpTooltip'

describe('HelpTooltip', () => {
  it('renders short help and lexicon link', async () => {
    render(
      <MemoryRouter>
        <HelpTooltip entryId="gdd" />
      </MemoryRouter>,
    )
    screen.getByRole('button', { name: /Help: Game Design Document/i }).click()
    expect(screen.getByText(/living design spec/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Read more in Lexicon/i }).getAttribute('href')).toBe(
      '/docs/lexicon#gdd',
    )
  })
})
