import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { EmptyField } from '../components/EmptyField'
import { MetaField } from '../components/FieldLabel'
import { ExportDropdown } from '../components/ExportDropdown'
import { SuggestEditLink } from '../components/Layout'
import { AgentContextSection } from '../components/AgentContextSection'
import { SectionHeading } from '../components/SectionHeading'
import { useHashScroll } from '../hooks/useHashScroll'
import { buildCanonical, pageTitle } from '../seo/meta'
import { breadcrumbJsonLd, definedTermJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

export function VariableDetailPage() {
  const { slug = '' } = useParams()
  const { data: v } = useQuery({
    queryKey: ['variable', slug],
    queryFn: () => api.fetchVariable(slug),
    enabled: !!slug,
  })
  const { data: varMaps } = useQuery({
    queryKey: ['variable-maps', slug],
    queryFn: async () => {
      const idx = await api.fetchVariableToMaps()
      return idx.variables[slug] ?? []
    },
    enabled: !!slug,
  })
  const { data: varMechs } = useQuery({
    queryKey: ['variable-mechanics', slug],
    queryFn: async () => {
      const idx = await api.fetchVariableToMechanics()
      return idx.variables[slug] ?? []
    },
    enabled: !!slug,
  })
  const { data: menuIndex } = useQuery({
    queryKey: ['ui-menus-index'],
    queryFn: api.fetchUIMenusIndex,
  })
  const { data: relatedMenuDetails } = useQuery({
    queryKey: ['menus-for-variable', slug, menuIndex?.length],
    queryFn: async () => {
      if (!menuIndex) return []
      const menus = await Promise.all(menuIndex.map((row) => api.fetchUIMenu(row.slug)))
      return menus.filter((m) => m.related_variables?.includes(slug))
    },
    enabled: !!slug && !!menuIndex,
  })

  useHashScroll(!!v)

  if (!v) return <p>Loading…</p>

  const canonical = buildCanonical(`/variables/${slug}`)

  return (
    <div>
      <DocumentMeta
        title={pageTitle(v.name)}
        description={v.summary}
        path={`/variables/${slug}`}
        ogType="article"
        jsonLd={[
          definedTermJsonLd({ name: v.name, description: v.summary, url: canonical, termSet: 'Game Variables' }),
          breadcrumbJsonLd([
            { name: 'Variables', url: buildCanonical('/variables') },
            { name: v.name, url: canonical },
          ]),
        ]}
      />
      <div className="detail-header">
        <h1>{v.name}</h1>
        <div className="detail-actions">
          <ExportDropdown kind="variable" slug={slug} entity={v} />
          <SuggestEditLink slug={slug} kind="variable" />
        </div>
      </div>
      <p className="meta">
        <MetaField entryId="field.variable.category" label="category" value={v.category} />
        <MetaField entryId="field.variable.scope" label="scope" value={v.scope} />
        <MetaField entryId="field.variable.value_kind" label="value_kind" value={v.value_kind} />
        {v.reset_behavior && (
          <MetaField entryId="field.variable.reset_behavior" label="resets" value={v.reset_behavior} />
        )}
      </p>
      <section id="summary">
        <SectionHeading sectionId="summary" helpKey="field.mechanic.summary">Summary</SectionHeading>
        <p>{v.summary}</p>
      </section>
      <section id="shared-rationale">
        <SectionHeading sectionId="shared-rationale" helpKey="section.variable.shared-rationale">Shared rationale</SectionHeading>
        {v.shared_rationale ? <p>{v.shared_rationale}</p> : <EmptyField slug={slug} field="shared_rationale" kind="variable" />}
      </section>
      <section id="player-focus">
        <SectionHeading sectionId="player-focus" helpKey="field.variable.player_focus">Player focus</SectionHeading>
        {v.player_focus ? <p>{v.player_focus}</p> : <EmptyField slug={slug} field="player_focus" kind="variable" />}
      </section>
      <section id="typical-range">
        <SectionHeading sectionId="typical-range" helpKey="field.variable.typical_range">Typical range</SectionHeading>
        {v.typical_range ? <p>{v.typical_range}</p> : <EmptyField slug={slug} field="typical_range" kind="variable" />}
      </section>
      {v.tags && v.tags.length > 0 && (
        <section id="tags">
          <SectionHeading sectionId="tags">Tags</SectionHeading>
          <div className="chips">
            {v.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
      {v.design_guidance?.when_to_use && (
        <section id="design-guidance">
          <SectionHeading sectionId="design-guidance" helpKey="field.variable.design_guidance">When to use</SectionHeading>
          <p>{v.design_guidance.when_to_use}</p>
          {v.design_guidance.where_to_use && <p>{v.design_guidance.where_to_use}</p>}
          {v.design_guidance.designer_notes && <p>{v.design_guidance.designer_notes}</p>}
        </section>
      )}
      {v.design_guidance?.when_to_avoid && v.design_guidance.when_to_avoid.length > 0 && (
        <section id="when-to-avoid">
          <SectionHeading sectionId="when-to-avoid" helpKey="field.design_guidance.when_to_avoid">When to avoid</SectionHeading>
          <ul>
            {v.design_guidance.when_to_avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      <section id="related-mechanics">
        <SectionHeading sectionId="related-mechanics">Related mechanics</SectionHeading>
        {(varMechs ?? v.related_mechanics ?? []).length > 0 ? (
          <div className="chips">
            {(varMechs ?? v.related_mechanics ?? []).map((m) => (
              <Link key={m} className="chip" to={`/mechanics/${m}`}>
                {m}
              </Link>
            ))}
          </div>
        ) : (
          <p className="meta">No mechanic links yet.</p>
        )}
      </section>
      {v.related_variables && v.related_variables.length > 0 && (
        <section id="related-variables">
          <SectionHeading sectionId="related-variables">Related variables</SectionHeading>
          <div className="chips">
            {v.related_variables.map((rel) => (
              <Link key={rel.slug} className="chip" to={`/variables/${rel.slug}`}>
                {rel.slug}
                {rel.relationship ? ` (${rel.relationship})` : ''}
              </Link>
            ))}
          </div>
        </section>
      )}
      {relatedMenuDetails && relatedMenuDetails.length > 0 && (
        <section id="related-menus">
          <SectionHeading sectionId="related-menus">Related UI menus</SectionHeading>
          <div className="chips">
            {relatedMenuDetails.map((m) => (
              <Link key={m.slug} className="chip" to={`/ui-menus/${m.slug}`}>
                {m.slug}
              </Link>
            ))}
          </div>
        </section>
      )}
      <AgentContextSection ctx={v.agent_context} />
      <section id="featured-maps">
        <SectionHeading sectionId="featured-maps">Featured in maps</SectionHeading>
        {(varMaps ?? v.featured_in ?? []).length > 0 ? (
          <div className="chips">
            {(varMaps ?? v.featured_in ?? []).map((s) => (
              <Link key={s} className="chip" to={`/games/${s}`}>
                {s}
              </Link>
            ))}
          </div>
        ) : (
          <p className="meta">
            No maps yet.{' '}
            <a
              href={`https://github.com/blazium-games/game-design-index/issues/new?template=map-variable-binding.yml`}
              target="_blank"
              rel="noreferrer"
            >
              Add a binding
            </a>
          </p>
        )}
      </section>
    </div>
  )
}
