// One-off lexicon builder; run: go run ./scripts/build_lexicon
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type category struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type entry struct {
	Category  string            `json:"category"`
	Title     string            `json:"title"`
	Short     string            `json:"short"`
	Long      string            `json:"long"`
	Related   []string          `json:"related,omitempty"`
	SeeAlso   []string          `json:"seeAlso,omitempty"`
	SchemaRef string            `json:"schemaRef,omitempty"`
	EnumHelp  map[string]string `json:"enumHelp,omitempty"`
}

func writeLexicon(doc map[string]any) error {
	root, err := os.Getwd()
	if err != nil {
		return err
	}
	out := filepath.Join(root, "data", "source", "lexicon", "lexicon.json")
	f, err := os.Create(out)
	if err != nil {
		return err
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	return enc.Encode(doc)
}

func main() {
	doc := map[string]any{
		"schema_version": "1.0",
		"categories": []category{
			{ID: "process", Title: "Design process", Description: "Cross-cutting game design concepts and index workflows."},
			{ID: "mechanic", Title: "Mechanic catalog", Description: "Fields on reusable mechanic entries in the mechanics library."},
			{ID: "variable", Title: "Game variables", Description: "Tracked state variables shared across games and maps."},
			{ID: "menu", Title: "UI menus", Description: "Screen patterns and menu flow in the UI menu catalog."},
			{ID: "skill", Title: "Design skills", Description: "Player skills trained by mechanics and game loops."},
			{ID: "map", Title: "Gameplay maps", Description: "Game and genre recipe maps binding mechanics, variables, and menus."},
			{ID: "binding", Title: "Bindings and relationships", Description: "How entities link together on maps and in catalogs."},
		},
		"entries": buildEntries(),
	}
	if err := writeLexicon(doc); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println("Wrote data/source/lexicon/lexicon.json")
}

func buildEntries() map[string]entry {
	e := map[string]entry{}

	add := func(id string, ent entry) { e[id] = ent }

	// Process
	add("gdd", entry{Category: "process", Title: "Game Design Document (GDD)", Short: "A living design spec describing goals, loops, systems, and constraints.", Long: "A Game Design Document captures what the game is, who it is for, and how systems interact. In this index, map gdd_outline fields seed a GDD from signature mechanics, constraints, and progression notes.", Related: []string{"core-loop", "gdd-outline", "design-pillars"}})
	add("core-loop", entry{Category: "process", Title: "Core loop", Short: "The repeating cycle of actions the player performs moment to moment.", Long: "The core loop is the heartbeat of a game: perceive, decide, act, receive feedback, repeat. Maps store it in narrative.core_loop and gdd_outline.core_loop.", Related: []string{"gdd", "signature-gameplay"}})
	add("gdd-outline", entry{Category: "process", Title: "GDD outline", Short: "Structured GDD seed on gameplay maps.", Long: "The gdd_outline block exports designer-facing sections: overview, core_loop, player_goals, constraints, and optional combat, economy, and progression notes.", Related: []string{"gdd", "field.map.gdd_outline"}})
	add("design-pillars", entry{Category: "process", Title: "Design pillars", Short: "Non-negotiable creative goals that guide tradeoffs.", Long: "Short intent statements that keep features aligned with the player fantasy. Appears in narrative and design_intent on maps.", Related: []string{"player-fantasy"}})
	add("player-fantasy", entry{Category: "process", Title: "Player fantasy", Short: "The identity or power fantasy the game sells.", Long: "Answers who am I in this game. Stored in design_intent.player_fantasy and should align with signature mechanics.", Related: []string{"design-pillars", "signature-gameplay"}})
	add("enrichment", entry{Category: "process", Title: "Enrichment", Short: "Curated design pedagogy beyond bare schema fields.", Long: "Adding design_guidance, agent_context, and map-specific notes so entries are actionable. Export computes enrichment_status per entity type.", Related: []string{"agent-context", "field.mechanic.design_guidance"}})
	add("agent-context", entry{Category: "process", Title: "Agent context", Short: "Summaries and prompts for AI design assistants.", Long: "Bundles summary_for_agents, gdd_prompt, and implementation_checklist for agent workflows.", Related: []string{"gdd", "enrichment"}, SeeAlso: []string{"field.mechanic.agent_context"}})
	add("quality-tier", entry{Category: "process", Title: "Quality tier", Short: "Map curation level on gameplay maps.", Long: "Signals how game-specific and hand-enriched a map is.", SchemaRef: "gameplay-map.schema.json#metadata.quality_tier", EnumHelp: map[string]string{"curated": "Hand-enriched with game-specific notes.", "catalog": "Baseline catalog entry.", "template": "Genre-derived starter.", "stub": "Placeholder with minimal data."}})
	add("co-occurrence", entry{Category: "process", Title: "Co-occurrence", Short: "How often mechanics appear together.", Long: "Shows mechanic pairs or clusters on shared games; useful for genre fingerprints.", Related: []string{"field.mechanic.synergies"}})
	add("signature-gameplay", entry{Category: "process", Title: "Signature gameplay", Short: "Mechanics that define game or genre identity.", Long: "Ordered mechanic slugs that are headline interactions; bindings use role signature.", Related: []string{"field.map.mechanics.role", "core-loop"}})

	// Mechanic fields
	mechEnum := map[string]string{"action": "Real-time skill and reflex challenges.", "adventure": "Exploration, narrative, and discovery.", "strategy": "Planning, resource tradeoffs, and long horizons."}
	domainEnum := map[string]string{"locomotion": "Movement and traversal.", "combat": "Conflict resolution and damage.", "progression": "Growth, unlocks, and power curves.", "economy": "Resources, costs, and rewards.", "level": "Space, pacing, and encounter layout.", "session": "Runs, saves, and meta structure."}
	add("field.mechanic.summary", entry{Category: "mechanic", Title: "Summary", Short: "One-paragraph description of the mechanic.", Long: "The primary human-readable definition. Should stand alone without reading the full entry.", SchemaRef: "mechanic-entry.schema.json#summary"})
	add("field.mechanic.flavor", entry{Category: "mechanic", Title: "Flavor", Short: "High-level genre family: action, adventure, or strategy.", Long: "Taxonomy axis orthogonal to domain. Helps filter and compose genre recipes.", SchemaRef: "mechanic-entry.schema.json#flavor", EnumHelp: mechEnum})
	add("field.mechanic.domain", entry{Category: "mechanic", Title: "Domain", Short: "Which gameplay pillar the mechanic primarily affects.", Long: "Used on mechanic entries and map bindings to align systems.", SchemaRef: "mechanic-entry.schema.json#domain", EnumHelp: domainEnum})
	add("field.mechanic.tags", entry{Category: "mechanic", Title: "Tags", Short: "Controlled vocabulary labels for search and requirements.", Long: "Tags must match mechanic-tags.json. Used in requirements and filters.", SchemaRef: "mechanic-entry.schema.json#tags"})
	add("field.mechanic.design_guidance", entry{Category: "mechanic", Title: "Design guidance", Short: "When, where, and how to apply the mechanic.", Long: "Includes when_to_use, where_to_use, when_to_avoid, and designer_notes. Required for enrichment complete status together with agent_context.", Related: []string{"enrichment"}})
	add("field.mechanic.agent_context", entry{Category: "mechanic", Title: "Agent context (mechanic)", Short: "AI-facing summary and prompts for this mechanic.", Long: "summary_for_agents is required for enrichment complete. Optional gdd_prompt and implementation_checklist.", SeeAlso: []string{"agent-context"}})
	add("field.mechanic.synergies", entry{Category: "mechanic", Title: "Synergies", Short: "Mechanic slugs that combine well.", Long: "Cross-links for composition and co-occurrence exploration.", SchemaRef: "mechanic-entry.schema.json#synergies"})
	add("field.mechanic.synergy_notes", entry{Category: "mechanic", Title: "Synergy notes", Short: "Per-synergy explanation of why combinations work.", Long: "Pairs slug with a short note for designers.", SchemaRef: "mechanic-entry.schema.json#synergy_notes"})
	add("field.mechanic.examples", entry{Category: "mechanic", Title: "Examples", Short: "Concrete instantiations linked to maps.", Long: "Each example has label, description, and optional map_slug.", SchemaRef: "mechanic-entry.schema.json#examples"})
	add("field.mechanic.learning_objectives", entry{Category: "mechanic", Title: "Learning objectives", Short: "Designer outcomes when applying the mechanic.", Long: "Schema 1.3 pedagogy field for teaching and briefs.", SchemaRef: "mechanic-entry.schema.json#learning_objectives"})
	add("field.mechanic.design_exercises", entry{Category: "mechanic", Title: "Design exercises", Short: "Practice prompts with constraints and success criteria.", Long: "Structured exercises for workshops or agent tasks.", SchemaRef: "mechanic-entry.schema.json#design_exercises"})
	add("field.mechanic.skills_developed", entry{Category: "mechanic", Title: "Skills developed", Short: "Design skill slugs trained by this mechanic.", Long: "Links mechanics catalog to skills catalog.", SchemaRef: "mechanic-entry.schema.json#skills_developed"})
	add("field.mechanic.player_experience", entry{Category: "mechanic", Title: "Player experience", Short: "How the mechanic feels moment to moment.", Long: "Emotional and readability notes for designers.", SchemaRef: "mechanic-entry.schema.json#player_experience"})
	add("field.mechanic.parameter_knobs", entry{Category: "mechanic", Title: "Parameter knobs", Short: "Tunable values that change mechanic feel.", Long: "Name, range, and effect triples for balancing.", SchemaRef: "mechanic-entry.schema.json#parameter_knobs"})
	add("field.mechanic.complexity", entry{Category: "mechanic", Title: "Complexity", Short: "Implementation and cognitive load: S, M, or L.", Long: "Rough sizing for scoping prototypes.", SchemaRef: "mechanic-entry.schema.json#complexity", EnumHelp: map[string]string{"S": "Small scope.", "M": "Medium scope.", "L": "Large scope."}})

	// Variable fields
	add("field.variable.category", entry{Category: "variable", Title: "Variable category", Short: "Kind of tracked state.", Long: "stat, resource, currency, slot, meter, counter, or flag.", SchemaRef: "game-variable.schema.json#category", EnumHelp: map[string]string{"stat": "Character attribute.", "resource": "Consumable or regenerating pool.", "currency": "Trade and shop value.", "slot": "Discrete equipment or ability slot.", "meter": "Continuous gauge.", "counter": "Integer tally.", "flag": "Boolean or enum state."}})
	add("field.variable.scope", entry{Category: "variable", Title: "Scope", Short: "Who or what owns the variable.", Long: "player, party, world, session, or run.", SchemaRef: "game-variable.schema.json#scope", EnumHelp: map[string]string{"player": "Per avatar.", "party": "Shared squad state.", "world": "Persistent world.", "session": "Current play session.", "run": "Roguelike run scope."}})
	add("field.variable.value_kind", entry{Category: "variable", Title: "Value kind", Short: "Data shape of the variable.", Long: "integer, float, boolean, enum, slot_list, or grid.", SchemaRef: "game-variable.schema.json#value_kind"})
	add("field.variable.reset_behavior", entry{Category: "variable", Title: "Reset behavior", Short: "When the variable resets.", Long: "per_death, per_level, per_session, or persistent.", SchemaRef: "game-variable.schema.json#reset_behavior"})
	add("field.variable.shared_rationale", entry{Category: "variable", Title: "Shared rationale", Short: "Why this variable exists across games.", Long: "Cross-game design intent. Required with player_focus for variable enrichment complete.", SchemaRef: "game-variable.schema.json#shared_rationale"})
	add("field.variable.player_focus", entry{Category: "variable", Title: "Player focus", Short: "What the player watches or optimizes.", Long: "Ties the variable to readable UI and decisions.", SchemaRef: "game-variable.schema.json#player_focus"})
	add("field.variable.typical_range", entry{Category: "variable", Title: "Typical range", Short: "Expected numeric or qualitative bounds.", Long: "Helps agents tune defaults without guessing.", SchemaRef: "game-variable.schema.json#typical_range"})
	add("field.variable.design_guidance", entry{Category: "variable", Title: "Design guidance (variable)", Short: "When to use or avoid this variable type.", Long: "Same shape as mechanic design_guidance.", SchemaRef: "game-variable.schema.json#design_guidance"})
	add("field.variable.agent_context", entry{Category: "variable", Title: "Agent context (variable)", Short: "AI summary for variable usage.", Long: "Optional gdd_prompt and checklist for implementation.", SchemaRef: "game-variable.schema.json#agent_context"})

	// Menu fields
	add("field.menu.menu_type", entry{Category: "menu", Title: "Menu type", Short: "Functional screen category.", Long: "Values include main, pause, inventory, shop, hub, boons, and others. Groups navigation, commerce, and overlay patterns.", SchemaRef: "ui-menu.schema.json#menu_type"})
	add("field.menu.layer", entry{Category: "menu", Title: "Layer", Short: "When the menu appears in the session.", Long: "meta (between runs), in_game (during play), or combat_overlay.", SchemaRef: "ui-menu.schema.json#layer", EnumHelp: map[string]string{"meta": "Title, lobby, hub between runs.", "in_game": "Pause, inventory during play.", "combat_overlay": "HUD-adjacent overlays."}})
	add("field.menu.input_context", entry{Category: "menu", Title: "Input context", Short: "Primary input scheme the menu targets.", Long: "gamepad, keyboard_mouse, touch, or any.", SchemaRef: "ui-menu.schema.json#input_context"})
	add("field.menu.shared_rationale", entry{Category: "menu", Title: "Shared rationale (menu)", Short: "Why this menu pattern exists.", Long: "Required for menu enrichment complete.", SchemaRef: "ui-menu.schema.json#shared_rationale"})
	add("field.menu.typical_actions", entry{Category: "menu", Title: "Typical actions", Short: "Common player actions on this screen.", Long: "Bullet list of verbs the menu supports.", SchemaRef: "ui-menu.schema.json#typical_actions"})

	// Skill fields
	add("field.skill.category", entry{Category: "skill", Title: "Skill category", Short: "motor, cognitive, strategic, social, or creative.", Long: "Taxonomy for design skills the game trains.", SchemaRef: "skill.schema.json#category", EnumHelp: map[string]string{"motor": "Timing and dexterity.", "cognitive": "Memory, pattern recognition.", "strategic": "Planning and evaluation.", "social": "Cooperation and deception.", "creative": "Expression and experimentation."}})
	add("field.skill.learning_outcome", entry{Category: "skill", Title: "Learning outcome", Short: "What the player learns by practicing.", Long: "Required for skill enrichment complete with related_mechanics.", SchemaRef: "skill.schema.json#learning_outcome"})
	add("field.skill.practice_activities", entry{Category: "skill", Title: "Practice activities", Short: "In-game activities that train the skill.", Long: "Concrete loops or challenges tied to mechanics.", SchemaRef: "skill.schema.json#practice_activities"})
	add("field.skill.design_guidance", entry{Category: "skill", Title: "Design guidance (skill)", Short: "When to emphasize this skill in a design.", Long: "when_to_use maps to When to emphasize on the site.", SchemaRef: "skill.schema.json#design_guidance"})

	// Map fields
	add("field.map.narrative", entry{Category: "map", Title: "Narrative", Short: "Description, core loop, skills tested, pillars.", Long: "Human-facing story of the game or genre recipe.", SchemaRef: "gameplay-map.schema.json#narrative"})
	add("field.map.context", entry{Category: "map", Title: "Context", Short: "Dimension, perspective, platforms, session type.", Long: "Situates the map for filters and agent briefs.", SchemaRef: "gameplay-map.schema.json#context"})
	add("field.map.systems", entry{Category: "map", Title: "Systems", Short: "Failure model, economy, pacing, loop phases.", Long: "High-level system characterization for GDD seeds.", SchemaRef: "gameplay-map.schema.json#systems"})
	add("field.map.gdd_outline", entry{Category: "map", Title: "GDD outline (field)", Short: "Structured GDD sections on the map.", Long: "overview, core_loop, goals, constraints, and system notes.", Related: []string{"gdd-outline"}, SchemaRef: "gameplay-map.schema.json#gdd_outline"})
	add("field.map.variants", entry{Category: "map", Title: "Variants", Short: "Alternate rule sets or difficulty modes.", Long: "Label, notes, and signature add/drop lists.", SchemaRef: "gameplay-map.schema.json#variants"})
	add("field.map.views", entry{Category: "map", Title: "Views", Short: "Filtered slices of mechanic bindings.", Long: "Preset filters by role or flavor for exploration.", SchemaRef: "gameplay-map.schema.json#views"})
	add("field.map.skill_slugs", entry{Category: "map", Title: "Design skills", Short: "Skill catalog links for this map.", Long: "Cross-links to skills trained or emphasized.", SchemaRef: "gameplay-map.schema.json#skill_slugs"})
	add("field.map.design_intent", entry{Category: "map", Title: "Design intent", Short: "Fantasy, tone, theme tags, pillars.", Long: "Creative direction beyond raw mechanics.", SchemaRef: "gameplay-map.schema.json#design_intent"})

	// Bindings
	roleMech := map[string]string{"signature": "Defines identity of the map.", "supporting": "Enables or modifies signatures.", "common": "Genre-standard filler mechanic."}
	add("field.map.mechanics.role", entry{Category: "binding", Title: "Mechanic role (map)", Short: "signature, supporting, or common.", Long: "How important the binding is on this map.", SchemaRef: "gameplay-map.schema.json#mechanics.role", EnumHelp: roleMech, Related: []string{"signature-gameplay"}})
	add("field.map.mechanics.phase", entry{Category: "binding", Title: "Phase", Short: "When in the loop the mechanic peaks.", Long: "early, mid, late, or optional.", SchemaRef: "gameplay-map.schema.json#mechanics.phase", EnumHelp: map[string]string{"early": "Tutorial or opening.", "mid": "Core challenge.", "late": "Mastery or climax.", "optional": "Side systems."}})
	add("field.map.mechanics.domain", entry{Category: "binding", Title: "Domain (binding)", Short: "Pillar for this binding on the map.", Long: "Same enum as mechanic domain.", SchemaRef: "gameplay-map.schema.json#mechanics.domain", EnumHelp: domainEnum})
	add("field.map.mechanics.map_notes", entry{Category: "binding", Title: "Map notes (mechanic)", Short: "Game-specific notes for this binding.", Long: "How the mechanic expresses on this title.", SchemaRef: "gameplay-map.schema.json#mechanics.map_notes"})
	add("field.map.mechanics.expression", entry{Category: "binding", Title: "Expression", Short: "Short formula or pattern for the binding.", Long: "Compact design shorthand on maps.", SchemaRef: "gameplay-map.schema.json#mechanics.expression"})
	add("field.map.mechanics.weight", entry{Category: "binding", Title: "Weight", Short: "Relative emphasis from 1 to 5.", Long: "Optional priority for agents composing briefs.", SchemaRef: "gameplay-map.schema.json#mechanics.weight"})
	add("field.map.variables.role", entry{Category: "binding", Title: "Variable role (map)", Short: "primary, supporting, or hidden.", Long: "Visibility and importance on this map.", SchemaRef: "gameplay-map.schema.json#variables.role", EnumHelp: map[string]string{"primary": "Central to decisions.", "supporting": "Secondary feedback.", "hidden": "Backend or debug state."}})
	add("field.map.variables.expression", entry{Category: "binding", Title: "Expression (variable)", Short: "How the variable shows on this map.", Long: "Tuning note or UI expression.", SchemaRef: "gameplay-map.schema.json#variables.expression"})
	add("field.map.ui_menus.role", entry{Category: "binding", Title: "Menu role (map)", Short: "core, optional, or contextual.", Long: "How essential the menu is on this map.", SchemaRef: "gameplay-map.schema.json#ui_menus.role", EnumHelp: map[string]string{"core": "Required for the loop.", "optional": "Quality-of-life.", "contextual": "Situational overlay."}})
	add("field.map.variable_relationships", entry{Category: "binding", Title: "Variable relationships", Short: "Edges between variables on the map.", Long: "from_variable, to_variable, relationship, notes.", SchemaRef: "gameplay-map.schema.json#variable_relationships"})
	add("field.map.menu_flow", entry{Category: "binding", Title: "Menu flow (map)", Short: "Navigation edges between menus.", Long: "How players move between screens on this title.", SchemaRef: "gameplay-map.schema.json#menu_flow"})

	// Shared design guidance subfields
	add("field.design_guidance.when_to_use", entry{Category: "process", Title: "When to use", Short: "Situations where the pattern applies.", Long: "Primary enrichment field across mechanics, variables, menus, and skills.", Related: []string{"enrichment"}})
	add("field.design_guidance.when_to_avoid", entry{Category: "process", Title: "When to avoid", Short: "Anti-patterns and misfit contexts.", Long: "Bullet list of cases to skip this pattern.", Related: []string{"field.design_guidance.when_to_use"}})
	add("field.design_guidance.where_to_use", entry{Category: "process", Title: "Where to use", Short: "Placement in genre, loop phase, or UI.", Long: "Spatial and structural guidance.", Related: []string{"field.design_guidance.when_to_use"}})
	add("field.design_guidance.designer_notes", entry{Category: "process", Title: "Designer notes", Short: "Tactical tips for application.", Long: "Freeform expert notes.", Related: []string{"field.design_guidance.when_to_use"}})

	// Section help keys
	sections := map[string]entry{
		"section.map.description":        {Category: "map", Title: "Description section", Short: "Overview and core loop narrative.", Long: "Primary human-readable summary of the game or genre recipe."},
		"section.map.context":            {Category: "map", Title: "Context section", Short: "Platform, dimension, perspective metadata.", Long: "Situates the title for agents and filters."},
		"section.map.signatures":         {Category: "map", Title: "Signature mechanics section", Short: "Headline mechanic links.", Long: "Quick navigation to defining mechanics.", Related: []string{"signature-gameplay"}},
		"section.map.mechanics":          {Category: "map", Title: "Mechanic bindings section", Short: "Full binding table.", Long: "Role, phase, domain, and notes per mechanic.", Related: []string{"field.map.mechanics.role"}},
		"section.map.variables":          {Category: "map", Title: "Variable bindings section", Short: "Variables used on this map.", Long: "Role and expression per variable binding."},
		"section.map.ui-menus":           {Category: "map", Title: "UI menu bindings section", Short: "Menus used on this map.", Long: "Role and notes per menu binding."},
		"section.map.gdd-outline":        {Category: "map", Title: "GDD outline section", Short: "Structured GDD seed.", Long: "Exportable sections for briefs and agents.", Related: []string{"gdd-outline"}},
		"section.map.systems":            {Category: "map", Title: "Systems section", Short: "Failure, economy, pacing.", Long: "High-level system characterization.", Related: []string{"field.map.systems"}},
		"section.map.variants":           {Category: "map", Title: "Variants section", Short: "Alternate modes.", Long: "Optional rule variants for the same map."},
		"section.mechanic.summary":       {Category: "mechanic", Title: "Summary section", Short: "Mechanic definition.", Long: "Core description of the reusable mechanic."},
		"section.mechanic.design-guidance": {Category: "mechanic", Title: "Design guidance section", Short: "When and how to apply.", Long: "Pedagogy for designers and agents.", Related: []string{"field.mechanic.design_guidance"}},
		"section.mechanic.agent-context": {Category: "mechanic", Title: "Agent context section", Short: "AI prompts and checklist.", Long: "Agent-facing enrichment.", Related: []string{"agent-context"}},
		"section.variable.shared-rationale": {Category: "variable", Title: "Shared rationale section", Short: "Cross-game why.", Long: "Required enrichment field for variables."},
		"section.skill.learning-outcome": {Category: "skill", Title: "Learning outcome section", Short: "Skill training goal.", Long: "What players learn through related mechanics."},
		"section.analytics.enrichment":   {Category: "process", Title: "Enrichment coverage", Short: "Percent of catalog with pedagogy complete.", Long: "Analytics metrics for mechanics, skills, variables, and menus.", Related: []string{"enrichment"}},
	}
	for k, v := range sections {
		e[k] = v
	}

	// Index/filter labels
	add("filter.enrichment", entry{Category: "process", Title: "Enrichment filter", Short: "Filter by complete vs needs_info.", Long: "Shows entries missing required pedagogy fields.", Related: []string{"enrichment"}})
	add("filter.domain", entry{Category: "mechanic", Title: "Domain filter", Short: "Filter mechanics by pillar.", Long: "locomotion, combat, progression, economy, level, session.", Related: []string{"field.mechanic.domain"}})
	add("filter.flavor", entry{Category: "mechanic", Title: "Flavor filter", Short: "Filter mechanics by genre family.", Long: "action, adventure, or strategy.", Related: []string{"field.mechanic.flavor"}})

	return e
}
