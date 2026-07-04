import { formatMechanic } from '../utils/mechanicFormat'
import type {
  Catalog,
  CooccurrencePair,
  GameplayMap,
  GenreIndexRow,
  MapIndexRow,
  MechanicEntry,
  MechanicIndexRow,
  SearchRow,
} from '../types'

const BASE =
  import.meta.env.VITE_DATA_BASE_URL ??
  `${import.meta.env.BASE_URL}api/v1`

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  base: BASE,
  fetchCatalog: () => get<Catalog>('/catalog.json'),
  fetchMapsIndex: () => get<MapIndexRow[]>('/maps/index.json'),
  fetchMap: (slug: string) => get<GameplayMap>(`/maps/${slug}.json`),
  fetchMechanicsIndex: () => get<MechanicIndexRow[]>('/mechanics/index.json'),
  fetchMechanic: (slug: string) => get<MechanicEntry>(`/mechanics/${slug}.json`),
  fetchGenresIndex: () => get<GenreIndexRow[]>('/genres/index.json'),
  fetchGenre: (slug: string) => get<GameplayMap>(`/genres/${slug}.json`),
  fetchSearch: () => get<SearchRow[]>('/search.json'),
  fetchCooccurrence: async (limit = 100) => {
    const data = await get<{ pairs?: CooccurrencePair[] } | CooccurrencePair[]>(
      '/indexes/cooccurrence-top500.json',
    )
    const pairs = Array.isArray(data) ? data : (data.pairs ?? [])
    return pairs.slice(0, limit)
  },
  fetchMechanicToMaps: () =>
    get<{ mechanics: Record<string, string[]> }>('/indexes/mechanic-to-maps.json'),
  fetchTags: () => get<{ tags: string[] }>('/tags.json'),
  fetchMechanicFormatted: async (slug: string, format: 'md' | 'yaml' | 'txt' = 'md') => {
    const entry = await get<MechanicEntry>(`/mechanics/${slug}.json`)
    return formatMechanic(entry, format)
  },
}

export type ApiClient = typeof api
