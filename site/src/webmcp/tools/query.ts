import { jsonResponse } from '../responses'
import type { WebMCPDeps } from '../types'

type RegisterOpts = { signal?: AbortSignal }

export async function registerQueryTools(deps: WebMCPDeps, opts: RegisterOpts) {
  const mc = document.modelContext

  await mc.registerTool(
    {
      name: 'get-catalog',
      description: 'Return corpus statistics, schema version, and genre list for the game mechanics index.',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        return jsonResponse(await deps.api.fetchCatalog())
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'search-index',
      description: 'Search games and mechanics by title or slug substring.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search text' },
          type: { type: 'string', enum: ['game', 'mechanic'], description: 'Optional type filter' },
          limit: { type: 'number', description: 'Max results (default 25)' },
        },
        required: ['query'],
      },
      async execute(args) {
        const { query, type, limit = 25 } = args as {
          query: string
          type?: string
          limit?: number
        }
        const rows = await deps.api.fetchSearch()
        const q = query.toLowerCase()
        const out = rows
          .filter((r) => !type || r.type === type)
          .filter((r) => r.title.toLowerCase().includes(q) || r.slug.includes(q))
          .slice(0, limit)
        return jsonResponse(out)
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'list-games',
      description: 'List gameplay maps with optional genre and quality tier filters.',
      inputSchema: {
        type: 'object',
        properties: {
          genre: { type: 'string' },
          quality_tier: { type: 'string', enum: ['curated', 'template', 'catalog'] },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
      async execute(args) {
        const { genre, quality_tier, limit = 50, offset = 0 } = args as {
          genre?: string
          quality_tier?: string
          limit?: number
          offset?: number
        }
        let rows = await deps.api.fetchMapsIndex()
        rows = rows.filter((m) => m.map_type === 'game')
        if (genre) rows = rows.filter((m) => m.genres?.some((g) => g.toLowerCase() === genre.toLowerCase()))
        if (quality_tier) rows = rows.filter((m) => m.quality_tier === quality_tier)
        return jsonResponse(rows.slice(offset, offset + limit))
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'get-game',
      description: 'Return the full gameplay decomposition map for a game by slug.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Game map slug' } },
        required: ['slug'],
      },
      async execute(args) {
        const { slug } = args as { slug: string }
        return jsonResponse(await deps.api.fetchMap(slug))
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'list-mechanics',
      description: 'List mechanic entries with optional domain, flavor, and tag filters.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          flavor: { type: 'string', enum: ['action', 'adventure', 'strategy'] },
          tag: { type: 'string' },
          limit: { type: 'number' },
        },
      },
      async execute(args) {
        const { domain, flavor, tag, limit = 50 } = args as {
          domain?: string
          flavor?: string
          tag?: string
          limit?: number
        }
        let rows = await deps.api.fetchMechanicsIndex()
        if (domain) rows = rows.filter((m) => m.domain === domain)
        if (flavor) rows = rows.filter((m) => m.flavor === flavor)
        if (tag) rows = rows.filter((m) => m.tags?.includes(tag))
        return jsonResponse(rows.slice(0, limit))
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'get-mechanic',
      description: 'Return a full mechanic library entry by slug.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      async execute(args) {
        const { slug } = args as { slug: string }
        return jsonResponse(await deps.api.fetchMechanic(slug))
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'get-mechanic-formatted',
      description: 'Return a mechanic entry as Markdown, YAML, or plain text (formatted from JSON).',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          format: { type: 'string', enum: ['md', 'yaml', 'txt'], description: 'Output format (default md)' },
        },
        required: ['slug'],
      },
      async execute(args) {
        const { slug, format = 'md' } = args as { slug: string; format?: 'md' | 'yaml' | 'txt' }
        const text = await deps.api.fetchMechanicFormatted(slug, format)
        return { content: [{ type: 'text', text }] }
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'list-genres',
      description: 'List genre recipe maps in the index.',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        return jsonResponse(await deps.api.fetchGenresIndex())
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'get-genre',
      description: 'Return a genre recipe gameplay map by slug.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug'],
      },
      async execute(args) {
        const { slug } = args as { slug: string }
        return jsonResponse(await deps.api.fetchGenre(slug))
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'get-mechanic-maps',
      description: 'Return map slugs that feature a given mechanic.',
      inputSchema: {
        type: 'object',
        properties: {
          mechanic_slug: { type: 'string' },
          quality_tier: { type: 'string' },
        },
        required: ['mechanic_slug'],
      },
      async execute(args) {
        const { mechanic_slug, quality_tier } = args as {
          mechanic_slug: string
          quality_tier?: string
        }
        const idx = await deps.api.fetchMechanicToMaps()
        let slugs = idx.mechanics[mechanic_slug] ?? []
        if (quality_tier) {
          const maps = await deps.api.fetchMapsIndex()
          const tierSet = new Set(
            maps.filter((m) => m.quality_tier === quality_tier).map((m) => m.slug),
          )
          slugs = slugs.filter((s) => tierSet.has(s))
        }
        return jsonResponse({ mechanic_slug, maps: slugs })
      },
    },
    opts,
  )

  await mc.registerTool(
    {
      name: 'list-tags',
      description: 'Return the controlled mechanic tag vocabulary.',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        return jsonResponse(await deps.api.fetchTags())
      },
    },
    opts,
  )
}
