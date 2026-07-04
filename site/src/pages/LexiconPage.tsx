import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCategories, listEntries, searchEntries, lexiconHref, getEntry } from '../lexicon'
import { pageTitle } from '../seo/meta'
import { definedTermJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

export function LexiconPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const categories = listCategories()
  const entries = useMemo(() => {
    const base = query ? searchEntries(query) : listEntries()
    if (!category) return base
    return base.filter(({ entry }) => entry.category === category)
  }, [query, category])

  const jsonLd = definedTermJsonLd({
    name: 'Game Design Index Lexicon',
    description: 'Field definitions and design terminology for the Game Design Index schemas.',
    url: 'https://blazium-games.github.io/game-design-index/docs/lexicon',
    termSet: 'Game Design Index Lexicon',
  })

  return (
    <div className="lexicon-page">
      <DocumentMeta
        title={pageTitle('Lexicon')}
        description="Definitions for schema fields, bindings, and core game design terms such as GDD, core loop, and enrichment."
        path="/docs/lexicon"
        jsonLd={jsonLd}
      />
      <h1>Lexicon</h1>
      <p>
        Field-level help and design terminology used across mechanics, variables, UI menus, skills, and
        gameplay maps. Click <span className="help-trigger inline-demo">?</span> icons on detail pages for
        quick definitions, or browse here.
      </p>
      <div className="lexicon-toolbar">
        <input
          type="search"
          placeholder="Search terms and fields…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search lexicon"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <nav className="lexicon-jump" aria-label="Category shortcuts">
        {categories.map((c) => (
          <a key={c.id} href={`#cat-${c.id}`}>
            {c.title}
          </a>
        ))}
      </nav>
      {categories.map((cat) => {
        const catEntries = entries.filter(({ entry }) => entry.category === cat.id)
        if (catEntries.length === 0) return null
        return (
          <section key={cat.id} id={`cat-${cat.id}`} className="lexicon-category">
            <h2>{cat.title}</h2>
            <p className="meta">{cat.description}</p>
            {catEntries.map(({ id, entry }) => (
              <article key={id} id={id} className="lexicon-entry">
                <h3>{entry.title}</h3>
                <p className="lexicon-id">
                  <code>{id}</code>
                  {entry.schemaRef && (
                    <>
                      {' · '}
                      <span>{entry.schemaRef}</span>
                    </>
                  )}
                </p>
                <p>{entry.long}</p>
                {entry.enumHelp && (
                  <dl className="enum-help">
                    {Object.entries(entry.enumHelp).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {(entry.related?.length ?? 0) > 0 && (
                  <p className="lexicon-related">
                    Related:{' '}
                    {entry.related!.map((rel, i) => (
                      <span key={rel}>
                        {i > 0 && ', '}
                        <Link to={lexiconHref(rel)}>{getEntryTitle(rel)}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </section>
        )
      })}
      {entries.length === 0 && <p>No matching entries.</p>}
    </div>
  )
}

function getEntryTitle(id: string): string {
  return getEntry(id)?.title ?? id
}
