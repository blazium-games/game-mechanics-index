package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/blazium-games/game-design-index/internal"
	"github.com/blazium-games/game-design-index/internal/formats"
)

type Catalog struct {
	SchemaVersion   string   `json:"schema_version"`
	License         string   `json:"license"`
	ReleaseVersion  string   `json:"release_version"`
	MapCount        int      `json:"map_count"`
	MechanicCount   int      `json:"mechanic_count"`
	VariableCount   int      `json:"variable_count"`
	MenuCount       int      `json:"menu_count"`
	SkillCount      int      `json:"skill_count,omitempty"`
	GenreCount      int      `json:"genre_count"`
	GameCount       int      `json:"game_count"`
	Genres          []string `json:"genres"`
	Domains         []string `json:"domains"`
	Flavors         []string `json:"flavors"`
	APIBasePath     string   `json:"api_base_path"`
}

type MapIndexRow struct {
	Slug            string   `json:"slug"`
	Title           string   `json:"title"`
	Name            string   `json:"name"`
	MapType         string   `json:"map_type"`
	Genres          []string `json:"genres,omitempty"`
	QualityTier     string   `json:"quality_tier"`
	SignatureCount  int      `json:"signature_count"`
	Year            int      `json:"year,omitempty"`
}

type MechanicIndexRow struct {
	Slug                 string   `json:"slug"`
	Name                 string   `json:"name"`
	Domain               string   `json:"domain"`
	Flavor               string   `json:"flavor"`
	Tags                 []string `json:"tags,omitempty"`
	FeaturedCount        int      `json:"featured_count"`
	SignatureGamesCount  int      `json:"signature_games_count"`
	EnrichmentStatus     string   `json:"enrichment_status"`
}

type GenreIndexRow struct {
	Slug  string `json:"slug"`
	Title string `json:"title"`
	Name  string `json:"name"`
}

type VariableIndexRow struct {
	Slug              string   `json:"slug"`
	Name              string   `json:"name"`
	Category          string   `json:"category"`
	Scope             string   `json:"scope"`
	Tags              []string `json:"tags,omitempty"`
	FeaturedCount     int      `json:"featured_count"`
	EnrichmentStatus  string   `json:"enrichment_status"`
}

type MenuIndexRow struct {
	Slug             string   `json:"slug"`
	Name             string   `json:"name"`
	MenuType         string   `json:"menu_type"`
	Layer            string   `json:"layer"`
	Tags             []string `json:"tags,omitempty"`
	FeaturedCount    int      `json:"featured_count"`
	EnrichmentStatus string   `json:"enrichment_status"`
}

type SkillIndexRow struct {
	Slug             string   `json:"slug"`
	Name             string   `json:"name"`
	Category         string   `json:"category"`
	Tags             []string `json:"tags,omitempty"`
	MechanicCount    int      `json:"mechanic_count"`
	EnrichmentStatus string   `json:"enrichment_status"`
}

type SearchRow struct {
	Type    string   `json:"type"`
	Slug    string   `json:"slug"`
	Title   string   `json:"title"`
	Genres  []string `json:"genres,omitempty"`
	Tags    []string `json:"tags,omitempty"`
	Tier    string   `json:"tier,omitempty"`
}

func writeJSON(path string, v any) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	if err := scanBannedJSON(data, path); err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

func extractYear(desc string) int {
	if desc == "" {
		return 0
	}
	idx := strings.LastIndex(desc, "(")
	if idx < 0 {
		return 0
	}
	end := strings.Index(desc[idx:], ")")
	if end <= 1 {
		return 0
	}
	inner := strings.TrimSpace(desc[idx+1 : idx+end])
	if len(inner) == 4 {
		var y int
		if _, err := fmt.Sscanf(inner, "%d", &y); err == nil {
			return y
		}
	}
	return 0
}

