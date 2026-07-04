package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const (
	siteName      = "Game Design Index"
	twitterHandle = "@BlaziumGames"
	themeColor    = "#1a1d24"
)

type pageMeta struct {
	Path        string
	Title       string
	Description string
	OgType      string
}

type indexRow struct {
	Slug    string `json:"slug"`
	Title   string `json:"title"`
	Name    string `json:"name"`
	MapType string `json:"map_type"`
}

type mechanicRow struct {
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type namedRow struct {
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type catalog struct {
	ReleaseVersion string `json:"release_version"`
	GameCount      int    `json:"game_count"`
	MechanicCount  int    `json:"mechanic_count"`
}

type mapDoc struct {
	Title     string `json:"title"`
	Narrative struct {
		Description string `json:"description"`
	} `json:"narrative"`
	Subject struct {
		Name string `json:"name"`
	} `json:"subject"`
}

type mechanicDoc struct {
	Name    string `json:"name"`
	Summary string `json:"summary"`
}

type skillDoc struct {
	Name    string `json:"name"`
	Summary string `json:"summary"`
}

type variableDoc struct {
	Name    string `json:"name"`
	Summary string `json:"summary"`
}

type menuDoc struct {
	Name    string `json:"name"`
	Summary string `json:"summary"`
}

func main() {
	dist := flag.String("dist", "site/dist", "Vite build output directory")
	api := flag.String("api", "data/dist/api/v1", "Exported API root")
	base := flag.String("base", "https://blazium-games.github.io/game-design-index", "Public site base URL")
	flag.Parse()

	templatePath := filepath.Join(*dist, "index.html")
	template, err := os.ReadFile(templatePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read template: %v\n", err)
		os.Exit(1)
	}

	pages, lastMod, err := collectPages(*api)
	if err != nil {
		fmt.Fprintf(os.Stderr, "collect pages: %v\n", err)
		os.Exit(1)
	}

	baseURL := strings.TrimRight(*base, "/")
	ogImage := baseURL + "/og-default.png"

	for _, p := range pages {
		htmlDoc := injectMeta(string(template), p, baseURL, ogImage)
		outPath := filepath.Join(*dist, routeToFile(p.Path))
		if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
			exitErr(err)
		}
		if err := os.WriteFile(outPath, []byte(htmlDoc), 0o644); err != nil {
			exitErr(err)
		}
	}

	if err := writeSitemap(*dist, baseURL, pages, lastMod); err != nil {
		exitErr(err)
	}
	if err := writeRobots(*dist, baseURL); err != nil {
		exitErr(err)
	}
	if err := writeLLMsTxt(*dist, baseURL); err != nil {
		exitErr(err)
	}
	if err := writeSPAFallback(*dist); err != nil {
		exitErr(err)
	}

	fmt.Printf("Generated SEO for %d routes in %s\n", len(pages), *dist)
}

func exitErr(err error) {
	fmt.Fprintf(os.Stderr, "%v\n", err)
	os.Exit(1)
}

func routeToFile(path string) string {
	if path == "/" || path == "" {
		return "index.html"
	}
	return strings.TrimPrefix(path, "/") + "/index.html"
}

func collectPages(apiRoot string) ([]pageMeta, string, error) {
	var pages []pageMeta
	lastMod := time.Now().Format("2006-01-02")

	var cat catalog
	if data, err := os.ReadFile(filepath.Join(apiRoot, "catalog.json")); err == nil {
		_ = json.Unmarshal(data, &cat)
		if cat.ReleaseVersion != "" {
			lastMod = time.Now().Format("2006-01-02")
		}
	}

	staticPages := []pageMeta{
		{Path: "/", Title: siteName, Description: defaultDesc(), OgType: "website"},
		{Path: "/games", Title: "Games · " + siteName, Description: "Browse gameplay maps and signature mechanics for indexed video games.", OgType: "website"},
		{Path: "/mechanics", Title: "Mechanics · " + siteName, Description: "Reusable game design mechanics catalog with design guidance and enrichment status.", OgType: "website"},
		{Path: "/variables", Title: "Variables · " + siteName, Description: "Game variables catalog: health, currency, slots, and shared state patterns.", OgType: "website"},
		{Path: "/skills", Title: "Design Skills · " + siteName, Description: "Player skills catalog linked to mechanics, variables, and games.", OgType: "website"},
		{Path: "/ui-menus", Title: "UI Menus · " + siteName, Description: "Reusable UI menu patterns and screen flows across games.", OgType: "website"},
		{Path: "/genres", Title: "Genres · " + siteName, Description: "Genre recipe maps and common mechanic bindings.", OgType: "website"},
		{Path: "/explore/cooccurrence", Title: "Co-occurrence · " + siteName, Description: "Mechanic co-occurrence pairs across gameplay maps.", OgType: "website"},
		{Path: "/explore/analytics", Title: "Analytics · " + siteName, Description: "Corpus analytics, enrichment coverage, and design statistics.", OgType: "website"},
		{Path: "/changelog", Title: "Changelog · " + siteName, Description: "Release history for the Game Design Index data and site.", OgType: "website"},
		{Path: "/contribute", Title: "Contribute · " + siteName, Description: "How to contribute games, mechanics, and design pedagogy to the index.", OgType: "website"},
        {Path: "/docs/lexicon", Title: "Lexicon · " + siteName, Description: "Field definitions and game design terminology for the index schemas.", OgType: "website"},
        {Path: "/docs/api", Title: "API Docs · " + siteName, Description: "Static JSON API documentation for the Game Design Index.", OgType: "website"},
		{Path: "/docs/webmcp", Title: "WebMCP · " + siteName, Description: "In-browser WebMCP tools for AI agents querying the index.", OgType: "website"},
	}
	pages = append(pages, staticPages...)

	mapRows, _ := readIndex[indexRow](filepath.Join(apiRoot, "maps", "index.json"))
	for _, row := range mapRows {
		if row.MapType == "genre" {
			continue
		}
		desc := fmt.Sprintf("Gameplay map for %s with signature mechanics and design decomposition.", row.Name)
		if doc, err := readMapDoc(filepath.Join(apiRoot, "maps", row.Slug+".json")); err == nil {
			if doc.Narrative.Description != "" {
				desc = truncate(doc.Narrative.Description, 300)
			} else if doc.Subject.Name != "" {
				desc = fmt.Sprintf("Gameplay map for %s with signature mechanics and design decomposition.", doc.Subject.Name)
			}
			title := doc.Title
			if title == "" {
				title = row.Title
			}
			pages = append(pages, pageMeta{
				Path:        "/games/" + row.Slug,
				Title:       pageTitle(title),
				Description: desc,
				OgType:      "article",
			})
			continue
		}
		pages = append(pages, pageMeta{
			Path:        "/games/" + row.Slug,
			Title:       pageTitle(row.Title),
			Description: desc,
			OgType:      "article",
		})
	}

	mechRows, _ := readIndex[mechanicRow](filepath.Join(apiRoot, "mechanics", "index.json"))
	for _, row := range mechRows {
		desc := fmt.Sprintf("Reusable game design mechanic: %s.", row.Name)
		if doc, err := readMechanicDoc(filepath.Join(apiRoot, "mechanics", row.Slug+".json")); err == nil && doc.Summary != "" {
			desc = truncate(doc.Summary, 300)
		}
		pages = append(pages, pageMeta{
			Path:        "/mechanics/" + row.Slug,
			Title:       pageTitle(row.Name),
			Description: desc,
			OgType:      "article",
		})
	}

	varRows, _ := readIndex[namedRow](filepath.Join(apiRoot, "variables", "index.json"))
	for _, row := range varRows {
		desc := fmt.Sprintf("Game variable catalog entry: %s.", row.Name)
		if doc, err := readVariableDoc(filepath.Join(apiRoot, "variables", row.Slug+".json")); err == nil && doc.Summary != "" {
			desc = truncate(doc.Summary, 300)
		}
		pages = append(pages, pageMeta{
			Path:        "/variables/" + row.Slug,
			Title:       pageTitle(row.Name),
			Description: desc,
			OgType:      "article",
		})
	}

	menuRows, _ := readIndex[namedRow](filepath.Join(apiRoot, "ui-menus", "index.json"))
	for _, row := range menuRows {
		desc := fmt.Sprintf("UI menu pattern: %s.", row.Name)
		if doc, err := readMenuDoc(filepath.Join(apiRoot, "ui-menus", row.Slug+".json")); err == nil && doc.Summary != "" {
			desc = truncate(doc.Summary, 300)
		}
		pages = append(pages, pageMeta{
			Path:        "/ui-menus/" + row.Slug,
			Title:       pageTitle(row.Name),
			Description: desc,
			OgType:      "article",
		})
	}

	skillRows, _ := readIndex[namedRow](filepath.Join(apiRoot, "skills", "index.json"))
	for _, row := range skillRows {
		desc := fmt.Sprintf("Design skill: %s.", row.Name)
		if doc, err := readSkillDoc(filepath.Join(apiRoot, "skills", row.Slug+".json")); err == nil && doc.Summary != "" {
			desc = truncate(doc.Summary, 300)
		}
		pages = append(pages, pageMeta{
			Path:        "/skills/" + row.Slug,
			Title:       pageTitle(row.Name),
			Description: desc,
			OgType:      "article",
		})
	}

	genreRows, _ := readIndex[indexRow](filepath.Join(apiRoot, "genres", "index.json"))
	for _, row := range genreRows {
		pages = append(pages, pageMeta{
			Path:        "/genres/" + row.Slug,
			Title:       pageTitle(row.Title),
			Description: fmt.Sprintf("Genre recipe map: %s — common mechanics and design patterns.", row.Name),
			OgType:      "article",
		})
	}

	sort.Slice(pages, func(i, j int) bool { return pages[i].Path < pages[j].Path })
	return pages, lastMod, nil
}

func readIndex[T any](path string) ([]T, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var rows []T
	if err := json.Unmarshal(data, &rows); err != nil {
		return nil, err
	}
	return rows, nil
}

func readMapDoc(path string) (mapDoc, error) {
	var doc mapDoc
	data, err := os.ReadFile(path)
	if err != nil {
		return doc, err
	}
	err = json.Unmarshal(data, &doc)
	return doc, err
}

func readMechanicDoc(path string) (mechanicDoc, error) {
	var doc mechanicDoc
	data, err := os.ReadFile(path)
	if err != nil {
		return doc, err
	}
	err = json.Unmarshal(data, &doc)
	return doc, err
}

func readSkillDoc(path string) (skillDoc, error) {
	var doc skillDoc
	data, err := os.ReadFile(path)
	if err != nil {
		return doc, err
	}
	err = json.Unmarshal(data, &doc)
	return doc, err
}

func readVariableDoc(path string) (variableDoc, error) {
	var doc variableDoc
	data, err := os.ReadFile(path)
	if err != nil {
		return doc, err
	}
	err = json.Unmarshal(data, &doc)
	return doc, err
}

func readMenuDoc(path string) (menuDoc, error) {
	var doc menuDoc
	data, err := os.ReadFile(path)
	if err != nil {
		return doc, err
	}
	err = json.Unmarshal(data, &doc)
	return doc, err
}

func pageTitle(name string) string {
	return name + " · " + siteName
}

func defaultDesc() string {
	return "Open MIT-licensed index of video game mechanics, gameplay maps, design skills, variables, and genre recipes for game designers and AI agents."
}

func truncate(s string, max int) string {
	s = strings.Join(strings.Fields(s), " ")
	if len(s) <= max {
		return s
	}
	return s[:max-1] + "…"
}

func injectMeta(template string, p pageMeta, baseURL, ogImage string) string {
	canonical := baseURL + p.Path
	if p.Path == "/" {
		canonical = baseURL + "/"
	}

	metaBlock := fmt.Sprintf(`    <title>%s</title>
    <meta name="description" content="%s" />
    <link rel="canonical" href="%s" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:type" content="%s" />
    <meta property="og:site_name" content="%s" />
    <meta property="og:image" content="%s" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="%s" />
    <meta name="twitter:creator" content="%s" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="%s" />
    <meta name="theme-color" content="%s" />`,
		html.EscapeString(p.Title),
		html.EscapeString(p.Description),
		html.EscapeString(canonical),
		html.EscapeString(p.Title),
		html.EscapeString(p.Description),
		html.EscapeString(canonical),
		html.EscapeString(p.OgType),
		html.EscapeString(siteName),
		html.EscapeString(ogImage),
		html.EscapeString(twitterHandle),
		html.EscapeString(twitterHandle),
		html.EscapeString(p.Title),
		html.EscapeString(p.Description),
		html.EscapeString(ogImage),
		html.EscapeString(themeColor),
	)

	start := "<!-- seo-defaults -->"
	end := "<!-- /seo-defaults -->"
	if startIdx := strings.Index(template, start); startIdx >= 0 {
		if endIdx := strings.Index(template, end); endIdx > startIdx {
			return template[:startIdx] + metaBlock + template[endIdx+len(end):]
		}
	}
	return strings.Replace(template, "<title>Game Design Index</title>", metaBlock, 1)
}

func writeSitemap(dist, baseURL string, pages []pageMeta, lastMod string) error {
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	b.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")
	for _, p := range pages {
		loc := baseURL + p.Path
		if p.Path == "/" {
			loc = baseURL + "/"
		}
		b.WriteString("  <url>\n")
		b.WriteString(fmt.Sprintf("    <loc>%s</loc>\n", html.EscapeString(loc)))
		b.WriteString(fmt.Sprintf("    <lastmod>%s</lastmod>\n", lastMod))
		b.WriteString("  </url>\n")
	}
	b.WriteString("</urlset>\n")
	return os.WriteFile(filepath.Join(dist, "sitemap.xml"), []byte(b.String()), 0o644)
}

func writeRobots(dist, baseURL string) error {
	content := fmt.Sprintf(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

Sitemap: %s/sitemap.xml
`, baseURL)
	return os.WriteFile(filepath.Join(dist, "robots.txt"), []byte(content), 0o644)
}

func writeLLMsTxt(dist, baseURL string) error {
	content := fmt.Sprintf(`# Game Design Index

> Open MIT-licensed index of video game mechanics, gameplay decomposition, design skills, variables, UI menus, and genre recipes.

## Key URLs

- Site: %s/
- Games: %s/games
- Mechanics: %s/mechanics
- Skills: %s/skills
- Variables: %s/variables
- UI menus: %s/ui-menus
- Analytics: %s/explore/analytics
- API catalog: %s/api/v1/catalog.json
- API docs: %s/docs/api
- WebMCP: %s/docs/webmcp
- Contribute: %s/contribute
- GitHub: https://github.com/blazium-games/game-design-index
- Discord: https://discord.gg/sZaf9KYzDp
- X: https://x.com/BlaziumGames

## Usage

Use the static JSON API under /api/v1/ for programmatic access. WebMCP tools are available when browsing the live site in a supported browser.

## License

MIT License — Blazium Games
`, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL, baseURL)
	return os.WriteFile(filepath.Join(dist, "llms.txt"), []byte(content), 0o644)
}

func writeSPAFallback(dist string) error {
	rootIndex := filepath.Join(dist, "index.html")
	data, err := os.ReadFile(rootIndex)
	if err != nil {
		return fmt.Errorf("read root index for 404.html: %w", err)
	}
	if err := os.WriteFile(filepath.Join(dist, "404.html"), data, 0o644); err != nil {
		return fmt.Errorf("write 404.html: %w", err)
	}
	return os.WriteFile(filepath.Join(dist, ".nojekyll"), []byte{}, 0o644)
}
