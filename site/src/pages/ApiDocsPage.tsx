import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export function ApiDocsPage() {
  const { data: catalog } = useQuery({ queryKey: ['catalog'], queryFn: api.fetchCatalog })
  const base = api.base
  const endpoints = [
    '/catalog.json',
    '/maps/index.json',
    '/maps/{slug}.json',
    '/mechanics/index.json',
    '/mechanics/{slug}.json',
    '/genres/index.json',
    '/search.json',
    '/indexes/cooccurrence-top500.json',
    '/indexes/mechanic-to-maps.json',
    '/tags.json',
    '/openapi.json',
  ]
  return (
    <div>
      <h1>Static JSON API</h1>
      <p>
        Read-only HTTP endpoints mirrored on GitHub Pages. Pin versions via{' '}
        <a href="https://github.com/blazium-games/game-mechanics-index/releases" target="_blank" rel="noreferrer">
          GitHub Releases
        </a>{' '}
        or npm <code>@blazium-games/mechanics-index-data</code>.
      </p>
      {catalog && (
        <p className="meta">
          Schema {catalog.schema_version} · Release v{catalog.release_version} · License{' '}
          {catalog.license}
        </p>
      )}
      <p>
        Base URL (latest): <code>{base}</code>
      </p>
      <h2>Endpoints</h2>
      <ul>
        {endpoints.map((e) => (
          <li key={e}>
            <a href={`${base}${e.replace('{slug}', 'hollow-knight')}`} target="_blank" rel="noreferrer">
              {e}
            </a>
          </li>
        ))}
      </ul>
      <h2>Example</h2>
      <pre>{`fetch('${base}/maps/hollow-knight.json').then(r => r.json())`}</pre>
      <p>
        For in-browser AI agents, see <Link to="/docs/webmcp">WebMCP tools</Link> (copy-paste prompts at{' '}
        <Link to="/docs/webmcp#cursor">#cursor</Link>). Use <code>get-mechanic-formatted</code> for Markdown/YAML/text from JSON.
      </p>
      <h2>Multi-format export</h2>
      <p>
        Download <code>mechanics-index-formats-&#123;version&#125;.zip</code> from{' '}
        <a href="https://github.com/blazium-games/game-mechanics-index/releases" target="_blank" rel="noreferrer">
          GitHub Releases
        </a>{' '}
        — see{' '}
        <a
          href="https://github.com/blazium-games/game-mechanics-index/blob/main/docs/FORMATS.md"
          target="_blank"
          rel="noreferrer"
        >
          FORMATS.md
        </a>
      </p>
    </div>
  )
}