func exportAPI(b *internal.Bundle, outDir, releaseVersion string) error {
	pubMaps, pubMechs := sanitizeBundle(b)

	api := filepath.Join(outDir, "api", "v1")
	if err := os.MkdirAll(filepath.Join(api, "maps"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "mechanics"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "indexes"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "genres"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "variables"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "ui-menus"), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(api, "skills"), 0o755); err != nil {
		return err
	}

	genreCount, gameCount := 0, 0
	genreSet := map[string]struct{}{}
	for _, m := range b.Maps {
		if m.MapType == internal.MapTypeGenre {
			genreCount++
		} else {
			gameCount++
		}
		for _, g := range m.Subject.Genres {
			genreSet[g] = struct{}{}
		}
	}
	genres := make([]string, 0, len(genreSet))
	for g := range genreSet {
		genres = append(genres, g)
	}
	sort.Strings(genres)

	catalog := Catalog{
		SchemaVersion:  internal.SchemaVersion,
		License:        "MIT",
		ReleaseVersion: releaseVersion,
		MapCount:       len(b.Maps),
		MechanicCount:  len(b.Mechanics),
		VariableCount:  len(b.Variables),
		MenuCount:      len(b.UIMenus),
		SkillCount:     len(b.Skills),
		GenreCount:     genreCount,
		GameCount:      gameCount,
		Genres:         genres,
		Domains:        []string{"locomotion", "combat", "progression", "economy", "level", "session"},
		Flavors:        []string{"action", "adventure", "strategy"},
		APIBasePath:    "/api/v1",
	}
	if err := writeJSON(filepath.Join(api, "catalog.json"), catalog); err != nil {
		return err
	}

	analytics := internal.BuildAnalytics(b)
	if err := writeJSON(filepath.Join(api, "analytics.json"), analytics); err != nil {
		return err
	}

	changelogPath := filepath.Join(b.Root, "changelog.json")
	if changelogData, err := os.ReadFile(changelogPath); err == nil {
		if err := scanBannedJSON(changelogData, changelogPath); err != nil {
			return err
		}
		var changelog any
		if err := json.Unmarshal(changelogData, &changelog); err != nil {
			return fmt.Errorf("parse changelog: %w", err)
		}
		if err := writeJSON(filepath.Join(api, "changelog.json"), changelog); err != nil {
			return err
		}
	}

	lexiconPath := filepath.Join(b.Root, "lexicon", "lexicon.json")
	if lexiconData, err := os.ReadFile(lexiconPath); err == nil {
		if err := scanBannedJSON(lexiconData, lexiconPath); err != nil {
			return err
		}
		var lexicon any
		if err := json.Unmarshal(lexiconData, &lexicon); err != nil {
			return fmt.Errorf("parse lexicon: %w", err)
		}
		if err := writeJSON(filepath.Join(api, "lexicon.json"), lexicon); err != nil {
			return err
		}
	}

	var mapRows []MapIndexRow
	for slug, m := range b.Maps {
		tier := internal.DetectQualityTier(m)
		row := MapIndexRow{
			Slug:           slug,
			Title:          m.Title,
			Name:           m.Subject.Name,
			MapType:        string(m.MapType),
			Genres:         append([]string(nil), m.Subject.Genres...),
			QualityTier:    string(tier),
			SignatureCount: len(m.SignatureGameplay),
			Year:           extractYear(m.Narrative.Description),
		}
		if m.Context != nil && m.Context.Year > 0 {
			row.Year = m.Context.Year
		}
		mapRows = append(mapRows, row)
		if err := writeJSON(filepath.Join(api, "maps", slug+".json"), pubMaps[slug]); err != nil {
			return err
		}
	}
	sort.Slice(mapRows, func(i, j int) bool { return mapRows[i].Slug < mapRows[j].Slug })
	if err := writeJSON(filepath.Join(api, "maps", "index.json"), mapRows); err != nil {
		return err
	}

	var mechRows []MechanicIndexRow
	for slug, e := range b.Mechanics {
		sigCount := 0
		if e.SignatureOf != nil {
			sigCount = len(e.SignatureOf.Games)
		}
		mechRows = append(mechRows, MechanicIndexRow{
			Slug:                slug,
			Name:                e.Name,
			Domain:              string(e.Domain),
			Flavor:              string(e.Flavor),
			Tags:                append([]string(nil), e.Tags...),
			FeaturedCount:       len(e.FeaturedIn),
			SignatureGamesCount: sigCount,
			EnrichmentStatus:    internal.MechanicEnrichmentStatus(e),
		})
		if err := writeJSON(filepath.Join(api, "mechanics", slug+".json"), pubMechs[slug]); err != nil {
			return err
		}
	}
	sort.Slice(mechRows, func(i, j int) bool { return mechRows[i].Slug < mechRows[j].Slug })
	if err := writeJSON(filepath.Join(api, "mechanics", "index.json"), mechRows); err != nil {
		return err
	}

	var varRows []VariableIndexRow
	for slug, v := range b.Variables {
		varRows = append(varRows, VariableIndexRow{
			Slug:             slug,
			Name:             v.Name,
			Category:         string(v.Category),
			Scope:            string(v.Scope),
			Tags:             append([]string(nil), v.Tags...),
			FeaturedCount:    len(v.FeaturedIn),
			EnrichmentStatus: internal.VariableEnrichmentStatus(v),
		})
		if err := writeJSON(filepath.Join(api, "variables", slug+".json"), v); err != nil {
			return err
		}
	}
	sort.Slice(varRows, func(i, j int) bool { return varRows[i].Slug < varRows[j].Slug })
	if len(varRows) > 0 {
		if err := writeJSON(filepath.Join(api, "variables", "index.json"), varRows); err != nil {
			return err
		}
	}

	var menuRows []MenuIndexRow
	for slug, menu := range b.UIMenus {
		menuRows = append(menuRows, MenuIndexRow{
			Slug:             slug,
			Name:             menu.Name,
			MenuType:         string(menu.MenuType),
			Layer:            string(menu.Layer),
			Tags:             append([]string(nil), menu.Tags...),
			FeaturedCount:    len(menu.FeaturedIn),
			EnrichmentStatus: internal.MenuEnrichmentStatus(menu),
		})
		if err := writeJSON(filepath.Join(api, "ui-menus", slug+".json"), menu); err != nil {
			return err
		}
	}
	sort.Slice(menuRows, func(i, j int) bool { return menuRows[i].Slug < menuRows[j].Slug })
	if len(menuRows) > 0 {
		if err := writeJSON(filepath.Join(api, "ui-menus", "index.json"), menuRows); err != nil {
			return err
		}
	}

	var skillRows []SkillIndexRow
	for slug, skill := range b.Skills {
		skillRows = append(skillRows, SkillIndexRow{
			Slug:             slug,
			Name:             skill.Name,
			Category:         string(skill.Category),
			Tags:             append([]string(nil), skill.Tags...),
			MechanicCount:    len(skill.RelatedMechanics),
			EnrichmentStatus: internal.SkillEnrichmentStatus(skill),
		})
		if err := writeJSON(filepath.Join(api, "skills", slug+".json"), skill); err != nil {
			return err
		}
	}
	sort.Slice(skillRows, func(i, j int) bool { return skillRows[i].Slug < skillRows[j].Slug })
	if len(skillRows) > 0 {
		if err := writeJSON(filepath.Join(api, "skills", "index.json"), skillRows); err != nil {
			return err
		}
	}

	var genreRows []GenreIndexRow
	for slug, m := range b.Maps {
		if m.MapType != internal.MapTypeGenre {
			continue
		}
		genreRows = append(genreRows, GenreIndexRow{Slug: slug, Title: m.Title, Name: m.Subject.Name})
	}
	sort.Slice(genreRows, func(i, j int) bool { return genreRows[i].Slug < genreRows[j].Slug })
	if err := writeJSON(filepath.Join(api, "genres", "index.json"), genreRows); err != nil {
		return err
	}
	for _, g := range genreRows {
		if err := writeJSON(filepath.Join(api, "genres", g.Slug+".json"), pubMaps[g.Slug]); err != nil {
			return err
		}
	}

	// indexes
	mechToMaps := map[string][]string{}
	for slug, m := range b.Maps {
		seen := map[string]struct{}{}
		for _, bind := range m.Mechanics {
			ms := bind.MechanicSlug
			if _, ok := seen[ms]; ok {
				continue
			}
			seen[ms] = struct{}{}
			mechToMaps[ms] = append(mechToMaps[ms], slug)
		}
	}
	for k := range mechToMaps {
		sort.Strings(mechToMaps[k])
	}
	if err := writeJSON(filepath.Join(api, "indexes", "mechanic-to-maps.json"), map[string]any{"mechanics": mechToMaps}); err != nil {
		return err
	}

	skillToMechs := map[string][]string{}
	for slug, skill := range b.Skills {
		skillToMechs[slug] = append([]string(nil), skill.RelatedMechanics...)
		sort.Strings(skillToMechs[slug])
	}
	for _, m := range b.Mechanics {
		for _, sk := range m.SkillsDeveloped {
			skillToMechs[sk] = append(skillToMechs[sk], m.Slug)
		}
	}
	for k := range skillToMechs {
		seen := map[string]struct{}{}
		var uniq []string
		for _, s := range skillToMechs[k] {
			if _, ok := seen[s]; ok {
				continue
			}
			seen[s] = struct{}{}
			uniq = append(uniq, s)
		}
		sort.Strings(uniq)
		skillToMechs[k] = uniq
	}
	if len(skillToMechs) > 0 {
		if err := writeJSON(filepath.Join(api, "indexes", "skill-to-mechanics.json"), map[string]any{"skills": skillToMechs}); err != nil {
			return err
		}
	}

	coocPath := filepath.Join(b.Root, "indexes", "cooccurrence-top500.json")
	if data, err := os.ReadFile(coocPath); err == nil {
		if err := scanBannedJSON(data, coocPath); err != nil {
			return err
		}
		_ = os.MkdirAll(filepath.Join(api, "indexes"), 0o755)
		_ = os.WriteFile(filepath.Join(api, "indexes", "cooccurrence-top500.json"), data, 0o644)
	}

	genreRecipesPath := filepath.Join(b.Root, "indexes", "genre-to-recipes.json")
	if data, err := os.ReadFile(genreRecipesPath); err == nil {
		if err := scanBannedJSON(data, genreRecipesPath); err != nil {
			return err
		}
		_ = os.WriteFile(filepath.Join(api, "indexes", "genre-to-recipes.json"), data, 0o644)
	}

	for _, idxName := range []string{"variable-to-maps.json", "menu-to-maps.json", "variable-to-mechanics.json", "menu-flow-edges.json"} {
		idxPath := filepath.Join(b.Root, "indexes", idxName)
		if data, err := os.ReadFile(idxPath); err == nil {
			if err := scanBannedJSON(data, idxPath); err != nil {
				return err
			}
			_ = os.WriteFile(filepath.Join(api, "indexes", idxName), data, 0o644)
		}
	}

	varTagPath := filepath.Join(b.Root, "schema", "variable-tags.json")
	if data, err := os.ReadFile(varTagPath); err == nil {
		if err := scanBannedJSON(data, varTagPath); err != nil {
			return err
		}
		_ = os.WriteFile(filepath.Join(api, "variable-tags.json"), data, 0o644)
	}
	menuTagPath := filepath.Join(b.Root, "schema", "menu-tags.json")
	if data, err := os.ReadFile(menuTagPath); err == nil {
		if err := scanBannedJSON(data, menuTagPath); err != nil {
			return err
		}
		_ = os.WriteFile(filepath.Join(api, "menu-tags.json"), data, 0o644)
	}
	skillTagPath := filepath.Join(b.Root, "schema", "skill-tags.json")
	if data, err := os.ReadFile(skillTagPath); err == nil {
		if err := scanBannedJSON(data, skillTagPath); err != nil {
			return err
		}
		_ = os.WriteFile(filepath.Join(api, "skill-tags.json"), data, 0o644)
	}

	tagsPath := filepath.Join(b.Root, "schema", "mechanic-tags.json")
	if data, err := os.ReadFile(tagsPath); err == nil {
		if err := scanBannedJSON(data, tagsPath); err != nil {
			return err
		}
		_ = os.WriteFile(filepath.Join(api, "tags.json"), data, 0o644)
	}

	var search []SearchRow
	for slug, m := range b.Maps {
		if m.MapType == internal.MapTypeGenre {
			continue
		}
		search = append(search, SearchRow{
			Type: "game", Slug: slug, Title: m.Subject.Name, Genres: m.Subject.Genres, Tier: string(internal.DetectQualityTier(m)),
		})
	}
	for _, row := range mechRows {
		search = append(search, SearchRow{
			Type: "mechanic", Slug: row.Slug, Title: row.Name, Tags: row.Tags,
		})
	}
	for _, row := range varRows {
		search = append(search, SearchRow{
			Type: "variable", Slug: row.Slug, Title: row.Name, Tags: row.Tags,
		})
	}
	for _, row := range menuRows {
		search = append(search, SearchRow{
			Type: "menu", Slug: row.Slug, Title: row.Name, Tags: row.Tags,
		})
	}
	for _, row := range skillRows {
		search = append(search, SearchRow{
			Type: "skill", Slug: row.Slug, Title: row.Name, Tags: row.Tags,
		})
	}
	sort.Slice(search, func(i, j int) bool {
		if search[i].Type != search[j].Type {
			return search[i].Type < search[j].Type
		}
		return search[i].Slug < search[j].Slug
	})
	if err := writeJSON(filepath.Join(api, "search.json"), search); err != nil {
		return err
	}

	// related maps for curated
	for slug, m := range b.Maps {
		if internal.DetectQualityTier(m) != internal.QualityCurated || m.MapType == internal.MapTypeGenre {
			continue
		}
		related := b.SimilarMaps(slug, 1)
		if len(related) > 5 {
			related = related[:5]
		}
		if len(related) > 0 {
			if err := writeJSON(filepath.Join(api, "maps", slug, "related.json"), map[string]any{"slug": slug, "related": related}); err != nil {
				return err
			}
		}
	}

	openapi := map[string]any{
		"openapi": "3.0.3",
		"info": map[string]any{
			"title":       "Game Design Index API",
			"version":     releaseVersion,
			"description": "Static JSON file endpoints served from GitHub Pages",
		},
		"paths": map[string]any{
			"/api/v1/catalog.json":            map[string]any{"get": map[string]any{"summary": "Corpus catalog metadata"}},
			"/api/v1/analytics.json":          map[string]any{"get": map[string]any{"summary": "Pre-computed corpus analytics and correlations"}},
			"/api/v1/changelog.json":          map[string]any{"get": map[string]any{"summary": "Release changelog entries"}},
			"/api/v1/lexicon.json":            map[string]any{"get": map[string]any{"summary": "Field help and design terminology lexicon"}},
			"/api/v1/maps/index.json":         map[string]any{"get": map[string]any{"summary": "Lightweight game map index"}},
			"/api/v1/maps/{slug}.json":        map[string]any{"get": map[string]any{"summary": "Full gameplay map"}},
			"/api/v1/mechanics/index.json":    map[string]any{"get": map[string]any{"summary": "Mechanic index"}},
			"/api/v1/mechanics/{slug}.json":   map[string]any{"get": map[string]any{"summary": "Full mechanic entry"}},
			"/api/v1/variables/index.json":    map[string]any{"get": map[string]any{"summary": "Variable index"}},
			"/api/v1/variables/{slug}.json":   map[string]any{"get": map[string]any{"summary": "Full game variable entry"}},
			"/api/v1/ui-menus/index.json":     map[string]any{"get": map[string]any{"summary": "UI menu index"}},
			"/api/v1/ui-menus/{slug}.json":    map[string]any{"get": map[string]any{"summary": "Full UI menu entry"}},
			"/api/v1/skills/index.json":       map[string]any{"get": map[string]any{"summary": "Design skill index"}},
			"/api/v1/skills/{slug}.json":      map[string]any{"get": map[string]any{"summary": "Full design skill entry"}},
			"/api/v1/search.json":             map[string]any{"get": map[string]any{"summary": "Unified search index"}},
			"/formats/v1/mechanics/{slug}.md": map[string]any{"get": map[string]any{"summary": "Mechanic entry as Markdown"}},
			"/formats/v1/mechanics/{slug}.txt": map[string]any{"get": map[string]any{"summary": "Mechanic entry as plain text"}},
			"/formats/v1/catalog.md":          map[string]any{"get": map[string]any{"summary": "Corpus catalog as Markdown"}},
		},
	}
	if err := writeJSON(filepath.Join(api, "openapi.json"), openapi); err != nil {
		return err
	}
	return exportFormats(b, outDir, releaseVersion, pubMaps, pubMechs)
}

