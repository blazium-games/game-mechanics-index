import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ExportDropdown } from '../components/ExportDropdown'
import { MetaField } from '../components/FieldLabel'
import { SuggestEditLink } from '../components/Layout'
import { AgentContextSection } from '../components/AgentContextSection'
import { SectionHeading } from '../components/SectionHeading'
import { useHashScroll } from '../hooks/useHashScroll'
import { buildCanonical, pageTitle } from '../seo/meta'
import {
  breadcrumbJsonLd,
  definedTermJsonLd,
  learningResourceJsonLd,
} from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'
import { REPO_URL } from '../types'

export function MechanicDetailPage() {
  const { slug = '' } = useParams()
  const { data: mech } = useQuery({
    queryKey: ['mechanic', slug],
    queryFn: () => api.fetchMechanic(slug),
    enabled: !!slug,
  })
  const { data: mechMaps } = useQuery({
    queryKey: ['mechanic-maps', slug],
    queryFn: async () => {
      const idx = await api.fetchMechanicToMaps()
      return idx.mechanics[slug] ?? []
    },
    enabled: !!slug,
  })
  const { data: varMechs } = useQuery({
    queryKey: ['variable-to-mechanics', slug],
    queryFn: async () => {
      const idx = await api.fetchVariableToMechanics()
      const out: string[] = []
      for (const [v, mechs] of Object.entries(idx.variables)) {
        if (mechs.includes(slug)) out.push(v)
      }
      return out.sort()
    },
    enabled: !!slug,
  })
  const { data: menuIndex } = useQuery({
    queryKey: ['ui-menus-index'],
    queryFn: api.fetchUIMenusIndex,
  })
  const { data: relatedMenus } = useQuery({
    queryKey: ['menus-for-mechanic', slug, menuIndex?.length],
    queryFn: async () => {
      if (!menuIndex) return []
      const menus = await Promise.all(menuIndex.map((row) => api.fetchUIMenu(row.slug)))
      return menus.filter((m) => m.related_mechanics?.includes(slug))
    },
    enabled: !!slug && !!menuIndex,
  })

  useHashScroll(!!mech)

  if (!mech) return <p>Loading…</p>

  const canonical = buildCanonical(`/mechanics/${slug}`)

  return (
    <div>
      <DocumentMeta
        title={pageTitle(mech.name)}
        description={mech.summary}
        path={`/mechanics/${slug}`}
        ogType="article"
        jsonLd={[
          definedTermJsonLd({ name: mech.name, description: mech.summary, url: canonical }),
          learningResourceJsonLd({ name: mech.name, description: mech.summary, url: canonical }),
          breadcrumbJsonLd([
            { name: 'Mechanics', url: buildCanonical('/mechanics') },
            { name: mech.name, url: canonical },
          ]),
        ]}
      />
      <div className="detail-header">
        <h1>{mech.name}</h1>
        <div className="detail-actions">
          <ExportDropdown kind="mechanic" slug={slug} entity={mech} />
          <SuggestEditLink slug={slug} kind="mechanic" />
        </div>
      </div>
      <p className="meta">
        <MetaField entryId="field.mechanic.domain" label="domain" value={mech.domain} />
        <MetaField entryId="field.mechanic.flavor" label="flavor" value={mech.flavor} />
      </p>
      <section id="summary">
        <SectionHeading sectionId="summary" helpKey="section.mechanic.summary">Summary</SectionHeading>
        <p>{mech.summary}</p>
      </section>
      {mech.player_experience && (
        <section id="player-experience">
          <SectionHeading sectionId="player-experience" helpKey="field.mechanic.player_experience">Player experience</SectionHeading>
          <p>{mech.player_experience}</p>
        </section>
      )}
      {mech.flavor_rationale && (
        <section id="flavor-rationale">
          <SectionHeading sectionId="flavor-rationale" helpKey="field.mechanic.flavor">Flavor rationale</SectionHeading>
          <p>{mech.flavor_rationale}</p>
        </section>
      )}
      {mech.tags && mech.tags.length > 0 && (
        <section id="tags">
          <SectionHeading sectionId="tags" helpKey="field.mechanic.tags">Tags</SectionHeading>
          <div className="chips">
            {mech.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
      {varMechs && varMechs.length > 0 && (
        <section id="related-variables">
          <SectionHeading sectionId="related-variables">Related variables</SectionHeading>
          <div className="chips">
            {varMechs.map((v) => (
              <Link key={v} className="chip" to={`/variables/${v}`}>
                {v}
              </Link>
            ))}
          </div>
        </section>
      )}
      {relatedMenus && relatedMenus.length > 0 && (
        <section id="related-menus">
          <SectionHeading sectionId="related-menus">Related UI menus</SectionHeading>
          <div className="chips">
            {relatedMenus.map((m) => (
              <Link key={m.slug} className="chip" to={`/ui-menus/${m.slug}`}>
                {m.slug}
              </Link>
            ))}
          </div>
        </section>
      )}
      {mech.signature_of?.games && mech.signature_of.games.length > 0 && (
        <section id="signature-games">
          <SectionHeading sectionId="signature-games">Signature games</SectionHeading>
          <ul>
            {mech.signature_of.games.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      )}
      {mech.synergies && mech.synergies.length > 0 && (
        <section id="synergies">
          <SectionHeading sectionId="synergies" helpKey="field.mechanic.synergies">Synergies</SectionHeading>
          <div className="chips">
            {mech.synergies.map((s) => (
              <Link key={s} className="chip" to={`/mechanics/${s}`}>
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}
      {mech.synergy_notes && mech.synergy_notes.length > 0 && (
        <section id="synergy-notes">
          <SectionHeading sectionId="synergy-notes" helpKey="field.mechanic.synergy_notes">Synergy notes</SectionHeading>
          <ul>
            {mech.synergy_notes.map((note) => (
              <li key={note.slug}>
                <Link to={`/mechanics/${note.slug}`}>{note.slug}</Link>
                {note.note ? ` — ${note.note}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
      {mech.examples && mech.examples.length > 0 && (
        <section id="examples">
          <SectionHeading sectionId="examples" helpKey="field.mechanic.examples">Examples</SectionHeading>
          {mech.examples.map((ex) => (
            <div key={`${ex.label ?? ex.map_slug ?? ex.description}`} className="exercise-card">
              {ex.label && <strong>{ex.label}</strong>}
              {ex.description && <p>{ex.description}</p>}
              {ex.map_slug && (
                <p className="meta">
                  <Link to={`/games/${ex.map_slug}`}>{ex.map_slug}</Link>
                </p>
              )}
            </div>
          ))}
        </section>
      )}
      {mech.design_guidance?.when_to_use && (
        <section id="design-guidance">
          <SectionHeading sectionId="design-guidance" helpKey="section.mechanic.design-guidance">When to use</SectionHeading>
          <p>{mech.design_guidance.when_to_use}</p>
        </section>
      )}
      {mech.design_guidance?.where_to_use && (
        <section id="where-to-use">
          <SectionHeading sectionId="where-to-use" helpKey="field.design_guidance.where_to_use">Where to use</SectionHeading>
          <p>{mech.design_guidance.where_to_use}</p>
        </section>
      )}
      {mech.design_guidance?.designer_notes && (
        <section id="designer-notes">
          <SectionHeading sectionId="designer-notes" helpKey="field.design_guidance.designer_notes">Designer notes</SectionHeading>
          <p>{mech.design_guidance.designer_notes}</p>
        </section>
      )}
      {mech.design_guidance?.when_to_avoid && mech.design_guidance.when_to_avoid.length > 0 && (
        <section id="when-to-avoid">
          <SectionHeading sectionId="when-to-avoid" helpKey="field.design_guidance.when_to_avoid">When to avoid</SectionHeading>
          <ul>
            {mech.design_guidance.when_to_avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {mech.learning_objectives && mech.learning_objectives.length > 0 && (
        <section id="learning-objectives">
          <SectionHeading sectionId="learning-objectives" helpKey="field.mechanic.learning_objectives">Learning objectives</SectionHeading>
          <ul>
            {mech.learning_objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {mech.design_exercises && mech.design_exercises.length > 0 && (
        <section id="design-exercises">
          <SectionHeading sectionId="design-exercises" helpKey="field.mechanic.design_exercises">Design exercises</SectionHeading>
          {mech.design_exercises.map((ex) => (
            <div key={ex.prompt} className="exercise-card">
              <p>{ex.prompt}</p>
              {ex.constraints && ex.constraints.length > 0 && (
                <p className="meta">Constraints: {ex.constraints.join('; ')}</p>
              )}
              {ex.success_criteria && ex.success_criteria.length > 0 && (
                <p className="meta">Success: {ex.success_criteria.join('; ')}</p>
              )}
            </div>
          ))}
        </section>
      )}
      {mech.skills_developed && mech.skills_developed.length > 0 && (
        <section id="skills-developed">
          <SectionHeading sectionId="skills-developed" helpKey="field.mechanic.skills_developed">Skills developed</SectionHeading>
          <div className="chips">
            {mech.skills_developed.map((s) => (
              <Link key={s} className="chip" to={`/skills/${s}`}>
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}
      <AgentContextSection ctx={mech.agent_context} sectionId="agent-context" />
      {!mech.design_guidance?.when_to_use && (
        <section id="enrichment-cta">
          <p className="meta">
            Design guidance not yet enriched.{' '}
            <a
              href={`${REPO_URL}/issues/new?template=enrich-mechanic.yml&slug=${encodeURIComponent(slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              Enrich this mechanic
            </a>
          </p>
        </section>
      )}
      <section id="featured-maps">
        <SectionHeading sectionId="featured-maps">Featured in maps</SectionHeading>
        <div className="chips">
          {(mechMaps ?? mech.featured_in ?? []).slice(0, 40).map((s) => (
            <Link key={s} className="chip" to={`/games/${s}`}>
              {s}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
