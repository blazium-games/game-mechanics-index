import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { DISCORD_URL, REPO_URL, TWITTER_URL } from '../types'
import { WebMCPBridge } from '../WebMCPBridge'

const NAV_LINKS = [
  { to: '/games', label: 'Games' },
  { to: '/mechanics', label: 'Mechanics' },
  { to: '/variables', label: 'Variables' },
  { to: '/skills', label: 'Skills' },
  { to: '/ui-menus', label: 'UI Menus' },
  { to: '/genres', label: 'Genres' },
  { to: '/explore/cooccurrence', label: 'Co-occurrence' },
  { to: '/explore/analytics', label: 'Analytics' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/docs/lexicon', label: 'Lexicon' },
  { to: '/docs/api', label: 'API' },
  { to: '/docs/webmcp', label: 'WebMCP' },
] as const

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className="app">
      <WebMCPBridge />
      <header className="header">
        <div className="header-bar">
          <Link to="/" className="logo">
            Game Design Index
          </Link>
          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
        </div>
        <div className={`header-nav-panel${menuOpen ? ' is-open' : ''}`} id="site-nav">
          <nav>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-community">
            <a className="btn github" href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn x-social" href={TWITTER_URL} target="_blank" rel="noreferrer">
              X
            </a>
            <a className="btn discord" href={DISCORD_URL} target="_blank" rel="noreferrer">
              Discord
            </a>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <span>MIT License · Blazium Games</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={TWITTER_URL} target="_blank" rel="noreferrer">
          X
        </a>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          Discord
        </a>
        <a href={`${REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer">
          Open an Issue
        </a>
      </footer>
    </div>
  )
}

export function SuggestEditLink({
  slug,
  kind,
}: {
  slug: string
  kind: 'game' | 'mechanic' | 'genre' | 'variable' | 'ui-menu'
}) {
  const title = encodeURIComponent(`Data correction: ${slug}`)
  const body = encodeURIComponent(
    `**${kind} slug:** \`${slug}\`\n\n**What should change:**\n\n`,
  )
  const url = `${REPO_URL}/issues/new?template=data-correction.yml&title=${title}&body=${body}`
  return (
    <a className="suggest-edit" href={url} target="_blank" rel="noreferrer">
      Suggest an edit
    </a>
  )
}
