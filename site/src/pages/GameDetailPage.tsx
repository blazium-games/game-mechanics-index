import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ExportDropdown } from '../components/ExportDropdown'
import { SuggestEditLink } from '../components/Layout'
import { MetaField } from '../components/FieldLabel'
import { MapDetailSections } from '../components/MapDetailSections'
import { useHashScroll } from '../hooks/useHashScroll'
import { buildCanonical, pageTitle } from '../seo/meta'
import { breadcrumbJsonLd, videoGameJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

export function GameDetailPage() {
  const { slug = '' } = useParams()
  const { data: map } = useQuery({
    queryKey: ['map', slug],
    queryFn: () => api.fetchMap(slug),
    enabled: !!slug,
  })

  useHashScroll(!!map)

  if (!map) return <p>Loading…</p>

  const canonical = buildCanonical(`/games/${slug}`)
  const description = map.narrative.description || `Gameplay map for ${map.subject.name}.`

  return (
    <div>
      <DocumentMeta
        title={pageTitle(map.subject.name)}
        description={description}
        path={`/games/${slug}`}
        ogType="article"
        jsonLd={[
          videoGameJsonLd({
            name: map.subject.name,
            description,
            url: canonical,
            genres: map.subject.genres,
          }),
          breadcrumbJsonLd([
            { name: 'Games', url: buildCanonical('/games') },
            { name: map.subject.name, url: canonical },
          ]),
        ]}
      />
      <div className="detail-header">
        <h1>{map.subject.name}</h1>
        <div className="detail-actions">
          <ExportDropdown kind="game" slug={slug} entity={map} />
          <SuggestEditLink slug={slug} kind="game" />
        </div>
      </div>
      <p className="meta">
        {map.subject.genres?.join(' · ')}
        {' · '}
        <MetaField entryId="quality-tier" label="tier" value={map.metadata?.quality_tier ?? 'template'} />
      </p>
      <MapDetailSections map={map} />
    </div>
  )
}
