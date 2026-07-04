import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { FieldLabel } from '../components/FieldLabel'
import { EnrichmentStatusChip } from '../components/EnrichmentStatusChip'
import { resolveEnrichmentStatus } from '../utils/enrichmentStatus'
import { pageTitle } from '../seo/meta'
import { DocumentMeta } from '../seo/usePageMeta'

export function SkillsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [enrichmentStatus, setEnrichmentStatus] = useState('')
  const { data: rows } = useQuery({ queryKey: ['skills-index'], queryFn: api.fetchSkillsIndex })

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows
      .filter((s) => !category || s.category === category)
      .filter(
        (s) =>
          !enrichmentStatus || resolveEnrichmentStatus(s.enrichment_status) === enrichmentStatus,
      )
      .filter((s) => {
        if (!query) return true
        const q = query.toLowerCase()
        return s.name.toLowerCase().includes(q) || s.slug.includes(q)
      })
  }, [rows, query, category, enrichmentStatus])

  return (
    <div>
      <DocumentMeta
        title={pageTitle('Design Skills')}
        description="Player skills catalog linked to mechanics, variables, and games."
        path="/skills"
      />
      <h1>Design skills</h1>
      <p className="meta">
        Reusable player skills linked to mechanics, variables, and games — use them to plan learning
        outcomes and practice exercises.
      </p>
      <div className="filters">
        <input placeholder="Search skills…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="filter-label">
          <FieldLabel entryId="field.skill.category">Category</FieldLabel>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="motor">motor</option>
          <option value="cognitive">cognitive</option>
          <option value="strategic">strategic</option>
          <option value="social">social</option>
          <option value="creative">creative</option>
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
      <p className="meta">{filtered.length} skills</p>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <FieldLabel entryId="field.skill.category">Category</FieldLabel>
            </th>
            <th>Mechanics</th>
            <th>
              <FieldLabel entryId="filter.enrichment">Status</FieldLabel>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.slug}>
              <td>
                <Link to={`/skills/${s.slug}`}>{s.name}</Link>
              </td>
              <td>{s.category}</td>
              <td>{s.mechanic_count}</td>
              <td>
                <EnrichmentStatusChip status={s.enrichment_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
