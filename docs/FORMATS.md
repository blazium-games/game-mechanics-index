# Multi-format export (`formats/v1/`)

The export pipeline (`go run ./cmd/export`) emits sanitized corpus data in five formats alongside the JSON API.

## Paths

| Format | Example path | Use when |
|--------|--------------|----------|
| JSON | `/api/v1/mechanics/{slug}.json` | Programmatic access, WebMCP tools, strict schemas |
| Markdown | `/formats/v1/mechanics/{slug}.md` | Human-readable GDD sections, LLM context with headings |
| YAML | `/formats/v1/mechanics/{slug}.yaml` | Config-driven tooling, readable structured data |
| XML | `/formats/v1/mechanics/{slug}.xml` | Legacy pipelines, stable element names |
| Plain text | `/formats/v1/mechanics/{slug}.txt` | Compact LLM context (headings stripped) |

### Directory layout

```
formats/v1/
  catalog.{md,yaml}
  index.md
  mechanics/{slug}.{md,yaml,xml,txt}
  maps/{slug}.{md,yaml,xml,txt}
  genres/{slug}.{md,yaml,xml,txt}
```

## Markdown layout (mechanics)

Mechanic Markdown mirrors the reference page structure:

1. Title + flavor/domain/complexity
2. Description
3. Category Insights (`flavor_rationale`)
4. Featured In / Common In
5. Synergies (with notes when present)
6. When to Use / Where to Use
7. Signature of
8. Examples
9. Agent Summary (when present)

Empty sections are omitted.

## Sanitization

All formats use the same public sanitizer as JSON:

- `implementation` block removed
- `media` removed
- map provenance URL field removed from maps
- Public sanitizer removes internal-only fields from all formats

## Regenerating

```bash
go run ./cmd/export -version 0.1.0
```

GitHub Pages hosts the JSON API under `/api/v1/`. Full multi-format exports (`formats/v1/`) are attached to [GitHub Releases](https://github.com/blazium-games/game-mechanics-index/releases) as `mechanics-index-formats-{version}.zip`.

## AI agent recommendation

- **Browser + live site:** WebMCP tools on [the index](https://blazium-games.github.io/game-mechanics-index/) (see [WEBMCP.md](WEBMCP.md))
- **Headless / CI:** `curl` the JSON API or fetch `.md` / `.txt` from `formats/v1/` for prose-oriented prompts
