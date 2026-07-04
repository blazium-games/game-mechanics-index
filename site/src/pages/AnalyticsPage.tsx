import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { HelpTooltip } from '../components/HelpTooltip'
import { BarBreakdown } from '../components/analytics/BarBreakdown'
import { HeatmapGrid } from '../components/analytics/HeatmapGrid'
import { HubDiagram } from '../components/analytics/HubDiagram'
import { InsightCallout } from '../components/analytics/InsightCallout'
import { PieBreakdown } from '../components/analytics/PieBreakdown'
import { RankedTable } from '../components/analytics/RankedTable'
import { ScatterLift } from '../components/analytics/ScatterLift'
import { SectionCard } from '../components/analytics/SectionCard'
import { StatGrid } from '../components/analytics/StatGrid'
import { pageTitle } from '../seo/meta'
import { datasetJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

function AnalyticsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="analytics-page">
      <section className="hero">
        <h1>Corpus analytics</h1>
        <p className="meta">Failed to load analytics: {message}</p>
        <div className="cta-actions">
          <button type="button" className="btn" onClick={onRetry}>
            Retry
          </button>
          <a className="btn secondary" href={`${api.base}/analytics.json`} target="_blank" rel="noreferrer">
            View raw JSON
          </a>
        </div>
      </section>
    </div>
  )
}

