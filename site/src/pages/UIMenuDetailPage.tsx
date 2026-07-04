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

export function UIMenuDetailPage() {
  const { slug = '' } = useParams()
  const { data: menu } = useQuery({
    queryKey: ['ui-menu', slug],
    queryFn: () => api.fetchUIMenu(slug),
    enabled: !!slug,
  })
  const { data: menuMaps } = useQuery({
    queryKey: ['menu-maps', slug],
    queryFn: async () => {
      const idx = await api.fetchMenuToMaps()
      return idx.menus[slug] ?? []
    },
    enabled: !!slug,
  })
  const { data: flow } = useQuery({
    queryKey: ['menu-flow'],
    queryFn: api.fetchMenuFlowEdges,
  })

  useHashScroll(!!menu)

  if (!menu) return <p>Loading…</p>

  const outEdges = flow?.edges.filter((e) => e.from_menu === slug) ?? []
  const inEdges = flow?.edges.filter((e) => e.to_menu === slug) ?? []
  const canonical = buildCanonical(`/ui-menus/${slug}`)

  return (
    <div>
      <DocumentMeta
        title={pageTitle(menu.name)}
        description={menu.summary}
        path={`/ui-menus/${slug}`}
        ogType="article"
        jsonLd={[
          definedTermJsonLd({ name: menu.name, description: menu.summary, url: canonical, termSet: 'UI Menus' }),
          breadcrumbJsonLd([
            { name: 'UI Menus', url: buildCanonical('/ui-menus') },
            { name: menu.name, url: canonical },
          ]),
        ]}
      />
      <div className="detail-header">
        <h1>{menu.name}</h1>
        <div className="detail-actions">
          <ExportDropdown kind="menu" slug={slug} entity={menu} />
          <SuggestEditLink slug={slug} kind="ui-menu" />
        </div>
      </div>
      <p className="meta">
        <MetaField entryId="field.menu.menu_type" label="menu_type" value={menu.menu_type} />
        <MetaField entryId="field.menu.layer" label="layer" value={menu.layer} />
        {menu.input_context && (
          <MetaField entryId="field.menu.input_context" label="input" value={menu.input_context} />
        )}
      </p>
      <section id="summary">
        <SectionHeading sectionId="summary" helpKey="field.menu.shared_rationale">Summary</SectionHeading>
        <p>{menu.summary}</p>
      </section>
      <section id="shared-rationale">
        <SectionHeading sectionId="shared-rationale" helpKey="field.menu.shared_rationale">Shared rationale</SectionHeading>
        {menu.shared_rationale ? (
          <p>{menu.shared_rationale}</p>
        ) : (
          <EmptyField slug={slug} field="shared_rationale" kind="ui-menu" />
        )}
      </section>
      {menu.typical_actions && menu.typical_actions.length > 0 && (
        <section id="typical-actions">
          <SectionHeading sectionId="typical-actions" helpKey="field.menu.typical_actions">Typical actions</SectionHeading>
          <div className="chips">
            {menu.typical_actions.map((a) => (
              <span key={a} className="chip">
                {a}
              </span>
            ))}
          </div>
        </section>
      )}
      {menu.design_guidance?.when_to_use && (
        <section id="design-guidance">
          <SectionHeading sectionId="design-guidance" helpKey="field.menu.shared_rationale">When to use</SectionHeading>
          <p>{menu.design_guidance.when_to_use}</p>
          {menu.design_guidance.where_to_use && <p>{menu.design_guidance.where_to_use}</p>}
          {menu.design_guidance.designer_notes && <p>{menu.design_guidance.designer_notes}</p>}
        </section>
      )}
      {menu.design_guidance?.when_to_avoid && menu.design_guidance.when_to_avoid.length > 0 && (
        <section id="when-to-avoid">
          <SectionHeading sectionId="when-to-avoid" helpKey="field.design_guidance.when_to_avoid">When to avoid</SectionHeading>
          <ul>
            {menu.design_guidance.when_to_avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {menu.related_mechanics && menu.related_mechanics.length > 0 && (
        <section id="related-mechanics">
          <SectionHeading sectionId="related-mechanics">Related mechanics</SectionHeading>
          <div className="chips">
            {menu.related_mechanics.map((m) => (
              <Link key={m} className="chip" to={`/mechanics/${m}`}>
                {m}
              </Link>
            ))}
          </div>
        </section>
      )}
      {menu.related_variables && menu.related_variables.length > 0 && (
        <section id="related-variables">
          <SectionHeading sectionId="related-variables">Related variables</SectionHeading>
          <div className="chips">
            {menu.related_variables.map((v) => (
              <Link key={v} className="chip" to={`/variables/${v}`}>
                {v}
              </Link>
            ))}
          </div>
        </section>
      )}
      {menu.related_menus && menu.related_menus.length > 0 && (
        <section id="related-menus">
          <SectionHeading sectionId="related-menus">Related menus</SectionHeading>
          <div className="chips">
            {menu.related_menus.map((rel) => (
              <Link key={rel.slug} className="chip" to={`/ui-menus/${rel.slug}`}>
                {rel.slug}
                {rel.relationship ? ` (${rel.relationship})` : ''}
              </Link>
            ))}
          </div>
        </section>
      )}
      {(outEdges.length > 0 || inEdges.length > 0) && (
        <section id="menu-flow">
          <SectionHeading sectionId="menu-flow" helpKey="field.menu.menu_flow">Menu flow</SectionHeading>
          <ul>
            {outEdges.map((e) => (
              <li key={`${e.from_menu}-${e.to_menu}`}>
                → <Link to={`/ui-menus/${e.to_menu}`}>{e.to_menu}</Link>
                {e.relationship ? ` (${e.relationship})` : ''}
              </li>
            ))}
            {inEdges.map((e) => (
              <li key={`in-${e.from_menu}-${e.to_menu}`}>
                ← <Link to={`/ui-menus/${e.from_menu}`}>{e.from_menu}</Link>
                {e.relationship ? ` (${e.relationship})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
      <AgentContextSection ctx={menu.agent_context} />
      <section id="featured-maps">
        <SectionHeading sectionId="featured-maps">Featured in maps</SectionHeading>
        {(menuMaps ?? menu.featured_in ?? []).length > 0 ? (
          <div className="chips">
            {(menuMaps ?? menu.featured_in ?? []).map((s) => (
              <Link key={s} className="chip" to={`/games/${s}`}>
                {s}
              </Link>
            ))}
          </div>
        ) : (
          <p className="meta">No maps yet.</p>
        )}
      </section>
    </div>
  )
}