func writeText(path, content string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	if err := scanBannedJSON([]byte(content), path); err != nil {
		return err
	}
	return os.WriteFile(path, []byte(content), 0o644)
}

func exportFormats(b *internal.Bundle, outDir, releaseVersion string, pubMaps, pubMechs map[string]map[string]any) error {
	fmtBase := filepath.Join(outDir, "formats", "v1")
	for slug, raw := range pubMechs {
		var e internal.MechanicEntry
		data, _ := json.Marshal(raw)
		_ = json.Unmarshal(data, &e)
		e.Slug = slug
		if err := writeText(filepath.Join(fmtBase, "mechanics", slug+".md"), formats.MechanicMarkdown(e)); err != nil {
			return err
		}
		if err := writeText(filepath.Join(fmtBase, "mechanics", slug+".txt"), formats.MechanicText(e)); err != nil {
			return err
		}
		yml, err := formats.ToYAML(raw)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(fmtBase, "mechanics"), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "mechanics", slug+".yaml"), yml, 0o644); err != nil {
			return err
		}
		xml, err := formats.MechanicXML(e)
		if err != nil {
			return err
		}
		if err := scanBannedJSON(xml, slug+".xml"); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "mechanics", slug+".xml"), xml, 0o644); err != nil {
			return err
		}
	}

	for slug, v := range b.Variables {
		if err := writeText(filepath.Join(fmtBase, "variables", slug+".md"), formats.VariableMarkdown(v)); err != nil {
			return err
		}
		if err := writeText(filepath.Join(fmtBase, "variables", slug+".txt"), formats.VariableText(v)); err != nil {
			return err
		}
		yml, err := formats.ToYAML(v)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(fmtBase, "variables"), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "variables", slug+".yaml"), yml, 0o644); err != nil {
			return err
		}
		xml, err := formats.VariableXML(v)
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "variables", slug+".xml"), xml, 0o644); err != nil {
			return err
		}
	}

	for slug, menu := range b.UIMenus {
		if err := writeText(filepath.Join(fmtBase, "ui-menus", slug+".md"), formats.MenuMarkdown(menu)); err != nil {
			return err
		}
		if err := writeText(filepath.Join(fmtBase, "ui-menus", slug+".txt"), formats.MenuText(menu)); err != nil {
			return err
		}
		yml, err := formats.ToYAML(menu)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(fmtBase, "ui-menus"), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "ui-menus", slug+".yaml"), yml, 0o644); err != nil {
			return err
		}
		xml, err := formats.MenuXML(menu)
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, "ui-menus", slug+".xml"), xml, 0o644); err != nil {
			return err
		}
	}

	for slug, raw := range pubMaps {
		var m internal.GameplayMap
		data, _ := json.Marshal(raw)
		_ = json.Unmarshal(data, &m)
		m.Slug = slug
		subdir := "maps"
		if m.MapType == internal.MapTypeGenre {
			subdir = "genres"
		}
		if err := writeText(filepath.Join(fmtBase, subdir, slug+".md"), formats.MapMarkdown(m)); err != nil {
			return err
		}
		if err := writeText(filepath.Join(fmtBase, subdir, slug+".txt"), formats.MapText(m)); err != nil {
			return err
		}
		yml, err := formats.ToYAML(raw)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(fmtBase, subdir), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, subdir, slug+".yaml"), yml, 0o644); err != nil {
			return err
		}
		xml, err := formats.MapXML(m)
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(fmtBase, subdir, slug+".xml"), xml, 0o644); err != nil {
			return err
		}
	}

	catMD := formats.CatalogMarkdown(internal.SchemaVersion, releaseVersion, len(b.Maps), len(b.Mechanics))
	if err := writeText(filepath.Join(fmtBase, "catalog.md"), catMD); err != nil {
		return err
	}
	catYAML, err := formats.ToYAML(map[string]any{
		"schema_version":  internal.SchemaVersion,
		"release_version": releaseVersion,
		"map_count":       len(b.Maps),
		"mechanic_count":  len(b.Mechanics),
	})
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(fmtBase, "catalog.yaml"), catYAML, 0o644); err != nil {
		return err
	}

	var mechLines []string
	for slug := range b.Mechanics {
		mechLines = append(mechLines, slug)
	}
	sort.Strings(mechLines)
	return writeText(filepath.Join(fmtBase, "index.md"), formats.IndexMarkdown("Design Index", mechLines))
}