export function AnalyticsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: api.fetchAnalytics,
  })

  if (isLoading) return <p className="meta">Loading analytics…</p>
  if (error || !data) {
    return (
      <AnalyticsErrorState
        message={error instanceof Error ? error.message : 'Unknown error'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['analytics'] })}
      />
    )
  }

  const legacyNote =
    '_legacyEnrichmentStats' in data && data._legacyEnrichmentStats
      ? 'Some enrichment stats were unavailable — data may be from an older export.'
      : null

  return (
    <div className="analytics-page">
      <DocumentMeta
        title={pageTitle('Analytics')}
        description="Corpus analytics, enrichment coverage, and design statistics."
        path="/explore/analytics"
        jsonLd={datasetJsonLd({
          name: 'Game Design Index Analytics',
          description: 'Pre-computed statistics and correlations across the game design corpus.',
        })}
      />
      <section className="hero">
        <h1>Corpus analytics</h1>
        <p>
          Pre-computed statistics, correlations, and visual breakdowns across games, mechanics,
          variables, and UI menus. Data refreshes on each release export.
        </p>
        {legacyNote && <p className="meta">{legacyNote}</p>}
      </section>

      <StatGrid overview={data.overview} />

      <div className="analytics-grid">
        <SectionCard
          title="Corpus composition"
          description="How game maps are classified by quality tier and signature mechanic count."
        >
          <div className="analytics-split">
            <div>
              <h3>Quality tiers</h3>
              <BarBreakdown data={data.quality_tiers} layout="horizontal" />
            </div>
            <div>
              <h3>Signature count distribution</h3>
              <BarBreakdown data={data.signature_distribution} layout="horizontal" />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Temporal and genre coverage"
          description="Release decades and most common genre labels on game maps."
        >
          <div className="analytics-split">
            <div>
              <h3>Games by decade</h3>
              <BarBreakdown data={data.games_by_decade} layout="horizontal" />
            </div>
            <div>
              <h3>Top genres</h3>
              <BarBreakdown data={data.top_genres} layout="vertical" maxBars={15} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Mechanic taxonomy"
          description="How the reusable mechanic library is distributed by domain, flavor, and design complexity."
        >
          <div className="analytics-triple">
            <div>
              <h3>Domains</h3>
              <PieBreakdown data={data.mechanic_domains} />
            </div>
            <div>
              <h3>Flavors</h3>
              <PieBreakdown data={data.mechanic_flavors} />
            </div>
            <div>
              <h3>Complexity</h3>
              <PieBreakdown
                data={data.mechanic_complexity}
                totalLabel={`${data.overview.mechanic_count} mechanics — complexity not yet classified in catalog metadata`}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Mechanic adoption and correlation"
          description="Most widespread mechanics and co-occurrence lift (association beyond marginal frequency)."
        >
          <h3>Top mechanics by map adoption</h3>
          <RankedTable
            rows={data.top_mechanics.map((m) => ({
              slug: m.slug,
              label: m.name,
              count: m.count,
            }))}
            labelHeader="Mechanic"
            countHeader="Maps"
            linkPrefix="/mechanics"
          />
          <h3>Adoption chart (top 10)</h3>
          <BarBreakdown
            data={data.top_mechanics.map((m) => ({ label: m.name, count: m.count }))}
            layout="vertical"
            maxBars={10}
          />
          <h3>Co-occurrence scatter</h3>
          <ScatterLift pairs={data.cooccurrence} />
          <p className="meta">
            <Link to="/explore/cooccurrence">View full co-occurrence table →</Link>
          </p>
        </SectionCard>

        <SectionCard
          title="Genre × domain heatmap"
          description="For top genres: how many games bind mechanics in each design domain."
        >
          <HeatmapGrid heatmap={data.genre_domain_heatmap} />
        </SectionCard>

        <SectionCard
          title={
            <>
              Mechanics and skills enrichment
              <HelpTooltip entryId="section.analytics.enrichment" />
            </>
          }
          description="Design pedagogy coverage — mechanics need design_guidance and agent_context; skills need learning outcomes and related mechanics."
        >
          <div className="analytics-split">
            <div>
              <h3>Mechanic domains</h3>
              <BarBreakdown data={data.mechanic_stats?.by_category ?? []} layout="horizontal" />
              <p className="meta">
                Enrichment: {data.mechanic_stats?.enrichment_complete ?? 0} complete,{' '}
                {data.mechanic_stats?.enrichment_needs_info ?? 0} need info
                {data.overview.mechanic_enrichment_pct != null &&
                  ` · ${data.overview.mechanic_enrichment_pct}%`}
              </p>
              <p className="meta">
                <Link to="/mechanics">Browse mechanics →</Link>
              </p>
            </div>
            <div>
              <h3>Skill categories</h3>
              <BarBreakdown data={data.skill_stats?.by_category ?? []} layout="horizontal" />
              <p className="meta">
                Enrichment: {data.skill_stats?.enrichment_complete ?? 0} complete,{' '}
                {data.skill_stats?.enrichment_needs_info ?? 0} need info
                {data.overview.skill_enrichment_pct != null &&
                  ` · ${data.overview.skill_enrichment_pct}%`}
              </p>
              <p className="meta">
                <Link to="/skills">Browse skills →</Link>
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Variables and UI menus"
          description="Early-stage entity catalogs — enrichment and pilot map binding coverage."
        >
          <div className="analytics-split">
            <div>
              <h3>Variable categories</h3>
              <BarBreakdown data={data.variable_stats?.by_category ?? []} layout="horizontal" />
              <p className="meta">
                Enrichment: {data.variable_stats?.enrichment_complete ?? 0} complete,{' '}
                {data.variable_stats?.enrichment_needs_info ?? 0} need info ·{' '}
                {data.variable_stats?.with_map_bindings ?? 0} with map bindings
              </p>
            </div>
            <div>
              <h3>Menu types</h3>
              <BarBreakdown data={data.menu_stats?.by_menu_type ?? []} layout="horizontal" />
              <p className="meta">
                Enrichment: {data.menu_stats?.enrichment_complete ?? 0} complete,{' '}
                {data.menu_stats?.enrichment_needs_info ?? 0} need info ·{' '}
                {data.menu_stats?.with_map_bindings ?? 0} with map bindings
              </p>
            </div>
          </div>
          {(data.variable_mechanic_pairs?.length ?? 0) > 0 && (
            <>
              <h3>Variable → mechanic links</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Mechanic</th>
                  </tr>
                </thead>
                <tbody>
                  {data.variable_mechanic_pairs.map((p) => (
                    <tr key={`${p.variable}-${p.mechanic}`}>
                      <td>
                        <Link to={`/variables/${p.variable}`}>{p.variable}</Link>
                      </td>
                      <td>
                        <Link to={`/mechanics/${p.mechanic}`}>{p.mechanic}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Menu navigation graph"
          description="Hub menus with the most flow edges and relationship types across pilot maps."
        >
          <HubDiagram menuFlow={data.menu_flow} />
        </SectionCard>
      </div>

      <InsightCallout insights={data.insights} />
    </div>
  )
}
