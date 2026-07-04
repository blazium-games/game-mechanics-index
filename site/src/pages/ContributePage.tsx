import { Link } from 'react-router-dom'
import { DISCORD_URL, REPO_URL } from '../types'
import { pageTitle } from '../seo/meta'
import { faqPageJsonLd } from '../seo/jsonld'
import { DocumentMeta } from '../seo/usePageMeta'

const contributeFaqs = [
  {
    question: 'How do I add a new game to the index?',
    answer:
      'Open a GitHub issue or pull request with a gameplay map JSON file including subject, narrative, signature mechanics, and mechanic bindings with map_notes.',
  },
  {
    question: 'How do I enrich an existing mechanic?',
    answer:
      'Use the enrich-mechanic issue template with design guidance, learning objectives, design exercises, and agent context. Author a local patch under data/source/enrichment/cohorts/, run apply_enrichment to merge into library catalogs, then open a PR with the merged library/map changes only.',
  },
  {
    question: 'Where is the data licensed?',
    answer: 'The Game Design Index is MIT-licensed. See the GitHub repository for full license terms.',
  },
  {
    question: 'Can I discuss contributions before opening a PR?',
    answer:
      'Yes — join the Blazium Games Discord to coordinate game design contributions and ask questions.',
  },
]

export function ContributePage() {
  return (
    <div>
      <DocumentMeta
        title={pageTitle('Contribute')}
        description="How to contribute games, mechanics, and design pedagogy to the index."
        path="/contribute"
        jsonLd={faqPageJsonLd(contributeFaqs)}
      />
      <h1>Contribute</h1>
      <p>We are actively looking for additional game data. Help expand the index via GitHub.</p>
      <section>
        <h2>What to add</h2>
        <ul>
          <li>
            <strong>New game map</strong> — subject, narrative, signatures, mechanic bindings with
            map_notes
          </li>
          <li>
            <strong>Enrich existing game</strong> — upgrade quality toward curated with
            game-specific notes
          </li>
          <li>
            <strong>New mechanic</strong> — schema 1.1 entry with domain, tags, summary
          </li>
          <li>
            <strong>Enrich mechanic</strong> — add design guidance, agent context, learning objectives,
            and design exercises (schema 1.3) via{' '}
            <a href={`${REPO_URL}/issues/new?template=enrich-mechanic.yml`} target="_blank" rel="noreferrer">
              enrich-mechanic
            </a>{' '}
            issues; author local patches in{' '}
            <a href={`${REPO_URL}/tree/main/data/source/enrichment`} target="_blank" rel="noreferrer">
              data/source/enrichment/
            </a>
            , apply with <code>go run ./scripts/apply_enrichment</code>, then PR merged catalog changes
          </li>
          <li>
            <strong>Game variables</strong> — enrich catalog entries (shared rationale, player
            focus, typical range) via enrich-variable issues
          </li>
          <li>
            <strong>UI menus</strong> — document screen patterns and map bindings via enrich-ui-menu
            issues
          </li>
          <li>
            <strong>Map bindings</strong> — add variables[] and ui_menus[] to gameplay maps
          </li>
          <li>
            <strong>Corrections</strong> — fix genres, synergies, or signature lists
          </li>
        </ul>
      </section>
      <section>
        <h2>Community</h2>
        <p>
          Join the <a href={DISCORD_URL} target="_blank" rel="noreferrer">Blazium Games Discord</a>{' '}
          to discuss game design, ask questions, and coordinate contributions. Submit data changes
          and corrections via{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          Issues and pull requests.
        </p>
        <div className="cta-actions">
          <a className="btn discord" href={DISCORD_URL} target="_blank" rel="noreferrer">
            Join Discord
          </a>
          <a className="btn github" href={REPO_URL} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </div>
      </section>
      <section>
        <h2>Quality tiers</h2>
        <ul>
          <li>
            <strong>curated</strong> — hand-enriched, game-specific mechanic notes
          </li>
          <li>
            <strong>template</strong> — genre-derived starter maps awaiting enrichment
          </li>
        </ul>
      </section>
      <div className="cta-actions">
        <a className="btn" href={`${REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer">
          Open an Issue
        </a>
        <a className="btn secondary" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
          CONTRIBUTING.md
        </a>
      </div>
      <p>
        See also <Link to="/docs/lexicon">Lexicon</Link>, <Link to="/docs/api">API docs</Link>, and{' '}
        <Link to="/docs/webmcp">WebMCP tools</Link>.
      </p>
    </div>
  )
}
