import toolsManifest from '../../public/webmcp-tools.json'
import { CopyBlock } from '../components/CopyBlock'

const LIVE = 'https://blazium-games.github.io/game-mechanics-index/'

const cursorRule = `When the user asks about game mechanics, genre recipes, or gameplay decomposition:
1. Prefer the Game Mechanics Index WebMCP tools on ${LIVE} when browsing that page.
2. Otherwise use the static API: ${LIVE}api/v1/
3. Use tool names: get-catalog, search-index, get-game, get-mechanic, get-mechanic-formatted, compose-design-brief, get-cooccurrence.
4. Do not scrape HTML; use structured JSON from tools or API.`

const userPrompt = `You are on the Game Mechanics Index. Use document.modelContext WebMCP tools (not HTML scraping).
Task: Find curated metroidvania-style games, list their signature mechanics, and draft a one-page design brief combining the top two references.
Tools to use: search-index, get-game, compose-design-brief.`

const apiFallback = `curl -s ${LIVE}api/v1/catalog.json
curl -s ${LIVE}api/v1/mechanics/boss-weakness-network.json`

const systemContext = `Game Mechanics Index — 1389 games, 248 mechanics, schema 1.2.
WebMCP tools on document.modelContext return { content: [{ type: "text", text: "<json>" }] }.
Catalog: get-catalog. Search: search-index { query }. Game: get-game { slug }. Mechanic: get-mechanic { slug }. Formatted: get-mechanic-formatted { slug, format: "md" }. GDD seed: compose-design-brief { ref_slugs: ["hollow-knight", "dead-cells"] }.`

export function WebMcpDocsPage() {
  const tools = toolsManifest.tools as Array<{
    name: string
    description: string
    inputSchema: object
  }>
  return (
    <div>
      <h1>WebMCP agent tools</h1>
      <p>
        This site registers <a href="https://github.com/webmachinelearning/webmcp">WebMCP</a> tools on{' '}
        <code>document.modelContext</code> so browser-integrated AI agents can query the index with
        structured schemas instead of scraping the UI.
      </p>

      <h2 id="quick-start">Quick start</h2>
      <ol>
        <li>
          Open the <a href={LIVE}>live site</a> in a WebMCP-capable browser or Cursor browser agent.
        </li>
        <li>
          Confirm tools: run <code>document.modelContext.getTools()</code> in DevTools.
        </li>
        <li>Paste a user prompt (below) and let the agent call tools.</li>
      </ol>

      <h2 id="cursor">Cursor workflow</h2>
      <p>
        Open the index URL in Cursor&apos;s browser, then paste the user prompt block. The agent should call
        WebMCP tools rather than scraping HTML.
      </p>
      <CopyBlock label="User prompt">{userPrompt}</CopyBlock>

      <h2 id="api-fallback">Static API fallback (no browser)</h2>
      <p>When WebMCP is unavailable, use JSON or Markdown from the static export:</p>
      <CopyBlock label="curl">{apiFallback}</CopyBlock>

      <h2 id="rules">Project rule (copy into .cursor/rules)</h2>
      <CopyBlock label="Cursor rule">{cursorRule}</CopyBlock>

      <h2 id="system-context">System context</h2>
      <CopyBlock label="Paste at session start">{systemContext}</CopyBlock>

      <h2>Registered tools ({tools.length})</h2>
      {tools.map((t) => (
        <section key={t.name} className="tool-doc">
          <h3>
            <code>{t.name}</code>
          </h3>
          <p>{t.description}</p>
          <pre>{JSON.stringify(t.inputSchema, null, 2)}</pre>
        </section>
      ))}

      <h2>Example prompts</h2>
      <ul>
        <li>What are Hollow Knight&apos;s signature mechanics?</li>
        <li>Find metroidvania games with checkpoint mechanics</li>
        <li>Compose a design brief from Hades and Dead Cells</li>
        <li>Fetch boss-weakness-network as Markdown for a GDD section</li>
      </ul>

      <p>
        Full manifest: <a href="/webmcp-tools.json">webmcp-tools.json</a> · GitHub{' '}
        <a
          href="https://github.com/blazium-games/game-mechanics-index/blob/main/docs/WEBMCP.md"
          target="_blank"
          rel="noreferrer"
        >
          docs/WEBMCP.md
        </a>
      </p>
    </div>
  )
}
