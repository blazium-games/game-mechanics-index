import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RouteErrorFallback } from './components/RouteErrorFallback'
import { FilterProvider } from './context/Filters'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ApiDocsPage } from './pages/ApiDocsPage'
import { ChangelogPage } from './pages/ChangelogPage'
import { ContributePage } from './pages/ContributePage'
import { CooccurrencePage } from './pages/CooccurrencePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GamesPage } from './pages/GamesPage'
import { GenreDetailPage, GenresPage } from './pages/GenresPage'
import { HomePage } from './pages/HomePage'
import { MechanicDetailPage } from './pages/MechanicDetailPage'
import { MechanicsPage } from './pages/MechanicsPage'
import { VariableDetailPage } from './pages/VariableDetailPage'
import { VariablesPage } from './pages/VariablesPage'
import { UIMenuDetailPage } from './pages/UIMenuDetailPage'
import { UIMenusPage } from './pages/UIMenusPage'
import { SkillsPage } from './pages/SkillsPage'
import { SkillDetailPage } from './pages/SkillDetailPage'
import { LexiconPage } from './pages/LexiconPage'
import { WebMcpDocsPage } from './pages/WebMcpDocsPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'games', element: <GamesPage /> },
        { path: 'games/:slug', element: <GameDetailPage /> },
        { path: 'mechanics', element: <MechanicsPage /> },
        { path: 'mechanics/:slug', element: <MechanicDetailPage /> },
        { path: 'variables', element: <VariablesPage /> },
        { path: 'variables/:slug', element: <VariableDetailPage /> },
        { path: 'ui-menus', element: <UIMenusPage /> },
        { path: 'ui-menus/:slug', element: <UIMenuDetailPage /> },
        { path: 'skills', element: <SkillsPage /> },
        { path: 'skills/:slug', element: <SkillDetailPage /> },
        { path: 'genres', element: <GenresPage /> },
        { path: 'genres/:slug', element: <GenreDetailPage /> },
        { path: 'explore/cooccurrence', element: <CooccurrencePage /> },
        { path: 'explore/analytics', element: <AnalyticsPage />, errorElement: <RouteErrorFallback /> },
        { path: 'changelog', element: <ChangelogPage /> },
        { path: 'contribute', element: <ContributePage /> },
        { path: 'docs/lexicon', element: <LexiconPage /> },
        { path: 'docs/api', element: <ApiDocsPage /> },
        { path: 'docs/webmcp', element: <WebMcpDocsPage /> },
      ],
    },
  ],
  { basename: basename === '/' ? undefined : basename },
)

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <RouterProvider router={router} />
      </FilterProvider>
    </QueryClientProvider>
  )
}
