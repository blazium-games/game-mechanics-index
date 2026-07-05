# Game Design Index

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Issues welcome](https://img.shields.io/badge/issues-welcome-blue.svg)](https://github.com/blazium-games/game-design-index/issues)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/blazium-games/game-design-index/pulls)

**An open, MIT-licensed index of video game mechanics and gameplay decomposition.**

Browse **1,389 gameplay maps**, **248 reusable mechanics**, and **16 genre recipes**. Use the static JSON API or in-page **WebMCP** tools for AI agents.

| | |
|---|---|
| **Live site** | [game-design-index](https://blazium-games.github.io/game-design-index) |
| **GitHub** | [blazium-games/game-design-index](https://github.com/blazium-games/game-design-index) |
| **Discord** | [Server Invite](https://discord.gg/sZaf9KYzDp) |
| **X** | [BlaziumGames](https://x.com/BlaziumGames) |
| **API** | [docs/API.md](docs/API.md) |
| **WebMCP** | [docs/WEBMCP.md](docs/WEBMCP.md) |
| **Contribute** | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Looking for additional data

We actively welcome **missing games**, **corrections**, and **new mechanic definitions**. Open an [Issue](https://github.com/blazium-games/game-design-index/issues/new/choose) or submit a PR.

## Quick start (developers)

```powershell
# Export public API
go run ./cmd/export -version 1.0.0

# Run site locally
cd site
npm install
npm run dev
```

## Data access

| Method | Use case |
|--------|----------|
| **GitHub Pages** | Latest API at `/api/v1/*.json` |
| **GitHub Releases** | Pinned `design-index-api-{version}.zip` |
| **WebMCP** | `document.modelContext` tools on the live site |

## Query with AI agents

The browse UI registers [WebMCP](https://github.com/webmachinelearning/webmcp) tools (`get-game`, `search-index`, `compose-design-brief`, etc.) so browser-integrated agents can query structured data instead of scraping HTML.

## License

MIT — see [LICENSE](LICENSE). Include the copyright notice when redistributing data.
