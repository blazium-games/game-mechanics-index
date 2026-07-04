import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { FieldLabel } from '../components/FieldLabel'
import { EnrichmentStatusChip } from '../components/EnrichmentStatusChip'
import { resolveEnrichmentStatus } from '../utils/enrichmentStatus'
import { pageTitle } from '../seo/meta'
import { DocumentMeta } from '../seo/usePageMeta'

export function VariablesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [enrichmentStatus, setEnrichmentStatus] = useState('')
  const { data: rows } = useQuery({ queryKey: ['variables-index'], queryFn: api.fetchVariablesIndex })

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows
      .filter((v) => !category || v.category === category)
      .filter(
        (v) =>
          !enrichmentStatus || resolveEnrichmentStatus(v.enrichment_status) === enrichmentStatus,
      )
      .filter((v) => {
        if (!query) return true
        const q = query.toLowerCase()
        return v.name.toLowerCase().includes(q) || v.slug.includes(q)
      })
  }, [rows, query, category, enrichmentStatus])

  return (
    <div>
      <DocumentMeta
        title={pageTitle('Variables')}
        description="Game variables catalog: health, currency, slots, and shared state patterns."
        path="/variables"
      />
      <h1>Game variables</h1>
      <p className="meta">
        Tracked state patterns (health, currency, slots) shared across games. All catalog entries
        are listed — empty fields can be enriched via Issues.
      </p>
      <div className="filters">
        <input placeholder="Search variables…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="filter-label">
          <FieldLabel entryId="field.variable.category">Category</FieldLabel>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="stat">stat</option>
          <option value="resource">resource</option>
          <option value="currency">currency</option>
          <option value="slot">slot</option>
          <option value="meter">meter</option>
          <option value="counter">counter</option>
          <option value="flag">flag</option>
        </select>
        </label>
        <label className="filter-label">
          <FieldLabel entryId="filter.enrichment">Enrichment</FieldLabel>
          <select value={enrichmentStatus} onChange={(e) => setEnrichmentStatus(e.target.value)}>
          <option value="">All enrichment</option>
          <option value="complete">complete</option>
          <option value="needs_info">needs info</option>
        </select>
        </label>
      </div>
      <p className="meta">{filtered.length} variables</p>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <FieldLabel entryId="field.variable.category">Category</FieldLabel>
            </th>
            <th>
              <FieldLabel entryId="field.variable.scope">Scope</FieldLabel>
            </th>
            <th>Maps</th>
            <th>
              <FieldLabel entryId="filter.enrichment">Status</FieldLabel>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.slug}>
              <td>
                <Link to={`/variables/${v.slug}`}>{v.name}</Link>
              </td>
              <td>{v.category}</td>
              <td>{v.scope}</td>
              <td>{v.featured_count}</td>
              <td>
                <EnrichmentStatusChip status={v.enrichment_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
