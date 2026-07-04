import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { MetaField } from '../components/FieldLabel'
import { SectionHeading } from '../components/SectionHeading'
import { useHashScroll } from '../hooks/useHashScroll'
import { buildCanonical, pageTitle } from '../seo/meta'
import { breadcrumbJsonLd, definedTermJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

export function SkillDetailPage() {
  const { slug = '' } = useParams()
  const { data: skill } = useQuery({
    queryKey: ['skill', slug],
    queryFn: () => api.fetchSkill(slug),
    enabled: !!slug,
  })

  useHashScroll(!!skill)

  if (!skill) return <p>Loading…</p>

  const canonical = buildCanonical(`/skills/${slug}`)

  return (
    <div>
      <DocumentMeta
        title={pageTitle(skill.name)}
        description={skill.summary}
        path={`/skills/${slug}`}
        ogType="article"
        jsonLd={[
          definedTermJsonLd({ name: skill.name, description: skill.summary, url: canonical, termSet: 'Design Skills' }),
          breadcrumbJsonLd([
            { name: 'Design Skills', url: buildCanonical('/skills') },
            { name: skill.name, url: canonical },
          ]),
        ]}
      />
      <h1>{skill.name}</h1>
      <p className="meta">
        <MetaField entryId="field.skill.category" label="category" value={skill.category} />
      </p>
      <section id="summary">
        <SectionHeading sectionId="summary" helpKey="field.skill.learning_outcome">Summary</SectionHeading>
        <p>{skill.summary}</p>
      </section>
      <section id="learning-outcome">
        <SectionHeading sectionId="learning-outcome" helpKey="section.skill.learning-outcome">Learning outcome</SectionHeading>
        <p>{skill.learning_outcome}</p>
      </section>
      {skill.practice_activities && skill.practice_activities.length > 0 && (
        <section id="practice-activities">
          <SectionHeading sectionId="practice-activities" helpKey="field.skill.practice_activities">Practice activities</SectionHeading>
          <ul>
            {skill.practice_activities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}
      {skill.design_guidance?.when_to_use && (
        <section id="design-guidance">
          <SectionHeading sectionId="design-guidance" helpKey="field.skill.design_guidance">When to emphasize</SectionHeading>
          <p>{skill.design_guidance.when_to_use}</p>
          {skill.design_guidance.where_to_use && <p>{skill.design_guidance.where_to_use}</p>}
          {skill.design_guidance.designer_notes && <p>{skill.design_guidance.designer_notes}</p>}
        </section>
      )}
      {skill.design_guidance?.when_to_avoid && skill.design_guidance.when_to_avoid.length > 0 && (
        <section id="when-to-avoid">
          <SectionHeading sectionId="when-to-avoid" helpKey="field.design_guidance.when_to_avoid">When to avoid</SectionHeading>
          <ul>
            {skill.design_guidance.when_to_avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {skill.related_mechanics && skill.related_mechanics.length > 0 && (
        <section id="related-mechanics">
          <SectionHeading sectionId="related-mechanics">Related mechanics</SectionHeading>
          <div className="chips">
            {skill.related_mechanics.map((m) => (
              <Link key={m} className="chip" to={`/mechanics/${m}`}>
                {m}
              </Link>
            ))}
          </div>
        </section>
      )}
      {skill.related_variables && skill.related_variables.length > 0 && (
        <section id="related-variables">
          <SectionHeading sectionId="related-variables">Related variables</SectionHeading>
          <div className="chips">
            {skill.related_variables.map((v) => (
              <Link key={v} className="chip" to={`/variables/${v}`}>
                {v}
              </Link>
            ))}
          </div>
        </section>
      )}
      {skill.tags && skill.tags.length > 0 && (
        <section id="tags">
          <SectionHeading sectionId="tags">Tags</SectionHeading>
          <div className="chips">
            {skill.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
