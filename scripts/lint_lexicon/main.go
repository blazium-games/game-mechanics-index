package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	root, err := os.Getwd()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	lexPath := filepath.Join(root, "data", "source", "lexicon", "lexicon.json")
	raw, err := os.ReadFile(lexPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, "read lexicon:", err)
		os.Exit(1)
	}
	var doc struct {
		Entries map[string]struct {
			Category string `json:"category"`
			Title    string `json:"title"`
			Short    string `json:"short"`
			Long     string `json:"long"`
		} `json:"entries"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		fmt.Fprintln(os.Stderr, "parse lexicon:", err)
		os.Exit(1)
	}
	schemaDir := filepath.Join(root, "data", "source", "schema")
	schemaProps := loadSchemaProperties(schemaDir)
	var warnings []string
	for id, ent := range doc.Entries {
		if ent.Title == "" || ent.Short == "" || ent.Long == "" {
			warnings = append(warnings, fmt.Sprintf("entry %q missing title/short/long", id))
		}
		if !strings.HasPrefix(id, "field.") {
			continue
		}
		parts := strings.SplitN(strings.TrimPrefix(id, "field."), ".", 2)
		if len(parts) != 2 {
			continue
		}
		entity, fieldPath := parts[0], parts[1]
		schemaFile := entitySchemaFile(entity)
		if schemaFile == "" {
			continue
		}
		props, ok := schemaProps[schemaFile]
		if !ok {
			warnings = append(warnings, fmt.Sprintf("no schema loaded for %s (%s)", id, schemaFile))
			continue
		}
		top := strings.Split(fieldPath, ".")[0]
		if _, ok := props[top]; !ok {
			warnings = append(warnings, fmt.Sprintf("field %q top property %q not in %s", id, top, schemaFile))
		}
	}
	if len(warnings) > 0 {
		for _, w := range warnings {
			fmt.Fprintln(os.Stderr, "WARN:", w)
		}
		os.Exit(1)
	}
	fmt.Printf("OK: %d lexicon entries validated\n", len(doc.Entries))
}

func entitySchemaFile(entity string) string {
	switch entity {
	case "mechanic":
		return "mechanic-entry.schema.json"
	case "variable":
		return "game-variable.schema.json"
	case "menu":
		return "ui-menu.schema.json"
	case "skill":
		return "skill.schema.json"
	case "map":
		return "gameplay-map.schema.json"
	default:
		return ""
	}
}

func loadSchemaProperties(schemaDir string) map[string]map[string]struct{} {
	out := map[string]map[string]struct{}{}
	entries, err := os.ReadDir(schemaDir)
	if err != nil {
		fmt.Fprintln(os.Stderr, "read schema dir:", err)
		os.Exit(1)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".schema.json") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(schemaDir, e.Name()))
		if err != nil {
			continue
		}
		var schema struct {
			Properties map[string]any `json:"properties"`
		}
		if err := json.Unmarshal(raw, &schema); err != nil {
			continue
		}
		props := map[string]struct{}{}
		for k := range schema.Properties {
			props[k] = struct{}{}
		}
		out[e.Name()] = props
	}
	return out
}
