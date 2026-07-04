# Lexicon

Canonical field help and design-term definitions for the Game Design Index site and API.

## Entry IDs

| Prefix | Example | Use |
|--------|---------|-----|
| Bare slug | `gdd`, `core-loop`, `enrichment` | Cross-cutting design terms |
| `field.{entity}.{path}` | `field.variable.scope` | Schema field help |
| `section.{context}.{id}` | `section.map.gdd-outline` | Detail page section help |
| `filter.{name}` | `filter.enrichment` | Index page filter labels |

## Adding entries

1. Edit [`scripts/build_lexicon/main.go`](../scripts/build_lexicon/main.go) and regenerate:

   ```powershell
   go run ./scripts/build_lexicon > data/source/lexicon/lexicon.json
   ```

2. Run `go run ./scripts/lint_lexicon` to verify `field.*` keys map to schema properties.

3. Reference new ids from the site via `HelpTooltip`, `FieldLabel`, or `SectionHeading helpKey`.

## Export

`cmd/export` copies `lexicon.json` to `data/dist/api/v1/lexicon.json` for agents and external tools.
