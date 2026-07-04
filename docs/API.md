# Static JSON API

The Game Mechanics Index exposes a **read-only static JSON API** served from GitHub Pages and versioned GitHub Releases.

## Base URLs

| Source | URL |
|--------|-----|
| Latest (Pages) | `https://blazium-games.github.io/game-mechanics-index/api/v1/` |
| Multi-format export | [GitHub Releases](https://github.com/blazium-games/game-mechanics-index/releases) (`mechanics-index-formats-{version}.zip`) |
| Pinned release | `https://github.com/blazium-games/game-mechanics-index/releases/download/v{version}/mechanics-index-api-{version}.zip` |

## JSON endpoints (`/api/v1/`)

| Path | Description |
|------|-------------|
| `catalog.json` | Counts, schema version, release version, genres |
| `maps/index.json` | Lightweight game map rows |
| `maps/{slug}.json` | Full gameplay map (sanitized) |
| `mechanics/index.json` | Mechanic index rows |
| `mechanics/{slug}.json` | Full mechanic entry (no implementation block) |
| `genres/index.json` | Genre recipe index |
| `genres/{slug}.json` | Genre recipe map |
| `search.json` | Unified search index |
| `tags.json` | Controlled mechanic tag vocabulary |
| `indexes/mechanic-to-maps.json` | Reverse index |
| `indexes/cooccurrence-top500.json` | Top mechanic pairs |
| `indexes/genre-to-recipes.json` | Genre labels to recipe slugs |
| `openapi.json` | Minimal OpenAPI descriptor |

## Multi-format endpoints (`/formats/v1/`)

| Path | Description |
|------|-------------|
| `catalog.md` / `catalog.yaml` | Corpus summary |
| `index.md` | Mechanic slug listing |
| `mechanics/{slug}.md` | GDD-style Markdown mechanic page |
| `mechanics/{slug}.yaml` | YAML mechanic document |
| `mechanics/{slug}.xml` | XML mechanic document |
| `mechanics/{slug}.txt` | Plain-text mechanic (LLM-friendly) |
| `maps/{slug}.{md,yaml,xml,txt}` | Game map exports |
| `genres/{slug}.{md,yaml,xml,txt}` | Genre recipe exports |

See [FORMATS.md](FORMATS.md) for format selection guidance.

## Example

```bash
curl -s https://blazium-games.github.io/game-mechanics-index/api/v1/catalog.json
curl -s https://blazium-games.github.io/game-mechanics-index/formats/v1/mechanics/boss-weakness-network.md
```

```javascript
const catalog = await fetch('/api/v1/catalog.json').then((r) => r.json())
```

## Versioning

- `catalog.json` → `release_version` and `schema_version` (currently `1.2` for mechanics)
- Pin consumers to GitHub Release tags for reproducible builds

## Sanitized export

Public API responses omit map provenance URL fields, mechanic implementation blocks, and `media`.

## WebMCP

For in-browser AI agents, prefer [WebMCP tools](WEBMCP.md) on the live site over raw HTTP when the user is already browsing the index.

## License

MIT — retain copyright notice when redistributing.
