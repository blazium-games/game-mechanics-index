# Data format (schema 1.2)

Neutral field guide for contributors to the Game Design Index. For in-depth definitions of every field and core design terms (GDD, core loop, enrichment, binding roles), see the live **[Lexicon](/docs/lexicon)** and `GET /api/v1/lexicon.json`.

## Schema versions

| Document | Version | Notes |
|----------|---------|-------|
| Mechanic entries | **1.2** / **1.3** | 1.3 adds `learning_objectives`, `design_exercises`, `skills_developed` |
| Design skills | **1.0** | Catalog in `library/skills.json` |
| Game variables | **1.0** / **1.1** | 1.1 adds `agent_context` |
| UI menus | **1.0** / **1.1** | 1.1 adds `agent_context` |
| Gameplay maps | **1.1** (or 1.2) | Optional `skill_slugs[]` references skills catalog |

## Gameplay map (`data/source/maps/{slug}.json`)

| Field | Required | Notes |
|-------|----------|-------|
| `schema_version` | yes | `"1.1"` or `"1.2"` |
| `slug` | yes | kebab-case stable ID |
| `title` | yes | Display title |
| `map_type` | yes | `game` or `genre` |
| `subject` | yes | `name`, `genres[]`, optional `influences[]` |
| `narrative` | yes | `description`, `core_loop`, `skills_tested[]` |
| `signature_gameplay` | yes | 3–7 mechanic slugs |
| `mechanics` | yes | Bindings: `mechanic_slug`, `role`, `map_notes`, `domain` |
| `gdd_outline` | no | GDD seed: `overview`, `core_loop`, `player_goals[]`, `constraints[]`, `progression_notes`, `combat_notes`, `economy_notes` |
| `mechanic_relationships[]` | no | Map-local edges: `from_mechanic`, `to_mechanic`, `relationship`, `notes` |
| `skill_slugs[]` | no | Structured refs to `library/skills.json` (keep `narrative.skills_tested[]` for display) |

### Binding roles

- `signature` — DNA mechanic for this game
- `supporting` — important but not identity-defining
- `common` — genre-standard presence

### Flavors (mechanic entries)

Each mechanic has exactly one **flavor**: `action`, `adventure`, or `strategy`.

### Domains

`locomotion`, `combat`, `progression`, `economy`, `level`, `session`

## Mechanic entry (`library/mechanics.json`)

### Required (1.1 core)

| Field | Required |
|-------|----------|
| `slug`, `name`, `flavor`, `domain`, `summary`, `tags[]` | yes |
| `requirements[]` | recommended |
| `synergies[]`, `conflicts[]` | optional |
| `signature_of.games[]` | when known |

### Schema 1.2 additions (GDD / AI)

| Field | Purpose |
|-------|---------|
| `flavor_rationale` | Why the flavor classification fits (Category Insights) |
| `design_guidance.when_to_use` | When to apply this mechanic |
| `design_guidance.where_to_use` | Which design layer (boss roster, macro routing, etc.) |
| `design_guidance.when_to_avoid[]` | Contexts to avoid |
| `design_guidance.designer_notes` | Tuning / implementation notes |
| `synergy_notes[]` | `{ slug, note }` — synergies with designer prose |
| `player_experience` | What the player optimizes for |
| `complexity` | `S` / `M` / `L` — public design effort |
| `examples[]` | `{ label, description, map_slug? }` |
| `relationship_model` | Network mechanics: `type` (`directed_cycle` \| `graph`), `edges[]` |
| `agent_context.summary_for_agents` | One-paragraph agent synopsis |
| `agent_context.gdd_prompt` | Ready-made GDD section seed |
| `agent_context.implementation_checklist[]` | Build-order checklist |
| `media.snippet_path` | Internal asset path; **stripped on public export** |

Keep `parameter_knobs`, `requirements`, `synergies` (slug index), `conflicts`, and `anti_patterns` as first-class design fields.

### Schema 1.3 additions (design pedagogy)

| Field | Purpose |
|-------|---------|
| `learning_objectives[]` | Designer-facing outcomes when applying the mechanic |
| `design_exercises[]` | `{ prompt, constraints[], success_criteria[] }` practice prompts |
| `skills_developed[]` | Skill slugs from the skills catalog |

## Enrichment patches (`data/source/enrichment/`)

Design pedagogy content is contributed via **local cohort patch files** under `enrichment/cohorts/` (gitignored), merged into library catalogs by `go run ./scripts/apply_enrichment`.

| Step | Action |
|------|--------|
| 1 | Open a GitHub **Enrich mechanic** issue (or enrich-variable / enrich-ui-menu for other entities) |
| 2 | Author `{YYYY-MM}-{label}-v{release}.json` locally with slug-keyed patches |
| 3 | Run `go run ./scripts/apply_enrichment` locally |
| 4 | PR the merged `library/` and `maps/` changes only (cohort files stay local) |

A mechanic is **enrichment complete** when both `design_guidance.when_to_use` and `agent_context.summary_for_agents` are populated. Export exposes `enrichment_status` on mechanics, variables, menus, and skills index rows.

See [`data/source/enrichment/README.md`](../data/source/enrichment/README.md) for patch format and naming.

## Design skill (`library/skills.json`)

| Field | Required | Notes |
|-------|----------|-------|
| `slug`, `name`, `summary`, `category`, `learning_outcome`, `tags[]` | yes | |
| `category` | yes | `motor`, `cognitive`, `strategic`, `social`, `creative` |
| `practice_activities[]` | no | How games train this skill |
| `related_mechanics[]`, `related_variables[]` | no | Cross-links |
| `design_guidance` | no | When to emphasize this skill in a design |

## Quality metadata

`metadata.quality_tier`: `curated` | `catalog` | `template` | `stub`

## Public export

The export pipeline strips `implementation`, `media`, and map provenance URLs before publishing.

Multi-format exports (Markdown, YAML, XML, plain text) are documented in [FORMATS.md](FORMATS.md).
